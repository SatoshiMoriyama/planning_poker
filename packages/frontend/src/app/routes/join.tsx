import { useParams, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { AppLayout } from '../../components/layout/app-layout';
import { JoinView } from '../../features/join/components/join-view';

export default function JoinRoute() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  if (!roomId) {
    throw new Error('roomId is required');
  }

  const handleSubmit = useCallback(
    (data: { userName: string }) => {
      navigate(`/room/${roomId}`, { state: { userName: data.userName, mode: 'join' } });
    },
    [navigate, roomId],
  );

  return (
    <AppLayout>
      <JoinView roomId={roomId} onSubmit={handleSubmit} />
    </AppLayout>
  );
}
