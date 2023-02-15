import { NextFunction, Request, Response } from 'express';
import HttpError from '../errors/HttpError';
import logger from '../utils/logger';
import { sendErrorResponse } from '../utils/response';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    logger.error(err.stack);

    if (err instanceof HttpError) {
        return sendErrorResponse(res, err.serializeErrors(), err.status);
    }

    return sendErrorResponse(res, [{ message: err.message }]);
}

export default errorHandler;
