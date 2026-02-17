export enum ErrorCode {
  NETWORK = 'NETWORK',
  GPS = 'GPS',
  API = 'API',
  UNKNOWN = 'UNKNOWN',
}

export class AppError extends Error {
  public code: ErrorCode;
  public userMessage: string;

  constructor(code: ErrorCode, message: string, userMessage?: string) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.userMessage = userMessage || message;

    // Set prototype explicitly for built-in classes in TS
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
