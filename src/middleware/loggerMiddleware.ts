import morgan from 'morgan';
import { logger } from '../utils';

export const loggerMiddleware = morgan('combined', {
  stream: new class {
    write(req: string) {
      logger.info('http-logger', { req });
    }
  }
});

export default loggerMiddleware;
