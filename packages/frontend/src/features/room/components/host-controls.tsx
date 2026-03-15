import type { RoomStatus } from '../../../shared/lib/types';
import { Button } from '@/components/ui/button';

interface HostControlsProps {
  status: RoomStatus;
  onReveal: () => void;
  onReset: () => void;
}

export function HostControls({ status, onReveal, onReset }: HostControlsProps) {
  return (
    <div className="flex gap-2">
      <Button onClick={onReveal} disabled={false}>
        公開
      </Button>
      <Button onClick={onReset} disabled={false} variant="secondary">
        リセット
      </Button>
    </div>
  );
}
