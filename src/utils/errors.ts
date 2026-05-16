export class ApiError extends Error {
  public status: number;
  public url: string;

  constructor(message: string, status: number, url: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.url = url;
  }
}

export class NetworkError extends Error {
  public originalError: Error | unknown;

  constructor(message: string, originalError?: Error | unknown) {
    super(message);
    this.name = 'NetworkError';
    this.originalError = originalError;
  }
}
