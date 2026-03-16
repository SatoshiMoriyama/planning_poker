import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requireConnectionAndRoom } from '../helpers';

vi.mock('../../db/connections');
vi.mock('../../db/rooms');

import { getConnection } from '../../db/connections';
import { getRoom } from '../../db/rooms';

const mockGetConnection = vi.mocked(getConnection);
const mockGetRoom = vi.mocked(getRoom);

describe('requireConnectionAndRoom', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return connection and room when both exist', async () => {
    const connection = {
      connectionId: 'conn-1',
      roomId: 'room-1',
      userName: 'Alice',
      ttl: 9999,
    };
    const room = {
      roomId: 'room-1',
      status: 'voting' as const,
      participants: {},
      ttl: 9999,
    };
    mockGetConnection.mockResolvedValue(connection);
    mockGetRoom.mockResolvedValue(room);

    const result =
      await requireConnectionAndRoom('conn-1');

    expect(result.connection).toBe(connection);
    expect(result.room).toBe(room);
  });

  it('should throw when connection does not exist', async () => {
    mockGetConnection.mockResolvedValue(null);

    await expect(
      requireConnectionAndRoom('conn-missing'),
    ).rejects.toThrow('Connection not found');
  });

  it('should throw when room does not exist', async () => {
    mockGetConnection.mockResolvedValue({
      connectionId: 'conn-1',
      roomId: 'room-missing',
      userName: 'Alice',
      ttl: 9999,
    });
    mockGetRoom.mockResolvedValue(null);

    await expect(
      requireConnectionAndRoom('conn-1'),
    ).rejects.toThrow('Room not found');
  });
});
