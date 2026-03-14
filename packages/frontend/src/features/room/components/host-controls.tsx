import type { RoomStatus } from '../../../shared/lib/types';

interface HostControlsProps {
  status: RoomStatus;
  onReveal: () => void;
  onReset: () => void;
}

export function HostControls({ status, onReveal, onReset }: HostControlsProps) {
  if (status === 'voting') {
    return (
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onReveal}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
        >
          公開
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onReset}
        className="px-6 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700"
      >
        リセット
      </button>
    </div>
  );
}
