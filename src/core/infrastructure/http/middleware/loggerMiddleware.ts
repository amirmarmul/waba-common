import morgan from 'morgan';
import json from 'morgan-json';
import { logger } from '@/core/utils/logger';

export const loggerMiddleware = morgan(json(':method :url :status :res[content-length] :response-time :user-agent'), {
  stream: new class {
    write(message: any) {
      const logMessage = JSON.parse(message);
      logger.info(logMessage);
    }
  }
});
