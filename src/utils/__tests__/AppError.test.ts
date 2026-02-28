import { describe, it, expect } from 'vitest';
import { AppError } from '../AppError';

describe('AppError', () => {
    it('should create an AppError with default UNKNOWN code', () => {
        const error = new AppError('An error occurred');
        expect(error.message).toBe('An error occurred');
        expect(error.code).toBe('UNKNOWN');
        expect(error.name).toBe('AppError');
        expect(error instanceof AppError).toBe(true);
        expect(error instanceof Error).toBe(true);
    });

    it('should create an AppError with a specific code', () => {
        const error = new AppError('Network error', 'NETWORK');
        expect(error.message).toBe('Network error');
        expect(error.code).toBe('NETWORK');
        expect(error.name).toBe('AppError');
    });

    it('should maintain prototype chain', () => {
        const error = new AppError('API failed', 'API');
        expect(Object.getPrototypeOf(error)).toBe(AppError.prototype);
    });
});
