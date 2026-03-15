import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConnectionStatusBadge, type ConnectionStatus } from '../connection-status';

describe('ConnectionStatusBadge', () => {
  it('should display "接続中" when connected', () => {
    // Given / When
    render(<ConnectionStatusBadge status="connected" />);

    // Then
    expect(screen.getByText('接続中')).toBeInTheDocument();
  });

  it('should display "接続待ち" when connecting', () => {
    // Given / When
    render(<ConnectionStatusBadge status="connecting" />);

    // Then
    expect(screen.getByText('接続待ち')).toBeInTheDocument();
  });

  it('should display "切断" when disconnected', () => {
    // Given / When
    render(<ConnectionStatusBadge status="disconnected" />);

    // Then
    expect(screen.getByText('切断')).toBeInTheDocument();
  });

  it('should render all status variants without errors', () => {
    // Given
    const statuses: ConnectionStatus[] = ['connected', 'connecting', 'disconnected'];

    // When / Then
    for (const status of statuses) {
      const { unmount } = render(<ConnectionStatusBadge status={status} />);
      unmount();
    }
  });
});
