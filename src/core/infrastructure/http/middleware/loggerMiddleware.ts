import morgan from 'morgan';
import json from 'morgan-json';
import { logger } from '@/core/utils/logger';

const format = json(':method :url :status :res[content-length] :response-time', { stringify: false });

export const loggerMiddleware = morgan(format, {
  stream: new class {
    write(message: any) {
      logger.log('info', 'accesslog', message);
    }
  }
});
