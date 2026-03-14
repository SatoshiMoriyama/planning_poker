import { getConnection } from '../db/connections';
import { getRoom } from '../db/rooms';
import type { Connection, Room } from '../types';

export async function requireConnectionAndRoom(
  connectionId: string,
): Promise<{ connection: Connection; room: Room }> {
  const connection = await getConnection(connectionId);
  if (!connection) {
    throw new Error(
      `Connection not found: ${connectionId}`,
    );
  }

  const room = await getRoom(connection.roomId);
  if (!room) {
    throw new Error(
      `Room not found: ${connection.roomId}`,
    );
  }

  return { connection, room };
}
