# プランニングポーカーアプリ: DynamoDB テーブル設計ガイド

## 1. シングルテーブル設計 vs マルチテーブル設計

### 結論: プランニングポーカーには「シングルテーブル設計」を推奨

| 観点 | シングルテーブル | マルチテーブル |
|------|----------------|--------------|
| パフォーマンス | 1回のクエリで関連データ取得可能 | テーブルをまたぐ複数クエリが必要 |
| コスト | 読み取り回数が少なく低コスト | 複数テーブルへのアクセスでコスト増 |
| 運用 | テーブル1つの監視で済む | 複数テーブルの管理が必要 |
| 学習コスト | キー設計が複雑（初心者には難しい） | 直感的で分かりやすい |
| スケーラビリティ | 高い（DynamoDBの特性を最大活用） | 普通 |

**プランニングポーカーの場合:**
- エンティティが少ない（接続、ルーム、投票の3種類程度）
- アクセスパターンが明確
- リアルタイム性が重要 → クエリ回数を最小化したい

これらの理由からシングルテーブル設計が適しています。

> **補足**: AWS公式ブログでも「アクセスパターンが明確で、関連するエンティティをまとめて取得する必要がある場合はシングルテーブル設計が有効」と推奨されています。ただし、既存のOSS実装（Planning Poker Teams）ではシンプルさを優先してマルチテーブル設計を採用している例もあります。チーム規模が小さく開発スピード重視ならマルチテーブルもアリです。

---

## 2. 推奨テーブル設計（シングルテーブル）

### テーブル名: `PlanningPokerTable`

| 属性名 | 型 | 説明 |
|--------|-----|------|
| **PK** (Partition Key) | String | エンティティの主キー |
| **SK** (Sort Key) | String | エンティティの種別・詳細キー |
| connectionId | String | WebSocket接続ID |
| roomId | String | ルームID |
| userName | String | ユーザー名 |
| isHost | Boolean | ホストかどうか |
| isSpectator | Boolean | 観察者かどうか |
| vote | String | 投票値（"1", "3", "5", "8" など） |
| status | String | ルームの状態（"voting", "revealed", "waiting"） |
| createdAt | String | 作成日時（ISO 8601） |
| ttl | Number | TTL（Unix epoch秒） |

### エンティティとキー設計

#### (A) 接続レコード (Connection)
```
PK: "CONN#<connectionId>"
SK: "CONN#<connectionId>"
```
- WebSocket接続時（$connect）に作成
- 属性: connectionId, roomId, userName, isHost, isSpectator, ttl

#### (B) ルームレコード (Room)
```
PK: "ROOM#<roomId>"
SK: "ROOM#METADATA"
```
- ルーム作成時に生成
- 属性: roomId, status, hostConnectionId, createdAt, ttl

#### (C) 参加者レコード (Participant)
```
PK: "ROOM#<roomId>"
SK: "PARTICIPANT#<connectionId>"
```
- ルーム参加時に作成
- 属性: connectionId, userName, isHost, isSpectator, vote, ttl

### データ例

| PK | SK | connectionId | roomId | userName | vote | status |
|----|-----|-------------|--------|----------|------|--------|
| CONN#abc123 | CONN#abc123 | abc123 | room-1 | もりやま | - | - |
| CONN#def456 | CONN#def456 | def456 | room-1 | 田中 | - | - |
| ROOM#room-1 | ROOM#METADATA | - | room-1 | - | - | voting |
| ROOM#room-1 | PARTICIPANT#abc123 | abc123 | room-1 | もりやま | 5 | - |
| ROOM#room-1 | PARTICIPANT#def456 | def456 | room-1 | 田中 | 8 | - |

---

## 3. GSI（Global Secondary Index）設計

### GSI1: connectionId → ルーム情報の逆引き

**必要な理由**: `$disconnect` 時に connectionId しか分からないため、そこから roomId を特定してルームの参加者リストを更新する必要がある。

| 属性 | 値 |
|------|-----|
| GSI名 | `GSI1-ConnectionIndex` |
| パーティションキー | `connectionId` |
| ソートキー | なし |
| 射影 (Projection) | ALL |

**使用するアクセスパターン:**
```
$disconnect 時:
1. GSI1で connectionId → 接続レコード取得（roomId判明）
2. メインテーブルで PK="ROOM#<roomId>" を Query → 全参加者取得
3. 該当参加者レコードを削除
4. 残りの参加者にブロードキャスト
```

### GSI が不要なケース

以下のアクセスパターンはメインテーブルのキー設計で直接対応可能:

| アクセスパターン | クエリ方法 |
|-----------------|-----------|
| ルーム内の全参加者を取得 | `PK = "ROOM#<roomId>"` で Query（SK が `PARTICIPANT#` で始まるものをフィルタ） |
| ルームのメタデータを取得 | `PK = "ROOM#<roomId>", SK = "ROOM#METADATA"` で GetItem |
| 特定参加者の情報を取得 | `PK = "ROOM#<roomId>", SK = "PARTICIPANT#<connectionId>"` で GetItem |

---

## 4. TTL（Time To Live）設計

### TTL の基本ルール
- **データ型**: Number型（Unix epoch 秒）
- **属性名**: `ttl`（任意の名前でOK）
- **削除タイミング**: 期限切れ後、通常48時間以内に自動削除
- **コスト**: TTLによる削除は WCU（書き込みキャパシティ）を消費しない（無料）

### エンティティ別 TTL 設定

| エンティティ | TTL の目安 | 理由 |
|-------------|-----------|------|
| 接続レコード | 接続時刻 + 2.5時間 | API Gateway WebSocket の最大接続時間が2時間のため |
| ルームレコード | 最終アクティビティ + 24時間 | セッション終了後もしばらく参照できるように |
| 参加者レコード | 接続時刻 + 2.5時間 | 接続レコードと同じライフサイクル |

### TTL の計算例（JavaScript）
```javascript
// 接続レコード・参加者レコード: 2.5時間後に期限切れ
const ttl = Math.floor(Date.now() / 1000) + (2.5 * 60 * 60); // 9000秒後

// ルームレコード: 24時間後に期限切れ
const roomTtl = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 86400秒後
```

### TTL 利用時の注意点

1. **期限切れアイテムはすぐには消えない**: 最大48時間のラグがあるため、Query/Scan時にフィルタ式で除外する
   ```javascript
   FilterExpression: "#ttl > :now OR attribute_not_exists(#ttl)"
   ExpressionAttributeNames: { "#ttl": "ttl" }
   ExpressionAttributeValues: { ":now": Math.floor(Date.now() / 1000) }
   ```
2. **$disconnect での明示的削除も併用**: TTLだけに頼らず、正常切断時は即座にレコードを削除する
3. **DynamoDB Streams との連携**: TTL削除をトリガーにして、ルームの参加者リスト更新などの後処理が可能

---

## 5. アクセスパターンまとめ

| # | アクセスパターン | 操作 | キー条件 |
|---|-----------------|------|----------|
| 1 | WebSocket接続時に接続情報を保存 | PutItem | PK=CONN#connId, SK=CONN#connId |
| 2 | ルーム作成 | PutItem | PK=ROOM#roomId, SK=ROOM#METADATA |
| 3 | ルーム参加 | PutItem | PK=ROOM#roomId, SK=PARTICIPANT#connId |
| 4 | ルーム内の全参加者を取得 | Query | PK=ROOM#roomId, SK begins_with("PARTICIPANT#") |
| 5 | 投票を記録 | UpdateItem | PK=ROOM#roomId, SK=PARTICIPANT#connId |
| 6 | 全投票結果を取得（公開時） | Query | PK=ROOM#roomId, SK begins_with("PARTICIPANT#") |
| 7 | connectionIdからルーム情報を取得 | Query (GSI1) | GSI1: connectionId=connId |
| 8 | 切断時に接続・参加者レコードを削除 | DeleteItem x2 | GSI1で逆引き後、両レコード削除 |
| 9 | ルーム状態を更新 | UpdateItem | PK=ROOM#roomId, SK=ROOM#METADATA |

---

## 6. CloudFormation / CDK でのテーブル定義例（参考）

```yaml
# CloudFormation
PlanningPokerTable:
  Type: AWS::DynamoDB::Table
  Properties:
    TableName: PlanningPokerTable
    BillingMode: PAY_PER_REQUEST
    AttributeDefinitions:
      - AttributeName: PK
        AttributeType: S
      - AttributeName: SK
        AttributeType: S
      - AttributeName: connectionId
        AttributeType: S
    KeySchema:
      - AttributeName: PK
        KeyType: HASH
      - AttributeName: SK
        KeyType: RANGE
    GlobalSecondaryIndexes:
      - IndexName: GSI1-ConnectionIndex
        KeySchema:
          - AttributeName: connectionId
            KeyType: HASH
        Projection:
          ProjectionType: ALL
    TimeToLiveSpecification:
      AttributeName: ttl
      Enabled: true
```

---

## Sources

- [AWS 公式: WebSocket Chat App チュートリアル](https://docs.aws.amazon.com/apigateway/latest/developerguide/websocket-api-chat-app.html)
- [AWS 公式: DynamoDB TTL ドキュメント](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html)
- [AWS ブログ: Creating a single-table design with Amazon DynamoDB](https://aws.amazon.com/blogs/compute/creating-a-single-table-design-with-amazon-dynamodb/)
- [AWS ブログ: Single-table vs multi-table DynamoDB design patterns](https://aws.amazon.com/blogs/mobile/single-table-vs-multi-table-dynamodb-appsync/)
- [Planning Poker Teams Backend (GitHub)](https://github.com/Planning-Poker-Teams/planning-poker-backend)
- [Building a WebSocket Service with AWS Lambda & DynamoDB (Velotio)](https://www.velotio.com/engineering-blog/building-a-websocket-service-with-aws-lambda-dynamodb)
- [DynamoDB Single Table Design: GSI Optimization (Pravin.dev)](https://pravin.dev/posts/dynamodb-single-table-design/)
