import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JoinView } from '../join-view';

describe('JoinView', () => {
  it('should render user name input and join button', () => {
    // Given
    const onSubmit = vi.fn();

    // When
    render(<JoinView roomId="room-abc" onSubmit={onSubmit} />);

    // Then
    expect(screen.getByLabelText(/ユーザー名/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /参加/ })).toBeInTheDocument();
  });

  it('should display the roomId so users know which room they are joining', () => {
    // Given
    const onSubmit = vi.fn();

    // When
    render(<JoinView roomId="room-abc" onSubmit={onSubmit} />);

    // Then
    expect(screen.getByText(/room-abc/)).toBeInTheDocument();
  });

  it('should call onSubmit with userName when form is submitted', async () => {
    // Given
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<JoinView roomId="room-abc" onSubmit={onSubmit} />);

    // When
    await user.type(screen.getByLabelText(/ユーザー名/), 'Alice');
    await user.click(screen.getByRole('button', { name: /参加/ }));

    // Then
    expect(onSubmit).toHaveBeenCalledWith({ userName: 'Alice' });
  });

  it('should not submit when userName is empty', async () => {
    // Given
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<JoinView roomId="room-abc" onSubmit={onSubmit} />);

    // When
    await user.click(screen.getByRole('button', { name: /参加/ }));

    // Then
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should trim whitespace from userName', async () => {
    // Given
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<JoinView roomId="room-abc" onSubmit={onSubmit} />);

    // When
    await user.type(screen.getByLabelText(/ユーザー名/), '  Alice  ');
    await user.click(screen.getByRole('button', { name: /参加/ }));

    // Then
    expect(onSubmit).toHaveBeenCalledWith({ userName: 'Alice' });
  });

  it('should not render roomId input field', () => {
    // Given
    const onSubmit = vi.fn();

    // When
    render(<JoinView roomId="room-abc" onSubmit={onSubmit} />);

    // Then
    expect(screen.queryByLabelText(/ルームID/)).not.toBeInTheDocument();
  });
});
