// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePullToRefresh } from '../usePullToRefresh';

describe('usePullToRefresh Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with refreshing false', () => {
    const { result } = renderHook(() => usePullToRefresh({ onRefresh: vi.fn() }));
    expect(result.current.refreshing).toBe(false);
  });

  it('should call onRefresh when pulled beyond threshold', async () => {
    const onRefreshMock = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => usePullToRefresh({ onRefresh: onRefreshMock, threshold: 100 }));

    // Simulate touch start
    act(() => {
      const touchStartEvent = { touches: [{ clientY: 100 }] } as any;
      result.current.handleTouchStart(touchStartEvent);
    });

    // Simulate touch move (pull down by 150px)
    act(() => {
      const touchMoveEvent = { touches: [{ clientY: 250 }] } as any;
      result.current.handleTouchMove(touchMoveEvent);
    });

    // Simulate touch end
    await act(async () => {
      await result.current.handleTouchEnd();
    });

    expect(onRefreshMock).toHaveBeenCalledTimes(1);
    expect(result.current.refreshing).toBe(false); // Should reset after async
  });

  it('should NOT call onRefresh if pull is below threshold', async () => {
    const onRefreshMock = vi.fn();
    const { result } = renderHook(() => usePullToRefresh({ onRefresh: onRefreshMock, threshold: 100 }));

    act(() => {
      result.current.handleTouchStart({ touches: [{ clientY: 100 }] } as any);
    });

    act(() => {
      result.current.handleTouchMove({ touches: [{ clientY: 150 }] } as any); // Diff is 50
    });

    await act(async () => {
      await result.current.handleTouchEnd();
    });

    expect(onRefreshMock).not.toHaveBeenCalled();
  });
});
