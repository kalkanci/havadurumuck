
export enum ErrorCode {
  NETWORK = 'NETWORK',
  API = 'API',
  GPS = 'GPS',
  UNKNOWN = 'UNKNOWN'
}

export class AppError extends Error {
  code: ErrorCode;

  constructor(message: string, code: ErrorCode = ErrorCode.UNKNOWN) {
    super(message);
    this.name = 'AppError';
    this.code = code;
  }
}
