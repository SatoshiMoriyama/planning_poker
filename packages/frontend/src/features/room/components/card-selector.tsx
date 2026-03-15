import { CARD_VALUES } from '../../../shared/lib/types';
import { Button } from '@/components/ui/button';

interface CardSelectorProps {
  onSelect: (value: string) => void;
  disabled: boolean;
  selectedCard: string | null;
}

export function CardSelector({ onSelect, disabled, selectedCard }: CardSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CARD_VALUES.map((value) => (
        <Button
          key={value}
          disabled={disabled}
          aria-pressed={value === selectedCard ? 'true' : 'false'}
          onClick={() => onSelect(value)}
          variant={value === selectedCard ? 'default' : 'outline'}
          size="lg"
          className={`w-12 h-14 text-lg font-bold transition-all duration-200 ${value === selectedCard
              ? 'scale-105 -translate-y-1 shadow-lg'
              : 'hover:-translate-y-1 hover:shadow-md'
            }`}
        >
          {value}
        </Button>
      ))}
    </div>
  );
}
