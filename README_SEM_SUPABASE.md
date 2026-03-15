# Francagestao — Sem Supabase

## O que mudou
- Removido: `@supabase/supabase-js`
- Adicionado: `better-sqlite3` no backend (banco de dados local)
- Novo arquivo: `src/lib/api.ts` — toda comunicação com o backend passa por aqui
- `src/lib/supabase.ts` — esvaziado (não usa mais)

## Configuração

### Frontend
Crie um `.env` na raiz do projeto:
```
VITE_API_URL=https://SEU-BACKEND.onrender.com
```

### Backend
No painel do Render/Railway, adicione a variável de ambiente:
```
PASSWORD_HASH=$2b$10$Sumorq07XeLe93jpJ4TcHOAkp2XJV3FCxPGh3LcaBG.xjfWhV0c9K
```

Para gerar um novo hash com outra senha:
```bash
cd backend
node hash.js sua_nova_senha
```
Cole o hash gerado na variável `PASSWORD_HASH`.

### Instalar dependências do backend
```bash
cd backend
npm install
npm start
```

## Segurança
- A senha **nunca aparece** no frontend
- O hash fica **somente** na variável de ambiente do servidor
- Os dados ficam num arquivo `data.db` (SQLite) no servidor
