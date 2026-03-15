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
    <div className="flex flex-wrap gap-3">
      {participants.map((p) => {
        const isMe = p.connectionId === myConnectionId;
        const revealed = status === 'revealed' && p.hasVoted && p.vote !== null;

        return (
          <div
            key={p.connectionId}
            data-testid={`participant-${p.connectionId}`}
            data-voted={String(p.hasVoted)}
            className={`flex flex-col items-center justify-center w-20 h-24 rounded-lg border-2 font-bold text-lg transition-colors ${isMe
                ? 'border-blue-600 bg-blue-50'
                : p.hasVoted
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 bg-white'
              }`}
          >
            <span className="text-2xl mb-1">
              {revealed ? p.vote : p.hasVoted ? '✔' : '—'}
            </span>
            <span className="text-xs text-gray-600 truncate max-w-[4.5rem] text-center">
              {p.userName}{isMe ? ' (あなた)' : ''}
            </span>
          </div>
        );
      })}
    </div>
  );
}
