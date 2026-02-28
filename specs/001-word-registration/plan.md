# Implementation Plan: 単語登録機能

**Branch**: `001-word-registration` | **Date**: 2026-02-27 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-word-registration/spec.md`

## Summary

英単語のスペルと意味をペアで1件ずつ登録する機能を実装する。
バックエンド（NestJS + TypeORM + MySQL）に単語登録 REST API（`POST /api/words`）を実装し、
フロントエンド（React + TypeScript）に登録フォームを実装する。
入力バリデーション（必須・文字数上限）をフロントエンド・バックエンド両側で行い、
登録完了後にフォームをクリアして次の単語を続けて登録できるようにする。

## Technical Context

**Language/Version**: TypeScript 5.x（フロントエンド・バックエンド共通）
**Primary Dependencies**: React 18（frontend）、NestJS 10 + TypeORM 0.3（backend）、React Hook Form（フォームバリデーション）、Axios（HTTP クライアント）
**Storage**: MySQL 8.x（TypeORM 経由）
**Testing**: Jest + React Testing Library（frontend）、Jest + NestJS テスト機能（backend）
**Target Platform**: Web（Docker コンテナ、Linux）
**Project Type**: Web アプリケーション（React SPA + NestJS REST API）
**Performance Goals**: 登録完了まで 30 秒以内（SC-001）
**Constraints**: spell ≤ 200 文字、meaning ≤ 500 文字（FR-008）
**Scale/Scope**: 個人利用の英単語学習アプリ（認証機能は別 feature）

## Constitution Check

*GATE: Phase 0 リサーチ前に確認。Phase 1 設計後に再確認。*

| 原則 | 状態 | 根拠 |
|------|------|------|
| I. TDD（NON-NEGOTIABLE） | ✅ PASS | フロントエンドは React Testing Library で `WordRegistrationForm` の描画・送信・バリデーション表示をテストする。バックエンドは NestJS Jest で `WordsService` / `WordsController` の単体テストを実装する。テストは実装コードより先に記述する。 |
| II. RESTful API | ✅ PASS | `POST /api/words` を実装。201 Created / 400 Bad Request / 500 Internal Server Error を適切に返す。リソース指向 URL。 |
| III. データ整合性 | ✅ PASS | フロントエンドで React Hook Form によるクライアントサイドバリデーション。バックエンドで `class-validator` による DTO バリデーション。MySQL の `NOT NULL` 制約・文字数制限をスキーマレベルでも保証。開発環境では `synchronize: true` を使用し迅速にイテレーションする。本番相当環境およびスキーマ変更を伴う後続 feature（認証機能等）ではマイグレーションを導入する。 |

**Post-design 再確認**: Phase 1 設計完了。全原則に準拠を確認済み。開発環境の `synchronize: true` 使用は、本 feature がスキーマ初回作成であり既存データの損失リスクがないため許容する。

## Project Structure

### Documentation (this feature)

```text
specs/001-word-registration/
├── plan.md              # このファイル (/speckit.plan コマンド出力)
├── research.md          # Phase 0 出力 (/speckit.plan コマンド)
├── data-model.md        # Phase 1 出力 (/speckit.plan コマンド)
├── quickstart.md        # Phase 1 出力 (/speckit.plan コマンド)
├── contracts/           # Phase 1 出力 (/speckit.plan コマンド)
│   └── api.md
└── tasks.md             # Phase 2 出力 (/speckit.tasks コマンド - /speckit.plan では生成しない)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── words/
│   │   ├── dto/
│   │   │   └── create-word.dto.ts
│   │   ├── word.entity.ts
│   │   ├── words.controller.ts
│   │   ├── words.module.ts
│   │   └── words.service.ts
│   ├── app.module.ts
│   └── main.ts
└── test/
    └── words/
        ├── words.controller.spec.ts
        └── words.service.spec.ts

frontend/
├── src/
│   ├── components/
│   │   └── WordRegistrationForm/
│   │       ├── WordRegistrationForm.tsx
│   │       └── WordRegistrationForm.test.tsx
│   ├── services/
│   │   └── wordService.ts
│   └── App.tsx
└── package.json

docker-compose.yml
```

**Structure Decision**: Web アプリケーション構成（Option 2）を採用。
フロントエンド（`frontend/`）とバックエンド（`backend/`）を分離し、
`docker-compose.yml` でオーケストレーションする。

## Complexity Tracking

> 今フェーズでは Constitution Check 違反なし。記録不要。
