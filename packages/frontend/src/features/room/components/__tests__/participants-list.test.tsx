import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ParticipantsList } from '../participants-list';

interface ParticipantDisplay {
  connectionId: string;
  userName: string;
  hasVoted: boolean;
  vote: string | null;
}

describe('ParticipantsList', () => {
  const baseParticipants: ParticipantDisplay[] = [
    { connectionId: 'conn-host', userName: 'Host', hasVoted: true, vote: null },
    { connectionId: 'conn-alice', userName: 'Alice', hasVoted: false, vote: null },
  ];

  describe('voting phase', () => {
    it('should render all participant names', () => {
      // When
      render(
        <ParticipantsList
          participants={baseParticipants}
          status="voting"
          myConnectionId="conn-host"
        />,
      );

      // Then
      expect(screen.getByText('Host (あなた)')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    it('should show voted indicator for participants who have voted', () => {
      // When
      render(
        <ParticipantsList
          participants={baseParticipants}
          status="voting"
          myConnectionId="conn-host"
        />,
      );

      // Then
      const hostItem = screen.getByText('Host (あなた)').closest('[data-testid]');
      expect(hostItem).toHaveAttribute('data-voted', 'true');
    });

    it('should not show card values during voting', () => {
      // Given
      const participants: ParticipantDisplay[] = [
        { connectionId: 'conn-host', userName: 'Host', hasVoted: true, vote: '5' },
      ];

      // When
      render(
        <ParticipantsList
          participants={participants}
          status="voting"
          myConnectionId="conn-other"
        />,
      );

      // Then
      expect(screen.queryByText('5')).not.toBeInTheDocument();
    });
  });

  describe('revealed phase', () => {
    it('should show card values when revealed', () => {
      // Given
      const participants: ParticipantDisplay[] = [
        { connectionId: 'conn-host', userName: 'Host', hasVoted: true, vote: '5' },
        { connectionId: 'conn-alice', userName: 'Alice', hasVoted: true, vote: '8' },
      ];

      // When
      render(
        <ParticipantsList
          participants={participants}
          status="revealed"
          myConnectionId="conn-host"
        />,
      );

      // Then
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
    });

    it('should indicate participants who did not vote', () => {
      // Given
      const participants: ParticipantDisplay[] = [
        { connectionId: 'conn-host', userName: 'Host', hasVoted: true, vote: '5' },
        { connectionId: 'conn-alice', userName: 'Alice', hasVoted: false, vote: null },
      ];

      // When
      render(
        <ParticipantsList
          participants={participants}
          status="revealed"
          myConnectionId="conn-host"
        />,
      );

      // Then
      const aliceItem = screen.getByText('Alice').closest('[data-testid]');
      expect(aliceItem).toHaveAttribute('data-voted', 'false');
    });
  });

  describe('self highlight', () => {
    it('should highlight the current user with "(あなた)" suffix', () => {
      // When
      render(
        <ParticipantsList
          participants={baseParticipants}
          status="voting"
          myConnectionId="conn-host"
        />,
      );

      // Then
      expect(screen.getByText(/あなた/)).toBeInTheDocument();
      expect(screen.getByText('Host (あなた)')).toBeInTheDocument();
      expect(screen.queryByText('Alice (あなた)')).not.toBeInTheDocument();
    });

    it('should apply distinct styling to the current user entry', () => {
      // When
      render(
        <ParticipantsList
          participants={baseParticipants}
          status="voting"
          myConnectionId="conn-host"
        />,
      );

      // Then
      const hostItem = screen.getByTestId('participant-conn-host');
      expect(hostItem.className).toContain('border-blue');
    });
  });

  describe('empty state', () => {
    it('should handle empty participants list', () => {
      // When
      render(
        <ParticipantsList
          participants={[]}
          status="voting"
          myConnectionId="conn-host"
        />,
      );

      // Then
      expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    });
  });
});
