import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoomIdCopy } from '../room-id-copy';

describe('RoomIdCopy', () => {
  it('should display the room ID', () => {
    // Given / When
    render(<RoomIdCopy roomId="test-room-123" />);

    // Then
    expect(screen.getByText(/test-room-123/)).toBeInTheDocument();
  });

  it('should render a copy button', () => {
    // Given / When
    render(<RoomIdCopy roomId="test-room-123" />);

    // Then
    expect(screen.getByRole('button', { name: /コピー/ })).toBeInTheDocument();
  });

  it('should copy the room ID to clipboard when copy button is clicked', async () => {
    // Given
    const user = userEvent.setup();
    render(<RoomIdCopy roomId="test-room-123" />);
    const writeTextSpy = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue(undefined);

    // When
    await user.click(screen.getByRole('button', { name: /コピー/ }));

    // Then
    expect(writeTextSpy).toHaveBeenCalledWith('test-room-123');
  });

  it('should show feedback after successful copy', async () => {
    // Given
    const user = userEvent.setup();
    render(<RoomIdCopy roomId="test-room-123" />);
    vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

    // When
    await user.click(screen.getByRole('button', { name: /コピー/ }));

    // Then
    expect(screen.getByText(/コピーしました/)).toBeInTheDocument();
  });

  it('should show error feedback when clipboard write fails', async () => {
    // Given
    const user = userEvent.setup();
    render(<RoomIdCopy roomId="test-room-123" />);
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(
      new Error('denied'),
    );

    // When
    await user.click(screen.getByRole('button', { name: /コピー/ }));

    // Then
    expect(screen.getByText(/コピーに失敗しました/)).toBeInTheDocument();
  });
});
