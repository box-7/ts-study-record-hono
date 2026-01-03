// Honoフレームワーク本体（APIルーティングやミドルウェアなどを提供）を使うためのimport
import { Hono } from 'hono'

// Node.js上でHonoアプリを起動するための「サーバー起動関数」をimport
import { serve } from '@hono/node-server'
// SQLiteデータベースをNode.jsで操作するためのライブラリ（better-sqlite3）のDatabaseクラスをimport
import Database from 'better-sqlite3'
//「CORS（クロスオリジンリソースシェアリング）」を許可するためのミドルウェアをimportしています
// APIサーバーが他のドメイン（例：localhost:5173のフロントエンド）からリクエストされてもブロックされないようにする
import { cors } from 'hono/cors';
import { Record } from './domain/record'
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const recordSchema = z.object({
  title: z.string(),
  time: z.number()
});

// Honoフレームワークのアプリケーションインスタンス（APIサーバー本体）を作成しています。
// これにルーティングやミドルウェアを追加してAPIサーバーを構築します。
const app = new Hono()
// better-sqlite3ライブラリを使って、mydb.sqliteというSQLiteデータベースファイルに接続しています。
// dbはこのデータベースを操作するためのインスタンスです。
const db = new Database('mydb.sqlite')

// prepareは、better-sqlite3ライブラリのメソッドで、
//「SQL文を事前に準備（プリコンパイル）して、繰り返し安全に実行できるようにする」ためのもの
// better-sqlite3のAPIで、SQL文を実行しています
db.prepare(`
  CREATE TABLE IF NOT EXISTS study_record (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    time INTEGER NOT NULL
  )
`).run();

// cとは Honoのルーティング関数で使われる「コンテキスト（context）」オブジェクト
// リクエストやレスポンス、パラメータなどにアクセスできます
app.get('/records', (c) => {
  const records = db.prepare('SELECT * FROM study_record').all() as Record[];
  return c.json(records);
});

// zValidator('json', recordSchema) の 'json' は「リクエストボディのContent-Typeがapplication/jsonであること」を意味します。
// recordSchema（zodのスキーマ）で、titleがstring、timeがnumberであることを検証します。
// バリデーションに失敗した場合は、自動的に400エラー（Bad Request）が返ります。
app.post('/records', zValidator('json', recordSchema), async (c) => {
  // zodバリデーション済みの値を取得
  const { title, time } = c.req.valid('json');
  const id = crypto.randomUUID();
  // 'INSERT INTO study_record (id, title, time) VALUES (?, ?, ?)'
  // これは「id, title, timeの3つのカラムに値を挿入する」という意味のSQL文
  // 「?」は後から値を安全に埋め込むための場所で、.run(id, title, time) でそれぞれの値が順番にセットされます。
  db.prepare('INSERT INTO study_record (id, title, time) VALUES (?, ?, ?)').run(id, title, time);
  return c.text('Record added');
});

app.delete('/records/:id', (c) => {
  const id = c.req.param('id');
  db.prepare('DELETE FROM study_record WHERE id = ?').run(id);
  return c.text('Record deleted');
});

export type AppType = typeof app;

// 全てのリクエストパス（'*'）」に対してCORS（クロスオリジンリソースシェアリング）を許可するミドルウェアを適用
app.use('*', cors());

serve(app)