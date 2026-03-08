export type ErrorCode = 'NETWORK' | 'API' | 'GPS' | 'UNKNOWN';

export class AppError extends Error {
  code: ErrorCode;

  constructor(message: string, code: ErrorCode) {
    super(message);
    this.name = 'AppError';
    this.code = code;
  }
}
