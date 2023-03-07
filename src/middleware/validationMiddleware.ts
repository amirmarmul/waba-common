import { RequestValidationError } from '../errors/RequestValidationError';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { NextFunction, Request, RequestHandler, Response } from 'express';

export function validateBodyMiddleware<T>(type: any, skipMissingProperties = false): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    validate(plainToClass(type, req.body), { skipMissingProperties })
      .then((errors: ValidationError[]) => {
        if (errors.length > 0) {
          next(new RequestValidationError(errors));
        } else {
          next();
        }
      })
  }
}

export function validateQueryMiddleware<T>(type: any, skipMissingProperties = false): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    validate(plainToClass(type, req.query, { enableImplicitConversion: false }), { skipMissingProperties })
      .then((errors: ValidationError[]) => {
        if (errors.length > 0) {
          next(new RequestValidationError(errors));
        } else {
          next();
        }
      })
  }
}

export default validateBodyMiddleware;
