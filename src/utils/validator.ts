import { plainToClass } from 'class-transformer';
import { validateOrReject, ValidationError } from 'class-validator';
import { RequestValidationError } from '../errors';

export async function validator(object: object, klass: any) {
  try {
    await validateOrReject(plainToClass(klass, object, { enableImplicitConversion: false }), { skipMissingProperties: false });
  } catch (errors) {
    throw new RequestValidationError(errors as ValidationError[])
  }
}

export default validator;