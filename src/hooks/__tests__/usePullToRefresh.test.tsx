import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { usePullToRefresh } from '../usePullToRefresh';

describe('usePullToRefresh', () => {
    it('should trigger onRefresh when pulled down enough', () => {
        const onRefresh = vi.fn();
        const haptic = vi.fn();
        const setRefreshing = vi.fn();

        const { result } = renderHook(() => usePullToRefresh({ onRefresh, haptic, setRefreshing }));

        // Simulate Touch Start
        act(() => {
            result.current.handleTouchStart({
                touches: [{ clientY: 100 }]
            } as any);
        });

        // Simulate Touch Move (down 200px)
        act(() => {
            result.current.handleTouchMove({
                touches: [{ clientY: 300 }]
            } as any);
        });

        // Simulate Touch End
        act(() => {
            result.current.handleTouchEnd();
        });

        expect(setRefreshing).toHaveBeenCalledWith(true);
        expect(onRefresh).toHaveBeenCalled();
        expect(haptic).toHaveBeenCalled();
    });

    it('should NOT trigger refresh if pull is too short', () => {
        const onRefresh = vi.fn();
        const haptic = vi.fn();
        const setRefreshing = vi.fn();

        const { result } = renderHook(() => usePullToRefresh({ onRefresh, haptic, setRefreshing }));

        act(() => {
            result.current.handleTouchStart({ touches: [{ clientY: 100 }] } as any);
        });

        act(() => {
            result.current.handleTouchMove({ touches: [{ clientY: 150 }] } as any); // Only 50px
        });

        act(() => {
            result.current.handleTouchEnd();
        });

        expect(setRefreshing).not.toHaveBeenCalled();
        expect(onRefresh).not.toHaveBeenCalled();
    });
});
