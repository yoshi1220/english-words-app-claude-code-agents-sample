# Quickstart: 単語登録機能

**Feature**: 001-word-registration | **Date**: 2026-02-27

## 前提条件

- Docker / Docker Compose がインストール済みであること
- Node.js 20.x 以上がインストール済みであること（ローカル開発の場合）

---

## 開発環境の起動（Docker Compose）

```bash
# リポジトリルートで実行
docker-compose up --build
```

起動後のアクセス先:

| サービス | URL |
|----------|-----|
| フロントエンド | http://localhost:5173 |
| バックエンド API | http://localhost:3000 |
| MySQL | localhost:3306 |

---

## バックエンドのセットアップ（ローカル）

```bash
cd backend

# 依存パッケージのインストール
npm install

# 開発サーバーの起動（ホットリロード有効）
npm run start:dev
```

### バックエンドのテスト実行

```bash
cd backend

# 単体テスト（TDD: 実装前に実行して RED を確認）
npm run test

# テストのウォッチモード
npm run test:watch

# カバレッジレポート
npm run test:cov
```

---

## フロントエンドのセットアップ（ローカル）

```bash
cd frontend

# 依存パッケージのインストール
npm install

# 開発サーバーの起動
npm run dev
```

### フロントエンドのテスト実行

```bash
cd frontend

# 単体テスト（TDD: 実装前に実行して RED を確認）
npm run test

# テストのウォッチモード
npm run test -- --watch
```

---

## データベースのセットアップ

開発環境では TypeORM の `synchronize: true` を使用するため、
バックエンド起動時に自動的に `words` テーブルが作成される。

手動で確認する場合:

```bash
# MySQL コンテナに接続
docker exec -it english-words-db mysql -u root -p

# テーブルの確認
USE english_words;
SHOW TABLES;
DESCRIBE words;
```

---

## 動作確認（curl）

```bash
# 単語を登録する
curl -X POST http://localhost:3000/api/words \
  -H "Content-Type: application/json" \
  -d '{"spell": "abundant", "meaning": "豊富な"}'

# 期待レスポンス（201 Created）:
# {"id":1,"spell":"abundant","meaning":"豊富な","createdAt":"2026-02-27T00:00:00.000Z"}

# バリデーションエラーの確認
curl -X POST http://localhost:3000/api/words \
  -H "Content-Type: application/json" \
  -d '{"spell": "", "meaning": "豊富な"}'

# 期待レスポンス（400 Bad Request）:
# {"statusCode":400,"message":["スペルを入力してください"],"error":"Bad Request"}
```

---

## TDD 開発フロー

本 feature は TDD（Constitution 原則 I）に従って開発する。

```
1. テストを書く（Red）
   └── npm run test → FAIL を確認

2. 最小限の実装（Green）
   └── npm run test → PASS を確認

3. リファクタリング
   └── npm run test → PASS のまま維持
```

### バックエンドの TDD 開始手順

```bash
cd backend

# 1. テストファイルを先に作成
touch src/words/words.service.spec.ts
touch src/words/words.controller.spec.ts

# 2. テストを書く → npm run test で RED を確認
# 3. 実装 → npm run test で GREEN を確認
```

### フロントエンドの TDD 開始手順

```bash
cd frontend

# 1. テストファイルを先に作成
mkdir -p src/components/WordRegistrationForm
touch src/components/WordRegistrationForm/WordRegistrationForm.test.tsx

# 2. テストを書く → npm run test で RED を確認
# 3. 実装 → npm run test で GREEN を確認
```
