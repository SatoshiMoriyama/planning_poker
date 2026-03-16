import type { RevealedParticipant } from '../../../shared/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

function getSpreadInfo(participants: RevealedParticipant[]) {
  const numericVotes = participants
    .map((p) => p.vote)
    .filter((v): v is string => v !== null && v !== '?')
    .map(Number);

  if (numericVotes.length === 0) return null;

  const min = Math.min(...numericVotes);
  const max = Math.max(...numericVotes);
  const allSame = min === max;

  return { min, max, allSame };
}

export function VotingResult({ participants, average }: VotingResultProps) {
  if (participants.length === 0) {
    return null;
  }

  const spread = getSpreadInfo(participants);

  return (
    <Card>
      <CardHeader className="space-y-2">
        <CardTitle className="text-center flex items-baseline justify-center gap-1">
          平均: {average !== null ? <AverageDisplay average={average} /> : '-'}
        </CardTitle>
        {spread && (
          <div className="flex items-center justify-center gap-2">
            {spread.allSame ? (
              <Badge variant="default">✓ 全員一致</Badge>
            ) : (
              <>
                <span className="text-sm text-muted-foreground">
                  範囲: {spread.min} 〜 {spread.max}
                </span>
                <Badge variant="destructive">⚠ 意見が分かれています</Badge>
              </>
            )}
          </div>
        )}
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
