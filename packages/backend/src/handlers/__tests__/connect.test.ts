import { describe, it, expect } from 'vitest';
import { handler } from '../connect';
import type { APIGatewayProxyResultV2 } from 'aws-lambda';

function createConnectEvent(connectionId: string) {
  return {
    requestContext: {
      connectionId,
      routeKey: '$connect',
      eventType: 'CONNECT',
      connectedAt: Date.now(),
      requestId: 'req-123',
      apiId: 'api-123',
      domainName: 'example.execute-api.ap-northeast-1.amazonaws.com',
      stage: 'production',
    },
    isBase64Encoded: false,
  };
}

describe('connect handler', () => {
  it('should return 200 on successful connection', async () => {
    // Given
    const event = createConnectEvent('conn-abc');

    // When
    const result = (await handler(
      event as never,
    )) as APIGatewayProxyResultV2;

    // Then
    expect(result).toMatchObject({ statusCode: 200 });
  });
});
