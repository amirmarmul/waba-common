import HttpError from './HttpError';

class WrongAuthenticationTokenError extends HttpError {
    constructor() {
        super('Authentication token missing', 401);
    }
}

export default WrongAuthenticationTokenError;
