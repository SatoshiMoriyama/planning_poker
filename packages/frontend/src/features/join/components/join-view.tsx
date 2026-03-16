import { type FormEvent, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

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
    <div className="max-w-md mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">ルームに参加</CardTitle>
          <p className="text-center text-muted-foreground">
            ルーム: <span>{roomId}</span>
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="join-userName">ユーザー名</Label>
              <Input
                id="join-userName"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              参加
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
