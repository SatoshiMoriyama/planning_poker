import { updateStatus } from '../db/rooms';
import { broadcastToRoom } from '../websocket/broadcast';
import { UserFacingError } from '../errors';
import { requireConnectionAndRoom } from './helpers';

export async function reveal(
  connectionId: string,
): Promise<void> {
  const { connection, room } =
    await requireConnectionAndRoom(connectionId);

  if (room.hostConnectionId !== connectionId) {
    throw new UserFacingError('Only the host can reveal votes');
  }

  if (room.status === 'revealed') {
    throw new UserFacingError('Room is already revealed');
  }

  await updateStatus(connection.roomId, 'revealed');

  const participants = Object.values(
    room.participants,
  ).map((p) => ({
    connectionId: p.connectionId,
    userName: p.userName,
    vote: p.vote,
  }));

  const average = calculateAverage(participants);

  await broadcastToRoom(connection.roomId, {
    type: 'revealed',
    participants,
    average,
  });
}

function calculateAverage(
  participants: Array<{
    vote: string | null;
  }>,
): number | null {
  const numericVotes = participants
    .map((p) => p.vote)
    .filter((v): v is string => v !== null && v !== '?')
    .map(Number);

  if (numericVotes.length === 0) {
    return null;
  }

  const sum = numericVotes.reduce((a, b) => a + b, 0);
  return sum / numericVotes.length;
}
