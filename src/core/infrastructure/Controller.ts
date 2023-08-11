import { Response, Router } from 'express';

export abstract class Controller {
  router: Router = Router();

  constructor() {
    this.registerRoutes();
  }

  abstract registerRoutes(): void;

  public ok<T>(res: Response, dto?: T) {
    if (!!dto) {
      return res.status(200).json(dto);
    } else {
      return res.sendStatus(200);
    }
  }

  public created(res: Response) {
    return res.sendStatus(201);
  }

  public fail(res: Response, error: Error | string) {
    return res.status(500).json({
      message: error.toString()
    });
  }
}
