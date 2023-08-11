import { AppError } from '@/core/errors/AppError';

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request') {
    super(message, 400);
  }
}

export default BadRequestError;
