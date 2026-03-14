import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CardSelector } from '../card-selector';

const CARD_VALUES = ['1', '2', '3', '5', '8', '13', '21', '?'] as const;

describe('CardSelector', () => {
  it('should render all card values as buttons', () => {
    // Given
    const onSelect = vi.fn();

    // When
    render(<CardSelector onSelect={onSelect} disabled={false} selectedCard={null} />);

    // Then
    for (const value of CARD_VALUES) {
      expect(screen.getByRole('button', { name: value })).toBeInTheDocument();
    }
  });

  it('should call onSelect with the card value when a card is clicked', async () => {
    // Given
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<CardSelector onSelect={onSelect} disabled={false} selectedCard={null} />);

    // When
    await user.click(screen.getByRole('button', { name: '5' }));

    // Then
    expect(onSelect).toHaveBeenCalledWith('5');
  });

  it('should highlight the selected card', () => {
    // Given
    const onSelect = vi.fn();

    // When
    render(<CardSelector onSelect={onSelect} disabled={false} selectedCard="8" />);

    // Then
    const selectedButton = screen.getByRole('button', { name: '8' });
    expect(selectedButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('should not highlight unselected cards', () => {
    // Given
    const onSelect = vi.fn();

    // When
    render(<CardSelector onSelect={onSelect} disabled={false} selectedCard="8" />);

    // Then
    const unselectedButton = screen.getByRole('button', { name: '5' });
    expect(unselectedButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('should disable all cards when disabled prop is true', () => {
    // Given
    const onSelect = vi.fn();

    // When
    render(<CardSelector onSelect={onSelect} disabled={true} selectedCard={null} />);

    // Then
    for (const value of CARD_VALUES) {
      expect(screen.getByRole('button', { name: value })).toBeDisabled();
    }
  });

  it('should not call onSelect when disabled', async () => {
    // Given
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<CardSelector onSelect={onSelect} disabled={true} selectedCard={null} />);

    // When
    await user.click(screen.getByRole('button', { name: '5' }));

    // Then
    expect(onSelect).not.toHaveBeenCalled();
  });
});
