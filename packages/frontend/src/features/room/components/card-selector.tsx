import { CARD_VALUES } from '../../../shared/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CardSelectorProps {
  onSelect: (value: string) => void;
  disabled: boolean;
  selectedCard: string | null;
  isRevote: boolean;
}

export function CardSelector({ onSelect, disabled, selectedCard, isRevote }: CardSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CARD_VALUES.map((value) => {
        const isSelected = value === selectedCard;

        return (
          <div key={value} className="relative">
            <Button
              disabled={disabled}
              aria-pressed={isSelected ? 'true' : 'false'}
              onClick={() => onSelect(value)}
              variant={isSelected ? 'default' : 'outline'}
              size="lg"
              className={`w-16 h-20 text-xl font-bold transition-all duration-200 ${isSelected
                ? `ring-2 ring-primary scale-105 -translate-y-1 shadow-lg ${isRevote ? 'animate-pulse' : ''}`
                : 'hover:-translate-y-1 hover:shadow-md'
                }`}
            >
              {value}
            </Button>
            {isSelected && (
              <Badge
                variant="default"
                className="absolute -top-2 -right-2 size-5 p-0 justify-center"
                aria-label="投票済み"
              >
                ✔
              </Badge>
            )}
          </div>
        );
      })}
    </div>
  );
}
