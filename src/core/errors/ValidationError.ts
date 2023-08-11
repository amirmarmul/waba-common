import { AppError, ErrorMessage } from '@/core/errors/AppError';

export class ValidationError extends AppError {
  constructor(protected errors: ErrorMessage[]) {
    super('Unprocessable Content', 422);
  }

  static with(error: ErrorMessage) {
    return new ValidationError([error]);
  }

  serializeErrors(): ErrorMessage[] {
    return this.errors;
  }
}

export default ValidationError;
