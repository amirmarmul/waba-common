import { ValidationError } from 'class-validator';
import HttpError, { ErrorMessage } from './HttpError';

export class RequestValidationError extends HttpError {
  protected errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super('Unprocessable Content', 422);

    this.errors = errors;
  }

  serializeErrors(): ErrorMessage[] {
    return this.errors
      .flatMap((error) => this.mapChildrenToValidationErrors(error))
      .filter((error) => !!error.constraints)
      .flatMap((error) => {
        return { message: Object.values(error.constraints!).join(', '), field: error.property };
      });
  }

  private mapChildrenToValidationErrors(error: ValidationError, parentPath?: string): ValidationError[] {
    if (!(error.children && error.children.length)) {
      return [error];
    }
    const validationErrors = [];
    parentPath = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;
    for (const item of error.children) {
      if (item.children && item.children.length) {
        validationErrors.push(
          ...this.mapChildrenToValidationErrors(item, parentPath),
        );
      }
      validationErrors.push(
        this.prependConstraintsWithParentProp(item, parentPath),
      );
    }
    return validationErrors;
  }

  private prependConstraintsWithParentProp(error: ValidationError, parentPath?: string): ValidationError {
    const constraints: any = {};
    for (const key in error.constraints) {
      constraints[key] = `${parentPath}.${error.constraints[key]}`;
    }
    return {
      ...error,
      constraints,
    } as ValidationError;
  }
}

export default RequestValidationError;
