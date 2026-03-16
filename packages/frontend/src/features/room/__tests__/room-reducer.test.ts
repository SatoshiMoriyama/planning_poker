import { describe, it, expect } from 'vitest';
import { roomReducer, type RoomState, type RoomAction } from '../room-reducer';

function createInitialState(overrides: Partial<RoomState> = {}): RoomState {
  return {
    roomId: 'room-abc',
    status: 'voting',
    participants: new Map([
      ['conn-creator', { connectionId: 'conn-creator', userName: 'Creator', hasVoted: false, vote: null }],
    ]),
    myConnectionId: 'conn-creator',
    myUserName: 'Creator',
    average: null,
    ...overrides,
  };
}

describe('roomReducer', () => {
  describe('participantJoined', () => {
    it('should add new participant to the map', () => {
      // Given
      const state = createInitialState();
      const action: RoomAction = {
        type: 'participantJoined',
        participant: { connectionId: 'conn-alice', userName: 'Alice' },
      };

      // When
      const next = roomReducer(state, action);

      // Then
      expect(next.participants.size).toBe(2);
      expect(next.participants.get('conn-alice')).toEqual({
        connectionId: 'conn-alice',
        userName: 'Alice',
        hasVoted: false,
        vote: null,
      });
    });

    it('should not mutate the original state', () => {
      // Given
      const state = createInitialState();
      const action: RoomAction = {
        type: 'participantJoined',
        participant: { connectionId: 'conn-alice', userName: 'Alice' },
      };

      // When
      roomReducer(state, action);

      // Then
      expect(state.participants.size).toBe(1);
    });
  });

  describe('participantLeft', () => {
    it('should remove participant from the map', () => {
      // Given
      const state = createInitialState({
        participants: new Map([
          ['conn-creator', { connectionId: 'conn-creator', userName: 'Creator', hasVoted: false, vote: null }],
          ['conn-alice', { connectionId: 'conn-alice', userName: 'Alice', hasVoted: false, vote: null }],
        ]),
      });
      const action: RoomAction = {
        type: 'participantLeft',
        connectionId: 'conn-alice',
      };

      // When
      const next = roomReducer(state, action);

      // Then
      expect(next.participants.size).toBe(1);
      expect(next.participants.has('conn-alice')).toBe(false);
    });

    it('should handle removing non-existent participant gracefully', () => {
      // Given
      const state = createInitialState();
      const action: RoomAction = {
        type: 'participantLeft',
        connectionId: 'conn-unknown',
      };

      // When
      const next = roomReducer(state, action);

      // Then
      expect(next.participants.size).toBe(1);
    });
  });

  describe('voteUpdate', () => {
    it('should update participants hasVoted status', () => {
      // Given
      const state = createInitialState({
        participants: new Map([
          ['conn-creator', { connectionId: 'conn-creator', userName: 'Creator', hasVoted: false, vote: null }],
          ['conn-alice', { connectionId: 'conn-alice', userName: 'Alice', hasVoted: false, vote: null }],
        ]),
      });
      const action: RoomAction = {
        type: 'voteUpdate',
        participants: [
          { connectionId: 'conn-creator', userName: 'Creator', hasVoted: true },
          { connectionId: 'conn-alice', userName: 'Alice', hasVoted: false },
        ],
      };

      // When
      const next = roomReducer(state, action);

      // Then
      expect(next.participants.get('conn-creator')?.hasVoted).toBe(true);
      expect(next.participants.get('conn-alice')?.hasVoted).toBe(false);
    });

    it('should keep status as voting', () => {
      // Given
      const state = createInitialState();
      const action: RoomAction = {
        type: 'voteUpdate',
        participants: [
          { connectionId: 'conn-creator', userName: 'Creator', hasVoted: true },
        ],
      };

      // When
      const next = roomReducer(state, action);

      // Then
      expect(next.status).toBe('voting');
    });
  });

  describe('revealed', () => {
    it('should change status to revealed', () => {
      // Given
      const state = createInitialState();
      const action: RoomAction = {
        type: 'revealed',
        participants: [
          { connectionId: 'conn-creator', userName: 'Creator', vote: '5' },
        ],
        average: 5,
      };

      // When
      const next = roomReducer(state, action);

      // Then
      expect(next.status).toBe('revealed');
    });

    it('should update participants with revealed votes', () => {
      // Given
      const state = createInitialState({
        participants: new Map([
          ['conn-creator', { connectionId: 'conn-creator', userName: 'Creator', hasVoted: true, vote: null }],
          ['conn-alice', { connectionId: 'conn-alice', userName: 'Alice', hasVoted: true, vote: null }],
        ]),
      });
      const action: RoomAction = {
        type: 'revealed',
        participants: [
          { connectionId: 'conn-creator', userName: 'Creator', vote: '5' },
          { connectionId: 'conn-alice', userName: 'Alice', vote: '8' },
        ],
        average: 6.5,
      };

      // When
      const next = roomReducer(state, action);

      // Then
      expect(next.participants.get('conn-creator')?.vote).toBe('5');
      expect(next.participants.get('conn-alice')?.vote).toBe('8');
    });

    it('should set average value', () => {
      // Given
      const state = createInitialState();
      const action: RoomAction = {
        type: 'revealed',
        participants: [
          { connectionId: 'conn-creator', userName: 'Creator', vote: '5' },
        ],
        average: 5,
      };

      // When
      const next = roomReducer(state, action);

      // Then
      expect(next.average).toBe(5);
    });

    it('should handle null average when no numeric votes', () => {
      // Given
      const state = createInitialState();
      const action: RoomAction = {
        type: 'revealed',
        participants: [
          { connectionId: 'conn-creator', userName: 'Creator', vote: '?' },
        ],
        average: null,
      };

      // When
      const next = roomReducer(state, action);

      // Then
      expect(next.average).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset status to voting', () => {
      // Given
      const state = createInitialState({ status: 'revealed', average: 5 });
      const action: RoomAction = { type: 'reset' };

      // When
      const next = roomReducer(state, action);

      // Then
      expect(next.status).toBe('voting');
    });

    it('should clear all votes and hasVoted flags', () => {
      // Given
      const state = createInitialState({
        status: 'revealed',
        participants: new Map([
          ['conn-creator', { connectionId: 'conn-creator', userName: 'Creator', hasVoted: true, vote: '5' }],
          ['conn-alice', { connectionId: 'conn-alice', userName: 'Alice', hasVoted: true, vote: '8' }],
        ]),
      });
      const action: RoomAction = { type: 'reset' };

      // When
      const next = roomReducer(state, action);

      // Then
      for (const [, participant] of next.participants) {
        expect(participant.vote).toBeNull();
        expect(participant.hasVoted).toBe(false);
      }
    });

    it('should clear average', () => {
      // Given
      const state = createInitialState({ status: 'revealed', average: 6.5 });
      const action: RoomAction = { type: 'reset' };

      // When
      const next = roomReducer(state, action);

      // Then
      expect(next.average).toBeNull();
    });

    it('should preserve participant list after reset', () => {
      // Given
      const state = createInitialState({
        status: 'revealed',
        participants: new Map([
          ['conn-creator', { connectionId: 'conn-creator', userName: 'Creator', hasVoted: true, vote: '5' }],
          ['conn-alice', { connectionId: 'conn-alice', userName: 'Alice', hasVoted: true, vote: '8' }],
        ]),
      });
      const action: RoomAction = { type: 'reset' };

      // When
      const next = roomReducer(state, action);

      // Then
      expect(next.participants.size).toBe(2);
      expect(next.participants.has('conn-creator')).toBe(true);
      expect(next.participants.has('conn-alice')).toBe(true);
    });
  });

  describe('error', () => {
    it('should not modify state on error message', () => {
      // Given
      const state = createInitialState();
      const action: RoomAction = {
        type: 'error',
        message: 'Something went wrong',
      };

      // When
      const next = roomReducer(state, action);

      // Then
      expect(next).toEqual(state);
    });
  });

  describe('host concept removal', () => {
    it('should not have isHost in RoomState', () => {
      // Given
      const state = createInitialState();

      // Then
      expect(state).not.toHaveProperty('isHost');
    });
  });
});
