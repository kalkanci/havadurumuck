export enum ErrorCode {
    NETWORK_ERROR = 'NETWORK_ERROR',
    API_ERROR = 'API_ERROR',
    GEOLOCATION_DENIED = 'GEOLOCATION_DENIED',
    GEOLOCATION_UNAVAILABLE = 'GEOLOCATION_UNAVAILABLE',
    GEOLOCATION_TIMEOUT = 'GEOLOCATION_TIMEOUT',
    INVALID_DATA = 'INVALID_DATA',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
    RATE_LIMIT = 'RATE_LIMIT'
}

export class AppError extends Error {
    public readonly code: ErrorCode;
    public readonly originalError?: unknown;

    constructor(message: string, code: ErrorCode = ErrorCode.UNKNOWN_ERROR, originalError?: unknown) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.originalError = originalError;
    }
}

export const getErrorMessage = (error: unknown): string => {
    if (error instanceof AppError) {
        switch (error.code) {
            case ErrorCode.NETWORK_ERROR:
                return 'İnternet bağlantınızı kontrol edin.';
            case ErrorCode.API_ERROR:
                return 'Sunucu tarafında bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
            case ErrorCode.GEOLOCATION_DENIED:
                return 'Konum izni reddedildi. Lütfen ayarlardan konum iznini açın.';
            case ErrorCode.GEOLOCATION_UNAVAILABLE:
                return 'Konum bilgisi alınamıyor.';
            case ErrorCode.GEOLOCATION_TIMEOUT:
                return 'Konum alma işlemi zaman aşımına uğradı.';
            case ErrorCode.RATE_LIMIT:
                return 'Çok fazla istek yapıldı. Lütfen biraz bekleyin.';
            default:
                return error.message;
        }
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'Beklenmedik bir hata oluştu.';
};
