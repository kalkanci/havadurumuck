// @vitest-environment jsdom
import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, act, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import Toast from '../Toast';

describe('Toast Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it('renders the message when isVisible is true', () => {
    render(<Toast message="Test message" isVisible={true} onClose={() => {}} />);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('does not render when isVisible is false', () => {
    render(<Toast message="Test message" isVisible={false} onClose={() => {}} />);
    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  it('calls onClose after duration', () => {
    const handleClose = vi.fn();
    render(<Toast message="Test message" isVisible={true} onClose={handleClose} duration={3000} />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
