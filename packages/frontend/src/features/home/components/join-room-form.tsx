import { type FormEvent, useState } from 'react';

interface JoinRoomFormProps {
  onSubmit: (data: { userName: string; roomId: string }) => void;
}

export function JoinRoomForm({ onSubmit }: JoinRoomFormProps) {
  const [userName, setUserName] = useState('');
  const [roomId, setRoomId] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedUserName = userName.trim();
    const trimmedRoomId = roomId.trim();
    if (!trimmedUserName || !trimmedRoomId) return;
    onSubmit({ userName: trimmedUserName, roomId: trimmedRoomId });
  }

  return (
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
      <div>
        <label htmlFor="join-roomId" className="block text-sm font-medium text-gray-700">
          ルームID
        </label>
        <input
          id="join-roomId"
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
      <button
        type="submit"
        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
      >
        参加
      </button>
    </form>
  );
}
