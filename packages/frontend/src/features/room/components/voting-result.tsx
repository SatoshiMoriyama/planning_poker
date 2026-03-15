import type { RevealedParticipant } from '../../../shared/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VotingResultProps {
  participants: RevealedParticipant[];
  average: number | null;
}

export function VotingResult({ participants, average }: VotingResultProps) {
  if (participants.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">
          平均: <span className="text-2xl">{average !== null ? average : '-'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {participants.map((p) => (
          <div key={p.connectionId} className="flex justify-between items-center py-1.5 border-b last:border-0">
            <span className="text-sm">{p.userName}</span>
            <span className="font-bold">{p.vote !== null ? p.vote : '-'}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
