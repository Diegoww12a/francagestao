import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';

const app = express();
const db = new Database('data.db');

const allowedOrigins = [
  'https://diegoww12a.github.io',
  'https://franca-dashboard.netlify.app',
  'http://localhost:5173'
];

app.use(cors({
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('CORS: origem não permitida'));
  }
}));

app.use(express.json());

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT DEFAULT '',
    status TEXT DEFAULT 'pending', created_at TEXT DEFAULT (datetime('now')), completed_at TEXT
  );
  CREATE TABLE IF NOT EXISTS missions (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT DEFAULT '',
    scheduled_date TEXT, status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now')), completed_at TEXT
  );
  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY, content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS purchases (
    id TEXT PRIMARY KEY, item TEXT NOT NULL, quantity INTEGER NOT NULL,
    price INTEGER NOT NULL, status TEXT DEFAULT 'pending', created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY, item TEXT NOT NULL, quantity INTEGER NOT NULL,
    price INTEGER NOT NULL, buyer TEXT DEFAULT '', created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS deliveries (
    id TEXT PRIMARY KEY, description TEXT NOT NULL, recipient TEXT NOT NULL,
    status TEXT DEFAULT 'pending', created_at TEXT DEFAULT (datetime('now')), completed_at TEXT
  );
  CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, role TEXT DEFAULT 'Recruta',
    status TEXT DEFAULT 'active', created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY, type TEXT NOT NULL, description TEXT NOT NULL,
    amount INTEGER NOT NULL, created_at TEXT DEFAULT (datetime('now'))
  );
`);

const PASSWORD_HASH = process.env.PASSWORD_HASH || '$2b$10$Sumorq07XeLe93jpJ4TcHOAkp2XJV3FCxPGh3LcaBG.xjfWhV0c9K';

app.post('/login', async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Senha obrigatória' });
  const ok = await bcrypt.compare(password, PASSWORD_HASH);
  if (!ok) return res.status(401).json({ error: 'Senha incorreta' });
  res.json({ success: true });
});

const uuid = () => randomUUID();
const now = () => new Date().toISOString();

// TASKS
app.get('/tasks', (_, res) => res.json(db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all()));
app.post('/tasks', (req, res) => { const { title, description = '', status = 'pending' } = req.body; if (!title) return res.status(400).json({ error: 'title obrigatório' }); const id = uuid(); db.prepare('INSERT INTO tasks (id,title,description,status) VALUES (?,?,?,?)').run(id, title, description, status); res.json(db.prepare('SELECT * FROM tasks WHERE id=?').get(id)); });
app.patch('/tasks/:id', (req, res) => { const { status } = req.body; db.prepare('UPDATE tasks SET status=?, completed_at=? WHERE id=?').run(status, status === 'completed' ? now() : null, req.params.id); res.json(db.prepare('SELECT * FROM tasks WHERE id=?').get(req.params.id)); });
app.delete('/tasks/:id', (req, res) => { db.prepare('DELETE FROM tasks WHERE id=?').run(req.params.id); res.json({ success: true }); });

// MISSIONS
app.get('/missions', (_, res) => res.json(db.prepare('SELECT * FROM missions ORDER BY scheduled_date ASC').all()));
app.post('/missions', (req, res) => { const { title, description = '', scheduled_date, status = 'pending' } = req.body; if (!title) return res.status(400).json({ error: 'title obrigatório' }); const id = uuid(); db.prepare('INSERT INTO missions (id,title,description,scheduled_date,status) VALUES (?,?,?,?,?)').run(id, title, description, scheduled_date, status); res.json(db.prepare('SELECT * FROM missions WHERE id=?').get(id)); });
app.patch('/missions/:id', (req, res) => { const { status } = req.body; db.prepare('UPDATE missions SET status=?, completed_at=? WHERE id=?').run(status, status === 'completed' ? now() : null, req.params.id); res.json(db.prepare('SELECT * FROM missions WHERE id=?').get(req.params.id)); });
app.delete('/missions/:id', (req, res) => { db.prepare('DELETE FROM missions WHERE id=?').run(req.params.id); res.json({ success: true }); });

// NOTES
app.get('/notes', (_, res) => res.json(db.prepare('SELECT * FROM notes ORDER BY updated_at DESC').all()));
app.post('/notes', (req, res) => { const { content } = req.body; if (!content) return res.status(400).json({ error: 'content obrigatório' }); const id = uuid(); db.prepare('INSERT INTO notes (id,content) VALUES (?,?)').run(id, content); res.json(db.prepare('SELECT * FROM notes WHERE id=?').get(id)); });
app.patch('/notes/:id', (req, res) => { const { content } = req.body; db.prepare('UPDATE notes SET content=?, updated_at=? WHERE id=?').run(content, now(), req.params.id); res.json(db.prepare('SELECT * FROM notes WHERE id=?').get(req.params.id)); });
app.delete('/notes/:id', (req, res) => { db.prepare('DELETE FROM notes WHERE id=?').run(req.params.id); res.json({ success: true }); });

// PURCHASES
app.get('/purchases', (_, res) => res.json(db.prepare('SELECT * FROM purchases ORDER BY created_at DESC').all()));
app.post('/purchases', (req, res) => { const { item, quantity, price, status = 'pending' } = req.body; if (!item) return res.status(400).json({ error: 'item obrigatório' }); const id = uuid(); db.prepare('INSERT INTO purchases (id,item,quantity,price,status) VALUES (?,?,?,?,?)').run(id, item, quantity, price, status); res.json(db.prepare('SELECT * FROM purchases WHERE id=?').get(id)); });
app.patch('/purchases/:id', (req, res) => { const { status } = req.body; db.prepare('UPDATE purchases SET status=? WHERE id=?').run(status, req.params.id); res.json(db.prepare('SELECT * FROM purchases WHERE id=?').get(req.params.id)); });
app.delete('/purchases/:id', (req, res) => { db.prepare('DELETE FROM purchases WHERE id=?').run(req.params.id); res.json({ success: true }); });

// SALES
app.get('/sales', (_, res) => res.json(db.prepare('SELECT * FROM sales ORDER BY created_at DESC').all()));
app.post('/sales', (req, res) => { const { item, quantity, price, buyer = '' } = req.body; if (!item) return res.status(400).json({ error: 'item obrigatório' }); const id = uuid(); db.prepare('INSERT INTO sales (id,item,quantity,price,buyer) VALUES (?,?,?,?,?)').run(id, item, quantity, price, buyer); res.json(db.prepare('SELECT * FROM sales WHERE id=?').get(id)); });
app.delete('/sales/:id', (req, res) => { db.prepare('DELETE FROM sales WHERE id=?').run(req.params.id); res.json({ success: true }); });

// DELIVERIES
app.get('/deliveries', (_, res) => res.json(db.prepare('SELECT * FROM deliveries ORDER BY created_at DESC').all()));
app.post('/deliveries', (req, res) => { const { description, recipient, status = 'pending' } = req.body; if (!description || !recipient) return res.status(400).json({ error: 'description e recipient obrigatórios' }); const id = uuid(); db.prepare('INSERT INTO deliveries (id,description,recipient,status) VALUES (?,?,?,?)').run(id, description, recipient, status); res.json(db.prepare('SELECT * FROM deliveries WHERE id=?').get(id)); });
app.patch('/deliveries/:id', (req, res) => { const { status } = req.body; db.prepare('UPDATE deliveries SET status=?, completed_at=? WHERE id=?').run(status, status === 'completed' ? now() : null, req.params.id); res.json(db.prepare('SELECT * FROM deliveries WHERE id=?').get(req.params.id)); });
app.delete('/deliveries/:id', (req, res) => { db.prepare('DELETE FROM deliveries WHERE id=?').run(req.params.id); res.json({ success: true }); });

// MEMBERS
app.get('/members', (_, res) => res.json(db.prepare('SELECT * FROM members ORDER BY created_at DESC').all()));
app.post('/members', (req, res) => { const { name, role = 'Recruta', status = 'active' } = req.body; if (!name) return res.status(400).json({ error: 'name obrigatório' }); const id = uuid(); db.prepare('INSERT INTO members (id,name,role,status) VALUES (?,?,?,?)').run(id, name, role, status); res.json(db.prepare('SELECT * FROM members WHERE id=?').get(id)); });
app.patch('/members/:id', (req, res) => { const { name, role, status } = req.body; db.prepare('UPDATE members SET name=?, role=?, status=? WHERE id=?').run(name, role, status, req.params.id); res.json(db.prepare('SELECT * FROM members WHERE id=?').get(req.params.id)); });
app.delete('/members/:id', (req, res) => { db.prepare('DELETE FROM members WHERE id=?').run(req.params.id); res.json({ success: true }); });

// TRANSACTIONS
app.get('/transactions', (_, res) => res.json(db.prepare('SELECT * FROM transactions ORDER BY created_at DESC').all()));
app.post('/transactions', (req, res) => { const { type, description, amount } = req.body; if (!type || !description || !amount) return res.status(400).json({ error: 'type, description e amount obrigatórios' }); const id = uuid(); db.prepare('INSERT INTO transactions (id,type,description,amount) VALUES (?,?,?,?)').run(id, type, description, amount); res.json(db.prepare('SELECT * FROM transactions WHERE id=?').get(id)); });
app.delete('/transactions/:id', (req, res) => { db.prepare('DELETE FROM transactions WHERE id=?').run(req.params.id); res.json({ success: true }); });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));
