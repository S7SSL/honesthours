-- Honest Hours — Initial Schema
-- Apply via: Supabase Dashboard → SQL Editor

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

CREATE POLICY "service_role_all_companies"
  ON companies FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_employees"
  ON employees FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_sessions"
  ON sessions FOR ALL TO service_role USING (true) WITH CHECK (true);
