import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateRoomForm } from '../create-room-form';

describe('CreateRoomForm', () => {
  it('should render user name input and create button', () => {
    // Given
    const onSubmit = vi.fn();

    // When
    render(<CreateRoomForm onSubmit={onSubmit} />);

    // Then
    expect(screen.getByLabelText(/ユーザー名/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ルーム作成/ })).toBeInTheDocument();
  });

  it('should call onSubmit with userName when form is submitted', async () => {
    // Given
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<CreateRoomForm onSubmit={onSubmit} />);

    // When
    await user.type(screen.getByLabelText(/ユーザー名/), 'Alice');
    await user.click(screen.getByRole('button', { name: /ルーム作成/ }));

    // Then
    expect(onSubmit).toHaveBeenCalledWith({ userName: 'Alice' });
  });

  it('should not submit when userName is empty', async () => {
    // Given
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<CreateRoomForm onSubmit={onSubmit} />);

    // When
    await user.click(screen.getByRole('button', { name: /ルーム作成/ }));

    // Then
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should trim whitespace from userName', async () => {
    // Given
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<CreateRoomForm onSubmit={onSubmit} />);

    // When
    await user.type(screen.getByLabelText(/ユーザー名/), '  Alice  ');
    await user.click(screen.getByRole('button', { name: /ルーム作成/ }));

    // Then
    expect(onSubmit).toHaveBeenCalledWith({ userName: 'Alice' });
  });

  it('should render submit button as enabled', () => {
    // Given
    const onSubmit = vi.fn();

    // When
    render(<CreateRoomForm onSubmit={onSubmit} />);

    // Then
    expect(screen.getByRole('button', { name: /ルーム作成/ })).toBeEnabled();
  });
});
