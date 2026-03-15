import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HostControls } from '../host-controls';

describe('HostControls', () => {
  describe('voting phase', () => {
    it('should show reveal button during voting', () => {
      // Given
      const onReveal = vi.fn();
      const onReset = vi.fn();

      // When
      render(<HostControls status="voting" onReveal={onReveal} onReset={onReset} />);

      // Then
      expect(screen.getByRole('button', { name: /公開/ })).toBeInTheDocument();
    });

    it('should call onReveal when reveal button is clicked', async () => {
      // Given
      const user = userEvent.setup();
      const onReveal = vi.fn();
      const onReset = vi.fn();
      render(<HostControls status="voting" onReveal={onReveal} onReset={onReset} />);

      // When
      await user.click(screen.getByRole('button', { name: /公開/ }));

      // Then
      expect(onReveal).toHaveBeenCalledOnce();
    });

    it('should show reset button during voting', () => {
      // Given
      const onReveal = vi.fn();
      const onReset = vi.fn();

      // When
      render(<HostControls status="voting" onReveal={onReveal} onReset={onReset} />);

      // Then
      expect(screen.getByRole('button', { name: /リセット/ })).toBeInTheDocument();
    });
  });

  describe('revealed phase', () => {
    it('should show reset button after reveal', () => {
      // Given
      const onReveal = vi.fn();
      const onReset = vi.fn();

      // When
      render(<HostControls status="revealed" onReveal={onReveal} onReset={onReset} />);

      // Then
      expect(screen.getByRole('button', { name: /リセット/ })).toBeInTheDocument();
    });

    it('should call onReset when reset button is clicked', async () => {
      // Given
      const user = userEvent.setup();
      const onReveal = vi.fn();
      const onReset = vi.fn();
      render(<HostControls status="revealed" onReveal={onReveal} onReset={onReset} />);

      // When
      await user.click(screen.getByRole('button', { name: /リセット/ }));

      // Then
      expect(onReset).toHaveBeenCalledOnce();
    });

    it('should show reveal button after reveal', () => {
      // Given
      const onReveal = vi.fn();
      const onReset = vi.fn();

      // When
      render(<HostControls status="revealed" onReveal={onReveal} onReset={onReset} />);

      // Then
      expect(screen.getByRole('button', { name: /公開/ })).toBeInTheDocument();
    });
  });
});
