import { plainToClass } from 'class-transformer';
import { validateSync, ValidatorOptions } from 'class-validator';
import { RequestValidationError } from '../errors';

export function transformAndValidate(klass: any, object: object, options?: ValidatorOptions) {
  const classObject: object = plainToClass(klass, object, { enableImplicitConversion: false });
  const errors = validateSync(classObject, options ? options : void 0);
  if (errors.length) {
    throw new RequestValidationError(errors);
  }
  return classObject;
}

export default transformAndValidate;