import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JoinRoomForm } from '../join-room-form';

describe('JoinRoomForm', () => {
  it('should render userName input, roomId input, and join button', () => {
    // Given
    const onSubmit = vi.fn();

    // When
    render(<JoinRoomForm onSubmit={onSubmit} />);

    // Then
    expect(screen.getByLabelText(/ユーザー名/)).toBeInTheDocument();
    expect(screen.getByLabelText(/ルームID/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /参加/ })).toBeInTheDocument();
  });

  it('should call onSubmit with userName and roomId', async () => {
    // Given
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<JoinRoomForm onSubmit={onSubmit} />);

    // When
    await user.type(screen.getByLabelText(/ユーザー名/), 'Bob');
    await user.type(screen.getByLabelText(/ルームID/), 'room-xyz');
    await user.click(screen.getByRole('button', { name: /参加/ }));

    // Then
    expect(onSubmit).toHaveBeenCalledWith({ userName: 'Bob', roomId: 'room-xyz' });
  });

  it('should not submit when userName is empty', async () => {
    // Given
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<JoinRoomForm onSubmit={onSubmit} />);

    // When
    await user.type(screen.getByLabelText(/ルームID/), 'room-xyz');
    await user.click(screen.getByRole('button', { name: /参加/ }));

    // Then
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should not submit when roomId is empty', async () => {
    // Given
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<JoinRoomForm onSubmit={onSubmit} />);

    // When
    await user.type(screen.getByLabelText(/ユーザー名/), 'Bob');
    await user.click(screen.getByRole('button', { name: /参加/ }));

    // Then
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should trim whitespace from inputs', async () => {
    // Given
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<JoinRoomForm onSubmit={onSubmit} />);

    // When
    await user.type(screen.getByLabelText(/ユーザー名/), '  Bob  ');
    await user.type(screen.getByLabelText(/ルームID/), '  room-xyz  ');
    await user.click(screen.getByRole('button', { name: /参加/ }));

    // Then
    expect(onSubmit).toHaveBeenCalledWith({ userName: 'Bob', roomId: 'room-xyz' });
  });

  it('should render submit button as enabled', () => {
    // Given
    const onSubmit = vi.fn();

    // When
    render(<JoinRoomForm onSubmit={onSubmit} />);

    // Then
    expect(screen.getByRole('button', { name: /参加/ })).toBeEnabled();
  });
});
