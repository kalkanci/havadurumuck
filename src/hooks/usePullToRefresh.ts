import { useState, useRef, useCallback, TouchEvent } from 'react';

interface UsePullToRefreshProps {
  onRefresh: () => void | Promise<void>;
  threshold?: number;
}

export const usePullToRefresh = ({ onRefresh, threshold = 120 }: UsePullToRefreshProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pullDistance = useRef(0);

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

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance.current > threshold && window.scrollY === 0) {
      setRefreshing(true);
      try {
          await onRefresh();
      } finally {
          setRefreshing(false);
      }
    }
    startY.current = 0;
    pullDistance.current = 0;
  }, [threshold, onRefresh]);

  return {
    refreshing,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
};
