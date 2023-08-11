import HttpError from './HttpError';

export class AuthenticationTokenMissingError extends HttpError {
  constructor() {
    super('Authentication token missing', 401);
  }
}

export default AuthenticationTokenMissingError;
