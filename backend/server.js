import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import pg from 'pg';
import { randomUUID } from 'crypto';

const app = express();
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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
    console.log("Origin:", origin);
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('CORS bloqueado'));
  }
}));

app.use(express.json());

const uuid = () => randomUUID();
const now = () => new Date().toISOString();

const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// ================= LOGIN =================
const PASSWORD_HASH = process.env.PASSWORD_HASH;

app.post('/login', asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Senha obrigatória' });

  const ok = await bcrypt.compare(password.trim(), PASSWORD_HASH);
  if (!ok) return res.status(401).json({ error: 'Senha incorreta' });

  res.json({ success: true });
}));

// ================= GOALS =================
app.get('/goals', asyncHandler(async (_, res) => {
  const r = await pool.query('SELECT * FROM goals ORDER BY created_at DESC');
  res.json(r.rows);
}));

app.post('/goals', asyncHandler(async (req, res) => {
  let { member_id, title, target, current = 0, unit = '', type = 'free', deadline = '' } = req.body;

  if (!member_id || !title || target === undefined) {
    return res.status(400).json({ error: 'member_id, title e target obrigatórios' });
  }

  target = Number(target);
  current = Number(current);

  const id = uuid();

  await pool.query(
    'INSERT INTO goals (id,member_id,title,target,current,unit,type,deadline) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
    [id, member_id, title, target, current, unit, type, deadline]
  );

  const r = await pool.query('SELECT * FROM goals WHERE id=$1', [id]);
  res.json(r.rows[0]);
}));

app.patch('/goals/:id', asyncHandler(async (req, res) => {
  const { current, status } = req.body;

  if (status !== undefined) {
    await pool.query('UPDATE goals SET status=$1 WHERE id=$2', [status, req.params.id]);
  } else {
    await pool.query('UPDATE goals SET current=$1 WHERE id=$2', [Number(current), req.params.id]);
  }

  const r = await pool.query('SELECT * FROM goals WHERE id=$1', [req.params.id]);
  res.json(r.rows[0]);
}));

app.delete('/goals/:id', asyncHandler(async (req, res) => {
  await pool.query('DELETE FROM goals WHERE id=$1', [req.params.id]);
  res.json({ success: true });
}));

// ================= HEALTH =================
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// ================= ERRO GLOBAL =================
app.use((err, req, res, next) => {
  console.error('ERRO:', err);

  if (err.message?.includes('CORS')) {
    return res.status(403).json({ error: err.message });
  }

  res.status(500).json({
    error: 'Erro interno',
    details: err.message
  });
});

// ================= START =================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));
