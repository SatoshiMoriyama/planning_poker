import { CARD_VALUES } from '../../../shared/lib/types';

interface CardSelectorProps {
  onSelect: (value: string) => void;
  disabled: boolean;
  selectedCard: string | null;
}

export function CardSelector({ onSelect, disabled, selectedCard }: CardSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CARD_VALUES.map((value) => (
        <button
          key={value}
          type="button"
          disabled={disabled}
          aria-pressed={value === selectedCard ? 'true' : 'false'}
          onClick={() => onSelect(value)}
          className={`px-4 py-3 rounded-lg border-2 font-bold text-lg transition-colors ${
            value === selectedCard
              ? 'border-blue-600 bg-blue-100 text-blue-800'
              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {value}
        </button>
      ))}
    </div>
  );
}
