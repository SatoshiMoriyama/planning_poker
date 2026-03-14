# AWS CDK v2 WebSocket API + Lambda 調査結果

調査日: 2026-03-15

---

## 1. alpha / stable ステータス（最重要）

**結論: WebSocket 関連の構成は全て stable（安定版）に昇格済み**

- `aws-cdk-lib/aws-apigatewayv2` ... WebSocketApi, WebSocketStage 等 → **stable**
- `aws-cdk-lib/aws-apigatewayv2-integrations` ... WebSocketLambdaIntegration → **stable**
- 旧 alpha パッケージ (`@aws-cdk/aws-apigatewayv2-alpha`, `@aws-cdk/aws-apigatewayv2-integrations-alpha`) は **deprecated（非推奨）**

**つまり、追加の alpha パッケージのインストールは不要。`aws-cdk-lib` だけで全て使える。**

---

## 2. WebSocketApi / WebSocketStage の使い方

### インポート

```typescript
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import { WebSocketLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as lambda from 'aws-cdk-lib/aws-lambda';
```

### WebSocketApi の作成（$connect, $disconnect, $default を同時に設定）

```typescript
const webSocketApi = new apigwv2.WebSocketApi(this, 'MyWebSocketApi', {
  // ルート選択式（デフォルト: '$request.body.action'）
  // クライアントが { "action": "sendMessage", ... } を送ると "sendMessage" ルートにマッチ
  routeSelectionExpression: '$request.body.action',

  connectRouteOptions: {
    integration: new WebSocketLambdaIntegration('ConnectIntegration', connectHandler),
  },
  disconnectRouteOptions: {
    integration: new WebSocketLambdaIntegration('DisconnectIntegration', disconnectHandler),
  },
  defaultRouteOptions: {
    integration: new WebSocketLambdaIntegration('DefaultIntegration', defaultHandler),
  },
});
```

### WebSocketStage の作成

```typescript
const webSocketStage = new apigwv2.WebSocketStage(this, 'DevStage', {
  webSocketApi,
  stageName: 'dev',
  autoDeploy: true,  // ルート変更時に自動デプロイ
});

// 接続URL（クライアントが接続する先）
// wss://{apiId}.execute-api.{region}.amazonaws.com/dev
const wsUrl = webSocketStage.url;

// コールバックURL（Lambda からメッセージ送信する先）
// https://{apiId}.execute-api.{region}.amazonaws.com/dev
const callbackUrl = webSocketStage.callbackUrl;
```

### WebSocketApiProps 一覧

| プロパティ | 型 | 説明 | デフォルト |
|---|---|---|---|
| `apiName` | `string` | API名 | construct ID |
| `description` | `string` | APIの説明 | - |
| `routeSelectionExpression` | `string` | ルート選択式 | `$request.body.action` |
| `connectRouteOptions` | `WebSocketRouteOptions` | $connect ルート | - |
| `disconnectRouteOptions` | `WebSocketRouteOptions` | $disconnect ルート | - |
| `defaultRouteOptions` | `WebSocketRouteOptions` | $default ルート | - |
| `apiKeySelectionExpression` | `WebSocketApiKeySelectionExpression` | APIキー選択式 | - |
| `ipAddressType` | `IpAddressType` | IPアドレスタイプ | IPv4 |

---

## 3. カスタムルートの設定

```typescript
// カスタムルートを追加
webSocketApi.addRoute('sendMessage', {
  integration: new WebSocketLambdaIntegration('SendMessageIntegration', sendMessageHandler),
});

// レスポンスを返すルート（双方向通信）
webSocketApi.addRoute('getStatus', {
  integration: new WebSocketLambdaIntegration('GetStatusIntegration', getStatusHandler),
  returnResponse: true,  // Lambda のレスポンスをクライアントに返す
});
```

### クライアント側からの呼び出し例

```javascript
const ws = new WebSocket('wss://xxxxx.execute-api.ap-northeast-1.amazonaws.com/dev');

// sendMessage ルートを呼び出す（routeSelectionExpression が '$request.body.action' の場合）
ws.send(JSON.stringify({
  action: 'sendMessage',
  message: 'Hello!',
  to: 'user123'
}));
```

---

## 4. Lambda から WebSocket クライアントにメッセージを送信する方法

### 必要なパッケージ

```bash
npm install @aws-sdk/client-apigatewaymanagementapi
```

### Lambda ハンドラー（TypeScript）

```typescript
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
  GoneException,
} from '@aws-sdk/client-apigatewaymanagementapi';

const client = new ApiGatewayManagementApiClient({
  endpoint: process.env.WEBSOCKET_CALLBACK_URL,
  // 例: https://{apiId}.execute-api.{region}.amazonaws.com/{stage}
});

export const handler = async (event: any) => {
  const connectionId = event.requestContext.connectionId;

  // 特定のクライアントにメッセージ送信
  try {
    await client.send(new PostToConnectionCommand({
      ConnectionId: connectionId,
      Data: new TextEncoder().encode(JSON.stringify({ message: 'Hello!' })),
    }));
  } catch (error) {
    if (error instanceof GoneException) {
      // 接続が既に切断されている場合 → DynamoDB から connectionId を削除
      console.log(`Connection ${connectionId} is gone`);
    } else {
      throw error;
    }
  }

  return { statusCode: 200 };
};
```

### CDK側で権限を付与する方法

```typescript
// 方法1: 特定ステージのみ
webSocketStage.grantManagementApiAccess(sendMessageHandler);

// 方法2: 全ステージ
webSocketApi.grantManageConnections(sendMessageHandler);

// 環境変数でエンドポイントを渡す
sendMessageHandler.addEnvironment('WEBSOCKET_CALLBACK_URL', webSocketStage.callbackUrl);
```

### @connections API の操作一覧

| HTTP メソッド | パス | 説明 |
|---|---|---|
| `POST` | `/@connections/{connectionId}` | メッセージ送信 |
| `GET` | `/@connections/{connectionId}` | 接続情報取得 |
| `DELETE` | `/@connections/{connectionId}` | クライアント切断 |

---

## 5. DynamoDB テーブルの TTL 設定（CDK）

### TableV2（推奨）

```typescript
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

const connectionsTable = new dynamodb.TableV2(this, 'ConnectionsTable', {
  partitionKey: { name: 'connectionId', type: dynamodb.AttributeType.STRING },
  billing: dynamodb.Billing.onDemand(),
  removalPolicy: cdk.RemovalPolicy.DESTROY,
  timeToLiveAttribute: 'ttl',  // ← TTL属性名を指定するだけ
});
```

### Table（従来版）

```typescript
const connectionsTable = new dynamodb.Table(this, 'ConnectionsTable', {
  partitionKey: { name: 'connectionId', type: dynamodb.AttributeType.STRING },
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
  removalPolicy: cdk.RemovalPolicy.DESTROY,
  timeToLiveAttribute: 'ttl',
});
```

### Lambda 側で TTL 値をセットする方法

```typescript
// TTL は Unix epoch（秒単位）で設定する（ミリ秒ではない！）
const ttlValue = Math.floor(Date.now() / 1000) + 3600; // 1時間後に自動削除

await dynamoClient.send(new PutCommand({
  TableName: process.env.TABLE_NAME,
  Item: {
    connectionId: event.requestContext.connectionId,
    ttl: ttlValue,
  },
}));
```

### 注意点
- TTL 属性名の変更は、一度 TTL を無効化してから再度有効化する必要があり、最大1時間かかる
- TTL の値は **秒単位の Unix epoch** でなければならない（ミリ秒だと遥か未来の日時になり機能しない）

---

## 6. S3 + CloudFront の静的サイトホスティング（CDK）

### OAC（Origin Access Control）を使った最新パターン（推奨）

OAI（Origin Access Identity）は旧方式。2022年以降は **OAC** が推奨。
CDK v2 では L2 コンストラクト `S3BucketOrigin` が OAC を自動設定してくれる。

```typescript
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

// S3 バケット（パブリックアクセスは全てブロック）
const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
  removalPolicy: cdk.RemovalPolicy.DESTROY,
  autoDeleteObjects: true,
});

// CloudFront ディストリビューション（OAC 自動設定）
const distribution = new cloudfront.Distribution(this, 'Distribution', {
  defaultBehavior: {
    // S3BucketOrigin.withOriginAccessControl() で OAC が自動作成される
    origin: origins.S3BucketOrigin.withOriginAccessControl(websiteBucket),
    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
  },
  defaultRootObject: 'index.html',
  // SPA 用: 404 を index.html にリダイレクト
  errorResponses: [
    {
      httpStatus: 403,
      responseHttpStatus: 200,
      responsePagePath: '/index.html',
    },
    {
      httpStatus: 404,
      responseHttpStatus: 200,
      responsePagePath: '/index.html',
    },
  ],
});

// S3 にファイルをデプロイ
new s3deploy.BucketDeployment(this, 'DeployWebsite', {
  sources: [s3deploy.Source.asset('./frontend/dist')],
  destinationBucket: websiteBucket,
  distribution,  // デプロイ後に CloudFront キャッシュを自動無効化
  distributionPaths: ['/*'],
});

// CloudFront URL を出力
new cdk.CfnOutput(this, 'DistributionDomainName', {
  value: distribution.distributionDomainName,
});
```

### ポイント
- `S3BucketOrigin.withOriginAccessControl()` を使えば OAC が自動的に作成・設定される
- S3 バケットは **パブリックアクセス全ブロック** でOK（CloudFront 経由のみアクセス可能）
- `BucketDeployment` の `distribution` / `distributionPaths` で自動キャッシュ無効化

---

## 完全な構成例（全体像）

```
project/
├── lib/
│   ├── websocket-stack.ts      # WebSocket API + Lambda + DynamoDB
│   └── frontend-stack.ts       # S3 + CloudFront
├── lambda/
│   ├── connect.ts              # $connect ハンドラー
│   ├── disconnect.ts           # $disconnect ハンドラー
│   ├── default.ts              # $default ハンドラー
│   └── sendMessage.ts          # カスタムルートハンドラー
├── frontend/
│   └── dist/                   # ビルド済み静的ファイル
├── bin/
│   └── app.ts                  # CDK アプリのエントリポイント
└── cdk.json
```

---

## 参考リンク

- [WebSocketApi CDK API Reference](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_apigatewayv2.WebSocketApi.html)
- [aws-apigatewayv2 README](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_apigatewayv2-readme.html)
- [AWS Samples: websocket-chat-application](https://github.com/aws-samples/websocket-chat-application)
- [@connections API ドキュメント](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-how-to-call-websocket-api-connections.html)
- [CloudFront OAC L2 コンストラクト](https://aws.amazon.com/blogs/devops/a-new-aws-cdk-l2-construct-for-amazon-cloudfront-origin-access-control-oac/)
