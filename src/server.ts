import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import Database from 'better-sqlite3'

import { cors } from 'hono/cors';

const app = new Hono()
const db = new Database('mydb.sqlite')

app.use('*', cors());

// ★ 必ず最初にテーブル作成
db.prepare(`
  CREATE TABLE IF NOT EXISTS study_record (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    time INTEGER NOT NULL
  )
`).run();

app.get('/records', (c) => {
  const records = db.prepare('SELECT * FROM study_record').all();
  return c.json(records);
});

app.post('/records', async (c) => {
  const { title, time } = await c.req.json();
  const id = crypto.randomUUID();
  db.prepare('INSERT INTO study_record (id, title, time) VALUES (?, ?, ?)').run(id, title, time);
  return c.text('Record added');
});

app.delete('/records/:id', (c) => {
  const id = c.req.param('id');
  db.prepare('DELETE FROM study_record WHERE id = ?').run(id);
  return c.text('Record deleted');
});

serve(app)