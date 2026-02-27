# Research: 単語登録機能

**Phase**: 0 | **Feature**: 001-word-registration | **Date**: 2026-02-27

## 調査トピック一覧

本 feature の Technical Context で確認が必要なテクノロジーの選定と設計判断を記録する。

---

## 1. フロントエンド構築ツール

**Decision**: Vite + React + TypeScript

**Rationale**:
- Create React App（CRA）は 2023 年以降メンテナンス停止状態で非推奨。
- Vite は高速な開発サーバー（HMR）と TypeScript のネイティブサポートを提供。
- `npm create vite@latest frontend -- --template react-ts` で即座にセットアップ可能。

**Alternatives considered**:
- Next.js → SSR/SSG が不要なシンプルな SPA に対して過剰。将来的に必要になれば移行を検討。
- CRA → 非推奨のため却下。

---

## 2. フォームハンドリング

**Decision**: React Hook Form

**Rationale**:
- バリデーション（必須チェック・文字数上限）を宣言的に記述できる。
- uncontrolled components ベースのため不要な再レンダリングが少ない。
- `register` + `handleSubmit` + `formState.errors` で登録フォームのすべての要件（FR-002、FR-006、FR-008）をカバー。

**Alternatives considered**:
- Formik → 機能は同等だが、re-render が多く React Hook Form の方がパフォーマンスに優れる。
- 素の `useState` → バリデーション管理が煩雑になり、テストも複雑化するため却下。

---

## 3. HTTP クライアント

**Decision**: Axios

**Rationale**:
- エラーハンドリングが直感的（4xx/5xx を自動的に例外として扱う）。
- インターセプターで共通エラー処理・認証ヘッダー付与が容易（将来の認証機能に対応）。
- TypeScript の型付けサポートが充実。

**Alternatives considered**:
- Fetch API → エラーハンドリングが冗長（4xx でも例外にならない）。シンプルさでは優るが、プロジェクトの成長を考慮して Axios を選択。

---

## 4. バックエンド ORM

**Decision**: TypeORM（`@nestjs/typeorm`）

**Rationale**:
- NestJS の公式モジュール（`@nestjs/typeorm`）として提供されており、統合が最もスムーズ。
- デコレータベース（`@Entity`, `@Column`, `@PrimaryGeneratedColumn`）でエンティティ定義が TypeScript と親和性が高い。
- マイグレーション機能（Constitution III: データ整合性）が組み込まれている。
- MySQL 8.x のドライバー（`mysql2`）と直接統合。

**Alternatives considered**:
- Prisma → NestJS 統合は良好だが、スキーマ定義が独自形式（`.prisma`）で TypeScript のデコレータとの一体感が低い。
- Knex → クエリビルダーであり ORM ではないため、エンティティ管理が煩雑になる。

---

## 5. バックエンド入力バリデーション

**Decision**: class-validator + class-transformer

**Rationale**:
- NestJS の `ValidationPipe` と組み合わせることで、DTO クラスに付与したデコレータ（`@IsNotEmpty()`, `@MaxLength()` など）を自動的に検証できる。
- バリデーションエラーは NestJS が自動的に 400 Bad Request として返し、エラーメッセージも統一フォーマットで提供される（Constitution II・III に準拠）。

**Alternatives considered**:
- Joi → NestJS のデコレータベースのアーキテクチャとの統合が煩雑。
- 手動バリデーション → エラーフォーマットの統一管理が困難。

---

## 6. データベース接続設定

**Decision**: MySQL 8.x + TypeORM の接続設定を `app.module.ts` で `TypeOrmModule.forRoot()` を使って定義。

**Rationale**:
- 接続情報（ホスト・ポート・DB名・認証情報）は環境変数で管理し、`docker-compose.yml` から注入。
- 開発環境は `synchronize: true`（スキーマの自動同期）を使用し、本番相当環境ではマイグレーション（`migration:run`）を使用。

**Connection Parameters** (開発環境):
```
host: db（Docker サービス名）
port: 3306
database: english_words
username: root
password: password（環境変数で管理）
synchronize: true（開発のみ）
```

---

## 7. テスト戦略

**Decision**: TDD（Constitution I に従い必須）

**フロントエンド（React Testing Library + Jest）**:
- `WordRegistrationForm` コンポーネントのテスト:
  1. フォームが正しく描画される
  2. 有効な入力で送信すると `wordService.create()` が呼ばれる
  3. スペル未入力でエラーメッセージが表示される
  4. 意味未入力でエラーメッセージが表示される
  5. 空白のみの入力でエラーメッセージが表示される
  6. 登録成功後にフォームがクリアされる
  7. API エラー時にエラーメッセージが表示され入力が保持される

**バックエンド（NestJS Jest）**:
- `WordsService` の単体テスト（TypeORM リポジトリをモック）:
  1. `create()` が Word エンティティを保存して返す
  2. DB エラー時に例外を投げる
- `WordsController` の単体テスト（`WordsService` をモック）:
  1. 有効なリクエストで 201 を返す
  2. バリデーションエラーで 400 を返す

---

## 8. Docker 構成

**Decision**: `docker-compose.yml` で 3 サービスを定義

```yaml
services:
  db:       # MySQL 8.x
  backend:  # NestJS（ポート 3000）
  frontend: # Vite dev server（ポート 5173）
```

**Rationale**:
- 開発環境を統一し、環境差異によるバグを防ぐ。
- MySQL サービスの起動待機は `healthcheck` + `depends_on` で制御。

---

## NEEDS CLARIFICATION 解決状況

| 項目 | 状態 | 結論 |
|------|------|------|
| フロントエンド構築ツール | ✅ 解決 | Vite + React + TypeScript |
| ORM 選択 | ✅ 解決 | TypeORM（`@nestjs/typeorm`） |
| フォームライブラリ | ✅ 解決 | React Hook Form |
| HTTP クライアント | ✅ 解決 | Axios |
| バリデーション | ✅ 解決 | class-validator + class-transformer |
| DB 接続 | ✅ 解決 | mysql2 ドライバー、環境変数で設定 |
| テスト戦略 | ✅ 解決 | TDD: React Testing Library + NestJS Jest |
