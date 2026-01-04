// Honoフレームワーク本体（APIルーティングやミドルウェアなどを提供）を使うためのimport
import { Hono } from 'hono'

// SQLiteデータベースをNode.jsで操作するためのライブラリ（better-sqlite3）のDatabaseクラスをimport
import Database from 'better-sqlite3'
//「CORS（クロスオリジンリソースシェアリング）」を許可するためのミドルウェアをimportしています
// APIサーバーが他のドメイン（例：localhost:5173のフロントエンド）からリクエストされてもブロックされないようにする
import { cors } from 'hono/cors';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const recordSchema = z.object({
  // id: z.string(),
  title: z.string(),
  time: z.number()
});

export const recordListSchema = z.array(recordSchema);

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

// 全てのリクエストパス（'*'）」に対してCORS（クロスオリジンリソースシェアリング）を許可するミドルウェアを適用
app.use('*', cors());

// デバッグ用: すべてのリクエストをログ出力
app.use('*', async (c, next) => {
  console.log('=== Incoming Request ===');
  console.log('Method:', c.req.method);
  console.log('Path:', c.req.path);
  console.log('URL:', c.req.url);
  await next();
  console.log('=== Request Complete ===');
});

app.get('/records', (c) => {
  const records = db.prepare('SELECT * FROM study_record').all();

  const parsed = recordListSchema.safeParse(records);

  if (!parsed.success) {
    console.error('❌ Invalid DB data', parsed.error);
    return c.json(
      { success: false, error: 'Invalid record data' },
      500
    );
  }

  console.log('Record', parsed.data);
  return c.json(parsed.data);
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

app.put('/records/:id', zValidator('json', recordSchema), async (c) => {
  const id = c.req.param('id');
  const { title, time } = c.req.valid('json');
  // レコードが存在するかチェック（任意）
  // const exists = db.prepare('SELECT COUNT(*) as count FROM study_record WHERE id = ?').get(id).count > 0;
  const result = db.prepare('SELECT COUNT(*) as count FROM study_record WHERE id = ?').get(id) as { count: number };
  const exists = result.count > 0;

  if (!exists) {
    return c.text('Record not found', 404);
  }
  db.prepare('UPDATE study_record SET title = ?, time = ? WHERE id = ?').run(title, time, id);
  return c.text('Record updated');
});

app.delete('/records/:id', (c) => {
  const id = c.req.param('id');
  db.prepare('DELETE FROM study_record WHERE id = ?').run(id);
  return c.text('Record deleted');
});

app.notFound((c) => {
  console.log('🔴 404 Not Found');
  console.log('Method:', c.req.method);
  console.log('Path:', c.req.path);
  console.log('URL:', c.req.url);
  return c.text('Not Found', 404);
});

export type AppType = typeof app;

// serve(app)
export default app;