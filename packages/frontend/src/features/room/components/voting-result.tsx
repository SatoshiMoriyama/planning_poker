import type { RevealedParticipant } from '../../../shared/lib/types';

interface VotingResultProps {
  participants: RevealedParticipant[];
  average: number | null;
}

export function VotingResult({ participants, average }: VotingResultProps) {
  if (participants.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-sm text-gray-500">平均</p>
        <p className="text-3xl font-bold">{average !== null ? average : '-'}</p>
      </div>
      <ul className="space-y-1">
        {participants.map((p) => (
          <li key={p.connectionId} className="flex justify-between items-center p-2">
            <span>{p.userName}</span>
            <span className="font-bold">{p.vote !== null ? p.vote : '-'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
