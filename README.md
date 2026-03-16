# Planning Poker

リアルタイムでプランニングポーカーができるWebアプリケーション。
WebSocketを使って、チームメンバーがルームに参加し、ストーリーポイントの見積もりを同時に行えます。

## 技術スタック

- フロントエンド: React 19 + Vite + Tailwind CSS + shadcn/ui
- バックエンド: AWS Lambda (Node.js 22) + API Gateway WebSocket
- データベース: Amazon DynamoDB
- ホスティング: S3 + CloudFront
- IaC: AWS CDK
- パッケージ管理: pnpm (monorepo)

## プロジェクト構成

```
packages/
├── frontend/   # React SPA
├── backend/    # Lambda ハンドラー & ビジネスロジック
└── infra/      # CDK スタック定義
```

## セットアップ

```bash
pnpm install
```

## 開発

```bash
pnpm dev
```

## デプロイ

```bash
pnpm deploy
```
