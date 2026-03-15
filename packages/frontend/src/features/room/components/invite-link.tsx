import { useState } from 'react';

interface InviteLinkProps {
  roomId: string;
}

export function InviteLink({ roomId }: InviteLinkProps) {
  const [feedback, setFeedback] = useState<'copied' | 'error' | null>(null);
  const url = `${window.location.origin}/join/${roomId}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setFeedback('copied');
    } catch {
      setFeedback('error');
    }
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-600 truncate">{url}</span>
      <button
        type="button"
        onClick={handleCopy}
        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-gray-700 whitespace-nowrap"
      >
        コピー
      </button>
      {feedback === 'copied' && (
        <span className="text-green-600 whitespace-nowrap">コピーしました</span>
      )}
      {feedback === 'error' && (
        <span className="text-red-600 whitespace-nowrap">コピーに失敗しました</span>
      )}
    </div>
  );
}
