export type ErrorCode = 'NETWORK' | 'API' | 'GPS' | 'UNKNOWN';

export class AppError extends Error {
  public code: ErrorCode;

  constructor(message: string, code: ErrorCode = 'UNKNOWN') {
    super(message);
    this.name = 'AppError';
    this.code = code;

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
