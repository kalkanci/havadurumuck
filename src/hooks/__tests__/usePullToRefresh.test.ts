import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePullToRefresh } from '../usePullToRefresh';

describe('usePullToRefresh', () => {
  const onRefresh = vi.fn();
  const haptic = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    // Mock scrollY
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
  });

  it('should not refresh if not pulled enough', () => {
    const { result } = renderHook(() => usePullToRefresh({ onRefresh, haptic, threshold: 100 }));
    const { handlers } = result.current;

    act(() => {
      // Start
      handlers.onTouchStart({ touches: [{ clientY: 100 }] } as any);
      // Move 50px
      handlers.onTouchMove({ touches: [{ clientY: 150 }] } as any);
      // End
      handlers.onTouchEnd();
    });

    expect(onRefresh).not.toHaveBeenCalled();
    expect(result.current.refreshing).toBe(false);
  });

  it('should refresh if pulled enough', async () => {
    const { result } = renderHook(() => usePullToRefresh({ onRefresh, haptic, threshold: 100 }));
    const { handlers } = result.current;

    await act(async () => {
      // Start
      handlers.onTouchStart({ touches: [{ clientY: 100 }] } as any);
      // Move 150px
      handlers.onTouchMove({ touches: [{ clientY: 250 }] } as any);
      // End
      await handlers.onTouchEnd();
    });

    expect(onRefresh).toHaveBeenCalled();
    expect(haptic).toHaveBeenCalled();
  });

  it('should not refresh if window is scrolled down', () => {
    Object.defineProperty(window, 'scrollY', { value: 50, writable: true });

    const { result } = renderHook(() => usePullToRefresh({ onRefresh, haptic, threshold: 100 }));
    const { handlers } = result.current;

    act(() => {
      handlers.onTouchStart({ touches: [{ clientY: 100 }] } as any);
      handlers.onTouchMove({ touches: [{ clientY: 250 }] } as any);
      handlers.onTouchEnd();
    });

    expect(onRefresh).not.toHaveBeenCalled();
  });
});
