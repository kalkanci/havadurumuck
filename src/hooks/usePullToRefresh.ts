import { useState, useRef, useCallback, TouchEvent } from 'react';

interface UsePullToRefreshProps {
  onRefresh: () => void;
  hapticFeedback?: (pattern?: number | number[]) => void;
}

export const usePullToRefresh = ({ onRefresh, hapticFeedback }: UsePullToRefreshProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pullDistance = useRef(0);
  const PULL_THRESHOLD = 120;

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
      if (hapticFeedback) hapticFeedback(50);
      onRefresh();

      // Assume refresh completes after a short delay for UI purposes if it's synchronous,
      // but typically the parent will manage 'refreshing' state if async.
      // Here we just set it true to show an indicator immediately.
      setTimeout(() => setRefreshing(false), 1000);
    }
    startY.current = 0;
    pullDistance.current = 0;
  }, [hapticFeedback, onRefresh]);

  return {
    refreshing,
    setRefreshing,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    }
  };
};
