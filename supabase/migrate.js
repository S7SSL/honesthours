#!/usr/bin/env node
// Honest Hours — one-time schema migration
// Usage: DATABASE_URL="postgresql://..." node migrate.js
// Get DATABASE_URL from: https://supabase.com/dashboard/project/gcsorjyxzyltzxpmaavt/settings/database

const { Client } = require('pg');

const schema = `
CREATE TABLE IF NOT EXISTS companies (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_code text UNIQUE NOT NULL,
  name         text NOT NULL,
  email        text,
  plan         text DEFAULT 'trial',
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS employees (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_code text NOT NULL,
  employee_id  text NOT NULL,
  name         text NOT NULL,
  email        text,
  active       boolean DEFAULT true,
  created_at   timestamptz DEFAULT now(),
  UNIQUE(company_code, employee_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_code         text NOT NULL,
  employee_id          text NOT NULL,
  employee_name        text,
  date                 date NOT NULL DEFAULT CURRENT_DATE,
  start_time           timestamptz NOT NULL DEFAULT now(),
  end_time             timestamptz,
  total_active_seconds integer DEFAULT 0,
  total_idle_seconds   integer DEFAULT 0,
  status               text DEFAULT 'active',
  last_heartbeat       timestamptz DEFAULT now(),
  created_at           timestamptz DEFAULT now(),
  UNIQUE(company_code, employee_id, date)
);

CREATE INDEX IF NOT EXISTS sessions_company_date ON sessions(company_code, date DESC);
CREATE INDEX IF NOT EXISTS sessions_employee_date ON sessions(employee_id, date DESC);

ALTER TABLE companies  ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees  ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions   ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='companies' AND policyname='service_role_all_companies') THEN
    CREATE POLICY "service_role_all_companies" ON companies FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='employees' AND policyname='service_role_all_employees') THEN
    CREATE POLICY "service_role_all_employees" ON employees FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='sessions' AND policyname='service_role_all_sessions') THEN
    CREATE POLICY "service_role_all_sessions" ON sessions FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;
`;

async function migrate() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('❌ DATABASE_URL not set');
    console.error('Get it from: https://supabase.com/dashboard/project/gcsorjyxzyltzxpmaavt/settings/database');
    console.error('Use the "URI" connection string (Transaction mode pooler or Direct)');
    process.exit(1);
  }

  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  
  try {
    await client.connect();
    console.log('✓ Connected to Supabase');
    await client.query(schema);
    console.log('✓ Schema applied — tables created');
    
    const { rows } = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('companies','employees','sessions')");
    console.log('✓ Tables confirmed:', rows.map(r => r.table_name).join(', '));
  } catch (e) {
    console.error('❌ Migration failed:', e.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
