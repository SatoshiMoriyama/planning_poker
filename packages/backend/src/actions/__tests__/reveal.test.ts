import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reveal } from '../reveal';

vi.mock('../../db/connections');
vi.mock('../../db/rooms');
vi.mock('../../websocket/broadcast');

import { getConnection } from '../../db/connections';
import { getRoom, updateStatus } from '../../db/rooms';
import { broadcastToRoom } from '../../websocket/broadcast';

const mockGetConnection = vi.mocked(getConnection);
const mockGetRoom = vi.mocked(getRoom);
const mockUpdateStatus = vi.mocked(updateStatus);
const mockBroadcastToRoom = vi.mocked(broadcastToRoom);

function createConnectionFixture(
  overrides: Record<string, unknown> = {},
) {
  return {
    connectionId: 'conn-creator',
    roomId: 'room-xyz',
    userName: 'Creator',
    ttl: Math.floor(Date.now() / 1000) + 9000,
    ...overrides,
  };
}

function createRoomFixture(
  overrides: Record<string, unknown> = {},
) {
  return {
    roomId: 'room-xyz',
    status: 'voting' as const,
    participants: {
      'conn-creator': {
        connectionId: 'conn-creator',
        userName: 'Creator',
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

describe('reveal', () => {
  const connectionId = 'conn-creator';

  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateStatus.mockResolvedValue(undefined);
    mockBroadcastToRoom.mockResolvedValue(undefined);
  });

  it('should update room status to revealed', async () => {
    // Given
    mockGetConnection.mockResolvedValue(
      createConnectionFixture(),
    );
    mockGetRoom.mockResolvedValue(createRoomFixture());

    // When
    await reveal(connectionId);

    // Then
    expect(mockUpdateStatus).toHaveBeenCalledWith(
      'room-xyz',
      'revealed',
    );
  });

  it('should broadcast revealed with all votes and average', async () => {
    // Given
    mockGetConnection.mockResolvedValue(
      createConnectionFixture(),
    );
    mockGetRoom.mockResolvedValue(createRoomFixture());

    // When
    await reveal(connectionId);

    // Then
    expect(mockBroadcastToRoom).toHaveBeenCalledWith(
      'room-xyz',
      expect.objectContaining({
        type: 'revealed',
        participants: expect.arrayContaining([
          expect.objectContaining({ userName: 'Creator', vote: '5' }),
          expect.objectContaining({
            userName: 'Member',
            vote: '8',
          }),
        ]),
        average: 6.5,
      }),
    );
  });

  it('should exclude "?" from average calculation', async () => {
    // Given
    mockGetConnection.mockResolvedValue(
      createConnectionFixture(),
    );
    const room = createRoomFixture({
      participants: {
        'conn-creator': {
          connectionId: 'conn-creator',
          userName: 'Creator',
          vote: '3',
          hasVoted: true,
        },
        'conn-member': {
          connectionId: 'conn-member',
          userName: 'Member',
          vote: '?',
          hasVoted: true,
        },
        'conn-third': {
          connectionId: 'conn-third',
          userName: 'Third',
          vote: '5',
          hasVoted: true,
        },
      },
    });
    mockGetRoom.mockResolvedValue(room);

    // When
    await reveal(connectionId);

    // Then
    const broadcastMessage =
      mockBroadcastToRoom.mock.calls[0][1] as {
        average: number | null;
      };
    expect(broadcastMessage.average).toBe(4);
  });

  it('should return null average when all votes are "?"', async () => {
    // Given
    mockGetConnection.mockResolvedValue(
      createConnectionFixture(),
    );
    const room = createRoomFixture({
      participants: {
        'conn-creator': {
          connectionId: 'conn-creator',
          userName: 'Creator',
          vote: '?',
          hasVoted: true,
        },
      },
    });
    mockGetRoom.mockResolvedValue(room);

    // When
    await reveal(connectionId);

    // Then
    const broadcastMessage =
      mockBroadcastToRoom.mock.calls[0][1] as {
        average: number | null;
      };
    expect(broadcastMessage.average).toBeNull();
  });

  it('should throw when room is already revealed', async () => {
    // Given
    mockGetConnection.mockResolvedValue(
      createConnectionFixture(),
    );
    mockGetRoom.mockResolvedValue(
      createRoomFixture({ status: 'revealed' }),
    );

    // When & Then
    await expect(reveal(connectionId)).rejects.toThrow();
  });
});
