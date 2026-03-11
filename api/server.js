// Honest Hours — API server (Express + Supabase)

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Supabase ──────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-setup-token']
}));
app.use(express.json());

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── Health ────────────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'honesthours-api', ts: new Date().toISOString() });
});

// ── POST /api/session/start ───────────────────────────────────────────────────

app.post('/api/session/start', async (req, res) => {
  const { employee_id, employee_name, company_code, session_id, start_time } = req.body;

  if (!employee_id || !company_code) {
    return res.status(400).json({ error: 'employee_id and company_code required' });
  }

  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('sessions')
    .upsert({
      company_code,
      employee_id,
      employee_name: employee_name || employee_id,
      date: today,
      start_time: start_time || new Date().toISOString(),
      status: 'active',
      last_heartbeat: new Date().toISOString()
    }, {
      onConflict: 'company_code,employee_id,date',
      ignoreDuplicates: false
    })
    .select()
    .single();

  if (error) {
    console.error('[session/start]', error);
    return res.status(500).json({ error: error.message });
  }

  return res.json({ ok: true, session: data });
});

// ── POST /api/session/stop ────────────────────────────────────────────────────

app.post('/api/session/stop', async (req, res) => {
  const { employee_id, company_code, end_time, total_active_seconds, total_idle_seconds } = req.body;

  if (!employee_id || !company_code) {
    return res.status(400).json({ error: 'employee_id and company_code required' });
  }

  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('sessions')
    .update({
      end_time: end_time || new Date().toISOString(),
      total_active_seconds: total_active_seconds || 0,
      total_idle_seconds: total_idle_seconds || 0,
      status: 'completed',
      last_heartbeat: new Date().toISOString()
    })
    .eq('company_code', company_code)
    .eq('employee_id', employee_id)
    .eq('date', today)
    .select()
    .single();

  if (error) {
    console.error('[session/stop]', error);
    return res.status(500).json({ error: error.message });
  }

  return res.json({ ok: true, session: data });
});

// ── POST /api/heartbeat ───────────────────────────────────────────────────────

app.post('/api/heartbeat', async (req, res) => {
  const {
    employee_id, employee_name, company_code,
    status, total_active_seconds, idle_seconds, timestamp
  } = req.body;

  if (!employee_id || !company_code) {
    return res.status(400).json({ error: 'employee_id and company_code required' });
  }

  const today = new Date().toISOString().split('T')[0];
  const now = timestamp || new Date().toISOString();

  const { data, error } = await supabase
    .from('sessions')
    .upsert({
      company_code,
      employee_id,
      employee_name: employee_name || employee_id,
      date: today,
      start_time: now,
      total_active_seconds: total_active_seconds || 0,
      total_idle_seconds: idle_seconds || 0,
      status: status || 'active',
      last_heartbeat: now
    }, {
      onConflict: 'company_code,employee_id,date',
      ignoreDuplicates: false
    })
    .select()
    .single();

  if (error) {
    console.error('[heartbeat]', error);
    return res.status(500).json({ error: error.message });
  }

  return res.json({ ok: true, session: data });
});

// ── GET /api/dashboard/:company_code ─────────────────────────────────────────

app.get('/api/dashboard/:company_code', async (req, res) => {
  const { company_code } = req.params;
  if (!company_code) return res.status(400).json({ error: 'company_code required' });

  const today = new Date().toISOString().split('T')[0];
  const since = new Date();
  since.setDate(since.getDate() - 6);
  const sinceDate = since.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('company_code', company_code)
    .gte('date', sinceDate)
    .order('date', { ascending: false })
    .order('start_time', { ascending: false });

  if (error) {
    console.error('[dashboard]', error);
    return res.status(500).json({ error: error.message });
  }

  const byDate = {};
  const employees = new Set();

  (data || []).forEach(s => {
    employees.add(s.employee_id);
    if (!byDate[s.date]) byDate[s.date] = {};
    byDate[s.date][s.employee_id] = s;
  });

  const todaySessions = (data || [])
    .filter(s => s.date === today)
    .map(s => ({
      ...s,
      is_online: s.status === 'active' && isRecentHeartbeat(s.last_heartbeat)
    }));

  return res.json({
    ok: true,
    company_code,
    today,
    today_sessions: todaySessions,
    weekly: byDate,
    employees: Array.from(employees),
    fetched_at: new Date().toISOString()
  });
});

// ── GET /api/employee/:employee_id/summary ────────────────────────────────────

app.get('/api/employee/:employee_id/summary', async (req, res) => {
  const { employee_id } = req.params;
  const { company_code } = req.query;

  if (!employee_id) return res.status(400).json({ error: 'employee_id required' });

  const since = new Date();
  since.setDate(since.getDate() - 29);
  const sinceDate = since.toISOString().split('T')[0];

  let query = supabase
    .from('sessions')
    .select('*')
    .eq('employee_id', employee_id)
    .gte('date', sinceDate)
    .order('date', { ascending: false });

  if (company_code) query = query.eq('company_code', company_code);

  const { data, error } = await query;

  if (error) {
    console.error('[employee/summary]', error);
    return res.status(500).json({ error: error.message });
  }

  const totalActive = (data || []).reduce((s, r) => s + (r.total_active_seconds || 0), 0);
  const totalDays = (data || []).length;
  const avgPerDay = totalDays ? Math.round(totalActive / totalDays) : 0;

  return res.json({
    ok: true,
    employee_id,
    sessions: data || [],
    summary: {
      total_active_seconds: totalActive,
      total_days_tracked: totalDays,
      avg_daily_active_seconds: avgPerDay
    },
    fetched_at: new Date().toISOString()
  });
});

// ── GET /api/setup ────────────────────────────────────────────────────────────
// Returns schema SQL to apply. Used for documentation / one-time setup.

app.get('/api/setup', (req, res) => {
  res.json({
    message: 'Apply the schema from supabase/schema.sql in your Supabase SQL editor.',
    schema_url: 'https://github.com/S7SSL/honesthours/blob/main/supabase/schema.sql',
    dashboard_url: 'https://supabase.com/dashboard/project/gcsorjyxzyltzxpmaavt/sql'
  });
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function isRecentHeartbeat(ts) {
  if (!ts) return false;
  return Date.now() - new Date(ts).getTime() < 10 * 60 * 1000;
}

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`[HonestHours API] Listening on port ${PORT}`);
  console.log(`[HonestHours API] Supabase: ${SUPABASE_URL ? 'configured' : 'NOT CONFIGURED'}`);
});
