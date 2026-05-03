// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import ErrorBoundary from '../ErrorBoundary';

// Component that throws an error to test the boundary
const ProblemChild = () => {
  throw new Error('Test Error');
};

describe('ErrorBoundary', () => {
  // Suppress console.error since we expect an error to be logged by React/ErrorBoundary
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Child Component</div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders fallback UI when an error occurs in a child component', () => {
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('Beklenmeyen Bir Hata Oluştu')).toBeInTheDocument();
    expect(screen.getByText('Test Error')).toBeInTheDocument();
  });

  it('calls window.location.reload when reload button is clicked', () => {
    const originalLocation = window.location;

    // Mock window.location
    // Note: We can't completely replace window.location in jsdom easily,
    // but we can mock the reload method
    Object.defineProperty(window, 'location', {
        value: { reload: vi.fn() },
        writable: true
    });

    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    const reloadButton = screen.getAllByText('Sayfayı Yenile')[0];
    fireEvent.click(reloadButton);

    expect(window.location.reload).toHaveBeenCalled();

    // Restore
    window.location = originalLocation;
  });
});
