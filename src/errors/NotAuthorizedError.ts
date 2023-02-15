import HttpError from './HttpError';

export class NotAuthorizedError extends HttpError {
    constructor() {
        super('You\'re not authorized', 403);
    }
}

export default NotAuthorizedError;
