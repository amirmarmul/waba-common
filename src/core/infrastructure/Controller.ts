import { Response, Router } from 'express';
import { sendSuccessResponse } from '@/core/utils/response';
import { AppError } from '@/core/errors/AppError';

export abstract class Controller {
  router: Router = Router();

  constructor() {
    this.registerRoutes();
  }

  abstract registerRoutes(): void;

  public ok<T>(res: Response, dto?: T) {
    if (!!dto) {
      return sendSuccessResponse(res, dto, 200);
    } else {
      return res.sendStatus(200);
    }
  }

  public created(res: Response) {
    return res.sendStatus(201);
  }

  public fail(res: Response, error: Error | string) {
    if (error instanceof Error) {
      throw error;
    }
    throw new AppError(error);
  }
}
