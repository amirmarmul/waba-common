import { Crypto, logger } from '@/core';
import moment from 'moment';
import mongoose, { Schema, Model } from 'mongoose';

interface EncodedCursorPayload {
  query?: any;
  direction: 'next' | 'previous';
}

// Update model agar menggunakan properti meta
export class CursorPaginationModel<T> {
  meta: {
    cursors?: { next?: string | undefined; previous?: string | undefined };
    limit: number;
  } = { limit: 0 };
  docs: T[] = [];
}

export interface CursorPaginationOptions {
  query?: any;
  aggregate?: any;
  populate?: any;
  select?: any;
  search?: {
    value: string | undefined;
    fields: string[] | undefined;
  };
  sort?: any;
  projection?: any;
  // Cursor yang berisi query dan direction ('next' atau 'previous')
  cursor?: string;
  // Limit (default: 10)
  limit?: string;
}

export interface CursorPagination<T> extends Model<T> {
  cursor(
    options?: CursorPaginationOptions,
    onError?: Function
  ): Promise<CursorPaginationModel<T> | undefined>;
}

export function mongooseCursorPaginate<T>(schema: Schema<T>) {
  schema.statics.cursor = async function cursor(
    options: CursorPaginationOptions | undefined,
    onError?: Function
  ): Promise<CursorPaginationModel<T> | undefined> {
    // Mulai dengan query dasar dari options
    let baseQuery = options?.query ? { ...options.query } : {};
    let limit = parseInt(options?.limit ?? '10');
    // Ambil satu dokumen ekstra untuk pengecekan halaman selanjutnya/previous
    let fetchLimit = limit + 1;
    let direction: 'next' | 'previous' = 'next';

    // Jika tidak ada sort, gunakan _id sebagai default
    let sort = options?.sort ||
      (options?.aggregate?.find((agg: any) => agg.$sort) || {}).$sort ||
      { _id: -1 };

    // Jika ada cursor, dekripsi dan gabungkan kondisi tambahan
    if (options?.cursor) {
      try {
        const decodedStr = Crypto.decrypt(options.cursor);
        const decoded: EncodedCursorPayload = JSON.parse(decodedStr);
        logger.debug({ decoded });
        direction = decoded.direction;

        const sortKeys = Object.keys(sort);
        const sortKey = sortKeys[0];
        const sortOrder = sort[sortKey];

        // Ambil nilai boundary dari decoded.query sesuai field sort
        const decodedQuery = decoded.query || {};
        let cursorValue: any = decodedQuery.sort[sortKey];
        delete decodedQuery.sort;

        // Jika field sort berupa tanggal (berakhiran 'At') dan berupa string, konversi ke Date
        if (sortKey.endsWith('At') && typeof cursorValue === 'string') {
          cursorValue = moment(cursorValue).toDate();
        }

        logger.debug({ ['decodedQuery[sortKey]']: decodedQuery[sortKey], sortKey, decodedQuery });

        if (cursorValue !== undefined) {
          if (direction === 'next') {
            baseQuery[sortKey] = { [sortOrder === 1 ? '$gte' : '$lte']: cursorValue };
          } else if (direction === 'previous') {
            baseQuery[sortKey] = { [sortOrder === 1 ? '$lte' : '$gte']: cursorValue };
          }
          if (!!decodedQuery[sortKey]) {
            decodedQuery[sortKey] = { ...baseQuery[sortKey], ...decodedQuery[sortKey] };
          }
        }

        logger.debug({ baseQuery });
        // Gabungkan kondisi tambahan dari decodedQuery ke baseQuery
        baseQuery = { ...baseQuery, ...decodedQuery };
      } catch (e: any) {
        if (onError) onError(e);
        logger.debug({ e, stack: e.stack });
        return undefined;
      }
    }

    // Konversi _id jika diperlukan
    if (baseQuery && baseQuery._id) {
      if (baseQuery._id.$gte && typeof baseQuery._id.$gte === 'string') {
        baseQuery._id.$gte = new mongoose.Types.ObjectId(baseQuery._id.$gte);
      }
      if (baseQuery._id.$lte && typeof baseQuery._id.$lte === 'string') {
        baseQuery._id.$lte = new mongoose.Types.ObjectId(baseQuery._id.$lte);
      }
      if (baseQuery._id.$ne && typeof baseQuery._id.$ne === 'string') {
        baseQuery._id.$ne = new mongoose.Types.ObjectId(baseQuery._id.$ne);
      }
    }

    // Terapkan pencarian jika ada
    let effectiveQuery = { ...baseQuery };
    if (
      options?.search &&
      options.search.value &&
      options.search.fields &&
      options.search.fields.length
    ) {
      const searchQuery = {
        $regex: options.search.value,
        $options: 'i',
      };
      if (options.search.fields.length === 1) {
        effectiveQuery[options.search.fields[0]] = searchQuery;
      } else {
        effectiveQuery.$or = options.search.fields.map(field => ({ [field]: searchQuery }));
      }
    }

    // Atur sort order sesuai dengan direction
    if (direction === 'previous') {
      // Untuk previous, ubah urutan sort menjadi kebalikan (descending)
      sort = Object.fromEntries(
        Object.entries(sort).map(([key, value]: any) => [key, -value])
      );
    } else {
      sort = Object.fromEntries(
        Object.entries(sort).map(([key, value]: any) => [key, parseInt(value)])
      );
    }

    const projection = options?.projection ?? {};
    const populate = options?.populate;
    logger.debug({ effectiveQuery });

    let mQuery;
    if (options?.aggregate) {
      const aggregatePipeline = [...options.aggregate];
      const matchIndex = aggregatePipeline.findIndex(stage => stage.$match);
      if (matchIndex !== -1) {
        const _id = Object.assign(effectiveQuery?._id ?? {}, aggregatePipeline[matchIndex]?.$match?._id ?? {})
        aggregatePipeline[matchIndex].$match = {
          ...aggregatePipeline[matchIndex].$match,
          ...effectiveQuery,
          _id: Object.keys(_id).length > 0 ? _id : undefined
        };
      } else if (Object.keys(effectiveQuery).length > 0) {
        aggregatePipeline.unshift({ $match: effectiveQuery });
      }

      const sortIndex = aggregatePipeline.findIndex(stage => stage.$sort);
      if (sortIndex !== -1) {
        aggregatePipeline[sortIndex].$sort = sort;
      } else {
        aggregatePipeline.unshift({ $sort: sort });
      }

      const limitIndex = aggregatePipeline.findIndex(stage => stage.$limit);
      if (limitIndex !== -1) {
        aggregatePipeline[limitIndex].$limit = fetchLimit;
      } else {
        aggregatePipeline.unshift({ $limit: fetchLimit });
      }

      logger.debug({ aggregatePipeline });
      mQuery = this.aggregate(aggregatePipeline);
      if (options.select) {
        mQuery = mQuery.project(options.select);
      }
    } else {
      mQuery = this.find(effectiveQuery, projection);
      if (options?.select) {
        mQuery = mQuery.select(options.select);
      }
      if (populate) {
        mQuery = mQuery.populate(populate);
      }
      mQuery = mQuery.sort(sort).limit(fetchLimit);
    }

    try {
      let docs = await mQuery.exec();
      // Cek apakah ada dokumen ekstra (indikator adanya halaman selanjutnya/previous)
      let hasMore = docs.length > fetchLimit - 1;

      if (direction === 'next') {
        if (hasMore) {
          docs.pop(); // Hapus elemen ekstra di akhir array
        }
      } else if (direction === 'previous') {
        if (hasMore) {
          docs.pop(); // Hapus dokumen ekstra di akhir array (karena hasil query dalam urutan descending)
        }
        docs = docs.reverse(); // Balik agar urutannya natural
      }

      // Simpan key sort yang digunakan (gunakan _id sebagai fallback)
      const sortKeys = Object.keys(sort);
      const sortKey = sortKeys.length > 0 ? sortKeys[0] : '_id';

      // Pembuatan cursor
      let newCursorNext: string | undefined = undefined;
      let newCursorPrevious: string | undefined = undefined;

      if (docs.length > 0) {
        if ((direction === 'next' && hasMore) || direction === 'previous') {
          const lastDoc = docs[docs.length - 1];
          newCursorNext = Crypto.encrypt(
            JSON.stringify({
              query: {
                _id: { $ne: lastDoc._id },
                sort: { [sortKey]: lastDoc[sortKey] }
              },
              direction: 'next'
            })
          );
        }
        if (options?.cursor) {
          if (direction === 'next' || (direction === 'previous' && hasMore)) {
            const firstDoc = docs[0];
            newCursorPrevious = Crypto.encrypt(
              JSON.stringify({
                query: {
                  _id: { $ne: firstDoc._id },
                  sort: { [sortKey]: firstDoc[sortKey] }
                },
                direction: 'previous'
              })
            );
          }
        }
      }

      let cursors: { next?: string; previous?: string } | undefined = { next: newCursorNext, previous: newCursorPrevious };
      if (!newCursorNext && !newCursorPrevious) {
        cursors = undefined;
      }

      // Buat result dengan meta berisi limit dan cursors
      const result = new CursorPaginationModel<any>();
      result.meta = {
        limit,
        cursors
      };
      result.docs = docs;

      return result;
    } catch (error: any) {
      if (onError) onError(error);
      logger.debug({ error, stack: error.stack });
      return undefined;
    }
  };

  // Pengaturan toJSON dan toObject agar _id tampil sebagai id dan __v dihilangkan
  const toJSONOptions = {
    virtuals: true,
    transform: function (doc: any, ret: any) {
      ret.id = ret._id;
      delete ret.__v;
    }
  };
  schema.set('toJSON', toJSONOptions);
  schema.set('toObject', toJSONOptions);
}
