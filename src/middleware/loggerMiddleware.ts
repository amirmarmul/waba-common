import morgan from 'morgan';
import { logger } from '../utils';

export const loggerMiddleware = morgan('combined', {
  stream: new class {
    write(combined: string) {
      logger.info('http-logger', { combined });
    }
  }
});

export default loggerMiddleware;
