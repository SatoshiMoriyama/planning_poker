import {
  GetCommand,
  PutCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { docClient } from './client';
import { ROOMS_TABLE_NAME } from '../constants';
import type { Participant, Room, RoomStatus } from '../types';

export async function createRoom(room: Room): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName: ROOMS_TABLE_NAME,
      Item: room,
    }),
  );
}

export async function getRoom(
  roomId: string,
): Promise<Room | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: ROOMS_TABLE_NAME,
      Key: { roomId },
    }),
  );
  return (result.Item as Room) ?? null;
}

export async function addParticipant(
  roomId: string,
  participant: Participant,
): Promise<void> {
  await docClient.send(
    new UpdateCommand({
      TableName: ROOMS_TABLE_NAME,
      Key: { roomId },
      UpdateExpression:
        'SET participants.#cid = :participant',
      ExpressionAttributeNames: {
        '#cid': participant.connectionId,
      },
      ExpressionAttributeValues: {
        ':participant': participant,
      },
    }),
  );
}

export async function updateVote(
  roomId: string,
  connectionId: string,
  cardValue: string,
): Promise<void> {
  await docClient.send(
    new UpdateCommand({
      TableName: ROOMS_TABLE_NAME,
      Key: { roomId },
      UpdateExpression:
        'SET participants.#cid.vote = :vote, participants.#cid.hasVoted = :hasVoted',
      ExpressionAttributeNames: { '#cid': connectionId },
      ExpressionAttributeValues: {
        ':vote': cardValue,
        ':hasVoted': true,
      },
    }),
  );
}

export async function updateStatus(
  roomId: string,
  status: RoomStatus,
): Promise<void> {
  await docClient.send(
    new UpdateCommand({
      TableName: ROOMS_TABLE_NAME,
      Key: { roomId },
      UpdateExpression: 'SET #status = :status',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: { ':status': status },
    }),
  );
}

export async function resetVotes(
  roomId: string,
): Promise<void> {
  const room = await getRoom(roomId);
  if (!room) {
    throw new Error(`Room not found: ${roomId}`);
  }

  const resetParticipants: Record<string, Participant> = {};
  for (const [cid, p] of Object.entries(room.participants)) {
    resetParticipants[cid] = {
      ...p,
      vote: null,
      hasVoted: false,
    };
  }

  await docClient.send(
    new UpdateCommand({
      TableName: ROOMS_TABLE_NAME,
      Key: { roomId },
      UpdateExpression:
        'SET participants = :participants, #status = :status',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':participants': resetParticipants,
        ':status': 'voting',
      },
    }),
  );
}

export async function removeParticipant(
  roomId: string,
  connectionId: string,
): Promise<void> {
  await docClient.send(
    new UpdateCommand({
      TableName: ROOMS_TABLE_NAME,
      Key: { roomId },
      UpdateExpression: 'REMOVE participants.#cid',
      ExpressionAttributeNames: { '#cid': connectionId },
    }),
  );
}
