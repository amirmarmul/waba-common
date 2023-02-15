import HttpError from './HttpError';

export class WrongCredentialsError extends HttpError {
    constructor() {
        super('Wrong credentials provided', 401);
    }
}

export default WrongCredentialsError;
