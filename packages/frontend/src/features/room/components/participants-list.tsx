import type { RoomStatus } from '../../../shared/lib/types';

interface ParticipantDisplay {
  connectionId: string;
  userName: string;
  hasVoted: boolean;
  vote: string | null;
}

interface ParticipantsListProps {
  participants: ParticipantDisplay[];
  status: RoomStatus;
  myConnectionId: string;
}

export function ParticipantsList({ participants, status, myConnectionId }: ParticipantsListProps) {
  return (
    <ul className="space-y-2">
      {participants.map((p) => {
        const isMe = p.connectionId === myConnectionId;
        return (
          <li
            key={p.connectionId}
            data-testid={`participant-${p.connectionId}`}
            data-voted={String(p.hasVoted)}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              isMe ? 'border-blue-400 bg-blue-50' : p.hasVoted ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'
            }`}
          >
            <span className="font-medium">
              {p.userName}{isMe && ' (あなた)'}
            </span>
            <span className="text-lg font-bold">
              {status === 'revealed' && p.hasVoted && p.vote !== null ? p.vote : ''}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
