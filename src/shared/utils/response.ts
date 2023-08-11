import { Response } from 'express';
import { ErrorMessage } from '../errors/HttpError';

export function sendSuccessResponse(res: Response, data: any, status: number = 200) {
  return res.status(status).json({ status, data });
}

export function sendErrorResponse(res: Response, error: ErrorMessage[], status: number = 500) {
  return res.status(status).json({ status, error });
}
