import { type FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
      <div className="space-y-2">
        <Label htmlFor="join-userName">ユーザー名</Label>
        <Input
          id="join-userName"
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="名前を入力"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="join-roomId">ルームID</Label>
        <Input
          id="join-roomId"
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="ルームIDを入力"
        />
      </div>
      <Button type="submit" variant="secondary" className="w-full">
        参加
      </Button>
    </form>
  );
}
