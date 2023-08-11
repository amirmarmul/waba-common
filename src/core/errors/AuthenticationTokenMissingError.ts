import { AppError } from '@/core/errors/AppError';

export class AuthenticationTokenMissingError extends AppError {
  constructor() {
    super('Authentication token missing', 401);
  }
}

export default AuthenticationTokenMissingError;
