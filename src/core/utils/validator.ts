import { plainToClass } from 'class-transformer';
import { validateSync, ValidatorOptions } from 'class-validator';
import { RequestValidationError } from '@/core/errors/RequestValidationError';

export type Klass<T> = new (...args: any[]) => T;

export function transformAndValidate<T extends object>(klass: Klass<T>, object: object, options?: ValidatorOptions): T {
  object = normalizeObject(object);
  const classObject = plainToClass(klass, object, { enableImplicitConversion: false });
  const errors = validateSync(classObject, options ? options : void 0);
  if (errors.length) {
    throw new RequestValidationError(errors);
  }
  return classObject;
}

function normalizeObject(object: any) {
  console.log(JSON.stringify({ object }))
  let normalObject: any = {};
  for (let key in object) {
    const newKey = key.replace(/\[(.*?)\]/, '$1');
    if (typeof object[key] !== 'object') {
      normalObject[newKey] = object[key];
    }
    else if (Array.isArray(object[key])) {
      normalObject[newKey] = normilizeArray(object[key])
    }
    else if (object.hasOwnProperty(key)) {
      normalObject[newKey] = normalizeObject(object[key]);
    }
  }
  return normalObject;
}

function normilizeArray(array: any) {
  let normalArray = [];
  normalArray = array.map((item: any) => {
    if (typeof item !== 'object') {
      return item;
    } else if (Array.isArray(item)) {
      return normilizeArray(item);
    } else {
      return normalizeObject(item);
    }
  });
  return normalArray;
}

export default transformAndValidate;
