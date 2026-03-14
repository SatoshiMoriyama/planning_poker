import { describe, it, expect, vi, beforeEach } from 'vitest';
import { vote } from '../vote';

vi.mock('../../db/connections');
vi.mock('../../db/rooms');
vi.mock('../../websocket/broadcast');

import { getConnection } from '../../db/connections';
import { getRoom, updateVote } from '../../db/rooms';
import { broadcastToRoom } from '../../websocket/broadcast';

const mockGetConnection = vi.mocked(getConnection);
const mockGetRoom = vi.mocked(getRoom);
const mockUpdateVote = vi.mocked(updateVote);
const mockBroadcastToRoom = vi.mocked(broadcastToRoom);

const VALID_CARDS = ['1', '2', '3', '5', '8', '13', '21', '?'];

function createConnectionFixture(
  overrides: Record<string, unknown> = {},
) {
  return {
    connectionId: 'conn-voter',
    roomId: 'room-xyz',
    userName: 'Voter',
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
    status: 'voting' as const,
    participants: {
      'conn-host': {
        connectionId: 'conn-host',
        userName: 'Host',
        vote: null,
        hasVoted: false,
      },
      'conn-voter': {
        connectionId: 'conn-voter',
        userName: 'Voter',
        vote: null,
        hasVoted: false,
      },
    },
    ttl: Math.floor(Date.now() / 1000) + 86400,
    ...overrides,
  };
}

describe('vote', () => {
  const connectionId = 'conn-voter';

  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateVote.mockResolvedValue(undefined);
    mockBroadcastToRoom.mockResolvedValue(undefined);
  });

  it.each(VALID_CARDS)(
    'should accept valid card value: %s',
    async (cardValue) => {
      // Given
      mockGetConnection.mockResolvedValue(
        createConnectionFixture(),
      );
      mockGetRoom.mockResolvedValue(createRoomFixture());

      // When
      await vote(connectionId, cardValue);

      // Then
      expect(mockUpdateVote).toHaveBeenCalledWith(
        'room-xyz',
        connectionId,
        cardValue,
      );
    },
  );

  it('should broadcast voteUpdate with hasVoted flags (values hidden)', async () => {
    // Given
    mockGetConnection.mockResolvedValue(
      createConnectionFixture(),
    );
    mockGetRoom.mockResolvedValue(createRoomFixture());

    // When
    await vote(connectionId, '5');

    // Then
    expect(mockBroadcastToRoom).toHaveBeenCalledWith(
      'room-xyz',
      expect.objectContaining({
        type: 'voteUpdate',
        participants: expect.arrayContaining([
          expect.objectContaining({
            userName: expect.any(String),
            hasVoted: expect.any(Boolean),
          }),
        ]),
      }),
    );

    const broadcastMessage =
      mockBroadcastToRoom.mock.calls[0][1] as {
        participants: Array<Record<string, unknown>>;
      };
    for (const p of broadcastMessage.participants) {
      expect(p).not.toHaveProperty('vote');
    }
  });

  it('should throw for invalid card value', async () => {
    // Given
    mockGetConnection.mockResolvedValue(
      createConnectionFixture(),
    );
    mockGetRoom.mockResolvedValue(createRoomFixture());

    // When & Then
    await expect(vote(connectionId, '99')).rejects.toThrow();
  });

  it('should throw when room is in revealed status', async () => {
    // Given
    mockGetConnection.mockResolvedValue(
      createConnectionFixture(),
    );
    mockGetRoom.mockResolvedValue(
      createRoomFixture({ status: 'revealed' }),
    );

    // When & Then
    await expect(vote(connectionId, '5')).rejects.toThrow();
  });

  it('should throw when connection not found', async () => {
    // Given
    mockGetConnection.mockResolvedValue(null);

    // When & Then
    await expect(vote(connectionId, '5')).rejects.toThrow();
  });
});
