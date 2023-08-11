import { AppError } from '@/core/errors/AppError';

export class WrongCredentialsError extends AppError {
  constructor() {
    super('Wrong credentials provided', 401);
  }
}

export default WrongCredentialsError;
