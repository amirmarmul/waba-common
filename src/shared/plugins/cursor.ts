import { Crypto, logger } from '@/core';
import moment from 'moment';
import mongoose, { Schema, Model } from 'mongoose';

interface EncodedCursorPayload {
  query?: any;
  direction: 'next' | 'previous';
}

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
  cursor?: string;
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
    let baseQuery = options?.query ? { ...options.query } : {};
    let limit = parseInt(options?.limit ?? '10');
    let fetchLimit = limit + 1;
    let direction: 'next' | 'previous' = 'next';

    let sort = options?.sort ||
      (options?.aggregate?.find((agg: any) => agg.$sort) || {}).$sort ||
      { _id: -1 };

    if (options?.cursor) {
      try {
        const decodedStr = Crypto.decrypt(options.cursor);
        const decoded: EncodedCursorPayload = JSON.parse(decodedStr);
        logger.debug({ decoded });
        direction = decoded.direction;

        const sortQuery = decoded.query?.sort || {};
        delete decoded.query?.sort;

        for (const key of Object.keys(sort)) {
          let value = sortQuery[key];

          if (key.endsWith('At') && typeof value === 'string') {
            value = moment(value).toDate();
          }

          if (value !== undefined) {
            const operator = direction === 'next'
              ? (sort[key] === 1 ? '$gte' : '$lte')
              : (sort[key] === 1 ? '$lte' : '$gte');

            baseQuery[key] = { [operator]: value };

            if (decoded.query?.[key]) {
              baseQuery[key] = {
                ...baseQuery[key],
                ...decoded.query[key]
              };
            }
          }
        }

        logger.debug({ baseQuery });
        baseQuery = { ...baseQuery, ...decoded.query };
      } catch (e: any) {
        if (onError) onError(e);
        logger.debug({ e, stack: e.stack });
        return undefined;
      }
    }

    if (baseQuery && baseQuery._id) {
      ['gte', 'lte', 'ne'].forEach(op => {
        if (baseQuery._id[`$${op}`] && typeof baseQuery._id[`$${op}`] === 'string') {
          baseQuery._id[`$${op}`] = new mongoose.Types.ObjectId(baseQuery._id[`$${op}`]);
        }
      });
    }

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

    if (direction === 'previous') {
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
        aggregatePipeline[matchIndex].$match = {
          ...aggregatePipeline[matchIndex].$match,
          ...effectiveQuery
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
      let hasMore = docs.length > fetchLimit - 1;

      if (direction === 'next') {
        if (hasMore) {
          docs.pop();
        }
      } else if (direction === 'previous') {
        if (hasMore) {
          docs.pop();
        }
        docs = docs.reverse();
      }

      const sortKeys = Object.keys(sort);
      let newCursorNext: string | undefined = undefined;
      let newCursorPrevious: string | undefined = undefined;

      if (docs.length > 0) {
        const lastDoc = docs[docs.length - 1];
        const firstDoc = docs[0];

        const buildSortValues = (doc: any) => {
          return sortKeys.reduce((acc, key) => {
            acc[key] = doc[key];
            return acc;
          }, {} as any);
        };

        if ((direction === 'next' && hasMore) || direction === 'previous') {
          newCursorNext = Crypto.encrypt(
            JSON.stringify({
              query: {
                _id: { $ne: lastDoc._id },
                sort: buildSortValues(lastDoc)
              },
              direction: 'next'
            })
          );
        }

        if (options?.cursor) {
          if (direction === 'next' || (direction === 'previous' && hasMore)) {
            newCursorPrevious = Crypto.encrypt(
              JSON.stringify({
                query: {
                  _id: { $ne: firstDoc._id },
                  sort: buildSortValues(firstDoc)
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
