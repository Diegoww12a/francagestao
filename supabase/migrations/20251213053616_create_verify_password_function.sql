/*
  # Função para Verificar Senha

  1. Nova Função
    - `verify_password(input_password text)` - Verifica se a senha fornecida está correta
    - Retorna boolean (true se senha correta, false caso contrário)

  2. Segurança
    - Função é SECURITY DEFINER para permitir acesso à tabela auth_credentials
    - Disponível para usuários anônimos (necessário para login)

  3. Notas Importantes
    - Usa crypt para comparar hash bcrypt
    - Executa com privilégios do owner da função
*/

-- Criar função para verificar senha
CREATE OR REPLACE FUNCTION verify_password(input_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stored_hash text;
BEGIN
  -- Buscar o hash armazenado
  SELECT password_hash INTO stored_hash
  FROM auth_credentials
  LIMIT 1;

  -- Se não encontrar credencial, retornar false
  IF stored_hash IS NULL THEN
    RETURN false;
  END IF;

  -- Comparar a senha fornecida com o hash armazenado
  RETURN (crypt(input_password, stored_hash) = stored_hash);
END;
$$;

-- Permitir que usuários anônimos executem a função
GRANT EXECUTE ON FUNCTION verify_password(text) TO anon;
