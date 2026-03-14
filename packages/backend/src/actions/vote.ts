import { updateVote } from '../db/rooms';
import { broadcastToRoom } from '../websocket/broadcast';
import { CARD_VALUES } from '../constants';
import { UserFacingError } from '../errors';
import { requireConnectionAndRoom } from './helpers';

export async function vote(
  connectionId: string,
  cardValue: string,
): Promise<void> {
  if (!CARD_VALUES.includes(cardValue as (typeof CARD_VALUES)[number])) {
    throw new UserFacingError(`Invalid card value: ${cardValue}`);
  }

  const { connection, room } =
    await requireConnectionAndRoom(connectionId);

  if (room.status === 'revealed') {
    throw new UserFacingError('Cannot vote while room is revealed');
  }

  await updateVote(connection.roomId, connectionId, cardValue);

  const participants = Object.values(room.participants).map(
    (p) => ({
      connectionId: p.connectionId,
      userName: p.userName,
      hasVoted:
        p.connectionId === connectionId
          ? true
          : p.hasVoted,
    }),
  );

  await broadcastToRoom(connection.roomId, {
    type: 'voteUpdate',
    participants,
  });
}
