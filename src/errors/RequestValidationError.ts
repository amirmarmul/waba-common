import { ValidationError } from 'class-validator';
import HttpError, { ErrorMessage } from './HttpError';

export class RequestValidationError extends HttpError {
    protected errors: ValidationError[];

    constructor(errors: ValidationError[]) {
        super('Unprocessable Content', 422);

        this.errors = errors;
    }

    serializeErrors(): ErrorMessage[] {
        return this.errors.map((error: ValidationError) => {
            return { message: Object.values(error.constraints!).join(', '), field: error.property };
        });
    }
}

export default RequestValidationError;
