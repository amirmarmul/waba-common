import HttpError from './HttpError';

export class WrongAuthenticationTokenError extends HttpError {
    constructor() {
        super('Authentication token missing', 401);
    }
}

export default WrongAuthenticationTokenError;
