export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  LOCATION_ERROR = 'LOCATION_ERROR',
  GEOLOCATION_PERMISSION_DENIED = 'GEOLOCATION_PERMISSION_DENIED',
  GEOLOCATION_UNSUPPORTED = 'GEOLOCATION_UNSUPPORTED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export class AppError extends Error {
  public code: ErrorCode;
  public originalError?: any;

  constructor(message: string, code: ErrorCode, originalError?: any) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.originalError = originalError;
  }
}
