# API Contract: 単語登録機能

**Phase**: 1 | **Feature**: 001-word-registration | **Date**: 2026-02-27
**Base URL**: `http://localhost:3000`（開発環境）

---

## POST /api/words

単語（スペルと意味のペア）を 1 件登録する。

### リクエスト

```
POST /api/words
Content-Type: application/json
```

**Body**:

```json
{
  "spell": "abundant",
  "meaning": "豊富な"
}
```

| フィールド | 型 | 必須 | 制約 | 説明 |
|------------|----|------|------|------|
| `spell` | `string` | ✅ | 1〜200 文字、空白のみ不可 | 英単語のスペル |
| `meaning` | `string` | ✅ | 1〜500 文字、空白のみ不可 | 学習した意味 |

---

### レスポンス

#### 201 Created（登録成功）

```json
{
  "id": 1,
  "spell": "abundant",
  "meaning": "豊富な",
  "createdAt": "2026-02-27T00:00:00.000Z"
}
```

| フィールド | 型 | 説明 |
|------------|----|------|
| `id` | `number` | 自動採番の主キー |
| `spell` | `string` | 登録されたスペル |
| `meaning` | `string` | 登録された意味 |
| `createdAt` | `string` (ISO 8601) | 登録日時 |

---

#### 400 Bad Request（バリデーションエラー）

スペルまたは意味が未入力・空白のみ・文字数超過の場合。

```json
{
  "statusCode": 400,
  "message": [
    "スペルを入力してください",
    "スペルは200文字以内で入力してください"
  ],
  "error": "Bad Request"
}
```

| フィールド | 型 | 説明 |
|------------|----|------|
| `statusCode` | `number` | HTTP ステータスコード（400） |
| `message` | `string[]` | バリデーションエラーメッセージの配列 |
| `error` | `string` | エラー種別（`"Bad Request"`） |

**バリデーションエラーケース**:

| ケース | エラーメッセージ |
|--------|----------------|
| spell が未入力 | `"スペルを入力してください"` |
| spell が空白のみ | `"スペルを入力してください"` |
| spell が 200 文字超 | `"スペルは200文字以内で入力してください"` |
| meaning が未入力 | `"意味を入力してください"` |
| meaning が空白のみ | `"意味を入力してください"` |
| meaning が 500 文字超 | `"意味は500文字以内で入力してください"` |

---

#### 500 Internal Server Error（サーバーエラー）

DB 接続エラーなど、予期しないサーバー側のエラー。

```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

### サンプルリクエスト（curl）

```bash
# 正常系: 単語を登録する
curl -X POST http://localhost:3000/api/words \
  -H "Content-Type: application/json" \
  -d '{"spell": "abundant", "meaning": "豊富な"}'

# 正常系: 同じスペルを別の意味で登録する（許容）
curl -X POST http://localhost:3000/api/words \
  -H "Content-Type: application/json" \
  -d '{"spell": "run", "meaning": "経営する"}'

# 異常系: スペルが未入力
curl -X POST http://localhost:3000/api/words \
  -H "Content-Type: application/json" \
  -d '{"spell": "", "meaning": "豊富な"}'
```

---

### フロントエンド利用例

```typescript
// frontend/src/services/wordService.ts
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

export interface CreateWordRequest {
  spell: string;
  meaning: string;
}

export interface WordResponse {
  id: number;
  spell: string;
  meaning: string;
  createdAt: string;
}

export async function createWord(data: CreateWordRequest): Promise<WordResponse> {
  const response = await axios.post<WordResponse>(`${BASE_URL}/api/words`, data);
  return response.data;
}
```

---

### NestJS 実装のポイント

```typescript
// バリデーション自動適用（main.ts）
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,      // DTO に定義されていないフィールドを除去
    transform: true,      // DTO の型に自動変換（class-transformer）
    forbidNonWhitelisted: true,
  })
);

// コントローラー（words.controller.ts）
@Post()
@HttpCode(HttpStatus.CREATED)
async create(@Body() createWordDto: CreateWordDto): Promise<Word> {
  return this.wordsService.create(createWordDto);
}
```
