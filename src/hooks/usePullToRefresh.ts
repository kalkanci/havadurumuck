
import { useRef, useCallback } from 'react';

export const usePullToRefresh = (onRefresh: () => void) => {
  const startY = useRef(0);
  const pullDistance = useRef(0);
  const PULL_THRESHOLD = 120;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (startY.current === 0) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0 && window.scrollY === 0) {
      pullDistance.current = diff;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (pullDistance.current > PULL_THRESHOLD && window.scrollY === 0) {
      onRefresh();
    }
    startY.current = 0;
    pullDistance.current = 0;
  }, [onRefresh]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
};
