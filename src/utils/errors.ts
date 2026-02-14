export enum ErrorCode {
    NETWORK_ERROR = 'NETWORK_ERROR',
    API_ERROR = 'API_ERROR',
    GPS_ERROR = 'GPS_ERROR',
    LOCATION_NOT_FOUND = 'LOCATION_NOT_FOUND',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class AppError extends Error {
    public code: ErrorCode;
    public originalError?: unknown;

    constructor(message: string, code: ErrorCode, originalError?: unknown) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.originalError = originalError;
    }
}
