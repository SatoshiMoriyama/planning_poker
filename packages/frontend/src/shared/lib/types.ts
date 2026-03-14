export type RoomStatus = 'voting' | 'revealed';

export interface ParticipantInfo {
  connectionId: string;
  userName: string;
  hasVoted: boolean;
}

export interface RevealedParticipant {
  connectionId: string;
  userName: string;
  vote: string | null;
}

export interface YouInfo {
  connectionId: string;
  userName: string;
  isHost: boolean;
}

export type ClientMessage =
  | { action: 'createRoom'; userName: string }
  | { action: 'joinRoom'; roomId: string; userName: string }
  | { action: 'vote'; cardValue: string }
  | { action: 'reveal' }
  | { action: 'reset' };

export type ServerMessage =
  | { type: 'roomCreated'; roomId: string; you: YouInfo }
  | { type: 'roomJoined'; roomId: string; status: RoomStatus; participants: ParticipantInfo[]; you: YouInfo }
  | { type: 'participantJoined'; participant: { connectionId: string; userName: string } }
  | { type: 'participantLeft'; connectionId: string }
  | { type: 'voteUpdate'; participants: ParticipantInfo[] }
  | { type: 'revealed'; participants: RevealedParticipant[]; average: number | null }
  | { type: 'reset' }
  | { type: 'error'; message: string };

export const CARD_VALUES = ['1', '2', '3', '5', '8', '13', '21', '?'] as const;
