import HttpError from './HttpError';

class NotFoundError extends HttpError {
    constructor(message = 'Not Found') {
        super(message, 404);
    }
}

export default NotFoundError;
