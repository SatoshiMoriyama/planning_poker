import { Badge } from '../ui/badge';

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting';

const STATUS_CONFIG: Record<ConnectionStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  connected: { label: '接続中', variant: 'default' },
  connecting: { label: '接続待ち', variant: 'secondary' },
  disconnected: { label: '切断', variant: 'destructive' },
};

interface ConnectionStatusBadgeProps {
  status: ConnectionStatus;
}

export function ConnectionStatusBadge({ status }: ConnectionStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
