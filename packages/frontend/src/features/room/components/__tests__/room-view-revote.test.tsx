import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { RoomView } from '../room-view';
import type { ServerMessage } from '../../../../shared/lib/types';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

let mockLastMessage: ServerMessage | null = null;
const mockSend = vi.fn();
const mockConnect = vi.fn();

vi.mock('../../../../shared/hooks/use-websocket', () => ({
  useWebSocket: () => ({
    status: 'connected' as const,
    lastMessage: mockLastMessage,
    error: null,
    connect: mockConnect,
    send: mockSend,
  }),
}));

const defaultProps = {
  roomId: 'room-1',
  wsUrl: 'ws://localhost',
  userName: 'テスト太郎',
  mode: 'join' as const,
  onConnectionStatusChange: vi.fn(),
};

describe('RoomView revote behavior', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockLastMessage = null;
    mockSend.mockClear();
    mockConnect.mockClear();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function renderWithJoin() {
    mockLastMessage = {
      type: 'roomJoined',
      roomId: 'room-1',
      status: 'voting',
      participants: [],
      you: { connectionId: 'conn-1', userName: 'テスト太郎' },
    };
    return render(<RoomView {...defaultProps} />);
  }

  it('should not show revote message on first vote', () => {
    // Given
    renderWithJoin();

    // When
    fireEvent.click(screen.getByRole('button', { name: '5' }));

    // Then
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(mockSend).toHaveBeenCalledWith({ action: 'vote', cardValue: '5' });
  });

  it('should show revote message when changing vote', () => {
    // Given
    renderWithJoin();

    // When - first vote then change
    fireEvent.click(screen.getByRole('button', { name: '5' }));
    fireEvent.click(screen.getByRole('button', { name: '8' }));

    // Then
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveTextContent('投票を変更しました');
  });

  it('should auto-clear revote message after timeout', () => {
    // Given
    renderWithJoin();

    // When - trigger revote
    fireEvent.click(screen.getByRole('button', { name: '5' }));
    fireEvent.click(screen.getByRole('button', { name: '8' }));
    expect(screen.getByRole('status')).toBeInTheDocument();

    // When - advance timer past REVOTE_MESSAGE_DURATION_MS (2000ms)
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Then
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('should clear revote state on reset from server', () => {
    // Given
    const { rerender } = renderWithJoin();

    // trigger revote
    fireEvent.click(screen.getByRole('button', { name: '5' }));
    fireEvent.click(screen.getByRole('button', { name: '8' }));
    expect(screen.getByRole('status')).toBeInTheDocument();

    // When - server sends reset
    mockLastMessage = { type: 'reset' };
    rerender(<RoomView {...defaultProps} />);

    // Then
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
