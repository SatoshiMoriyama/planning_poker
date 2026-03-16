import { saveConnection } from '../db/connections';
import { getRoom, addParticipant } from '../db/rooms';
import {
  sendToConnection,
  broadcastToRoom,
} from '../websocket/broadcast';
import { CONNECTION_TTL_SECONDS } from '../constants';
import { UserFacingError } from '../errors';
import type { Participant } from '../types';

export async function joinRoom(
  connectionId: string,
  roomId: string,
  userName: string,
): Promise<void> {
  const room = await getRoom(roomId);
  if (!room) {
    throw new UserFacingError('Room not found');
  }

  const now = Math.floor(Date.now() / 1000);

  await saveConnection({
    connectionId,
    roomId,
    userName,
    ttl: now + CONNECTION_TTL_SECONDS,
  });

  const participant: Participant = {
    connectionId,
    userName,
    vote: null,
    hasVoted: false,
  };

  await addParticipant(roomId, participant);

  await broadcastToRoom(
    roomId,
    {
      type: 'participantJoined',
      participant: { connectionId, userName },
    },
    connectionId,
  );

  const participants = Object.values(
    room.participants,
  ).map((p) => ({
    connectionId: p.connectionId,
    userName: p.userName,
    hasVoted: p.hasVoted,
  }));

  await sendToConnection(connectionId, {
    type: 'roomJoined',
    roomId,
    status: room.status,
    participants,
    you: {
      connectionId,
      userName,
    },
  });
}
