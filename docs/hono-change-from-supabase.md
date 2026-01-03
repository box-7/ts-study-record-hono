### 元のプロジェクト
react
firebase hosting
supabase 

のプロジェクトをhonoを使うように変更

### 標準的なFirebase構成例
同じFirebaseプロジェクト内でHostingとFunctionsを一緒に管理するのが一般的
1つのFirebaseプロジェクト（例：my-app）で、フロントエンド（Hosting）とバックエンド（Cloud Functions）をまとめて運用
firebase.json でHostingとFunctionsの両方を設定する
ディレクトリ構成例
```
my-app/
  functions/   // Cloud Functionsのソース
  public/      // Hosting用の静的ファイル
  firebase.json
  ...
```


# 基本方針（Firebase + Hono）

## 全体構成

- **Firebase Hosting**
  - フロントエンドを担当
  - Next.js / SPA / 静的サイトを配信

- **Firebase Cloud Functions**
  - API サーバを担当
  - **Hono を使って API を実装**

👉 **Hono = Cloud Functions の中身**

---

## 役割分担イメージ
```
[ Browser / Client ]
|
v
Firebase Hosting
(Next.js / SPA / Static)
|
v
Firebase Cloud Functions (v2)
|
v
Hono
(API Router / Middleware)
```

---

## 標準的なディレクトリ構成（Hono あり）
```
my-app/
├─ functions/                # API（バックエンド）
│  ├─ src/
│  │  ├─ app/
│  │  │  └─ server.ts        # Hono アプリ本体
│  │  └─ index.ts            # Firebase Functions v2 エントリ
│  ├─ package.json
│  └─ tsconfig.json
│
├─ frontend/                 # フロントエンド
│  ├─ next.config.js         # Next.js の場合
│  ├─ package.json
│  ├─ src/
│  │  ├─ app/ or pages/      # Next.js
│  │  └─ components/
│  └─ out/                   # build 後（静的出力）
│
├─ public/                   # Firebase Hosting 配信用
│  └─ index.html             # SPA / 静的サイトの場合
│
└─ firebase.json
```

---

## 補足

- Firebase Functions **v2 を使用する前提**
- フロントと API を明確に分離できるため、構成がシンプル
- 将来的に Cloud Run / Cloudflare Workers などへの移行もしやすい

### 開発環境
- ローカルで Hono + SQLite を使う場合、Firebase や Supabase は不要
- React + Hono + SQLite だけでローカル開発・動作確認が可能
- Firebase Hosting や Supabase は「デプロイ」「本番運用」「BaaSが必要な場合」のみ必要
- ローカル開発中は Hono サーバーを起動し、React アプリと連携して動作確認すればOK
- 不要な Firebase や Supabase 関連の設定・依存は削除して問題なし

### コマンド

Hono本体のインストール
npm install hono
→ Honoフレームワーク本体。必須。

better-sqlite3（SQLiteドライバ）のインストール
npm install better-sqlite3
→ SQLiteをNode.jsで使うためのライブラリ。必須。

型定義ファイル（TypeScript用）
npm install --save-dev @types/better-sqlite3
→ TypeScriptで型補完を効かせる場合は必須。

HonoのNode.jsサーバー用アダプタ
npm install @hono/node-server
→ HonoをNode.jsで動かす場合は必須。



% npm install -D ts-node typescript
% npm install -D ts-node@latest

server.tsに以下追加
import { cors } from 'hono/cors';
CORS許可（app.use('*', cors())）も追加済み

### supabase関係のファイルを削除
'@/lib/record.ts';
'@/lib/record_delete.ts';

### サーバーを立ち上げ
% npx tsc
% node dist/server.js
tsconfig.jsonをsupabase→honoのnode.js用に変更

### clientを立ち上げ
npm run dev

その他、結構変更しているので、各ファイルを確認する



Jestでfetchを使うための対応まとめ
問題
Jest実行時に ReferenceError: fetch is not defined が発生。
node-fetch最新版（v3）はESM専用のため、Jest（CommonJS環境）で SyntaxError: Cannot use import statement outside a module となる。
対応手順
node-fetch最新版（v3）をアンインストール
npm uninstall node-fetch

node-fetch v2をインストール
npm install node-fetch@2

jest.setup.ts で fetch をグローバルに定義
// jest.setup.ts
const fetch = require('node-fetch');
global.fetch = fetch;

結果
Jestのテスト環境でもfetchが使えるようになり、hono/clientのAPI呼び出しも正常に動作するようになった。



% npm install zod @hono/zod-validator





