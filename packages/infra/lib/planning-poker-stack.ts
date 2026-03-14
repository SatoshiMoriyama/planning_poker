import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import { WebSocketLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import type { Construct } from 'constructs';

export class PlanningPokerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // --- DynamoDB ---
    const connectionsTable = new dynamodb.TableV2(this, 'ConnectionsTable', {
      partitionKey: { name: 'connectionId', type: dynamodb.AttributeType.STRING },
      billing: dynamodb.Billing.onDemand(),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      timeToLiveAttribute: 'ttl',
    });

    const roomsTable = new dynamodb.TableV2(this, 'RoomsTable', {
      partitionKey: { name: 'roomId', type: dynamodb.AttributeType.STRING },
      billing: dynamodb.Billing.onDemand(),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      timeToLiveAttribute: 'ttl',
    });

    // --- Lambda 共通設定 ---
    const nodejsFunctionProps: Partial<ConstructorParameters<typeof NodejsFunction>[2]> = {
      runtime: lambda.Runtime.NODEJS_22_X,
      timeout: cdk.Duration.seconds(30),
      bundling: {
        format: OutputFormat.ESM,
        mainFields: ['module', 'main'],
        banner: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
      },
      handler: 'handler',
    };

    // WEBSOCKET_ENDPOINT は WebSocketStage 作成後に設定するため、ここでは DynamoDB 環境変数のみ
    const tableEnvironment = {
      CONNECTIONS_TABLE_NAME: connectionsTable.tableName,
      ROOMS_TABLE_NAME: roomsTable.tableName,
    };

    const connectHandler = new NodejsFunction(this, 'ConnectHandler', {
      ...nodejsFunctionProps,
      entry: '../backend/src/handlers/connect.ts',
    });

    const disconnectHandler = new NodejsFunction(this, 'DisconnectHandler', {
      ...nodejsFunctionProps,
      entry: '../backend/src/handlers/disconnect.ts',
      environment: {
        ...tableEnvironment,
      },
    });

    const defaultHandler = new NodejsFunction(this, 'DefaultHandler', {
      ...nodejsFunctionProps,
      entry: '../backend/src/handlers/default.ts',
      environment: {
        ...tableEnvironment,
      },
    });

    // --- WebSocket API Gateway ---
    const webSocketApi = new apigwv2.WebSocketApi(this, 'WebSocketApi', {
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

    const webSocketStage = new apigwv2.WebSocketStage(this, 'WebSocketStage', {
      webSocketApi,
      stageName: 'prod',
      autoDeploy: true,
    });

    // WebSocket エンドポイントを Lambda に設定
    disconnectHandler.addEnvironment('WEBSOCKET_ENDPOINT', webSocketStage.callbackUrl);
    defaultHandler.addEnvironment('WEBSOCKET_ENDPOINT', webSocketStage.callbackUrl);

    // --- 権限付与 ---
    connectionsTable.grantReadWriteData(disconnectHandler);
    connectionsTable.grantReadWriteData(defaultHandler);

    roomsTable.grantReadWriteData(disconnectHandler);
    roomsTable.grantReadWriteData(defaultHandler);

    webSocketApi.grantManageConnections(disconnectHandler);
    webSocketApi.grantManageConnections(defaultHandler);

    // --- S3 + CloudFront（フロントエンド配信） ---
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(websiteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
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

    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('../frontend/dist')],
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ['/*'],
    });

    // --- Outputs ---
    new cdk.CfnOutput(this, 'WebSocketUrl', {
      value: webSocketStage.url,
    });

    new cdk.CfnOutput(this, 'CloudFrontUrl', {
      value: distribution.distributionDomainName,
    });
  }
}
