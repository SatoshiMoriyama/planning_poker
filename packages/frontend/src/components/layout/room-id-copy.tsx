import { useState } from 'react';
import { Button } from '../ui/button';

interface RoomIdCopyProps {
  roomId: string;
}

export function RoomIdCopy({ roomId }: RoomIdCopyProps) {
  const [feedback, setFeedback] = useState<'copied' | 'error' | null>(null);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(roomId);
      setFeedback('copied');
    } catch {
      setFeedback('error');
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Room: {roomId}</span>
      <Button variant="ghost" size="xs" onClick={handleCopy}>
        コピー
      </Button>
      {feedback === 'copied' && (
        <span className="text-xs text-green-600">コピーしました</span>
      )}
      {feedback === 'error' && (
        <span className="text-xs text-red-600">コピーに失敗しました</span>
      )}
    </div>
  );
}
