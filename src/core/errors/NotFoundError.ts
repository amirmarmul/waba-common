import { AppError } from '@/core/errors/AppError';

export class NotFoundError extends AppError {
  constructor(message = 'Not Found') {
    super(message, 404);
  }
}

export default NotFoundError;
