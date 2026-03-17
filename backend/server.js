import 'dotenv/config';
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

const PASSWORD_HASH = process.env.PASSWORD_HASH;
const uuid = () => randomUUID();
const now = () => new Date().toISOString();


// =========================
// 🔐 LOGIN
// =========================
app.post('/login', async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Senha obrigatória' });

  const ok = await bcrypt.compare(password.trim(), PASSWORD_HASH);
  if (!ok) return res.status(401).json({ error: 'Senha incorreta' });

  res.json({ success: true });
});


// =========================
// 📋 TASKS
// =========================
app.get('/tasks', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar tasks' });
  }
});


// =========================
// 👥 MEMBERS
// =========================
app.get('/members', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM members ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar members' });
  }
});


// =========================
// 🔥 KICK STATUS
// =========================
app.get('/kick-status/:channel', async (req, res) => {
  try {
    const r = await fetch(`https://kick.com/api/v2/channels/${req.params.channel}`, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' }
    });

    if (!r.ok) return res.status(502).json({ error: 'Canal não encontrado' });

    const data = await r.json();
    const isLive = data.livestream?.is_live === true;

    res.json({ isLive });
  } catch {
    res.status(502).json({ error: 'Erro ao consultar Kick' });
  }
});


// =========================
// 🟣 TWITCH STATUS
// =========================
app.get('/twitch-status/:channel', async (req, res) => {
  try {
    const tokenRes = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
        grant_type: 'client_credentials'
      })
    });

    const tokenData = await tokenRes.json();

    const r = await fetch(
      `https://api.twitch.tv/helix/streams?user_login=${req.params.channel}`,
      {
        headers: {
          'Client-Id': process.env.TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${tokenData.access_token}`
        }
      }
    );

    const data = await r.json();
    const isLive = data.data.length > 0;

    res.json({ isLive });
  } catch {
    res.status(502).json({ error: 'Erro ao consultar Twitch' });
  }
});


// =========================
// ❤️ HEALTH
// =========================
app.get('/health', (_, res) => res.json({ status: 'ok' }));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));
