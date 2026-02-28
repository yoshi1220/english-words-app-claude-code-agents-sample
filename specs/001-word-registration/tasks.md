# Tasks: 単語登録機能

**Input**: Design documents from `/specs/001-word-registration/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: TDD は Constitution 原則 I（NON-NEGOTIABLE）のため必須。テストは実装より先に記述する。

**Organization**: タスクはユーザーストーリー単位で整理。各ストーリーを独立して実装・テスト可能にする。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（異なるファイル、未完了タスクへの依存なし）
- **[Story]**: 対象ユーザーストーリー（US1, US2）
- 各タスクに正確なファイルパスを含める

---

## Phase 1: Setup（プロジェクト初期化）

**Purpose**: backend / frontend プロジェクトの作成と Docker 環境の構築

- [x] T001 [P] Initialize NestJS backend project with dependencies (`@nestjs/typeorm`, `typeorm`, `mysql2`, `class-validator`, `class-transformer`) in `backend/`
- [x] T002 [P] Initialize Vite + React + TypeScript frontend project with dependencies (`react-hook-form`, `axios`) in `frontend/`
- [x] T003 [P] Create `docker-compose.yml` with MySQL 8.x (`db`), NestJS (`backend`, port 3000), Vite dev server (`frontend`, port 5173) services

---

## Phase 2: Foundational（基盤構築）

**Purpose**: 全ユーザーストーリーの前提となるインフラ設定

**CRITICAL**: このフェーズが完了するまでユーザーストーリーの実装は開始不可

- [x] T004 [P] Configure TypeORM MySQL connection (`TypeOrmModule.forRoot()`) with environment variables in `backend/src/app.module.ts`
- [x] T005 [P] Configure global ValidationPipe (`whitelist`, `transform`, `forbidNonWhitelisted`) and CORS in `backend/src/main.ts`

**Checkpoint**: 基盤準備完了 — ユーザーストーリーの実装を開始可能

---

## Phase 3: User Story 1 — 英単語と意味の新規登録 (Priority: P1) MVP

**Goal**: スペルと意味を入力して登録ボタンを押すと、単語が DB に保存され、成功フィードバック表示後にフォームがクリアされて次の単語を続けて登録できる

**Independent Test**: `POST /api/words` に `{"spell": "abundant", "meaning": "豊富な"}` を送信し、201 レスポンスと登録データが返ること。フロントエンドで登録後にフォームがクリアされること。

### Tests for User Story 1 (TDD: RED first)

> **NOTE: これらのテストを先に書き、FAIL することを確認してから実装に進む**

- [x] T006 [P] [US1] Write WordsService unit tests (create returns saved entity, same spell with different meaning creates separate record, DB error throws exception) in `backend/src/words/words.service.spec.ts`
- [x] T007 [P] [US1] Write WordsController unit tests (valid request returns 201 with created word) in `backend/src/words/words.controller.spec.ts`
- [x] T008 [P] [US1] Write WordRegistrationForm tests (form renders with spell/meaning inputs and submit button, successful submit calls API and shows success feedback, form clears after successful registration, API error displays error message and preserves input) in `frontend/src/components/WordRegistrationForm/WordRegistrationForm.test.tsx`

### Backend Implementation for User Story 1

- [x] T009 [P] [US1] Create Word entity (`id`, `spell`, `meaning`, `createdAt`) with TypeORM decorators in `backend/src/words/word.entity.ts`
- [x] T010 [P] [US1] Create CreateWordDto with class-transformer `@Transform(trim)` and class-validator decorators (`@IsNotEmpty`, `@IsString`, `@MaxLength`) in `backend/src/words/dto/create-word.dto.ts`
- [x] T011 [US1] Implement WordsService with `create()` method (save via TypeORM repository) in `backend/src/words/words.service.ts`
- [x] T012 [US1] Implement WordsController with `POST /api/words` endpoint (201 Created) in `backend/src/words/words.controller.ts`
- [x] T013 [US1] Create WordsModule (register entity, service, controller) and import in AppModule in `backend/src/words/words.module.ts` and `backend/src/app.module.ts`

### Frontend Implementation for User Story 1

- [x] T014 [US1] Implement wordService API client (`CreateWordRequest`, `WordResponse` types, `createWord` function) in `frontend/src/services/wordService.ts`
- [x] T015 [US1] Implement WordRegistrationForm component (spell/meaning inputs, submit handler, success feedback display, form clear after success, error message on API failure with input preservation) using React Hook Form in `frontend/src/components/WordRegistrationForm/WordRegistrationForm.tsx`
- [x] T016 [US1] Integrate WordRegistrationForm component in `frontend/src/App.tsx`

**Checkpoint**: User Story 1 が完全に動作しテスト可能。`npm run test` が GREEN であること。

---

## Phase 4: User Story 2 — 入力バリデーション (Priority: P2)

**Goal**: 不完全な入力（空欄、空白のみ、文字数超過）で登録を試みた場合、適切なエラーメッセージが表示されて登録が阻止される

**Independent Test**: スペル欄・意味欄を空にして登録ボタンを押し、それぞれのエラーメッセージが表示されること。201 文字以上のスペルを入力して登録を試み、文字数超過エラーが表示されること。

### Tests for User Story 2 (TDD: RED first)

> **NOTE: これらのテストを先に書き、FAIL することを確認してから実装に進む**

- [x] T017 [P] [US2] Add frontend validation tests (empty spell shows error, empty meaning shows error, whitespace-only spell shows error, spell over 200 chars shows error, meaning over 500 chars shows error, form is NOT submitted when validation fails) to `frontend/src/components/WordRegistrationForm/WordRegistrationForm.test.tsx`
- [x] T018 [P] [US2] Add backend validation edge case tests (empty body returns 400, whitespace-only spell returns 400, spell over 200 chars returns 400, meaning over 500 chars returns 400) to `backend/test/words/words.controller.spec.ts`

### Frontend Implementation for User Story 2

- [x] T019 [US2] Add React Hook Form validation rules (`required`, `maxLength`, `validate` for whitespace trim) and inline error message display per field to `frontend/src/components/WordRegistrationForm/WordRegistrationForm.tsx`
- [x] T020 [US2] Add server-side validation error handling (parse 400 response `message` array, display backend error messages, preserve input on validation failure) to `frontend/src/components/WordRegistrationForm/WordRegistrationForm.tsx`

**Checkpoint**: User Story 1 と 2 が両方とも独立して動作。全テストが GREEN であること。

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: 全体統合の検証とドキュメント整合性確認

- [x] T021 Verify docker-compose.yml end-to-end (all 3 services start, backend connects to MySQL, frontend proxies to backend) per `docker-compose.yml` — Docker未使用環境のため設定の静的検証のみ実施。Docker起動時に手動確認推奨。
- [x] T022 Run quickstart.md validation scenarios (curl commands for success and validation error cases) per `specs/001-word-registration/quickstart.md` — Docker未使用環境のため静的検証のみ。Docker起動後にcurlコマンドで手動確認推奨。

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存なし — 即座に開始可能。T001, T002, T003 は全て並列実行可能
- **Foundational (Phase 2)**: Phase 1 の T001 完了に依存（T004, T005 は `backend/src/` 内のファイルを編集するため）。T004 と T005 は並列実行可能
- **User Story 1 (Phase 3)**: Phase 2 完了に依存。テストタスク (T006-T008) は並列実行可能。バックエンド実装は T009, T010 → T011 → T012 → T013 の順。フロントエンド実装は T014 → T015 → T016 の順
- **User Story 2 (Phase 4)**: Phase 3 完了に依存（US1 のフォームとAPIが存在する前提）。テストタスク (T017, T018) は並列実行可能
- **Polish (Phase 5)**: Phase 4 完了に依存

### User Story Dependencies

- **User Story 1 (P1)**: Phase 2 完了後に開始可能。他ストーリーへの依存なし
- **User Story 2 (P2)**: User Story 1 完了後に開始（US1 のフォームとバリデーション基盤に依存）

### Within Each User Story

1. テストを先に書き FAIL を確認（TDD: RED）
2. Entity / DTO → Service → Controller → Module の順（backend）
3. API client → Component → App integration の順（frontend）
4. 全テストが GREEN になるまで実装を続ける

### Parallel Opportunities

- **Phase 1**: T001, T002, T003 は全て並列実行可能
- **Phase 2**: T004, T005 は並列実行可能
- **Phase 3 Tests**: T006, T007, T008 は並列実行可能
- **Phase 3 Backend**: T009, T010 は並列実行可能（Entity と DTO は独立ファイル）
- **Phase 4 Tests**: T017, T018 は並列実行可能

---

## Parallel Example: User Story 1

```bash
# TDD テスト作成（全て並列実行可能）:
Task T006: "Write WordsService unit tests in backend/test/words/words.service.spec.ts"
Task T007: "Write WordsController unit tests in backend/test/words/words.controller.spec.ts"
Task T008: "Write WordRegistrationForm tests in frontend/src/components/WordRegistrationForm/WordRegistrationForm.test.tsx"

# Entity と DTO は並列実行可能:
Task T009: "Create Word entity in backend/src/words/word.entity.ts"
Task T010: "Create CreateWordDto in backend/src/words/dto/create-word.dto.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup 完了
2. Phase 2: Foundational 完了（CRITICAL — 全ストーリーをブロック）
3. Phase 3: User Story 1 完了
4. **STOP and VALIDATE**: User Story 1 を独立してテスト
5. `POST /api/words` で登録成功・フォームクリアを確認

### Incremental Delivery

1. Setup + Foundational → 基盤準備完了
2. User Story 1 → 独立テスト → MVP 完成（単語登録の Happy Path）
3. User Story 2 → 独立テスト → バリデーション追加（データ品質保証）
4. Polish → 統合検証 → 全機能完了

---

## Notes

- [P] タスク = 異なるファイル、依存関係なし
- [Story] ラベルで各タスクの対象ユーザーストーリーを追跡可能
- TDD は Constitution 原則 I（NON-NEGOTIABLE）: テストを先に書き RED を確認してから実装
- 各チェックポイントでストーリーの独立動作を検証
- タスクまたは論理グループ完了ごとにコミット推奨
