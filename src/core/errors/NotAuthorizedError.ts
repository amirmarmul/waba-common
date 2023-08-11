import { AppError } from '@/core/errors/AppError';

export class NotAuthorizedError extends AppError {
  constructor() {
    super('You\'re not authorized', 403);
  }
}

export default NotAuthorizedError;
