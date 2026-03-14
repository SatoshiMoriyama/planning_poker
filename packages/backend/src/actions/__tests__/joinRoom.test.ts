import { describe, it, expect, vi, beforeEach } from 'vitest';
import { joinRoom } from '../joinRoom';

vi.mock('../../db/connections');
vi.mock('../../db/rooms');
vi.mock('../../websocket/broadcast');

import { saveConnection } from '../../db/connections';
import { getRoom, addParticipant } from '../../db/rooms';
import {
  sendToConnection,
  broadcastToRoom,
} from '../../websocket/broadcast';

const mockSaveConnection = vi.mocked(saveConnection);
const mockGetRoom = vi.mocked(getRoom);
const mockAddParticipant = vi.mocked(addParticipant);
const mockSendToConnection = vi.mocked(sendToConnection);
const mockBroadcastToRoom = vi.mocked(broadcastToRoom);

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
    },
    ttl: Math.floor(Date.now() / 1000) + 86400,
    ...overrides,
  };
}

describe('joinRoom', () => {
  const connectionId = 'conn-new';
  const roomId = 'room-xyz';
  const userName = 'Bob';

  beforeEach(() => {
    vi.clearAllMocks();
    mockSaveConnection.mockResolvedValue(undefined);
    mockAddParticipant.mockResolvedValue(undefined);
    mockSendToConnection.mockResolvedValue(undefined);
    mockBroadcastToRoom.mockResolvedValue(undefined);
  });

  it('should save connection with roomId and userName', async () => {
    // Given
    mockGetRoom.mockResolvedValue(createRoomFixture());

    // When
    await joinRoom(connectionId, roomId, userName);

    // Then
    expect(mockSaveConnection).toHaveBeenCalledWith(
      expect.objectContaining({
        connectionId,
        roomId,
        userName,
      }),
    );
  });

  it('should add participant to the room', async () => {
    // Given
    mockGetRoom.mockResolvedValue(createRoomFixture());

    // When
    await joinRoom(connectionId, roomId, userName);

    // Then
    expect(mockAddParticipant).toHaveBeenCalledWith(
      roomId,
      expect.objectContaining({
        connectionId,
        userName,
        vote: null,
        hasVoted: false,
      }),
    );
  });

  it('should broadcast participantJoined to existing participants', async () => {
    // Given
    mockGetRoom.mockResolvedValue(createRoomFixture());

    // When
    await joinRoom(connectionId, roomId, userName);

    // Then
    expect(mockBroadcastToRoom).toHaveBeenCalledWith(
      roomId,
      expect.objectContaining({
        type: 'participantJoined',
        participant: expect.objectContaining({
          connectionId,
          userName,
        }),
      }),
      connectionId,
    );
  });

  it('should send roomJoined to the joining participant', async () => {
    // Given
    const room = createRoomFixture();
    mockGetRoom.mockResolvedValue(room);

    // When
    await joinRoom(connectionId, roomId, userName);

    // Then
    expect(mockSendToConnection).toHaveBeenCalledWith(
      connectionId,
      expect.objectContaining({
        type: 'roomJoined',
        roomId,
        status: 'voting',
        you: expect.objectContaining({
          connectionId,
          userName,
          isHost: false,
        }),
      }),
    );
  });

  it('should throw when room does not exist', async () => {
    // Given
    mockGetRoom.mockResolvedValue(null);

    // When & Then
    await expect(
      joinRoom(connectionId, roomId, userName),
    ).rejects.toThrow();
  });
});
