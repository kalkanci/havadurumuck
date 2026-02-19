import { useRef, useCallback, TouchEvent } from 'react';

interface PullToRefreshProps {
    onRefresh: () => void;
    haptic: (pattern?: number | number[]) => void;
    setRefreshing: (refreshing: boolean) => void;
}

export const usePullToRefresh = ({ onRefresh, haptic, setRefreshing }: PullToRefreshProps) => {
    const startY = useRef(0);
    const pullDistance = useRef(0);
    const PULL_THRESHOLD = 120;
    const contentRef = useRef<HTMLDivElement>(null);

    const handleTouchStart = useCallback((e: TouchEvent) => {
        if (window.scrollY === 0) {
          startY.current = e.touches[0].clientY;
        }
      }, []);

      const handleTouchMove = useCallback((e: TouchEvent) => {
        if (startY.current === 0) return;
        const currentY = e.touches[0].clientY;
        const diff = currentY - startY.current;

        if (diff > 0 && window.scrollY === 0) {
          pullDistance.current = diff;
        }
      }, []);

      const handleTouchEnd = useCallback(() => {
        if (pullDistance.current > PULL_THRESHOLD && window.scrollY === 0) {
          setRefreshing(true);
          haptic(50);
          onRefresh();
        }
        startY.current = 0;
        pullDistance.current = 0;
      }, [haptic, onRefresh, setRefreshing]);

      return {
          handleTouchStart,
          handleTouchMove,
          handleTouchEnd,
          contentRef
      };
};
