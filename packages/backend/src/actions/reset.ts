import { resetVotes } from '../db/rooms';
import { broadcastToRoom } from '../websocket/broadcast';
import { UserFacingError } from '../errors';
import { requireConnectionAndRoom } from './helpers';

export async function reset(
  connectionId: string,
): Promise<void> {
  const { connection, room } =
    await requireConnectionAndRoom(connectionId);

  await resetVotes(connection.roomId);

  await broadcastToRoom(connection.roomId, {
    type: 'reset',
  });
}
