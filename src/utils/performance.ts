/* Performance Utilities & Optimizations */

/**
 * Image Lazy Loading & Optimization
 */
export const optimizeImage = (url: string, width?: number, height?: number): string => {
  if (url.includes('unsplash') || url.includes('pexels')) {
    const params = new URLSearchParams();
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    params.append('fit', 'max');
    params.append('q', '80');
    return `${url}?${params.toString()}`;
  }
  return url;
};

/**
 * Debounce Hook for Search & Input
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Throttle Function for Scroll & Resize Events
 */
export const useThrottle = <T extends any[]>(
  callback: (...args: T) => void,
  limit: number
): ((...args: T) => void) => {
  const inThrottle = React.useRef(false);

  return React.useCallback(
    (...args: T) => {
      if (!inThrottle.current) {
        callback(...args);
        inThrottle.current = true;
        setTimeout(() => (inThrottle.current = false), limit);
      }
    },
    [callback, limit]
  );
};

/**
 * Intersection Observer Hook for Lazy Loading
 */
export const useIntersectionObserver = (
  ref: React.RefObject<HTMLElement>,
  options?: IntersectionObserverInit
): boolean => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.1, ...options });

    if (ref.current) observer.observe(ref.current);

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [ref, options]);

  return isVisible;
};

/**
 * Resource Hints Manager
 */
export const prefetchResource = (url: string, type: 'dns-prefetch' | 'preconnect' | 'prefetch' | 'preload'): void => {
  const link = document.createElement('link');
  link.rel = type;
  link.href = url;
  if (type === 'preload') {
    link.as = 'fetch';
    link.crossOrigin = 'anonymous';
  }
  document.head.appendChild(link);
};

/**
 * Memory-Efficient Date Formatting
 */
export const formatDate = (date: Date, format: 'short' | 'long' = 'short'): string => {
  const options: Intl.DateTimeFormatOptions = 
    format === 'short' 
      ? { month: 'short', day: 'numeric' }
      : { weekday: 'long', month: 'long', day: 'numeric' };
  
  return new Intl.DateTimeFormat('tr-TR', options).format(date);
};

/**
 * Memoization Cache for API Calls
 */
class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private ttl: number;

  constructor(ttlMinutes: number = 10) {
    this.ttl = ttlMinutes * 60 * 1000;
  }

  set(key: string, value: any): void {
    this.cache.set(key, { data: value, timestamp: Date.now() });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }
}

export const apiCache = new CacheManager(15); // 15-minute cache

/**
 * Virtual Scrolling Helper
 */
export const useVirtualScroll = (
  items: any[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollY, setScrollY] = React.useState(0);

  const startIndex = Math.max(0, Math.floor(scrollY / itemHeight) - 1);
  const endIndex = Math.min(items.length, Math.ceil((scrollY + containerHeight) / itemHeight) + 1);
  
  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;

  return { visibleItems, startIndex, offsetY };
};

/**
 * Network Status Hook
 */
export const useNetworkStatus = (): { online: boolean; effectiveType: string } => {
  const [networkStatus, setNetworkStatus] = React.useState({
    online: navigator.onLine,
    effectiveType: (navigator as any).connection?.effectiveType || '4g',
  });

  React.useEffect(() => {
    const handleOnline = () => setNetworkStatus(prev => ({ ...prev, online: true }));
    const handleOffline = () => setNetworkStatus(prev => ({ ...prev, online: false }));
    const handleConnectionChange = () => {
      setNetworkStatus(prev => ({
        ...prev,
        effectiveType: (navigator as any).connection?.effectiveType || '4g'
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    (navigator as any).connection?.addEventListener?.('change', handleConnectionChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      (navigator as any).connection?.removeEventListener?.('change', handleConnectionChange);
    };
  }, []);

  return networkStatus;
};

/**
 * Request Animation Frame Wrapper
 */
export const useRAF = (callback: FrameRequestCallback) => {
  const frameId = React.useRef<number>();

  React.useEffect(() => {
    frameId.current = requestAnimationFrame(callback);
    return () => {
      if (frameId.current) cancelAnimationFrame(frameId.current);
    };
  }, [callback]);
};

/**
 * Batch Update Optimization
 */
export const useBatchedState = <T extends Record<string, any>>(initialState: T) => {
  const [state, setState] = React.useState<T>(initialState);
  const batchUpdateRef = React.useRef<Partial<T>>({});

  const batchUpdate = React.useCallback((updates: Partial<T>) => {
    Object.assign(batchUpdateRef.current, updates);
    
    if (!batchUpdateRef.current._timer) {
      (batchUpdateRef.current as any)._timer = setTimeout(() => {
        setState(prev => ({ ...prev, ...batchUpdateRef.current }));
        batchUpdateRef.current = {};
      }, 16); // One frame @ 60fps
    }
  }, []);

  return [state, batchUpdate] as const;
};

/**
 * Performance Mark & Measure
 */
export const markPerformance = (label: string): void => {
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark(`${label}-start`);
  }
};

export const measurePerformance = (label: string): number => {
  if (typeof performance !== 'undefined' && performance.measure) {
    try {
      performance.measure(label, `${label}-start`);
      return performance.getEntriesByName(label)[0]?.duration || 0;
    } catch (e) {
      return 0;
    }
  }
  return 0;
};

/**
 * Long Task Detection (if supported)
 */
export const observeLongTasks = (callback: (duration: number) => void): (() => void) => {
  if (!('PerformanceObserver' in window)) return () => {};

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        callback(entry.duration);
      }
    });

    observer.observe({ entryTypes: ['longtask'] });
    return () => observer.disconnect();
  } catch (e) {
    return () => {};
  }
};

export default {
  optimizeImage,
  useDebounce,
  useThrottle,
  useIntersectionObserver,
  prefetchResource,
  formatDate,
  apiCache,
  useVirtualScroll,
  useNetworkStatus,
  useRAF,
  useBatchedState,
  markPerformance,
  measurePerformance,
  observeLongTasks,
};
