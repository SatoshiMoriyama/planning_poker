import type { RoomStatus } from '../../../shared/lib/types';

interface HostControlsProps {
  status: RoomStatus;
  onReveal: () => void;
  onReset: () => void;
}

export function HostControls({ status, onReveal, onReset }: HostControlsProps) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onReveal}
        disabled={false}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        公開
      </button>
      <button
        type="button"
        onClick={onReset}
        disabled={false}
        className="px-6 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        リセット
      </button>
    </div>
  );
}
