import compression from 'compression';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

import { Container } from '@/core/infrastructure/Container';
import { Controller } from '@/core/infrastructure/Controller';

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

  private registerMiddleware() {
    this.app.use(cors({ origin: '*' }));
    this.app.use(compression());
    this.app.use(helmet());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private registerControllers(controllers: any[]) {
    controllers.forEach((controller) => {
      const instance = this.resolve(controller);
      this.app.use('/', instance.router);
    });
  }

  private resolve(klass: any): Controller {
    if (klass instanceof Controller) {
      return klass;
    }
    return Container.get<Controller>(klass);
  }

  private registerErrorHandlers() {}
}
