import type { RevealedParticipant } from '../../../shared/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VotingResultProps {
  participants: RevealedParticipant[];
  average: number | null;
}

function AverageDisplay({ average }: { average: number }) {
  const rounded = Math.round(average);
  if (Number.isInteger(average)) {
    return <span className="text-3xl font-bold">{rounded}</span>;
  }
  return (
    <>
      <span className="text-3xl font-bold">{rounded}</span>
      <span className="text-sm text-muted-foreground ml-1">({average.toFixed(1)})</span>
    </>
  );
}

export function VotingResult({ participants, average }: VotingResultProps) {
  if (participants.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center flex items-baseline justify-center gap-1">
          平均: {average !== null ? <AverageDisplay average={average} /> : '-'}
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
