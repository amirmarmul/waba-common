export interface ErrorMessage {
  message: string;
  field?: string;
}

export class AppError extends Error {
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
