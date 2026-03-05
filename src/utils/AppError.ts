export type ErrorCode = 'NETWORK' | 'API' | 'GPS' | 'UNKNOWN';

export class AppError extends Error {
  code: ErrorCode;

  constructor(message: string, code: ErrorCode) {
    super(message);
    this.name = 'AppError';
    this.code = code;

    // Set the prototype explicitly to ensure correct prototype chain in TypeScript when extending Error
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
