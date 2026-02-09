import { render, screen, fireEvent } from '@testing-library/react';
import ErrorState from '../ErrorState';
import { describe, it, expect, vi } from 'vitest';

describe('ErrorState', () => {
  it('renders correctly with message', () => {
    render(<ErrorState message="Test Error" />);
    expect(screen.getByText('Test Error')).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Error" onRetry={onRetry} />);

    const button = screen.getByText('Tekrar Dene');
    fireEvent.click(button);

    expect(onRetry).toHaveBeenCalled();
  });
});
