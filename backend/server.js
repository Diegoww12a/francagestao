import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import pg from 'pg';
import { randomUUID } from 'crypto';

const app = express();
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://francagestao_db_user:LSGPLhjLaqNCPmMFo21GP28gQcmpYdhO@dpg-d6s7drua2pns73dhioo0-a/francagestao_db',
  ssl: { rejectUnauthorized: false }
});

const allowedOrigins = [
  'https://diegoww12a.github.io',
  'https://franca-dashboard.netlify.app',
  'https://francagestao.netlify.app',
  'http://localhost:5173'
];

app.use(cors({
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('CORS: origem não permitida'));
  }
}));

app.use(express.json());

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      member_id TEXT NOT NULL,
      title TEXT NOT NULL,
      target INTEGER NOT NULL,
      current INTEGER DEFAULT 0,
      unit TEXT DEFAULT '',
      status TEXT DEFAULT 'active',
      deadline TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await pool.query(`
    ALTER TABLE goals ADD COLUMN IF NOT EXISTS deadline TIMESTAMPTZ;
  `);

  console.log('Banco pronto');
}

initDB().catch(console.error);

const PASSWORD_HASH = process.env.PASSWORD_HASH || '$2b$10$bn7SVyBy3fULDf7jK4wc.uTRO4XDDtXaJ6qDzqO5yhrG6PNueiJvK';
const uuid = () => randomUUID();

// LOGIN
app.post('/login', async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Senha obrigatória' });
  const ok = await bcrypt.compare(password.trim(), PASSWORD_HASH);
  if (!ok) return res.status(401).json({ error: 'Senha incorreta' });
  res.json({ success: true });
});

// GOALS
app.get('/goals', async (_, res) => {
  const r = await pool.query('SELECT * FROM goals ORDER BY created_at DESC');
  res.json(r.rows);
});

app.post('/goals', async (req, res) => {
  const {
    member_id,
    title,
    target,
    current = 0,
    unit = '',
    deadline = null
  } = req.body;

  if (!member_id || !title || !target) {
    return res.status(400).json({ error: 'Campos obrigatórios' });
  }

  const id = uuid();

  await pool.query(
    `INSERT INTO goals 
     (id, member_id, title, target, current, unit, deadline)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [id, member_id, title, target, current, unit, deadline]
  );

  const r = await pool.query('SELECT * FROM goals WHERE id=$1', [id]);
  res.json(r.rows[0]);
});

// 🔥 AQUI TÁ O FIX DO TEU BUG
app.patch('/goals/:id', async (req, res) => {
  const { add, status, deadline } = req.body;

  if (add !== undefined) {
    // soma ao invés de substituir
    await pool.query(
      `UPDATE goals 
       SET current = current + $1
       WHERE id = $2`,
      [add, req.params.id]
    );
  }

  if (status !== undefined) {
    await pool.query(
      `UPDATE goals SET status = $1 WHERE id = $2`,
      [status, req.params.id]
    );
  }

  if (deadline !== undefined) {
    await pool.query(
      `UPDATE goals SET deadline = $1 WHERE id = $2`,
      [deadline, req.params.id]
    );
  }

  const r = await pool.query('SELECT * FROM goals WHERE id=$1', [req.params.id]);
  res.json(r.rows[0]);
});

app.delete('/goals/:id', async (req, res) => {
  await pool.query('DELETE FROM goals WHERE id=$1', [req.params.id]);
  res.json({ success: true });
});

// RESET
app.get('/reset-goals', async (_, res) => {
  await pool.query('DROP TABLE IF EXISTS goals');
  await pool.query(`
    CREATE TABLE goals (
      id TEXT PRIMARY KEY,
      member_id TEXT NOT NULL,
      title TEXT NOT NULL,
      target INTEGER NOT NULL,
      current INTEGER DEFAULT 0,
      unit TEXT DEFAULT '',
      status TEXT DEFAULT 'active',
      deadline TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  res.json({ success: true });
});

app.get('/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('rodando na porta ' + PORT));
