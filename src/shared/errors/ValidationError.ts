import HttpError, { ErrorMessage } from './HttpError';

export class ValidationError extends HttpError {
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
