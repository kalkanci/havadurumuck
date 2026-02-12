export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  GPS_ERROR = 'GPS_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  RATE_LIMIT = 'RATE_LIMIT'
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly isRetryable: boolean;
  public readonly originalError?: unknown;

  constructor(message: string, code: ErrorCode, isRetryable: boolean = true, originalError?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.isRetryable = isRetryable;
    this.originalError = originalError;
  }
}
