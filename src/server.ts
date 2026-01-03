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

// Honoフレームワークのアプリケーションインスタンス（APIサーバー本体）を作成しています。
// これにルーティングやミドルウェアを追加してAPIサーバーを構築します。
// const app = new Hono()

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

app.post('/records', async (c) => {
  // await c.req.json()リクエストボディ（JSON形式）をパースして取得
  // {"title":"勉強","time":60} という文字列 → { title: "勉強", time: 60 } というオブジェクト
  // Pick<Record, 'title' | 'time'> そのオブジェクトの型が「Record型のうちtitleとtimeだけを持つ部分型」であることをTypeScriptに伝えています。
  const { title, time }: Pick<Record, 'title' | 'time'> = await c.req.json();
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