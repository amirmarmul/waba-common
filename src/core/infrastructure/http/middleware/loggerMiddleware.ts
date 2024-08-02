import morgan from 'morgan';
import { logger } from '@/core/utils/logger';

export const loggerMiddleware = morgan('short', {
  stream: new class {
    write(message: string) {
      logger.info(message);
    }
  }
});
