/*
  # Adicionar coluna 'buyer' na tabela sales

  1. Modificações
    - Adiciona coluna `buyer` (text) à tabela `sales` se não existir

  2. Notas Importantes
    - A coluna é opcional (pode ser vazia)
    - Permite rastrear quem comprou o item
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales' AND column_name = 'buyer'
  ) THEN
    ALTER TABLE sales ADD COLUMN buyer text DEFAULT '';
  END IF;
END $$;
