import { describe, it, expect } from 'vitest';
import { AppError } from '../AppError';

describe('AppError', () => {
  it('should instantiate correctly with a message and error code', () => {
    const error = new AppError('Something went wrong', 'NETWORK');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe('Something went wrong');
    expect(error.code).toBe('NETWORK');
    expect(error.name).toBe('AppError');
  });

  it('should maintain the correct prototype chain', () => {
    const error = new AppError('API Error message', 'API');

    // Explicit prototype check because standard extending Error can sometimes lose the prototype chain in older TS/JS targets
    expect(Object.getPrototypeOf(error)).toBe(AppError.prototype);
  });
});
