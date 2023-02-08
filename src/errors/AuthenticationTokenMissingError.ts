import HttpError from './HttpError';

class AuthenticationTokenMissingError extends HttpError {
    constructor() {
        super('Authentication token missing', 401);
    }
}

export default AuthenticationTokenMissingError;
