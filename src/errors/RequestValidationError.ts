import HttpError, { ErrorMessage } from './HttpError';
import { ValidationError } from 'express-validator';

class RequestValidationError extends HttpError {
    protected errors: ValidationError[];

    constructor(errors: ValidationError[]) {
        super('Unprocessable Content', 422);

        this.errors = errors;
    }

    serializeErrors(): ErrorMessage[] {
        return this.errors.map((error: ValidationError) => {
            return { message: error.msg, field: error.param };
        });
    }
}

export default RequestValidationError;
