// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import ErrorBoundary from '../ErrorBoundary';

const ProblemChild = () => {
  throw new Error('Test error');
};

describe('ErrorBoundary', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child-element">Child content</div>
      </ErrorBoundary>
    );
    expect(screen.getByTestId('child-element')).toBeInTheDocument();
  });

  it('renders fallback UI when an error is thrown', () => {
    // Suppress console.error to keep test output clean
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('Beklenmeyen Bir Hata Oluştu')).toBeInTheDocument();
    expect(screen.getByText('Uygulama çalışırken bir sorunla karşılaştık. Lütfen sayfayı yenilemeyi deneyin.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sayfayı Yenile/i })).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
