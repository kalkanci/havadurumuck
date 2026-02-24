export type ErrorCode = 'NETWORK' | 'API' | 'GPS' | 'UNKNOWN';

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly originalError?: unknown;

  constructor(message: string, code: ErrorCode = 'UNKNOWN', originalError?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.originalError = originalError;

    // Restore prototype chain for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
