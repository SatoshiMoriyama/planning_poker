import { nanoid } from 'nanoid';
import { saveConnection } from '../db/connections';
import { createRoom as createRoomInDb } from '../db/rooms';
import { sendToConnection } from '../websocket/broadcast';
import {
  ROOM_ID_LENGTH,
  CONNECTION_TTL_SECONDS,
  ROOM_TTL_SECONDS,
} from '../constants';

export async function createRoom(
  connectionId: string,
  userName: string,
): Promise<void> {
  const roomId = nanoid(ROOM_ID_LENGTH);
  const now = Math.floor(Date.now() / 1000);

  await saveConnection({
    connectionId,
    roomId,
    userName,
    ttl: now + CONNECTION_TTL_SECONDS,
  });

  await createRoomInDb({
    roomId,
    hostConnectionId: connectionId,
    status: 'voting',
    participants: {
      [connectionId]: {
        connectionId,
        userName,
        vote: null,
        hasVoted: false,
      },
    },
    ttl: now + ROOM_TTL_SECONDS,
  });

  await sendToConnection(connectionId, {
    type: 'roomCreated',
    roomId,
    you: {
      connectionId,
      userName,
      isHost: true,
    },
  });
}
