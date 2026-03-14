import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    env: {
      CONNECTIONS_TABLE_NAME: 'test-connections',
      ROOMS_TABLE_NAME: 'test-rooms',
      WEBSOCKET_ENDPOINT: 'https://test.execute-api.ap-northeast-1.amazonaws.com/production',
    },
  },
});
