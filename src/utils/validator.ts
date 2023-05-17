import { plainToClass, ClassTransformOptions } from 'class-transformer';
import { validateSync, ValidatorOptions } from 'class-validator';
import { RequestValidationError } from '../errors';

interface TransformValidationOptions {
  validator?: ValidatorOptions,
  transformer?: ClassTransformOptions,
}

export function transformAndValidate(klass: any, object: object, options?: TransformValidationOptions) {
  const classObject: object = plainToClass(klass, object, options ? options.transformer : void 0);
  const errors = validateSync(classObject, options ? options.validator : void 0);
  if (errors.length) {
    throw new RequestValidationError(errors);
  }
  return classObject;
}

export default transformAndValidate;