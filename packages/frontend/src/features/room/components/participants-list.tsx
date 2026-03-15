import type { RoomStatus } from '../../../shared/lib/types';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

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
          <Card
            key={p.connectionId}
            data-testid={`participant-${p.connectionId}`}
            data-voted={String(p.hasVoted)}
            size="sm"
            className={`w-24 items-center py-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${isMe ? 'ring-2 ring-primary' : ''
              }`}
          >
            <Avatar size="lg">
              <AvatarFallback>
                {revealed ? p.vote : p.hasVoted ? '✔' : p.userName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center gap-1 px-2">
              <span className="text-xs truncate max-w-20 text-center">
                {p.userName}{isMe ? ' (あなた)' : ''}
              </span>
              {status === 'voting' && (
                <Badge variant={p.hasVoted ? 'default' : 'secondary'}>
                  {p.hasVoted ? '済' : '未'}
                </Badge>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
