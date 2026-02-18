import { useState, useRef, useCallback } from 'react';

interface UsePullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  haptic: (pattern?: number | number[]) => void;
  threshold?: number;
}

export const usePullToRefresh = ({ onRefresh, haptic, threshold = 120 }: UsePullToRefreshProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pullDistance = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (startY.current === 0) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    // Only allow pull if we are at the top and pulling down
    if (diff > 0 && window.scrollY === 0) {
      pullDistance.current = diff;
    }
  }, []);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance.current > threshold && window.scrollY === 0) {
      setRefreshing(true);
      haptic(50);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
    startY.current = 0;
    pullDistance.current = 0;
  }, [haptic, onRefresh, threshold]);

  return {
    refreshing,
    handlers: {
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd
    }
  };
};
