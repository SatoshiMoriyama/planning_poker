import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InviteLink } from '../invite-link';

describe('InviteLink', () => {
  it('should display the invite URL containing the roomId', () => {
    // Given / When
    render(<InviteLink roomId="room-abc" />);

    // Then
    expect(screen.getByText(/\/join\/room-abc/)).toBeInTheDocument();
  });

  it('should render a copy button', () => {
    // Given / When
    render(<InviteLink roomId="room-abc" />);

    // Then
    expect(screen.getByRole('button', { name: /コピー/ })).toBeInTheDocument();
  });

  it('should copy the invite URL to clipboard when copy button is clicked', async () => {
    // Given
    const user = userEvent.setup();
    render(<InviteLink roomId="room-abc" />);
    // userEvent.setup() がclipboardポリフィルを提供するため、setup後にspyする
    const writeTextSpy = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue(undefined);

    // When
    await user.click(screen.getByRole('button', { name: /コピー/ }));

    // Then
    expect(writeTextSpy).toHaveBeenCalledWith(
      expect.stringContaining('/join/room-abc'),
    );
  });

  it('should show feedback after successful copy', async () => {
    // Given
    const user = userEvent.setup();
    render(<InviteLink roomId="room-abc" />);
    vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

    // When
    await user.click(screen.getByRole('button', { name: /コピー/ }));

    // Then
    expect(screen.getByText(/コピーしました/)).toBeInTheDocument();
  });

  it('should show error feedback when clipboard write fails', async () => {
    // Given
    const user = userEvent.setup();
    render(<InviteLink roomId="room-abc" />);
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(
      new Error('denied'),
    );

    // When
    await user.click(screen.getByRole('button', { name: /コピー/ }));

    // Then
    expect(screen.getByText(/コピーに失敗しました/)).toBeInTheDocument();
  });
});
