import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VotingResult } from '../voting-result';

interface RevealedParticipant {
  connectionId: string;
  userName: string;
  vote: string | null;
}

describe('VotingResult', () => {
  it('should display the average value', () => {
    // Given
    const participants: RevealedParticipant[] = [
      { connectionId: 'conn-host', userName: 'Host', vote: '5' },
      { connectionId: 'conn-alice', userName: 'Alice', vote: '8' },
    ];

    // When
    render(<VotingResult participants={participants} average={6.5} />);

    // Then
    expect(screen.getByText('(6.5)')).toBeInTheDocument();
  });

  it('should display each participant vote', () => {
    // Given
    const participants: RevealedParticipant[] = [
      { connectionId: 'conn-host', userName: 'Host', vote: '5' },
      { connectionId: 'conn-alice', userName: 'Alice', vote: '13' },
    ];

    // When
    render(<VotingResult participants={participants} average={9} />);

    // Then
    expect(screen.getByText('Host')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('13')).toBeInTheDocument();
  });

  it('should show indication when average is null', () => {
    // Given
    const participants: RevealedParticipant[] = [
      { connectionId: 'conn-host', userName: 'Host', vote: '?' },
    ];

    // When
    render(<VotingResult participants={participants} average={null} />);

    // Then
    expect(screen.getByText('平均:', { exact: false })).toHaveTextContent('平均: -');
  });

  it('should handle participant with null vote', () => {
    // Given
    const participants: RevealedParticipant[] = [
      { connectionId: 'conn-host', userName: 'Host', vote: '5' },
      { connectionId: 'conn-alice', userName: 'Alice', vote: null },
    ];

    // When
    render(<VotingResult participants={participants} average={5} />);

    // Then
    expect(screen.getByText('Host')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('should display range and unique count when votes differ', () => {
    // Given
    const participants: RevealedParticipant[] = [
      { connectionId: 'conn-host', userName: 'Host', vote: '3' },
      { connectionId: 'conn-alice', userName: 'Alice', vote: '8' },
      { connectionId: 'conn-bob', userName: 'Bob', vote: '8' },
    ];

    // When
    render(<VotingResult participants={participants} average={6.3} />);

    // Then
    expect(screen.getByText(/範囲: 3 〜 8/)).toBeInTheDocument();
    expect(screen.getByText(/2種類/)).toBeInTheDocument();
  });

  it('should show unanimous badge when all votes are the same', () => {
    // Given
    const participants: RevealedParticipant[] = [
      { connectionId: 'conn-host', userName: 'Host', vote: '5' },
      { connectionId: 'conn-alice', userName: 'Alice', vote: '5' },
    ];

    // When
    render(<VotingResult participants={participants} average={5} />);

    // Then
    expect(screen.getByText('✓ 全員一致')).toBeInTheDocument();
  });

  it('should not render when no participants provided', () => {
    // When
    const { container } = render(<VotingResult participants={[]} average={null} />);

    // Then
    expect(container.textContent).toBe('');
  });
});
