// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../hooks';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should debounce value updates', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    expect(result.current).toBe('initial');

    // Update value
    rerender({ value: 'updated', delay: 500 });

    // Value should not be updated immediately
    expect(result.current).toBe('initial');

    // Fast-forward time halfway
    act(() => {
      vi.advanceTimersByTime(250);
    });

    // Value should still not be updated
    expect(result.current).toBe('initial');

    // Fast-forward the rest of the time
    act(() => {
      vi.advanceTimersByTime(250);
    });

    // Value should be updated now
    expect(result.current).toBe('updated');
  });

  it('should cancel previous timer if value updates before delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    // First update
    rerender({ value: 'update 1', delay: 500 });

    act(() => {
      vi.advanceTimersByTime(250);
    });

    // Second update before the first one completes
    rerender({ value: 'update 2', delay: 500 });

    act(() => {
      vi.advanceTimersByTime(250); // Total 500ms since first update
    });

    // Should not be 'update 1' because it was cancelled
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(250); // Total 500ms since second update
    });

    expect(result.current).toBe('update 2');
  });
});