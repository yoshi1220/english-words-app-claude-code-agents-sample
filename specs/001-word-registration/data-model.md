# Data Model: 単語登録機能

**Phase**: 1 | **Feature**: 001-word-registration | **Date**: 2026-02-27

## エンティティ一覧

本 feature で扱うエンティティは `Word`（単語）の 1 つ。

---

## Word エンティティ

### 概要

英語学習の記録単位。スペル・意味・登録日時を保持する。
同じスペルを異なる意味で複数回登録可能（FR-003）。

### フィールド定義

| フィールド | 型 | 制約 | 説明 |
|------------|----|------|------|
| `id` | `number` | PK, AUTO_INCREMENT | 自動採番の主キー |
| `spell` | `string` | NOT NULL, VARCHAR(200) | 英単語のスペル。空文字・空白のみ不可 |
| `meaning` | `string` | NOT NULL, VARCHAR(500) | 学習した意味（日本語）。空文字・空白のみ不可 |
| `createdAt` | `Date` | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 登録日時（自動設定、FR-007） |

> **設計メモ**: `userId` は認証機能（別 feature）実装後に追加する。
> 現時点では認証なしで登録できるが、認証機能追加時に外部キーを付与してマイグレーションを行う。

### バリデーションルール

| ルール | 対象 | 内容 |
|--------|------|------|
| 必須 | spell, meaning | 空文字・`null`・`undefined` を拒否（FR-002） |
| 空白トリム | spell, meaning | 空白文字のみの入力は無効（FR-002） |
| 最大文字数 | spell | 200 文字以内（FR-008） |
| 最大文字数 | meaning | 500 文字以内（FR-008） |

**注意**: スペルの英字制限は行わない。略語・記号も学習対象となりうるため（Edge Cases）。

### TypeORM エンティティ実装

```typescript
// backend/src/words/word.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('words')
export class Word {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200, nullable: false })
  spell: string;

  @Column({ type: 'varchar', length: 500, nullable: false })
  meaning: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

### DTO 定義

```typescript
// backend/src/words/dto/create-word.dto.ts
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateWordDto {
  @IsNotEmpty({ message: 'スペルを入力してください' })
  @IsString()
  @MaxLength(200, { message: 'スペルは200文字以内で入力してください' })
  spell: string;

  @IsNotEmpty({ message: '意味を入力してください' })
  @IsString()
  @MaxLength(500, { message: '意味は500文字以内で入力してください' })
  meaning: string;
}
```

### MySQL スキーマ（参考）

```sql
CREATE TABLE words (
  id         INT           NOT NULL AUTO_INCREMENT,
  spell      VARCHAR(200)  NOT NULL,
  meaning    VARCHAR(500)  NOT NULL,
  created_at DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id)
);
```

---

## 状態遷移

本 feature では状態遷移は存在しない。
Word は登録のみ行う（照会・更新・削除は別 feature）。

```
[未登録] → POST /api/words → [登録済み]
```

---

## 将来の拡張ポイント

- `userId` フィールド: 認証機能実装後に追加（外部キー `users.id`）。
- `learningStatus` フィールド: 学習状況管理機能実装後に追加（`UNLEARNED` / `LEARNING` / `MASTERED`）。
- `exampleSentence` フィールド: 例文登録機能実装後に追加（任意フィールド）。
