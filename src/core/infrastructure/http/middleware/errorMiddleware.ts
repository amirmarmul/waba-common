import { NextFunction, Request, Response } from 'express';
import logger from '@/core/utils/logger';
import { AppError } from '@/core/errors/AppError';
import { sendErrorResponse } from '@/core/utils/response';

export function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
  logger.error(err.message, { cause: err.cause, stack: err.stack });

  if (err instanceof AppError) {
    logger.error(JSON.stringify({ errorMiddleware: err.serializeErrors() }));
    return sendErrorResponse(res, err.serializeErrors(), err.status);
  }

  return sendErrorResponse(res, [{ message: err.message }]);
}
