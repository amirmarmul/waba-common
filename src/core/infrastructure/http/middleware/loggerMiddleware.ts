import morgan from 'morgan';
import { logger } from '@/core/utils/logger';

export const loggerMiddleware = morgan('combined', {
  stream: new class {
    write(message: string) {
      logger.info(message);
    }
  }
});
