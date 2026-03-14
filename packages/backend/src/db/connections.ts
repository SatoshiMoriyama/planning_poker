import {
  GetCommand,
  PutCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { docClient } from './client';
import { CONNECTIONS_TABLE_NAME } from '../constants';
import type { Connection } from '../types';

export async function saveConnection(
  connection: Connection,
): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName: CONNECTIONS_TABLE_NAME,
      Item: connection,
    }),
  );
}

export async function getConnection(
  connectionId: string,
): Promise<Connection | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: CONNECTIONS_TABLE_NAME,
      Key: { connectionId },
    }),
  );
  return (result.Item as Connection) ?? null;
}

export async function removeConnection(
  connectionId: string,
): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: CONNECTIONS_TABLE_NAME,
      Key: { connectionId },
    }),
  );
}
