import morgan from 'morgan';
import { logger } from '../utils';

export const httpLogger = morgan('combined', { stream: new class {
    write(message: string) {
        logger.info(message);
    }
}});

export default httpLogger;
