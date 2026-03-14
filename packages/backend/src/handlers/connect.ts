import type {
  APIGatewayProxyResultV2,
  APIGatewayProxyWebsocketEventV2,
} from 'aws-lambda';

export async function handler(
  _event: APIGatewayProxyWebsocketEventV2,
): Promise<APIGatewayProxyResultV2> {
  return { statusCode: 200, body: 'Connected' };
}
