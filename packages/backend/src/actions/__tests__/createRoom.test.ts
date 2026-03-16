import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRoom } from '../createRoom';

vi.mock('../../db/connections');
vi.mock('../../db/rooms');
vi.mock('../../websocket/broadcast');

import { saveConnection } from '../../db/connections';
import { createRoom as createRoomInDb } from '../../db/rooms';
import { sendToConnection } from '../../websocket/broadcast';

const mockSaveConnection = vi.mocked(saveConnection);
const mockCreateRoomInDb = vi.mocked(createRoomInDb);
const mockSendToConnection = vi.mocked(sendToConnection);

describe('createRoom', () => {
  const connectionId = 'conn-abc123';
  const userName = 'Alice';

  beforeEach(() => {
    vi.clearAllMocks();
    mockSaveConnection.mockResolvedValue(undefined);
    mockCreateRoomInDb.mockResolvedValue(undefined);
    mockSendToConnection.mockResolvedValue(undefined);
  });

  it('should save connection with roomId and userName', async () => {
    // When
    await createRoom(connectionId, userName);

    // Then
    expect(mockSaveConnection).toHaveBeenCalledOnce();
    const savedConnection = mockSaveConnection.mock.calls[0][0];
    expect(savedConnection).toMatchObject({
      connectionId,
      userName,
    });
    expect(savedConnection.roomId).toEqual(expect.any(String));
    expect(savedConnection.roomId.length).toBeGreaterThan(0);
  });

  it('should create room with creator as first participant', async () => {
    // When
    await createRoom(connectionId, userName);

    // Then
    expect(mockCreateRoomInDb).toHaveBeenCalledOnce();
    const createdRoom = mockCreateRoomInDb.mock.calls[0][0];
    expect(createdRoom).toMatchObject({
      status: 'voting',
    });
    expect(createdRoom).not.toHaveProperty('hostConnectionId');
    expect(createdRoom.roomId).toEqual(expect.any(String));
    expect(createdRoom.participants).toHaveProperty(connectionId);
    expect(createdRoom.participants[connectionId]).toMatchObject({
      connectionId,
      userName,
      vote: null,
      hasVoted: false,
    });
  });

  it('should send roomCreated message back to creator', async () => {
    // When
    await createRoom(connectionId, userName);

    // Then
    expect(mockSendToConnection).toHaveBeenCalledOnce();
    expect(mockSendToConnection).toHaveBeenCalledWith(
      connectionId,
      expect.objectContaining({
        type: 'roomCreated',
        roomId: expect.any(String),
        you: expect.objectContaining({
          connectionId,
          userName,
        }),
      }),
    );
    const sentMessage = mockSendToConnection.mock.calls[0][1] as {
      you: Record<string, unknown>;
    };
    expect(sentMessage.you).not.toHaveProperty('isHost');
  });

  it('should generate a unique roomId', async () => {
    // When
    await createRoom(connectionId, userName);

    // Then
    const savedConnection = mockSaveConnection.mock.calls[0][0];
    const createdRoom = mockCreateRoomInDb.mock.calls[0][0];
    expect(savedConnection.roomId).toBe(createdRoom.roomId);
  });

  it('should set TTL on the room', async () => {
    // When
    await createRoom(connectionId, userName);

    // Then
    const createdRoom = mockCreateRoomInDb.mock.calls[0][0];
    expect(createdRoom.ttl).toEqual(expect.any(Number));
    expect(createdRoom.ttl).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });
});
