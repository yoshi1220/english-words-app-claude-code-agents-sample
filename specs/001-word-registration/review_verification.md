# レビュー検証レポート

**日付**: 2026-02-28
**検証者**: review-verifier
**対象ブランチ**: `001-word-registration`

---

## 検証対象ドキュメント

- `/home/yoshi1220/workspace/english-words/specs/001-word-registration/code_review.md`

## 検証サマリー

- 評価した指摘事項数: 4（WARNING-001 ~ WARNING-004）
- 確認済み: 4 | 異議あり: 0 | 部分的に妥当: 0 | 証拠不十分: 0 | 不要: 0
- レビュー全体の品質: **徹底的**
- レビュー判定（PASS WITH WARNINGS）: **妥当**

---

## 指摘事項ごとの評価

### 指摘 1: WARNING-001 — フロントエンド API クライアントの BASE_URL ハードコード

- **出典**: code_review.md「Warnings」セクション、WARNING-001
- **レビューの主張**: `/home/yoshi1220/workspace/english-words/frontend/src/services/wordService.ts` の3行目で `BASE_URL` が `http://localhost:3000` にハードコードされている。Docker 環境では動作しない可能性がある。
- **調査結果**:
  - `wordService.ts` 3行目: `const BASE_URL = 'http://localhost:3000';` -- **ハードコードを確認**。
  - `vite.config.ts`: プロキシ設定なし。環境変数による上書き機構もなし。
  - `docker-compose.yml`: バックエンドはポート `3000:3000` でホストにマッピングされている。フロントエンドは Vite dev サーバー（`--host 0.0.0.0`）をコンテナ内で実行。
  - `api.md` 4行目: `Base URL: http://localhost:3000（開発環境）` と明記されており、現在の実装はこの仕様に準拠している。
  - Docker 環境での動作について: フロントエンドは SPA であり、API リクエストはブラウザから発行される。Docker 利用時もブラウザは `localhost:3000`（ホストマシン）にアクセスするため、ポートマッピング `3000:3000` が有効な限り動作する。レビューの「frontend container cannot reach localhost:3000 of the backend container」という記述は、SSR（サーバーサイドレンダリング）の場合に該当するが、本アプリは Vite dev サーバーによる CSR（クライアントサイドレンダリング）であるため、ブラウザからの直接アクセスとなり、実際には Docker 環境でも動作する。
- **判定**: **確認済み**（ハードコードの事実は正確。ただし Docker 環境での影響度はレビューが示唆するほど深刻ではない）
- **根拠**: ハードコードの事実は完全に正確。環境変数化の推奨も妥当。ただし Docker 環境で「動作しない」という表現はやや不正確で、CSR アプリであるためブラウザからのリクエストは `localhost:3000` で到達可能。将来的にデプロイ先が変わる場合に備えた環境変数化は良い提案。
- **アクション**: **維持**（低優先度の改善提案としてそのまま維持）

---

### 指摘 2: WARNING-002 — CORS 設定のオリジン制限なし

- **出典**: code_review.md「Warnings」セクション、WARNING-002
- **レビューの主張**: `/home/yoshi1220/workspace/english-words/backend/src/main.ts` の8行目で `app.enableCors()` が引数なしで呼ばれており、全オリジンからのアクセスを許可している。
- **調査結果**:
  - `main.ts` 8行目: `app.enableCors();` -- **引数なしの呼び出しを確認**。
  - NestJS の `enableCors()` をオプションなしで呼び出した場合、デフォルトで全オリジン (`*`) が許可される。
  - 本アプリは個人利用の英単語学習アプリ（plan.md: 「個人利用の英単語学習アプリ（認証機能は別 feature）」）であり、現段階では開発環境のみを対象としている。
- **判定**: **確認済み**
- **根拠**: `app.enableCors()` が引数なしで全オリジン許可になっている事実は正確。個人学習アプリの開発フェーズでは許容範囲であり、レビューの severity: LOW 評価も妥当。
- **アクション**: **維持**（低優先度の改善提案としてそのまま維持）

---

### 指摘 3: WARNING-003 — テストファイルパスの plan.md からの逸脱

- **出典**: code_review.md「Warnings」セクション、WARNING-003
- **レビューの主張**: plan.md（67-70行目）ではテストファイルを `backend/test/words/` に配置すると記載しているが、実装では `backend/src/words/` に配置されている。Jest 設定の `rootDir: "src"` により、`backend/test/` にテストを置くと検出されないため、実装側の配置が正しい。
- **調査結果**:
  - plan.md 67-70行目: `test/words/` 配下に `words.controller.spec.ts` と `words.service.spec.ts` を配置する構成が記載されている -- **レビューの主張通り**。
  - 実際のテストファイル: `backend/src/words/words.service.spec.ts` と `backend/src/words/words.controller.spec.ts` に存在 -- **`src/words/` に配置されていることを確認**。
  - `backend/test/words/` ディレクトリ: 存在するが**空**（ファイルなし）。
  - `backend/package.json` 65行目: `"rootDir": "src"` -- **Jest の rootDir が `src` であることを確認**。
  - `backend/package.json` 66行目: `"testRegex": ".*\\.spec\\.ts$"` -- `src` 配下の `.spec.ts` ファイルのみ検出対象。
  - `backend/src/app.controller.spec.ts`: NestJS scaffold が生成したテストファイルも `src/` に配置されており、コロケーションパターンが確立されている。
  - 空の `backend/test/words/` ディレクトリが残存している点は、レビューでは言及されていないが、plan.md の構成に従って作成されたが使用されなかったものと推測される。
- **判定**: **確認済み**
- **根拠**: plan.md と実装の不一致、Jest 設定による理由付け、scaffold テストのパターン、いずれもレビューの記述通り。レビューの「実装側が正しい」という評価も正確。plan.md の更新推奨も妥当。加えて、空の `backend/test/words/` ディレクトリの削除も検討すべき。
- **アクション**: **修正**
- **修正後の指示**: plan.md のテストファイルパスの修正に加え、不要な空ディレクトリ `backend/test/words/` の削除も推奨する。

---

### 指摘 4: WARNING-004 — plan.md と実際のバージョンの不一致

- **出典**: code_review.md「Warnings」セクション、WARNING-004
- **レビューの主張**: plan.md では NestJS 10 / React 18 と記載しているが、実際にインストールされているのは NestJS 11 / React 19 である。
- **調査結果**:
  - plan.md 17行目: `React 18（frontend）、NestJS 10 + TypeORM 0.3（backend）` -- **レビューの主張通り**。
  - `backend/package.json` 23行目: `"@nestjs/common": "^11.0.1"` -- **NestJS 11 を確認**。
  - `frontend/package.json` 16行目: `"react": "^19.2.0"` -- **React 19 を確認**。
  - `backend/package.json` 32行目: `"typeorm": "^0.3.28"` -- TypeORM 0.3 は plan.md と一致。
  - CLAUDE.md にも `React 18（frontend）、NestJS 10 + TypeORM 0.3（backend）` と記載されている（CLAUDE.md は plan.md から自動生成されるため同期している）。
- **判定**: **確認済み**
- **根拠**: バージョンの不一致は明確に存在する。NestJS 10 -> 11、React 18 -> 19 はメジャーバージョンの差異であり、ドキュメントの正確性の観点から修正すべき。レビューの「機能的な影響なし」という評価も、本アプリで使用している API の範囲では妥当。
- **アクション**: **修正**
- **修正後の指示**: plan.md だけでなく、CLAUDE.md の「Active Technologies」セクションおよび「Recent Changes」セクションも同様に更新が必要。CLAUDE.md は plan.md から自動生成される可能性があるため、生成元（plan.md）を修正した上で CLAUDE.md の再生成を検討すること。

---

## レビューが見落とした問題

### 見落とし 1: 空の `backend/test/words/` ディレクトリの残存

- **内容**: `backend/test/words/` ディレクトリが空の状態で残存している。plan.md の構成に従って作成されたが、実際のテストファイルは `backend/src/words/` に配置されたため不要になったと推測される。
- **根拠**: `ls -la /home/yoshi1220/workspace/english-words/backend/test/words/` の結果、ディレクトリは存在するがファイルは空。
- **推奨**: 空ディレクトリを削除してリポジトリをクリーンに保つ。

### 見落とし 2: CLAUDE.md のバージョン記載の不一致

- **内容**: WARNING-004 で plan.md のバージョン不一致は指摘されたが、CLAUDE.md にも同じ不正確なバージョン情報（`React 18`、`NestJS 10`）が記載されている点には言及されていない。
- **根拠**: CLAUDE.md の「Active Technologies」および「Recent Changes」セクションに `React 18（frontend）、NestJS 10 + TypeORM 0.3（backend）` と記載。
- **推奨**: plan.md と併せて CLAUDE.md のバージョン記載も修正する。

### 見落とし 3: フロントエンドのテストフレームワークの不一致

- **内容**: plan.md 19行目では `Jest + React Testing Library（frontend）` と記載しているが、実際のフロントエンドテストは Vitest（`vitest: ^4.0.18`）を使用している。
- **根拠**: `frontend/package.json` 11行目: `"test": "vitest run"` 、37行目: `"vitest": "^4.0.18"`。テストファイルでは `vi.mock()` / `vi.mocked()` が使用されており、Jest ではなく Vitest の API である。
- **推奨**: plan.md の Technical Context セクションで `Jest + React Testing Library` を `Vitest + React Testing Library` に修正する。

---

## 実装エージェントへの承認済みフィードバック

以下は検証を通過した指示のリストです。全て低優先度（任意）の改善であり、必須の修正はありません。

1. **(任意・低優先)** `/home/yoshi1220/workspace/english-words/frontend/src/services/wordService.ts` 3行目: `const BASE_URL = 'http://localhost:3000';` を `const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';` に変更することを検討する。将来的なデプロイ環境の柔軟性が向上する。現時点では CSR アプリのため Docker 環境でも `localhost:3000` で動作するが、環境変数化はベストプラクティス。

2. **(任意・低優先)** `/home/yoshi1220/workspace/english-words/specs/001-word-registration/plan.md` の修正:
   - 67-70行目: プロジェクト構成のテストファイルパスを `test/words/` から `src/words/` に変更する。具体的には以下の構造に修正:
     ```
     backend/
     ├── src/
     │   ├── words/
     │   │   ├── dto/
     │   │   │   └── create-word.dto.ts
     │   │   ├── word.entity.ts
     │   │   ├── words.controller.ts
     │   │   ├── words.controller.spec.ts    # ← ここに移動
     │   │   ├── words.module.ts
     │   │   ├── words.service.ts
     │   │   └── words.service.spec.ts       # ← ここに移動
     ```
   - 17行目: `React 18（frontend）、NestJS 10 + TypeORM 0.3（backend）` を `React 19（frontend）、NestJS 11 + TypeORM 0.3（backend）` に修正する。
   - 19行目: `Jest + React Testing Library（frontend）` を `Vitest + React Testing Library（frontend）` に修正する。

3. **(任意・低優先)** `/home/yoshi1220/workspace/english-words/CLAUDE.md` のバージョン記載を plan.md の修正に合わせて更新する。CLAUDE.md が plan.md から自動生成される場合は、plan.md 修正後に再生成する。手動管理の場合は以下を修正:
   - 「Active Technologies」セクション: `React 18` -> `React 19`、`NestJS 10` -> `NestJS 11`
   - 「Recent Changes」セクション: 同様にバージョンを修正

4. **(任意・低優先)** 空ディレクトリ `/home/yoshi1220/workspace/english-words/backend/test/words/` を削除する。plan.md の構成に従って作成されたが、テストファイルは `src/words/` に配置されたため不要。

5. **(任意・低優先)** CORS 設定について: 現段階では対応不要。将来的に認証機能やデプロイを行う際に、`/home/yoshi1220/workspace/english-words/backend/src/main.ts` 8行目の `app.enableCors()` にオリジン制限を追加すること（例: `app.enableCors({ origin: 'http://localhost:5173' })`）。

---

## 除外された指摘事項

なし。全ての WARNING が正確であり、いずれも維持または修正の上で承認された。

---

## 検証者コメント

レビューの品質は**徹底的**と評価する。以下がその理由:

- 全タスク（T004-T022）に対して個別に実装確認が行われている。
- 仕様書（api.md、data-model.md）との整合性が項目単位で検証されている。
- コード品質（命名規則、エラーハンドリング、インポート順序、テストパターン、コメント）が多角的にレビューされている。
- WARNING の severity 評価が適切で、過剰な修正要求がない。
- テストファイルパスの逸脱について、Jest 設定を根拠に「実装が正しい」と判断しており、分析が正確。

見落とし 3件（空ディレクトリ、CLAUDE.md のバージョン、フロントエンドテストフレームワーク名）はいずれも軽微なドキュメント整合性の問題であり、レビュー全体の品質を損なうものではない。
