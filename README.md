# Francagestão — Painel Administrativo

Painel administrativo **full-stack**: autenticação por senha, dashboard com gráficos e persistência em banco.

![Prévia do painel](docs/preview.png)

## Sobre

Sistema de gestão com separação clara entre frontend e backend.

- **Frontend** — React + TypeScript, gráficos via Recharts, ícones Lucide
- **Backend** — API Node com banco SQLite local (`better-sqlite3`)
- **Deploy** — frontend no GitHub Pages, backend no Render

## Segurança

Decisões tomadas de propósito:

- A senha **nunca aparece no frontend** — só o hash trafega
- O hash (bcrypt, `PASSWORD_HASH`) vive **apenas** na variável de ambiente do servidor
- Os dados ficam num arquivo `data.db` (SQLite), fora do repositório

Para gerar um hash novo:

```bash
cd backend
node hash.js sua_nova_senha
```

## Configuração

### Frontend

Crie um `.env` na raiz (o `.env.example` já vem com o modelo):

```
VITE_API_URL=https://SEU-BACKEND.onrender.com
```

### Backend

Adicione no painel do Render/Railway:

```
PASSWORD_HASH=$2b$10$...
```

## Rodar localmente

```bash
# frontend
npm install
npm run dev

# backend (outra janela)
cd backend
npm install
npm start
```

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | build de produção |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run deploy` | publica no GitHub Pages |

## Stack

React · TypeScript · Vite · Tailwind CSS · Recharts · Node · SQLite · bcrypt · ESLint

## Autor

**Diego Neves** — Desenvolvedor Front-end
