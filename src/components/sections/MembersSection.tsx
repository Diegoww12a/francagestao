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
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
];

app.use(cors({
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    if (origin && origin.startsWith('http://localhost')) return cb(null, true);
    cb(new Error('CORS: origem não permitida'));
  },
  credentials: true,
}));

app.use(express.json());

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT DEFAULT '',
      status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT NOW(), completed_at TIMESTAMPTZ
    );
    CREATE TABLE IF NOT EXISTS missions (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT DEFAULT '',
      scheduled_date TEXT, status TEXT DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW(), completed_at TIMESTAMPTZ
    );
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY, content TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS purchases (
      id TEXT PRIMARY KEY, item TEXT NOT NULL, quantity INTEGER NOT NULL,
      price INTEGER NOT NULL, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY, item TEXT NOT NULL, quantity INTEGER NOT NULL,
      price INTEGER NOT NULL, buyer TEXT DEFAULT '', created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS deliveries (
      id TEXT PRIMARY KEY, description TEXT NOT NULL, recipient TEXT NOT NULL,
      status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT NOW(), completed_at TIMESTAMPTZ
    );
    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, role TEXT DEFAULT 'Recruta',
      kick_channel TEXT DEFAULT '', avatar_url TEXT DEFAULT '',
      joined_at TEXT DEFAULT '', status TEXT DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY, type TEXT NOT NULL, description TEXT NOT NULL,
      amount INTEGER NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS stock (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, quantity INTEGER NOT NULL,
      category TEXT DEFAULT 'Item', created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY, member_id TEXT NOT NULL, title TEXT NOT NULL,
      target INTEGER NOT NULL, current INTEGER DEFAULT 0, unit TEXT DEFAULT '',
      type TEXT DEFAULT 'free', deadline TEXT DEFAULT '',
      status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log('Banco de dados inicializado!');
}

initDB().catch(console.error);

const PASSWORD_HASH = process.env.PASSWORD_HASH || '$2b$10$bn7SVyBy3fULDf7jK4wc.uTRO4XDDtXaJ6qDzqO5yhrG6PNueiJvK';
const uuid = () => randomUUID();
const now = () => new Date().toISOString();

app.post('/login', async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Senha obrigatória' });
  const ok = await bcrypt.compare(password.trim(), PASSWORD_HASH);
  if (!ok) return res.status(401).json({ error: 'Senha incorreta' });
  res.json({ success: true });
});

// TASKS
app.get('/tasks', async (_, res) => { const r = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC'); res.json(r.rows); });
app.post('/tasks', async (req, res) => { const { title, description = '', status = 'pending' } = req.body; if (!title) return res.status(400).json({ error: 'title obrigatório' }); const id = uuid(); await pool.query('INSERT INTO tasks (id,title,description,status) VALUES ($1,$2,$3,$4)', [id, title, description, status]); const r = await pool.query('SELECT * FROM tasks WHERE id=$1', [id]); res.json(r.rows[0]); });
app.patch('/tasks/:id', async (req, res) => { const { status } = req.body; const completed_at = status === 'completed' ? now() : null; await pool.query('UPDATE tasks SET status=$1, completed_at=$2 WHERE id=$3', [status, completed_at, req.params.id]); const r = await pool.query('SELECT * FROM tasks WHERE id=$1', [req.params.id]); res.json(r.rows[0]); });
app.delete('/tasks/:id', async (req, res) => { await pool.query('DELETE FROM tasks WHERE id=$1', [req.params.id]); res.json({ success: true }); });

// MISSIONS
app.get('/missions', async (_, res) => { const r = await pool.query('SELECT * FROM missions ORDER BY scheduled_date ASC'); res.json(r.rows); });
app.post('/missions', async (req, res) => { const { title, description = '', scheduled_date, status = 'pending' } = req.body; if (!title) return res.status(400).json({ error: 'title obrigatório' }); const id = uuid(); await pool.query('INSERT INTO missions (id,title,description,scheduled_date,status) VALUES ($1,$2,$3,$4,$5)', [id, title, description, scheduled_date, status]); const r = await pool.query('SELECT * FROM missions WHERE id=$1', [id]); res.json(r.rows[0]); });
app.patch('/missions/:id', async (req, res) => { const { status } = req.body; const completed_at = status === 'completed' ? now() : null; await pool.query('UPDATE missions SET status=$1, completed_at=$2 WHERE id=$3', [status, completed_at, req.params.id]); const r = await pool.query('SELECT * FROM missions WHERE id=$1', [req.params.id]); res.json(r.rows[0]); });
app.delete('/missions/:id', async (req, res) => { await pool.query('DELETE FROM missions WHERE id=$1', [req.params.id]); res.json({ success: true }); });

// NOTES
app.get('/notes', async (_, res) => { const r = await pool.query('SELECT * FROM notes ORDER BY updated_at DESC'); res.json(r.rows); });
app.post('/notes', async (req, res) => { const { content } = req.body; if (!content) return res.status(400).json({ error: 'content obrigatório' }); const id = uuid(); await pool.query('INSERT INTO notes (id,content) VALUES ($1,$2)', [id, content]); const r = await pool.query('SELECT * FROM notes WHERE id=$1', [id]); res.json(r.rows[0]); });
app.patch('/notes/:id', async (req, res) => { const { content } = req.body; await pool.query('UPDATE notes SET content=$1, updated_at=$2 WHERE id=$3', [content, now(), req.params.id]); const r = await pool.query('SELECT * FROM notes WHERE id=$1', [req.params.id]); res.json(r.rows[0]); });
app.delete('/notes/:id', async (req, res) => { await pool.query('DELETE FROM notes WHERE id=$1', [req.params.id]); res.json({ success: true }); });

// PURCHASES
app.get('/purchases', async (_, res) => { const r = await pool.query('SELECT * FROM purchases ORDER BY created_at DESC'); res.json(r.rows); });
app.post('/purchases', async (req, res) => { const { item, quantity, price, status = 'pending' } = req.body; if (!item) return res.status(400).json({ error: 'item obrigatório' }); const id = uuid(); await pool.query('INSERT INTO purchases (id,item,quantity,price,status) VALUES ($1,$2,$3,$4,$5)', [id, item, quantity, price, status]); const r = await pool.query('SELECT * FROM purchases WHERE id=$1', [id]); res.json(r.rows[0]); });
app.patch('/purchases/:id', async (req, res) => { const { status } = req.body; await pool.query('UPDATE purchases SET status=$1 WHERE id=$2', [status, req.params.id]); const r = await pool.query('SELECT * FROM purchases WHERE id=$1', [req.params.id]); res.json(r.rows[0]); });
app.delete('/purchases/:id', async (req, res) => { await pool.query('DELETE FROM purchases WHERE id=$1', [req.params.id]); res.json({ success: true }); });

// SALES
app.get('/sales', async (_, res) => { const r = await pool.query('SELECT * FROM sales ORDER BY created_at DESC'); res.json(r.rows); });
app.post('/sales', async (req, res) => { const { item, quantity, price, buyer = '' } = req.body; if (!item) return res.status(400).json({ error: 'item obrigatório' }); const id = uuid(); await pool.query('INSERT INTO sales (id,item,quantity,price,buyer) VALUES ($1,$2,$3,$4,$5)', [id, item, quantity, price, buyer]); const r = await pool.query('SELECT * FROM sales WHERE id=$1', [id]); res.json(r.rows[0]); });
app.delete('/sales/:id', async (req, res) => { await pool.query('DELETE FROM sales WHERE id=$1', [req.params.id]); res.json({ success: true }); });

// DELIVERIES
app.get('/deliveries', async (_, res) => { const r = await pool.query('SELECT * FROM deliveries ORDER BY created_at DESC'); res.json(r.rows); });
app.post('/deliveries', async (req, res) => { const { description, recipient, status = 'pending' } = req.body; if (!description || !recipient) return res.status(400).json({ error: 'obrigatórios' }); const id = uuid(); await pool.query('INSERT INTO deliveries (id,description,recipient,status) VALUES ($1,$2,$3,$4)', [id, description, recipient, status]); const r = await pool.query('SELECT * FROM deliveries WHERE id=$1', [id]); res.json(r.rows[0]); });
app.patch('/deliveries/:id', async (req, res) => { const { status } = req.body; const completed_at = status === 'completed' ? now() : null; await pool.query('UPDATE deliveries SET status=$1, completed_at=$2 WHERE id=$3', [status, completed_at, req.params.id]); const r = await pool.query('SELECT * FROM deliveries WHERE id=$1', [req.params.id]); res.json(r.rows[0]); });
app.delete('/deliveries/:id', async (req, res) => { await pool.query('DELETE FROM deliveries WHERE id=$1', [req.params.id]); res.json({ success: true }); });

// MEMBERS
app.get('/members', async (_, res) => { const r = await pool.query('SELECT * FROM members ORDER BY created_at DESC'); res.json(r.rows); });
app.post('/members', async (req, res) => { const { name, role = 'Recruta', kick_channel = '', avatar_url = '', joined_at = '', status = 'active' } = req.body; if (!name) return res.status(400).json({ error: 'name obrigatório' }); const id = uuid(); await pool.query('INSERT INTO members (id,name,role,kick_channel,avatar_url,joined_at,status) VALUES ($1,$2,$3,$4,$5,$6,$7)', [id, name, role, kick_channel, avatar_url, joined_at, status]); const r = await pool.query('SELECT * FROM members WHERE id=$1', [id]); res.json(r.rows[0]); });
app.patch('/members/:id', async (req, res) => { const { name, role, kick_channel, avatar_url, joined_at, status } = req.body; await pool.query('UPDATE members SET name=$1, role=$2, kick_channel=$3, avatar_url=$4, joined_at=$5, status=$6 WHERE id=$7', [name, role, kick_channel ?? '', avatar_url ?? '', joined_at ?? '', status, req.params.id]); const r = await pool.query('SELECT * FROM members WHERE id=$1', [req.params.id]); res.json(r.rows[0]); });
app.delete('/members/:id', async (req, res) => { await pool.query('DELETE FROM members WHERE id=$1', [req.params.id]); res.json({ success: true }); });

// TRANSACTIONS
app.get('/transactions', async (_, res) => { const r = await pool.query('SELECT * FROM transactions ORDER BY created_at DESC'); res.json(r.rows); });
app.post('/transactions', async (req, res) => { const { type, description, amount } = req.body; if (!type || !description || !amount) return res.status(400).json({ error: 'obrigatórios' }); const id = uuid(); await pool.query('INSERT INTO transactions (id,type,description,amount) VALUES ($1,$2,$3,$4)', [id, type, description, amount]); const r = await pool.query('SELECT * FROM transactions WHERE id=$1', [id]); res.json(r.rows[0]); });
app.delete('/transactions/:id', async (req, res) => { await pool.query('DELETE FROM transactions WHERE id=$1', [req.params.id]); res.json({ success: true }); });

// STOCK
app.get('/stock', async (_, res) => { const r = await pool.query('SELECT * FROM stock ORDER BY category ASC, name ASC'); res.json(r.rows); });
app.post('/stock', async (req, res) => { const { name, quantity, category = 'Item' } = req.body; if (!name || !quantity) return res.status(400).json({ error: 'name e quantity obrigatórios' }); const id = uuid(); await pool.query('INSERT INTO stock (id,name,quantity,category) VALUES ($1,$2,$3,$4)', [id, name, quantity, category]); const r = await pool.query('SELECT * FROM stock WHERE id=$1', [id]); res.json(r.rows[0]); });
app.patch('/stock/:id', async (req, res) => { const { name, quantity, category } = req.body; await pool.query('UPDATE stock SET name=$1, quantity=$2, category=$3 WHERE id=$4', [name, quantity, category, req.params.id]); const r = await pool.query('SELECT * FROM stock WHERE id=$1', [req.params.id]); res.json(r.rows[0]); });
app.delete('/stock/:id', async (req, res) => { await pool.query('DELETE FROM stock WHERE id=$1', [req.params.id]); res.json({ success: true }); });

// GOALS
app.get('/goals', async (_, res) => { const r = await pool.query('SELECT * FROM goals ORDER BY created_at DESC'); res.json(r.rows); });
app.post('/goals', async (req, res) => { const { member_id, title, target, current = 0, unit = '', type = 'free', deadline = '' } = req.body; if (!member_id || !title || !target) return res.status(400).json({ error: 'member_id, title e target obrigatórios' }); const id = uuid(); await pool.query('INSERT INTO goals (id,member_id,title,target,current,unit,type,deadline) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', [id, member_id, title, target, current, unit, type, deadline]); const r = await pool.query('SELECT * FROM goals WHERE id=$1', [id]); res.json(r.rows[0]); });
app.patch('/goals/:id', async (req, res) => { const { current, status } = req.body; if (status !== undefined) { await pool.query('UPDATE goals SET status=$1 WHERE id=$2', [status, req.params.id]); } else { await pool.query('UPDATE goals SET current=$1 WHERE id=$2', [current, req.params.id]); } const r = await pool.query('SELECT * FROM goals WHERE id=$1', [req.params.id]); res.json(r.rows[0]); });
app.delete('/goals/:id', async (req, res) => { await pool.query('DELETE FROM goals WHERE id=$1', [req.params.id]); res.json({ success: true }); });

// RESET GOALS (temporário)
app.get('/reset-goals', async (_, res) => {
  await pool.query('DROP TABLE IF EXISTS goals');
  await pool.query(`CREATE TABLE goals (
    id TEXT PRIMARY KEY, member_id TEXT NOT NULL, title TEXT NOT NULL,
    target INTEGER NOT NULL, current INTEGER DEFAULT 0, unit TEXT DEFAULT '',
    type TEXT DEFAULT 'free', deadline TEXT DEFAULT '',
    status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT NOW()
  )`);
  res.json({ success: true });
});

// KICK STATUS
app.get('/kick-status/:channel', async (req, res) => {
  try {
    const r = await fetch(`https://kick.com/api/v2/channels/${req.params.channel}`, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    if (!r.ok) return res.status(502).json({ error: 'Canal não encontrado' });
    const data = await r.json();
    const isLive = data.livestream?.is_live === true;
    const viewers = data.livestream?.viewer_count || 0;
    res.json({ isLive, viewers });
  } catch {
    res.status(502).json({ error: 'Erro ao consultar Kick' });
  }
});

// MIGRATE
app.get('/migrate', async (_, res) => {
  try {
    await pool.query(`
      ALTER TABLE goals
      ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'free',
      ADD COLUMN IF NOT EXISTS deadline TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
    `);
    res.json({ success: true, message: 'Migração concluída!' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// TWITCH STATUS — adicionar antes de "app.get('/health'...)"
// Coloca as credenciais como variáveis de ambiente no Render:
// TWITCH_CLIENT_ID=x4csw5gb3s94qhxjs62zy7v6j9q7v8
// TWITCH_CLIENT_SECRET=rnqjra5e3wpi7ywp7sb1gyuu0o7o02

let twitchToken = null;
let twitchTokenExpiry = 0;

async function getTwitchToken() {
  if (twitchToken && Date.now() < twitchTokenExpiry) return twitchToken;
  const clientId = process.env.TWITCH_CLIENT_ID || 'x4csw5gb3s94qhxjs62zy7v6j9q7v8';
  const clientSecret = process.env.TWITCH_CLIENT_SECRET || 'rnqjra5e3wpi7ywp7sb1gyuu0o7o02';
  const r = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`, { method: 'POST' });
  const data = await r.json();
  twitchToken = data.access_token;
  twitchTokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return twitchToken;
}

app.get('/twitch-status/:channel', async (req, res) => {
  try {
    const clientId = process.env.TWITCH_CLIENT_ID || 'x4csw5gb3s94qhxjs62zy7v6j9q7v8';
    const token = await getTwitchToken();
    const r = await fetch(`https://api.twitch.tv/helix/streams?user_login=${req.params.channel}`, {
      headers: { 'Client-ID': clientId, 'Authorization': `Bearer ${token}` }
    });
    if (!r.ok) return res.status(502).json({ error: 'Erro ao consultar Twitch' });
    const data = await r.json();
    const stream = data.data?.[0];
    const isLive = !!stream;
    const viewers = stream?.viewer_count || 0;
    res.json({ isLive, viewers });
  } catch {
    res.status(502).json({ error: 'Erro ao consultar Twitch' });
  }
});

app.get('/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));
