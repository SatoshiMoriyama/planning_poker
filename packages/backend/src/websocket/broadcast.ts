import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi';
import { WEBSOCKET_ENDPOINT } from '../constants';
import { getRoom } from '../db/rooms';
import { removeConnection } from '../db/connections';
import { removeParticipant } from '../db/rooms';

function createApiClient(): ApiGatewayManagementApiClient {
  return new ApiGatewayManagementApiClient({
    endpoint: WEBSOCKET_ENDPOINT,
  });
}

export async function sendToConnection(
  connectionId: string,
  message: unknown,
): Promise<void> {
  const client = createApiClient();
  const data = JSON.stringify(message);

  await client.send(
    new PostToConnectionCommand({
      ConnectionId: connectionId,
      Data: new TextEncoder().encode(data),
    }),
  );
}

export async function broadcastToRoom(
  roomId: string,
  message: unknown,
  excludeConnectionId?: string,
): Promise<void> {
  const room = await getRoom(roomId);
  if (!room) {
    return;
  }

  const connectionIds = Object.keys(
    room.participants,
  ).filter((cid) => cid !== excludeConnectionId);

  const promises = connectionIds.map(async (cid) => {
    try {
      await sendToConnection(cid, message);
    } catch (error: unknown) {
      if (isGoneException(error)) {
        await removeConnection(cid);
        await removeParticipant(roomId, cid);
        return;
      }
      throw error;
    }
  });

  await Promise.all(promises);
}

function isGoneException(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    (error as { statusCode: number }).statusCode === 410
  );
}
