import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from '../disconnect';

vi.mock('../../db/connections');
vi.mock('../../db/rooms');
vi.mock('../../websocket/broadcast');

import {
  getConnection,
  removeConnection,
} from '../../db/connections';
import { getRoom, removeParticipant } from '../../db/rooms';
import { broadcastToRoom } from '../../websocket/broadcast';

const mockGetConnection = vi.mocked(getConnection);
const mockRemoveConnection = vi.mocked(removeConnection);
const mockGetRoom = vi.mocked(getRoom);
const mockRemoveParticipant = vi.mocked(removeParticipant);
const mockBroadcastToRoom = vi.mocked(broadcastToRoom);

function createDisconnectEvent(connectionId: string) {
  return {
    requestContext: {
      connectionId,
      routeKey: '$disconnect',
      eventType: 'DISCONNECT',
      connectedAt: Date.now(),
      requestId: 'req-123',
      apiId: 'api-123',
      domainName:
        'example.execute-api.ap-northeast-1.amazonaws.com',
      stage: 'production',
    },
    isBase64Encoded: false,
  };
}

function createConnectionFixture(
  overrides: Record<string, unknown> = {},
) {
  return {
    connectionId: 'conn-leaving',
    roomId: 'room-xyz',
    userName: 'Leaver',
    ttl: Math.floor(Date.now() / 1000) + 9000,
    ...overrides,
  };
}

function createRoomFixture() {
  return {
    roomId: 'room-xyz',
    status: 'voting' as const,
    participants: {
      'conn-creator': {
        connectionId: 'conn-creator',
        userName: 'Creator',
        vote: null,
        hasVoted: false,
      },
      'conn-leaving': {
        connectionId: 'conn-leaving',
        userName: 'Leaver',
        vote: null,
        hasVoted: false,
      },
    },
    ttl: Math.floor(Date.now() / 1000) + 86400,
  };
}

describe('disconnect handler', () => {
  const connectionId = 'conn-leaving';

  beforeEach(() => {
    vi.clearAllMocks();
    mockRemoveConnection.mockResolvedValue(undefined);
    mockRemoveParticipant.mockResolvedValue(undefined);
    mockBroadcastToRoom.mockResolvedValue(undefined);
  });

  it('should remove connection from connections table', async () => {
    // Given
    mockGetConnection.mockResolvedValue(
      createConnectionFixture(),
    );
    mockGetRoom.mockResolvedValue(createRoomFixture());
    const event = createDisconnectEvent(connectionId);

    // When
    await handler(event as never);

    // Then
    expect(mockRemoveConnection).toHaveBeenCalledWith(
      connectionId,
    );
  });

  it('should remove participant from the room', async () => {
    // Given
    mockGetConnection.mockResolvedValue(
      createConnectionFixture(),
    );
    mockGetRoom.mockResolvedValue(createRoomFixture());
    const event = createDisconnectEvent(connectionId);

    // When
    await handler(event as never);

    // Then
    expect(mockRemoveParticipant).toHaveBeenCalledWith(
      'room-xyz',
      connectionId,
    );
  });

  it('should broadcast participantLeft to remaining participants', async () => {
    // Given
    mockGetConnection.mockResolvedValue(
      createConnectionFixture(),
    );
    mockGetRoom.mockResolvedValue(createRoomFixture());
    const event = createDisconnectEvent(connectionId);

    // When
    await handler(event as never);

    // Then
    expect(mockBroadcastToRoom).toHaveBeenCalledWith(
      'room-xyz',
      expect.objectContaining({
        type: 'participantLeft',
        connectionId,
      }),
    );
  });

  it('should return 200 even when connection not found', async () => {
    // Given
    mockGetConnection.mockResolvedValue(null);
    const event = createDisconnectEvent(connectionId);

    // When
    const result = await handler(event as never);

    // Then
    expect(result).toMatchObject({ statusCode: 200 });
  });

  it('should return 200 on successful disconnect', async () => {
    // Given
    mockGetConnection.mockResolvedValue(
      createConnectionFixture(),
    );
    mockGetRoom.mockResolvedValue(createRoomFixture());
    const event = createDisconnectEvent(connectionId);

    // When
    const result = await handler(event as never);

    // Then
    expect(result).toMatchObject({ statusCode: 200 });
  });
});
