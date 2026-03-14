import { type FormEvent, useState } from 'react';

interface CreateRoomFormProps {
  onSubmit: (data: { userName: string }) => void;
}

export function CreateRoomForm({ onSubmit }: CreateRoomFormProps) {
  const [userName, setUserName] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = userName.trim();
    if (!trimmed) return;
    onSubmit({ userName: trimmed });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="create-userName" className="block text-sm font-medium text-gray-700">
          ユーザー名
        </label>
        <input
          id="create-userName"
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
        ルーム作成
      </button>
    </form>
  );
}
