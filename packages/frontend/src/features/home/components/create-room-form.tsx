import { type FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
      <div className="space-y-2">
        <Label htmlFor="create-userName">ユーザー名</Label>
        <Input
          id="create-userName"
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="名前を入力"
        />
      </div>
      <Button type="submit" className="w-full">
        ルーム作成
      </Button>
    </form>
  );
}
