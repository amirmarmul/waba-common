import { NextFunction, Request, Response } from 'express';

export function alwaysAcceptJsonMiddleware(req: Request, res: Response, next: NextFunction) {
  req.headers['accept'] = 'application/json';
  next();
}
