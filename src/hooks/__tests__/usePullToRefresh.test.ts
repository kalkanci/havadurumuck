// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react';
import { usePullToRefresh } from '../usePullToRefresh';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('usePullToRefresh hook', () => {
  let originalScrollY: number;

  beforeEach(() => {
    originalScrollY = window.scrollY;
    // Object.defineProperty is needed to mock read-only properties
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
  });

  afterEach(() => {
    Object.defineProperty(window, 'scrollY', { value: originalScrollY, writable: true });
  });

  it('triggers onRefresh when pulled down past threshold', () => {
    const onRefreshMock = vi.fn();
    const { result } = renderHook(() => usePullToRefresh(onRefreshMock));

    act(() => {
      // Simulate Touch Start at Y=100
      result.current.handleTouchStart({ touches: [{ clientY: 100 }] } as any);

      // Simulate Touch Move to Y=250 (Diff = 150, which is > 120 threshold)
      result.current.handleTouchMove({ touches: [{ clientY: 250 }] } as any);

      // Simulate Touch End
      result.current.handleTouchEnd();
    });

    expect(onRefreshMock).toHaveBeenCalledTimes(1);
  });

  it('does not trigger onRefresh when pull distance is below threshold', () => {
    const onRefreshMock = vi.fn();
    const { result } = renderHook(() => usePullToRefresh(onRefreshMock));

    act(() => {
      // Simulate Touch Start at Y=100
      result.current.handleTouchStart({ touches: [{ clientY: 100 }] } as any);

      // Simulate Touch Move to Y=150 (Diff = 50, which is < 120 threshold)
      result.current.handleTouchMove({ touches: [{ clientY: 150 }] } as any);

      // Simulate Touch End
      result.current.handleTouchEnd();
    });

    expect(onRefreshMock).not.toHaveBeenCalled();
  });
});
