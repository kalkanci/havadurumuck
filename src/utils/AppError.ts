export type ErrorCode = 'NETWORK' | 'API' | 'GPS' | 'UNKNOWN';

export class AppError extends Error {
  code: ErrorCode;

  constructor(message: string, code: ErrorCode = 'UNKNOWN') {
    super(message);
    this.name = 'AppError';
    this.code = code;

    // Restore prototype chain for instance of
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
