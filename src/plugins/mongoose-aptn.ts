import mongoose, { Schema, Model } from 'mongoose';

interface PaginationMeta {
  limit: number | undefined;
  offset: number | undefined;
  total: number | undefined;
}

export class PaginationModel<T> {
  meta: PaginationMeta = {
    limit: 0,
    offset: 0,
    total: undefined,
  };
  docs: T[] = [];
}

export interface PaginationOptions {
  query?: any | undefined;
  aggregate?: any | undefined;
  populate?: any | undefined;
  select?: any | undefined;
  search?: {
    value: string | undefined,
    fields: string[] | undefined,
  };
  sort?: any | undefined;
  projection?: any | undefined;
  page?: {
    limit?: any | undefined,
    offset?: any | undefined,
  }
}

export interface Pagination<T> extends Model<T> {
  paginate(
    options?: PaginationOptions | undefined,
    onError?: Function | undefined
  ): Promise<PaginationModel<T> | undefined>;
}

export function mongoosePaginate<T>(schema: Schema<T>) {
  schema.statics.paginate = async function paginate(
    options: PaginationOptions | undefined,
    onError: Function | undefined
  ): Promise<PaginationModel<T> | undefined> {
    // INIT
    let query = options?.query ?? {};
    let aggregate = options?.aggregate ?? undefined;
    let populate = options?.populate ?? undefined;
    let select = options?.select ?? undefined;
    let search = options?.search ?? undefined;
    let sort = options?.sort ?? { '_id': -1 };
    let projection = options?.projection ?? {};

    // PAGING
    const limit = parseInt(options?.page?.limit) > 0 ? parseInt(options?.page?.limit): 0;
    const skip = parseInt(options?.page?.offset) > 0 ? parseInt(options?.page?.offset): 0;

    // SEARCHING
    if (
      search
      && search.value
      && search.fields
      && search.fields.length
    ) {
      let searchQuery = {
        '$regex': search.value,
        '$options': 'i',
      };

      if (search.fields?.length == 1) {
        query[search.fields[0]] = searchQuery;
      } else {
        if (!query.$or) {
          query.$or = [];
        }

        search.fields.forEach(function (el) {
          let obj: any = {};
          obj[el] = searchQuery;
          query.$or.push(obj);
        });
      }
    }

    // QUERY
    let docsPromise;
    if (aggregate != undefined) {
      var mQuery: mongoose.Aggregate<T> | any = this.aggregate(aggregate);
      if (select != undefined) {
        mQuery = mQuery.project(select);
      }
    } else {
      var mQuery = this.find(query, projection);
      if (select != undefined) {
        mQuery = mQuery.select(select);
      }

      if (populate != undefined) {
        mQuery = mQuery.populate(populate);
      }
    }

    if (sort != undefined) {
      mQuery = mQuery.sort(sort);
    }

    if (limit > 0) {
      mQuery = mQuery.skip(skip);
      mQuery = mQuery.limit(limit);
    }

    docsPromise = mQuery.exec();

    // COUNTING
    let countPromise;
    if (aggregate != undefined) {
      countPromise = this.aggregate(aggregate).count('count');
    } else {
      countPromise = this.countDocuments(query).exec();
    }

    // PERFORM
    try {
      const [counts, docs] = await Promise.all([countPromise, docsPromise]);
      let count = 0;
      if (aggregate != undefined) {
        if (
          counts != undefined
          && counts[0] != undefined
          && counts[0]['count'] != undefined
        ) {
          count = counts[0]['count'];
        }
      } else {
        count = counts;
      }

      const myModel = new PaginationModel<T>();
      myModel.meta.total = count;
      myModel.meta.offset = skip;

      if (limit > 0) {
        myModel.meta.limit = limit;
      }

      if (limit == 0) {
        myModel.meta.limit = 0;
      }

      myModel.docs = docs;

      return myModel;
    } catch (error) {
      if (onError != undefined) {
        onError(error);
      }
      return undefined;
    }
  }

  schema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret. __v;
    }
  });
}
