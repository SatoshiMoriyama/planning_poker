import { useParams, useLocation } from 'react-router-dom';
import { RoomView } from '../../features/room/components/room-view';

const WS_URL = import.meta.env.VITE_WS_URL as string | undefined;

export default function RoomRoute() {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const state = location.state as { userName?: string; mode?: 'create' | 'join' } | null;
  const userName = state?.userName;
  const mode = state?.mode;

  if (!roomId) {
    throw new Error('roomId is required');
  }

  if (!userName) {
    throw new Error('userName is required');
  }

  if (!mode) {
    throw new Error('mode is required');
  }

  if (!WS_URL) {
    return <p className="text-red-600 p-8">WebSocket URL が設定されていません（VITE_WS_URL）</p>;
  }

  return <RoomView roomId={roomId} wsUrl={WS_URL} userName={userName} mode={mode} />;
}
