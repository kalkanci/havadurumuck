export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  LOCATION_ERROR = 'LOCATION_ERROR',
  GEOCODING_ERROR = 'GEOCODING_ERROR',
  INVALID_DATA = 'INVALID_DATA',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'AppError';

    // Fix prototype chain for custom error classes in TypeScript/ES5
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toString() {
    return `${this.name} [${this.code}]: ${this.message}`;
  }
}
