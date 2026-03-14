import type {
  APIGatewayProxyResultV2,
  APIGatewayProxyWebsocketEventV2,
} from 'aws-lambda';
import {
  getConnection,
  removeConnection,
} from '../db/connections';
import { getRoom, removeParticipant } from '../db/rooms';
import { broadcastToRoom } from '../websocket/broadcast';

export async function handler(
  event: APIGatewayProxyWebsocketEventV2,
): Promise<APIGatewayProxyResultV2> {
  const connectionId =
    event.requestContext.connectionId;

  const connection = await getConnection(connectionId);
  if (!connection) {
    return { statusCode: 200, body: 'Disconnected' };
  }

  await removeConnection(connectionId);

  const room = await getRoom(connection.roomId);
  if (room) {
    await removeParticipant(
      connection.roomId,
      connectionId,
    );

    await broadcastToRoom(connection.roomId, {
      type: 'participantLeft',
      connectionId,
    });
  }

  return { statusCode: 200, body: 'Disconnected' };
}
