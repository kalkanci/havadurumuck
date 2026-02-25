export enum ErrorCode {
  NETWORK = 'NETWORK',
  API = 'API',
  GPS = 'GPS',
  UNKNOWN = 'UNKNOWN'
}

export class AppError extends Error {
  constructor(public message: string, public code: ErrorCode) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
