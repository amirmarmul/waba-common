import compression from 'compression';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import 'express-async-errors';

import { Container } from '@/core/infrastructure/Container';
import { Controller } from '@/core/infrastructure/Controller';
import { loggerMiddleware } from '@/core/infrastructure/http/middleware/loggerMiddleware';
import { routeNotFoundMiddleware } from '@/core/infrastructure/http/middleware/routeNotFoundMiddleware';
import { errorMiddleware } from '@/core/infrastructure/http/middleware/errorMiddleware';

export class App {
  protected app: express.Application = express();

  constructor(controllers: any[]) {
    this.registerMiddleware();
    this.registerControllers(controllers);
    this.registerErrorHandlers();
  }

  public start() {
    this.app.listen(3000, () => {
      console.info('App listening @', 3000);
    });
  }

  protected registerMiddleware() {
    this.app.disable('x-powered-by');
    this.app.use(loggerMiddleware);

    this.app.use(cors({ origin: '*' }));
    this.app.use(compression());
    this.app.use(helmet());
    this.app.use(express.json({ limit: '2048mb' }));
    this.app.use(express.urlencoded({ limit: '2048mb', extended: true }));
  }

  protected registerControllers(controllers: any[]) {
    controllers.forEach((controller) => {
      const instance = this.resolve(controller);
      this.app.use('/', instance.router);
    });
  }

  protected resolve(klass: any): Controller {
    if (klass instanceof Controller) {
      return klass;
    }
    return Container.get<Controller>(klass);
  }

  protected registerErrorHandlers() {
    this.app.use(routeNotFoundMiddleware);
    this.app.use(errorMiddleware);
  }
}
