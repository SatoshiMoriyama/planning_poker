import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@aws-sdk/client-apigatewaymanagementapi');
vi.mock('../../db/rooms');
vi.mock('../../db/connections');

import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi';
import { getRoom, removeParticipant } from '../../db/rooms';
import { removeConnection } from '../../db/connections';
import { broadcastToRoom, sendToConnection } from '../broadcast';

const mockSend = vi.fn();
const mockGetRoom = vi.mocked(getRoom);
const mockRemoveConnection = vi.mocked(removeConnection);
const mockRemoveParticipant = vi.mocked(removeParticipant);

vi.mocked(ApiGatewayManagementApiClient).mockImplementation(
  () => ({ send: mockSend }) as never,
);

function createRoomFixture(
  participants: Record<string, { connectionId: string; userName: string; vote: string | null; hasVoted: boolean }>,
) {
  return {
    roomId: 'room-1',
    hostConnectionId: 'conn-host',
    status: 'voting' as const,
    participants,
    ttl: Math.floor(Date.now() / 1000) + 86400,
  };
}

function createGoneError(): Error {
  const error = new Error('Gone');
  (error as Error & { statusCode: number }).statusCode = 410;
  return error;
}

describe('sendToConnection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSend.mockResolvedValue({});
  });

  it('should send message via API Gateway', async () => {
    await sendToConnection('conn-1', { type: 'test' });

    expect(mockSend).toHaveBeenCalledWith(
      expect.any(PostToConnectionCommand),
    );
  });

  it('should propagate GoneException to caller', async () => {
    mockSend.mockRejectedValue(createGoneError());

    await expect(
      sendToConnection('conn-1', { type: 'test' }),
    ).rejects.toThrow();
  });

  it('should propagate non-Gone errors to caller', async () => {
    mockSend.mockRejectedValue(new Error('Network error'));

    await expect(
      sendToConnection('conn-1', { type: 'test' }),
    ).rejects.toThrow('Network error');
  });
});

describe('broadcastToRoom', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSend.mockResolvedValue({});
    mockRemoveConnection.mockResolvedValue(undefined);
    mockRemoveParticipant.mockResolvedValue(undefined);
  });

  it('should return early when room does not exist', async () => {
    mockGetRoom.mockResolvedValue(null);

    await broadcastToRoom('room-1', { type: 'test' });

    expect(mockSend).not.toHaveBeenCalled();
  });

  it('should send message to all participants', async () => {
    const room = createRoomFixture({
      'conn-1': { connectionId: 'conn-1', userName: 'A', vote: null, hasVoted: false },
      'conn-2': { connectionId: 'conn-2', userName: 'B', vote: null, hasVoted: false },
    });
    mockGetRoom.mockResolvedValue(room);

    await broadcastToRoom('room-1', { type: 'test' });

    expect(mockSend).toHaveBeenCalledTimes(2);
  });

  it('should exclude specified connectionId', async () => {
    const room = createRoomFixture({
      'conn-1': { connectionId: 'conn-1', userName: 'A', vote: null, hasVoted: false },
      'conn-2': { connectionId: 'conn-2', userName: 'B', vote: null, hasVoted: false },
    });
    mockGetRoom.mockResolvedValue(room);

    await broadcastToRoom('room-1', { type: 'test' }, 'conn-1');

    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it('should clean up connection and participant on GoneException', async () => {
    const room = createRoomFixture({
      'conn-gone': { connectionId: 'conn-gone', userName: 'Gone', vote: null, hasVoted: false },
    });
    mockGetRoom.mockResolvedValue(room);
    mockSend.mockRejectedValue(createGoneError());

    await broadcastToRoom('room-1', { type: 'test' });

    expect(mockRemoveConnection).toHaveBeenCalledWith('conn-gone');
    expect(mockRemoveParticipant).toHaveBeenCalledWith('room-1', 'conn-gone');
  });

  it('should rethrow non-Gone errors', async () => {
    const room = createRoomFixture({
      'conn-1': { connectionId: 'conn-1', userName: 'A', vote: null, hasVoted: false },
    });
    mockGetRoom.mockResolvedValue(room);
    mockSend.mockRejectedValue(new Error('Network error'));

    await expect(
      broadcastToRoom('room-1', { type: 'test' }),
    ).rejects.toThrow('Network error');
  });
});
