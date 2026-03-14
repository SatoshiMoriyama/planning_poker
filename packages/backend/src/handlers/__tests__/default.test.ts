import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from '../default';

vi.mock('../../actions/createRoom');
vi.mock('../../actions/joinRoom');
vi.mock('../../actions/vote');
vi.mock('../../actions/reveal');
vi.mock('../../actions/reset');
vi.mock('../../websocket/broadcast');

import { createRoom } from '../../actions/createRoom';
import { joinRoom } from '../../actions/joinRoom';
import { vote } from '../../actions/vote';
import { reveal } from '../../actions/reveal';
import { reset } from '../../actions/reset';
import { sendToConnection } from '../../websocket/broadcast';

const mockCreateRoom = vi.mocked(createRoom);
const mockJoinRoom = vi.mocked(joinRoom);
const mockVote = vi.mocked(vote);
const mockReveal = vi.mocked(reveal);
const mockReset = vi.mocked(reset);
const mockSendToConnection = vi.mocked(sendToConnection);

function createDefaultEvent(
  connectionId: string,
  body: Record<string, unknown>,
) {
  return {
    requestContext: {
      connectionId,
      routeKey: '$default',
      eventType: 'MESSAGE',
      connectedAt: Date.now(),
      requestId: 'req-123',
      apiId: 'api-123',
      domainName:
        'example.execute-api.ap-northeast-1.amazonaws.com',
      stage: 'production',
    },
    body: JSON.stringify(body),
    isBase64Encoded: false,
  };
}

describe('default handler', () => {
  const connectionId = 'conn-abc';

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateRoom.mockResolvedValue(undefined);
    mockJoinRoom.mockResolvedValue(undefined);
    mockVote.mockResolvedValue(undefined);
    mockReveal.mockResolvedValue(undefined);
    mockReset.mockResolvedValue(undefined);
    mockSendToConnection.mockResolvedValue(undefined);
  });

  it('should route createRoom action', async () => {
    // Given
    const event = createDefaultEvent(connectionId, {
      action: 'createRoom',
      userName: 'Alice',
    });

    // When
    await handler(event as never);

    // Then
    expect(mockCreateRoom).toHaveBeenCalledWith(
      connectionId,
      'Alice',
    );
  });

  it('should route joinRoom action', async () => {
    // Given
    const event = createDefaultEvent(connectionId, {
      action: 'joinRoom',
      roomId: 'room-xyz',
      userName: 'Bob',
    });

    // When
    await handler(event as never);

    // Then
    expect(mockJoinRoom).toHaveBeenCalledWith(
      connectionId,
      'room-xyz',
      'Bob',
    );
  });

  it('should route vote action', async () => {
    // Given
    const event = createDefaultEvent(connectionId, {
      action: 'vote',
      cardValue: '5',
    });

    // When
    await handler(event as never);

    // Then
    expect(mockVote).toHaveBeenCalledWith(connectionId, '5');
  });

  it('should route reveal action', async () => {
    // Given
    const event = createDefaultEvent(connectionId, {
      action: 'reveal',
    });

    // When
    await handler(event as never);

    // Then
    expect(mockReveal).toHaveBeenCalledWith(connectionId);
  });

  it('should route reset action', async () => {
    // Given
    const event = createDefaultEvent(connectionId, {
      action: 'reset',
    });

    // When
    await handler(event as never);

    // Then
    expect(mockReset).toHaveBeenCalledWith(connectionId);
  });

  it('should send error for unknown action', async () => {
    // Given
    const event = createDefaultEvent(connectionId, {
      action: 'unknownAction',
    });

    // When
    await handler(event as never);

    // Then
    expect(mockSendToConnection).toHaveBeenCalledWith(
      connectionId,
      expect.objectContaining({
        type: 'error',
        message: expect.any(String),
      }),
    );
  });

  it('should send error for invalid JSON body', async () => {
    // Given
    const event = {
      requestContext: {
        connectionId,
        routeKey: '$default',
        eventType: 'MESSAGE',
        connectedAt: Date.now(),
        requestId: 'req-123',
        apiId: 'api-123',
        domainName:
          'example.execute-api.ap-northeast-1.amazonaws.com',
        stage: 'production',
      },
      body: 'not-valid-json{{{',
      isBase64Encoded: false,
    };

    // When
    await handler(event as never);

    // Then
    expect(mockSendToConnection).toHaveBeenCalledWith(
      connectionId,
      expect.objectContaining({
        type: 'error',
        message: expect.any(String),
      }),
    );
  });

  it('should send error for missing action field', async () => {
    // Given
    const event = createDefaultEvent(connectionId, {
      userName: 'Alice',
    });

    // When
    await handler(event as never);

    // Then
    expect(mockSendToConnection).toHaveBeenCalledWith(
      connectionId,
      expect.objectContaining({
        type: 'error',
        message: expect.any(String),
      }),
    );
  });

  it('should return 200 on successful routing', async () => {
    // Given
    const event = createDefaultEvent(connectionId, {
      action: 'createRoom',
      userName: 'Alice',
    });

    // When
    const result = await handler(event as never);

    // Then
    expect(result).toMatchObject({ statusCode: 200 });
  });

  it('should send error when action throws', async () => {
    // Given
    mockCreateRoom.mockRejectedValue(
      new Error('Room creation failed'),
    );
    const event = createDefaultEvent(connectionId, {
      action: 'createRoom',
      userName: 'Alice',
    });

    // When
    await handler(event as never);

    // Then
    expect(mockSendToConnection).toHaveBeenCalledWith(
      connectionId,
      expect.objectContaining({
        type: 'error',
        message: expect.any(String),
      }),
    );
  });

  it('should not expose internal error details to client', async () => {
    // Given — internal Error (not UserFacingError) leaks connectionId
    mockCreateRoom.mockRejectedValue(
      new Error('Connection not found: conn-secret-id'),
    );
    const event = createDefaultEvent(connectionId, {
      action: 'createRoom',
      userName: 'Alice',
    });

    // When
    await handler(event as never);

    // Then — generic message, no internal identifiers
    expect(mockSendToConnection).toHaveBeenCalledWith(
      connectionId,
      { type: 'error', message: 'An error occurred' },
    );
  });

  it('should expose UserFacingError message to client', async () => {
    // Given
    const { UserFacingError } = await import('../../errors');
    mockReveal.mockRejectedValue(
      new UserFacingError('Only the host can reveal votes'),
    );
    const event = createDefaultEvent(connectionId, {
      action: 'reveal',
    });

    // When
    await handler(event as never);

    // Then
    expect(mockSendToConnection).toHaveBeenCalledWith(
      connectionId,
      { type: 'error', message: 'Only the host can reveal votes' },
    );
  });

  it('should reject userName exceeding max length', async () => {
    // Given
    const longUserName = 'A'.repeat(51);
    const event = createDefaultEvent(connectionId, {
      action: 'createRoom',
      userName: longUserName,
    });

    // When
    await handler(event as never);

    // Then
    expect(mockCreateRoom).not.toHaveBeenCalled();
    expect(mockSendToConnection).toHaveBeenCalledWith(
      connectionId,
      expect.objectContaining({
        type: 'error',
        message: expect.stringContaining('maximum length'),
      }),
    );
  });

  it('should accept userName within max length', async () => {
    // Given
    const validUserName = 'A'.repeat(50);
    const event = createDefaultEvent(connectionId, {
      action: 'createRoom',
      userName: validUserName,
    });

    // When
    await handler(event as never);

    // Then
    expect(mockCreateRoom).toHaveBeenCalledWith(
      connectionId,
      validUserName,
    );
  });
});
