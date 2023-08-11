import { AppError } from '@/core/errors/AppError';

export class WrongAuthenticationTokenError extends AppError {
  constructor() {
    super('Authentication token missing', 401);
  }
}

export default WrongAuthenticationTokenError;
