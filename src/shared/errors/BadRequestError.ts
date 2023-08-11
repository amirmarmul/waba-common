import HttpError from './HttpError';

export class BadRequestError extends HttpError {
  constructor(message = 'Bad Request') {
    super(message, 400);
  }
}

export default BadRequestError;
