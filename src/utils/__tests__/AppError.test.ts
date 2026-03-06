import { describe, it, expect } from 'vitest';
import { AppError } from '../AppError';

describe('AppError', () => {
  it('should create an error with message and code', () => {
    const err = new AppError('Test error', 'NETWORK');
    expect(err.message).toBe('Test error');
    expect(err.code).toBe('NETWORK');
    expect(err.name).toBe('AppError');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
  });

  it('should default to UNKNOWN code', () => {
    const err = new AppError('Test error');
    expect(err.code).toBe('UNKNOWN');
  });
});
