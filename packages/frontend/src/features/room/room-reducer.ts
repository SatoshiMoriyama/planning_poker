import type { RoomStatus } from '../../shared/lib/types';

export interface ParticipantState {
  connectionId: string;
  userName: string;
  hasVoted: boolean;
  vote: string | null;
}

export interface RoomState {
  roomId: string;
  status: RoomStatus;
  participants: Map<string, ParticipantState>;
  myConnectionId: string;
  myUserName: string;
  average: number | null;
}

export type RoomAction =
  | { type: 'participantJoined'; participant: { connectionId: string; userName: string } }
  | { type: 'participantLeft'; connectionId: string }
  | { type: 'voteUpdate'; participants: { connectionId: string; userName: string; hasVoted: boolean }[] }
  | { type: 'revealed'; participants: { connectionId: string; userName: string; vote: string | null }[]; average: number | null }
  | { type: 'reset' }
  | { type: 'error'; message: string };

export function roomReducer(state: RoomState, action: RoomAction): RoomState {
  switch (action.type) {
    case 'participantJoined': {
      const next = new Map(state.participants);
      next.set(action.participant.connectionId, {
        connectionId: action.participant.connectionId,
        userName: action.participant.userName,
        hasVoted: false,
        vote: null,
      });
      return { ...state, participants: next };
    }

    case 'participantLeft': {
      const next = new Map(state.participants);
      next.delete(action.connectionId);
      return { ...state, participants: next };
    }

    case 'voteUpdate': {
      const next = new Map<string, ParticipantState>();
      for (const p of action.participants) {
        const existing = state.participants.get(p.connectionId);
        next.set(p.connectionId, {
          connectionId: p.connectionId,
          userName: p.userName,
          hasVoted: p.hasVoted,
          vote: existing?.vote ?? null,
        });
      }
      return { ...state, participants: next };
    }

    case 'revealed': {
      const next = new Map<string, ParticipantState>();
      for (const p of action.participants) {
        next.set(p.connectionId, {
          connectionId: p.connectionId,
          userName: p.userName,
          hasVoted: true,
          vote: p.vote,
        });
      }
      return { ...state, status: 'revealed', participants: next, average: action.average };
    }

    case 'reset': {
      const next = new Map<string, ParticipantState>();
      for (const [key, p] of state.participants) {
        next.set(key, { ...p, hasVoted: false, vote: null });
      }
      return { ...state, status: 'voting', participants: next, average: null };
    }

    case 'error': {
      return state;
    }
  }
}
