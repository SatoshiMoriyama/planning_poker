import { type FormEvent, useState } from 'react';

interface JoinViewProps {
  roomId: string;
  onSubmit: (data: { userName: string }) => void;
}

export function JoinView({ roomId, onSubmit }: JoinViewProps) {
  const [userName, setUserName] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = userName.trim();
    if (!trimmed) return;
    onSubmit({ userName: trimmed });
  }

  return (
    <div className="max-w-md mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold text-center">ルームに参加</h1>
      <p className="text-center text-gray-600">
        ルーム: <span>{roomId}</span>
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="join-userName" className="block text-sm font-medium text-gray-700">
            ユーザー名
          </label>
          <input
            id="join-userName"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
        >
          参加
        </button>
      </form>
    </div>
  );
}
