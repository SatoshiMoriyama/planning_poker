import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import JoinRoute from '../join';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderJoinRoute(roomId: string) {
  return render(
    <MemoryRouter initialEntries={[`/join/${roomId}`]}>
      <Routes>
        <Route path="/join/:roomId" element={<JoinRoute />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('JoinRoute', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('should pass roomId from URL params to JoinView', () => {
    // Given
    const roomId = 'test-room-123';

    // When
    renderJoinRoute(roomId);

    // Then
    expect(screen.getByText(/test-room-123/)).toBeInTheDocument();
  });

  it('should render JoinView with user name input and join button', () => {
    // Given / When
    renderJoinRoute('room-abc');

    // Then
    expect(screen.getByLabelText(/ユーザー名/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /参加/ })).toBeInTheDocument();
  });

  it('should navigate to /room/:roomId with userName and mode when form is submitted', async () => {
    // Given
    const user = userEvent.setup();
    renderJoinRoute('room-abc');

    // When
    await user.type(screen.getByLabelText(/ユーザー名/), 'Alice');
    await user.click(screen.getByRole('button', { name: /参加/ }));

    // Then
    expect(mockNavigate).toHaveBeenCalledWith('/room/room-abc', {
      state: { userName: 'Alice', mode: 'join' },
    });
  });

  it('should not navigate when userName is empty', async () => {
    // Given
    const user = userEvent.setup();
    renderJoinRoute('room-abc');

    // When
    await user.click(screen.getByRole('button', { name: /参加/ }));

    // Then
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should not render roomId input field (only name input)', () => {
    // Given / When
    renderJoinRoute('room-abc');

    // Then
    expect(screen.queryByLabelText(/ルームID/)).not.toBeInTheDocument();
  });
});
