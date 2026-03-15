-- Secure Supabase RLS setup for Faction Management System
-- Public read (SELECT) allowed; INSERT/UPDATE/DELETE only for authenticated owners.
-- If you want a global admin, replace 'REPLACE_WITH_ADMIN_UID' below with the admin's auth.uid().

-- Add owner_id to tables (if missing)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS owner_id uuid;
ALTER TABLE missions ADD COLUMN IF NOT EXISTS owner_id uuid;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS owner_id uuid;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS owner_id uuid;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS owner_id uuid;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS owner_id uuid;

-- Enable RLS (idempotent)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

-- ---- DROP old public policies if they exist ----
DROP POLICY IF EXISTS "Allow public read access on tasks" ON tasks;
DROP POLICY IF EXISTS "Allow public insert access on tasks" ON tasks;
DROP POLICY IF EXISTS "Allow public update access on tasks" ON tasks;
DROP POLICY IF EXISTS "Allow public delete access on tasks" ON tasks;

DROP POLICY IF EXISTS "Allow public read access on missions" ON missions;
DROP POLICY IF EXISTS "Allow public insert access on missions" ON missions;
DROP POLICY IF EXISTS "Allow public update access on missions" ON missions;
DROP POLICY IF EXISTS "Allow public delete access on missions" ON missions;

DROP POLICY IF EXISTS "Allow public read access on notes" ON notes;
DROP POLICY IF EXISTS "Allow public insert access on notes" ON notes;
DROP POLICY IF EXISTS "Allow public update access on notes" ON notes;
DROP POLICY IF EXISTS "Allow public delete access on notes" ON notes;

DROP POLICY IF EXISTS "Allow public read access on purchases" ON purchases;
DROP POLICY IF EXISTS "Allow public insert access on purchases" ON purchases;
DROP POLICY IF EXISTS "Allow public update access on purchases" ON purchases;
DROP POLICY IF EXISTS "Allow public delete access on purchases" ON purchases;

DROP POLICY IF EXISTS "Allow public read access on sales" ON sales;
DROP POLICY IF EXISTS "Allow public insert access on sales" ON sales;
DROP POLICY IF EXISTS "Allow public update access on sales" ON sales;
DROP POLICY IF EXISTS "Allow public delete access on sales" ON sales;

DROP POLICY IF EXISTS "Allow public read access on deliveries" ON deliveries;
DROP POLICY IF EXISTS "Allow public insert access on deliveries" ON deliveries;
DROP POLICY IF EXISTS "Allow public update access on deliveries" ON deliveries;
DROP POLICY IF EXISTS "Allow public delete access on deliveries" ON deliveries;

-- ---- TASKS policies ----
CREATE POLICY allow_select_tasks_public
  ON tasks FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY allow_insert_tasks_authenticated
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND owner_id = auth.uid()
  );

CREATE POLICY allow_update_tasks_owner
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND (owner_id = auth.uid() OR auth.uid() = 'REPLACE_WITH_ADMIN_UID')
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND (owner_id = auth.uid() OR auth.uid() = 'REPLACE_WITH_ADMIN_UID')
  );

CREATE POLICY allow_delete_tasks_owner
  ON tasks FOR DELETE
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND (owner_id = auth.uid() OR auth.uid() = 'REPLACE_WITH_ADMIN_UID')
  );

-- ---- MISSIONS policies ----
CREATE POLICY allow_select_missions_public
  ON missions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY allow_insert_missions_authenticated
  ON missions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND owner_id = auth.uid()
  );

CREATE POLICY allow_update_missions_owner
  ON missions FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND (owner_id = auth.uid() OR auth.uid() = 'REPLACE_WITH_ADMIN_UID')
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND (owner_id = auth.uid() OR auth.uid() = 'REPLACE_WITH_ADMIN_UID')
  );

CREATE POLICY allow_delete_missions_owner
  ON missions FOR DELETE
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND (owner_id = auth.uid() OR auth.uid() = 'REPLACE_WITH_ADMIN_UID')
  );

-- ---- NOTES policies ----
CREATE POLICY allow_select_notes_public
  ON notes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY allow_insert_notes_authenticated
  ON notes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND owner_id = auth.uid()
  );

CREATE POLICY allow_update_notes_owner
  ON notes FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND (owner_id = auth.uid() OR auth.uid() = 'REPLACE_WITH_ADMIN_UID')
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND (owner_id = auth.uid() OR auth.uid() = 'REPLACE_WITH_ADMIN_UID')
  );

CREATE POLICY allow_delete_notes_owner
  ON notes FOR DELETE
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND (owner_id = auth.uid() OR auth.uid() = 'REPLACE_WITH_ADMIN_UID')
  );

-- ---- PURCHASES policies ----
CREATE POLICY allow_select_purchases_public
  ON purchases FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY allow_insert_purchases_authenticated
  ON purchases FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND owner_id = auth.uid()
  );

CREATE POLICY allow_update_purchases_owner
  ON purchases FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND (owner_id = auth.uid() OR auth.uid() = 'REPLACE_WITH_ADMIN_UID')
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND (owner_id = auth.uid() OR auth.uid() = 'REPLACE_WITH_ADMIN_UID')
  );

CREATE POLICY allow_delete_purchases_owner
  ON purchases FOR DELETE
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND (owner_id = auth.uid() OR auth.uid() = 'REPLACE_WITH_ADMIN_UID')
  );

-- ---- SALES policies ----
CREATE POLICY allow_select_sales_public
  ON sales FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY allow_insert_sales_authenticated
  ON sales FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND owner_id = auth.uid()
  );

CREATE POLICY allow_update_sales_owner
  ON sales FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND (owner_id = auth.uid() OR auth.uid() = 'REPLACE_WITH_ADMIN_UID')
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND (owner_id = auth.uid() OR auth.uid() = 'REPLACE_WITH_ADMIN_UID')
  );

CREATE POLICY allow_delete_sales_owner
  ON sales FOR DELETE
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND (owner_id = auth.uid() OR auth.uid() = 'REPLACE_WITH_ADMIN_UID')
  );

-- ---- DELIVERIES policies ----
CREATE POLICY allow_select_deliveries_public
  ON deliveries FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY allow_insert_deliveries_authenticated
  ON deliveries FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND owner_id = auth.uid()
  );

CREATE POLICY allow_update_deliveries_owner
  ON deliveries FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND (owner_id = auth.uid() OR auth.uid() = 'REPLACE_WITH_ADMIN_UID')
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND (owner_id = auth.uid() OR auth.uid() = 'REPLACE_WITH_ADMIN_UID')
  );

CREATE POLICY allow_delete_deliveries_owner
  ON deliveries FOR DELETE
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND (owner_id = auth.uid() OR auth.uid() = 'REPLACE_WITH_ADMIN_UID')
  );

-- ---- Helpful notes (in-SQL comments) ----
-- 1) After applying these policies, any client-side INSERT must include owner_id = auth.uid().
--    Example (JS): 
--      await supabase.from('purchases').insert([{ item:'X', quantity:1, price:100, owner_id: supabase.auth.user().id }])
--
-- 2) If you prefer server to set owner_id automatically, create a backend endpoint that uses the
--    service_role key (it bypasses RLS) and sets owner_id = auth.uid() based on the user's session.
--
-- 3) To give a specific admin full access, replace 'REPLACE_WITH_ADMIN_UID' with the admin's auth.uid().
--    If you don't want an admin override, leave the placeholder as-is (no admin will match).
--
-- 4) Test with a non-authenticated client: SELECT should work; INSERT/UPDATE/DELETE should fail.
--    Test with an authenticated user that sets owner_id equal to their auth.uid(): R/W should work.
