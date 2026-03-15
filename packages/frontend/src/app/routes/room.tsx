import { useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AppLayout } from '../../components/layout/app-layout';
import { RoomIdCopy } from '../../components/layout/room-id-copy';
import { ConnectionStatusBadge, type ConnectionStatus } from '../../components/layout/connection-status';
import { RoomView } from '../../features/room/components/room-view';
import { getConfig } from '../../shared/lib/config';

export default function RoomRoute() {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const state = location.state as { userName?: string; mode?: 'create' | 'join' } | null;
  const userName = state?.userName;
  const mode = state?.mode;

  const [wsUrl, setWsUrl] = useState<string | null>(null);
  const [configError, setConfigError] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');

  useEffect(() => {
    getConfig()
      .then((config) => setWsUrl(config.wsUrl))
      .catch(() => setConfigError(true));
  }, []);

  if (!roomId) {
    throw new Error('roomId is required');
  }

  if (!userName) {
    throw new Error('userName is required');
  }

  if (!mode) {
    throw new Error('mode is required');
  }

  const headerCenter = <RoomIdCopy roomId={roomId} />;
  const headerRight = (
    <>
      <span className="text-sm">{userName}</span>
      <ConnectionStatusBadge status={connectionStatus} />
    </>
  );

  if (configError) {
    return (
      <AppLayout headerCenter={headerCenter} headerRight={headerRight}>
        <p className="text-red-600 p-8">WebSocket URL が設定されていません</p>
      </AppLayout>
    );
  }

  if (!wsUrl) {
    return (
      <AppLayout headerCenter={headerCenter} headerRight={headerRight}>
        <p className="p-8">読み込み中...</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout headerCenter={headerCenter} headerRight={headerRight}>
      <RoomView
        roomId={roomId}
        wsUrl={wsUrl}
        userName={userName}
        mode={mode}
        onConnectionStatusChange={setConnectionStatus}
      />
    </AppLayout>
  );
}
