import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateRoomForm } from './create-room-form';
import { JoinRoomForm } from './join-room-form';

export function HomeView() {
  const navigate = useNavigate();

  const handleCreateRoom = useCallback((data: { userName: string }) => {
    navigate('/room/new', { state: { userName: data.userName, mode: 'create' } });
  }, [navigate]);

  const handleJoinRoom = useCallback((data: { userName: string; roomId: string }) => {
    navigate(`/room/${data.roomId}`, { state: { userName: data.userName, mode: 'join' } });
  }, [navigate]);

  return (
    <div className="max-w-md mx-auto p-8 space-y-8">
      <section>
        <h2 className="text-xl font-semibold mb-4">ルーム作成</h2>
        <CreateRoomForm onSubmit={handleCreateRoom} />
      </section>
      <hr />
      <section>
        <h2 className="text-xl font-semibold mb-4">ルームに参加</h2>
        <JoinRoomForm onSubmit={handleJoinRoom} />
      </section>
    </div>
  );
}
