# Hono と Next.js API Routes の違い

## 結論
**役割が根本的に異なる。**

---

## Next.js API Routes

- Next.js に付属する、**フロントエンド向けの簡易 API 機能**
- 主に **Next.js アプリ内**で使用することを想定
- ページと同じ感覚で API エンドポイントを作成できる
- **サーバーレス環境（Vercel など）での利用が前提**
- フロントエンドとバックエンドが密結合になりやすい

サーバーレス環境 ... サーバを自分で立てて・管理しなくていい実行環境

---

## Hono

- **実行環境に依存しない、独立した Web API フレームワーク**
- 以下のような複数の環境で動作可能
  - Node.js
  - Cloudflare Workers
  - Bun
  - Deno など
- フロントエンドに限らず、**純粋なバックエンド API**として利用可能
- 軽量・高速で、API サーバー専用構成にも向いている

---

## 使い分けのイメージ

- **Next.js API Routes**
  - 小規模
  - フロントエンド中心
  - Next.js 内で完結させたい場合

- **Hono**
  - API を独立させたい
  - 実行環境を選びたくない
  - 将来的なスケールや再利用を考慮したい場合

## 1. 思想・立ち位置の違い

| 観点 | Next.js API Routes | Hono |
|---|---|---|
| 主目的 | フロントエンドの補助 | API サーバそのもの |
| フレームワーク依存 | Next.js 専用 | 非依存 |
| 再利用性 | 低い | 高い |
| フロント / API 分離 | 向いていない | 向いている |

**フロントエンドと API を明確に分離したい場合、Hono の方が適している。**

## 2. 実行環境の違い

| 実行環境 | Next.js API Routes | Hono |
|---|---|---|
| Node.js | ○ | ○ |
| Edge Runtime | ○ | ◎ |
| Cloudflare Workers | △（制限あり） | ◎ |
| Bun / Deno | ✕ | ◎ |

**エッジ実行やマルチランタイム対応では Hono が有利。**

## Node.js

### 何か
- JavaScript を **サーバーで動かすための実行環境**
- Express / NestJS / Prisma などの **土台**

### 特徴
- `fs`（ファイル操作）が使える
- TCP / 常駐プロセスが使える
- **長時間動くサーバ向き**

### 表の意味
- **Node.js**
  - Next.js API Routes → ○（普通に動く）
  - Hono → ○（普通に動く）

※ 両方とも問題なし

---

## Edge Runtime

### 何か
- **Node.js ではない実行環境**
- Web 標準 API（`fetch` / `Request` / `Response`）中心
- Vercel Edge Functions など

### 特徴
- **超高速起動**
- `fs` / Node API は使えない
- **軽量処理向き**

### 表の意味
- **Edge Runtime**
  - Next.js API Routes → ○（動くが制限多い）
  - Hono → ◎（最初から対応前提）

---

## Cloudflare Workers

### 何か
- Cloudflare の **Edge 実行環境**
- 世界中の拠点でコードが動く

### 特徴
- Node.js ではない
- Web 標準 API のみ
- `fs` / TCP 不可
- **起動がほぼゼロ**

### 表の意味
- **Cloudflare Workers**
  - Next.js API Routes → △（無理がある）
    - Next.js 自体が前提じゃない
    - 制限が多すぎる
  - Hono → ◎（公式想定環境）

---

## Bun / Deno

### Bun
- 高速な JavaScript ランタイム
- Node.js 互換だが完全ではない
- Edge 寄りの思想

### Deno
- Node.js の作者が作った新ランタイム
- Web 標準重視
- 権限制御あり

### 表の意味
- **Bun / Deno**
  - Next.js API Routes → ✕
    - Next.js が Node.js 前提
  - Hono → ◎
    - どちらも公式サポート

---

## まとめ（1行ずつ覚える用）

- **Node.js**  
  → 伝統的サーバ、自由度高い

- **Edge Runtime**  
  → 軽量・高速、制限多い

- **Cloudflare Workers**  
  → Edge の代表格、Node じゃない

- **Bun / Deno**  
  → 新世代ランタイム、Web 標準寄り

## 3. ルーティングの違い

### Next.js API Routes

- **ファイル構造がそのまま URL になる**
- `app/api/users/route.ts` を作成すると `/users` が生える
- API が増えると **全体構造が見えづらくなりやすい**

### Hono

- **コード上でルートを定義する**
- `app.get("/users", ...)` のように明示的に記述できる
- **REST / バージョニング / RPC 構成**がしやすい

## 4. 型安全性の違い

### Next.js API Routes

- フロントエンドと API の型は **基本的に手動で共有**
- Zod などを使っても **型のズレが発生する可能性**がある
- 型安全は **「運用で担保するもの」** になりがち

### Hono（RPC 利用時）

- **API 定義からクライアントの型を生成**できる
- フロントエンドとバックエンドの **型ズレが起きない**
- API 変更が **即コンパイルエラー**として検出される

**型安全な RPC を重視する場合、Hono が有利。**

## 5. ミドルウェア・構成力

| 観点 | Next.js API Routes | Hono |
|---|---|---|
| ミドルウェア | 制限あり | 柔軟 |
| 認証 | NextAuth 依存になりがち | 自由に設計可能 |
| バリデーション | 自前実装 | 組み込みやすい |
| ロギング | 弱い | 強い |

**Hono は Express ライクだが、Edge を前提に設計されている。**


## 6. パフォーマンス

### Next.js API Routes

- Next.js の設計やランタイム制約の影響を受ける
- フロント中心の構成では十分だが、API 専用用途ではオーバーヘッドが出やすい

ランタイム
→ 実行する土台

オーバーヘッド
→ 目的以外にかかるムダ

### Hono

- **非常に軽量**
- Cloudflare Workers では **最速クラスのパフォーマンス**
- Edge 実行を前提とした設計で、起動・レスポンスが高速

---

## 7. 使い分けの指針

### Next.js API Routes が向いているケース

- 小規模アプリ
- フロントエンド専用の簡単な API
- API をフロントから分離する予定がない
- 開発スピードを最優先したい場合

### Hono が向いているケース

- API を **独立したサービス**として運用したい
- Edge Runtime / Cloudflare Workers を使いたい
- **型安全な RPC** を使いたい
- 将来的に **複数フロント（Web / Mobile など）** が増える可能性がある

---

## まとめ

### Next.js API Routes

- **Next.js の付属機能としての API**
- フロント開発の延長線上で使うもの

### Hono

- **本格的で再利用可能な API フレームワーク**
- 実行環境・構成・将来拡張を重視する場合に強力
