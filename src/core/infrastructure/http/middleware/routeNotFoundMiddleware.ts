import { NextFunction, Request, Response } from 'express';
import NotFoundError from '@/core/errors/NotFoundError';

export function routeNotFoundMiddleware(req: Request, res: Response, next: NextFunction) {
  throw new NotFoundError();
}
