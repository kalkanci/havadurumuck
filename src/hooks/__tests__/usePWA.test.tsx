import { renderHook, act } from '@testing-library/react';
import { usePWA } from '../usePWA';
import { describe, it, expect, vi } from 'vitest';

describe('usePWA', () => {
  it('should initialize with no install prompt', () => {
    const { result } = renderHook(() => usePWA());
    expect(result.current.deferredPrompt).toBeNull();
    expect(result.current.isInstallable).toBe(false);
  });

  it('should capture beforeinstallprompt event', () => {
    const { result } = renderHook(() => usePWA());

    const event = new Event('beforeinstallprompt');
    Object.defineProperty(event, 'prompt', { value: vi.fn() });

    act(() => {
      window.dispatchEvent(event);
    });

    expect(result.current.deferredPrompt).not.toBeNull();
    expect(result.current.isInstallable).toBe(true);
  });
});
