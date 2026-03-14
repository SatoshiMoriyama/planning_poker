export interface Connection {
  connectionId: string;
  roomId: string;
  userName: string;
  ttl: number;
}

export interface Participant {
  connectionId: string;
  userName: string;
  vote: string | null;
  hasVoted: boolean;
}

export type RoomStatus = 'voting' | 'revealed';

export interface Room {
  roomId: string;
  hostConnectionId: string;
  status: RoomStatus;
  participants: Record<string, Participant>;
  ttl: number;
}
