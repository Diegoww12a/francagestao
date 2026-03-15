/*
  # Tabela de Credenciais de Autenticação

  1. Nova Tabela
    - `auth_credentials`
      - `id` (uuid, primary key)
      - `password_hash` (text) - senha criptografada
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Segurança
    - Habilita RLS na tabela
    - Políticas restritivas (apenas leitura para autenticação)

  3. Notas Importantes
    - Esta tabela armazena apenas uma senha de administrador
    - A senha é criptografada usando bcrypt
    - Senha inicial: france2024 (pode ser alterada depois)
*/

-- Criar extensão para criptografia se não existir
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Criar tabela de credenciais
CREATE TABLE IF NOT EXISTS auth_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE auth_credentials ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura (necessário para login)
CREATE POLICY "Permitir leitura de credenciais"
  ON auth_credentials
  FOR SELECT
  TO anon
  USING (true);

-- Inserir senha inicial (france2024)
-- Usando crypt do pgcrypto para hash bcrypt
INSERT INTO auth_credentials (password_hash)
VALUES (crypt('france2024', gen_salt('bf')))
ON CONFLICT DO NOTHING;
