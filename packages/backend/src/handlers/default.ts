import type {
  APIGatewayProxyResultV2,
  APIGatewayProxyWebsocketEventV2,
} from 'aws-lambda';
import { createRoom } from '../actions/createRoom';
import { joinRoom } from '../actions/joinRoom';
import { vote } from '../actions/vote';
import { reveal } from '../actions/reveal';
import { reset } from '../actions/reset';
import { UserFacingError } from '../errors';
import { sendToConnection } from '../websocket/broadcast';

interface MessageBody {
  action: string;
  [key: string]: unknown;
}

type ActionHandler = (
  connectionId: string,
  body: MessageBody,
) => Promise<void>;

function requireString(
  body: MessageBody,
  field: string,
  maxLength: number,
): string {
  const value = body[field];
  if (typeof value !== 'string') {
    throw new UserFacingError(
      `Missing or invalid field: ${field}`,
    );
  }
  if (value.length > maxLength) {
    throw new UserFacingError(
      `Field ${field} exceeds maximum length of ${maxLength}`,
    );
  }
  return value;
}

const USERNAME_MAX_LENGTH = 50;
const ROOM_ID_MAX_LENGTH = 20;
const CARD_VALUE_MAX_LENGTH = 10;

const ACTION_HANDLERS: Record<string, ActionHandler> = {
  createRoom: (cid, body) =>
    createRoom(cid, requireString(body, 'userName', USERNAME_MAX_LENGTH)),
  joinRoom: (cid, body) =>
    joinRoom(
      cid,
      requireString(body, 'roomId', ROOM_ID_MAX_LENGTH),
      requireString(body, 'userName', USERNAME_MAX_LENGTH),
    ),
  vote: (cid, body) =>
    vote(cid, requireString(body, 'cardValue', CARD_VALUE_MAX_LENGTH)),
  reveal: (cid) => reveal(cid),
  reset: (cid) => reset(cid),
};

export async function handler(
  event: APIGatewayProxyWebsocketEventV2,
): Promise<APIGatewayProxyResultV2> {
  const connectionId =
    event.requestContext.connectionId;

  let body: MessageBody;
  try {
    body = JSON.parse(event.body ?? '') as MessageBody;
  } catch {
    await sendToConnection(connectionId, {
      type: 'error',
      message: 'Invalid JSON',
    });
    return { statusCode: 200, body: 'Error' };
  }

  if (!body.action) {
    await sendToConnection(connectionId, {
      type: 'error',
      message: 'Missing action field',
    });
    return { statusCode: 200, body: 'Error' };
  }

  const actionHandler = ACTION_HANDLERS[body.action];
  if (!actionHandler) {
    await sendToConnection(connectionId, {
      type: 'error',
      message: `Unknown action: ${body.action}`,
    });
    return { statusCode: 200, body: 'Error' };
  }

  try {
    await actionHandler(connectionId, body);
  } catch (error: unknown) {
    const message =
      error instanceof UserFacingError
        ? error.message
        : 'An error occurred';
    await sendToConnection(connectionId, {
      type: 'error',
      message,
    });
  }

  return { statusCode: 200, body: 'OK' };
}
