import { describe, it, expect } from 'vitest';
import { AppError } from '../AppError';

describe('AppError', () => {
  it('should initialize with correct message and default code', () => {
    const error = new AppError('Test error message');
    expect(error.message).toBe('Test error message');
    expect(error.code).toBe('UNKNOWN');
    expect(error.name).toBe('AppError');
    expect(error instanceof Error).toBe(true);
    expect(error instanceof AppError).toBe(true);
  });

  it('should initialize with specified code', () => {
    const error = new AppError('Network failed', 'NETWORK');
    expect(error.message).toBe('Network failed');
    expect(error.code).toBe('NETWORK');
    expect(error.name).toBe('AppError');
  });

  it('should retain the prototype chain', () => {
    const error = new AppError('API error', 'API');
    expect(Object.getPrototypeOf(error)).toBe(AppError.prototype);
  });
});
