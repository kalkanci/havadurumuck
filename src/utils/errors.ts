export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  GPS_ERROR = 'GPS_ERROR',
  API_ERROR = 'API_ERROR',
  LOCATION_DENIED = 'LOCATION_DENIED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  SEARCH_ERROR = 'SEARCH_ERROR'
}

export class AppError extends Error {
  code: ErrorCode;
  recoverable: boolean;

  constructor(message: string, code: ErrorCode = ErrorCode.UNKNOWN_ERROR, recoverable: boolean = true) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.recoverable = recoverable;
  }
}
