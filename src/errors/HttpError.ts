export interface ErrorMessage {
    message: string;
    field?: string;
}

abstract class HttpError extends Error {
    public status: number;
    public message: string;

    constructor(message: string, status: number = 500) {
        super(message);

        this.message = message;
        this.status = status;
    }

    serializeErrors(): ErrorMessage[] {
        return [{ message: this.message }];
    }
}

export default HttpError;
