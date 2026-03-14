import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reset } from '../reset';

vi.mock('../../db/connections');
vi.mock('../../db/rooms');
vi.mock('../../websocket/broadcast');

import { getConnection } from '../../db/connections';
import { getRoom, resetVotes } from '../../db/rooms';
import { broadcastToRoom } from '../../websocket/broadcast';

const mockGetConnection = vi.mocked(getConnection);
const mockGetRoom = vi.mocked(getRoom);
const mockResetVotes = vi.mocked(resetVotes);
const mockBroadcastToRoom = vi.mocked(broadcastToRoom);

function createConnectionFixture(
  overrides: Record<string, unknown> = {},
) {
  return {
    connectionId: 'conn-host',
    roomId: 'room-xyz',
    userName: 'Host',
    ttl: Math.floor(Date.now() / 1000) + 9000,
    ...overrides,
  };
}

function createRoomFixture(
  overrides: Record<string, unknown> = {},
) {
  return {
    roomId: 'room-xyz',
    hostConnectionId: 'conn-host',
    status: 'revealed' as const,
    participants: {
      'conn-host': {
        connectionId: 'conn-host',
        userName: 'Host',
        vote: '5',
        hasVoted: true,
      },
      'conn-member': {
        connectionId: 'conn-member',
        userName: 'Member',
        vote: '8',
        hasVoted: true,
      },
    },
    ttl: Math.floor(Date.now() / 1000) + 86400,
    ...overrides,
  };
}

describe('reset', () => {
  const hostConnectionId = 'conn-host';

  beforeEach(() => {
    vi.clearAllMocks();
    mockResetVotes.mockResolvedValue(undefined);
    mockBroadcastToRoom.mockResolvedValue(undefined);
  });

  it('should reset votes in the room', async () => {
    // Given
    mockGetConnection.mockResolvedValue(
      createConnectionFixture(),
    );
    mockGetRoom.mockResolvedValue(createRoomFixture());

    // When
    await reset(hostConnectionId);

    // Then
    expect(mockResetVotes).toHaveBeenCalledWith('room-xyz');
  });

  it('should broadcast reset message to all participants', async () => {
    // Given
    mockGetConnection.mockResolvedValue(
      createConnectionFixture(),
    );
    mockGetRoom.mockResolvedValue(createRoomFixture());

    // When
    await reset(hostConnectionId);

    // Then
    expect(mockBroadcastToRoom).toHaveBeenCalledWith(
      'room-xyz',
      expect.objectContaining({ type: 'reset' }),
    );
  });

  it('should throw when non-host tries to reset', async () => {
    // Given
    const nonHostConnectionId = 'conn-member';
    mockGetConnection.mockResolvedValue(
      createConnectionFixture({
        connectionId: nonHostConnectionId,
      }),
    );
    mockGetRoom.mockResolvedValue(createRoomFixture());

    // When & Then
    await expect(reset(nonHostConnectionId)).rejects.toThrow();
  });

  it('should throw when connection not found', async () => {
    // Given
    mockGetConnection.mockResolvedValue(null);

    // When & Then
    await expect(reset(hostConnectionId)).rejects.toThrow();
  });
});
