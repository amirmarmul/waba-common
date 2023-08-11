import { plainToClass } from 'class-transformer';
import { validateSync, ValidatorOptions } from 'class-validator';
import { RequestValidationError } from '@/core/errors/RequestValidationError';

export type Klass<T> = new (...args: any[]) => T;

export function transformAndValidate<T extends object>(klass: Klass<T>, object: object, options?: ValidatorOptions): T {
  const classObject = plainToClass(klass, object, { enableImplicitConversion: false });
  const errors = validateSync(classObject, options ? options : void 0);
  if (errors.length) {
    throw new RequestValidationError(errors);
  }
  return classObject;
}

export default transformAndValidate;
