export const CARD_VALUES = [
  '1',
  '2',
  '3',
  '5',
  '8',
  '13',
  '21',
  '?',
] as const;

export const ROOM_ID_LENGTH = 8;

/** 接続TTL: 2.5時間（秒） */
export const CONNECTION_TTL_SECONDS = 9000;

/** ルームTTL: 24時間（秒） */
export const ROOM_TTL_SECONDS = 86400;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Required environment variable ${name} is not set`,
    );
  }
  return value;
}

export const CONNECTIONS_TABLE_NAME =
  requireEnv('CONNECTIONS_TABLE_NAME');
export const ROOMS_TABLE_NAME =
  requireEnv('ROOMS_TABLE_NAME');
export const WEBSOCKET_ENDPOINT =
  requireEnv('WEBSOCKET_ENDPOINT');
