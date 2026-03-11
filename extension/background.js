// Honest Hours — background.js (Service Worker)

const DEFAULT_API = 'https://honesthours-api.onrender.com';
const HEARTBEAT_ALARM = 'honesthours-heartbeat';
const IDLE_THRESHOLD_SECONDS = 300; // 5 minutes

// ── Idle detection ────────────────────────────────────────────────────────────

chrome.idle.setDetectionInterval(IDLE_THRESHOLD_SECONDS);

chrome.idle.onStateChanged.addListener(async (newState) => {
  const state = await getState();
  if (state.status !== 'active' && state.status !== 'idle') return;

  const now = Date.now();

  if (newState === 'idle' || newState === 'locked') {
    // Going idle — save tick up to now, record idle start
    const elapsed = computeElapsed(state);
    await chrome.storage.local.set({
      status: 'idle',
      todayActiveSeconds: (state.todayActiveSeconds || 0) + elapsed,
      idleStart: now,
      lastTickTime: now
    });
  } else if (newState === 'active') {
    if (state.status === 'idle' && state.idleStart) {
      const idleSeconds = Math.floor((now - state.idleStart) / 1000);
      await chrome.storage.local.set({
        status: 'active',
        totalIdleSeconds: (state.totalIdleSeconds || 0) + idleSeconds,
        idleStart: null,
        lastTickTime: now
      });
    } else {
      await chrome.storage.local.set({ status: 'active', lastTickTime: now });
    }
    // Send a heartbeat on resume
    await sendHeartbeat();
  }
});

// ── Message handler ───────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'SESSION_START') {
    handleSessionStart(msg).then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg.type === 'SESSION_STOP') {
    handleSessionStop(msg).then(() => sendResponse({ ok: true }));
    return true;
  }
});

async function handleSessionStart({ sessionId, config, startTime }) {
  // Set lastTickTime for elapsed calc
  await chrome.storage.local.set({ lastTickTime: Date.now() });

  // POST session start to API
  const api = config.apiEndpoint || DEFAULT_API;
  try {
    await fetch(`${api}/api/session/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employee_id: config.employeeId,
        employee_name: config.employeeName,
        company_code: config.companyCode,
        session_id: sessionId,
        start_time: startTime
      })
    });
  } catch (e) {
    console.warn('[HonestHours] Session start API error:', e.message);
  }

  // Schedule heartbeat alarm every 5 minutes
  chrome.alarms.create(HEARTBEAT_ALARM, { periodInMinutes: 5 });
}

async function handleSessionStop({ sessionId, config, startTime, endTime, totalActiveSeconds, totalIdleSeconds }) {
  // Clear alarms
  chrome.alarms.clear(HEARTBEAT_ALARM);

  const api = config.apiEndpoint || DEFAULT_API;
  try {
    await fetch(`${api}/api/session/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employee_id: config.employeeId,
        company_code: config.companyCode,
        session_id: sessionId,
        start_time: startTime,
        end_time: endTime,
        total_active_seconds: totalActiveSeconds,
        total_idle_seconds: totalIdleSeconds
      })
    });
  } catch (e) {
    console.warn('[HonestHours] Session stop API error:', e.message);
  }
}

// ── Alarm handler ─────────────────────────────────────────────────────────────

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === HEARTBEAT_ALARM) {
    await sendHeartbeat();
  }
});

// ── Heartbeat logic ───────────────────────────────────────────────────────────

async function sendHeartbeat() {
  const state = await getState();
  if (state.status !== 'active' && state.status !== 'idle') return;

  const config = await getConfig();
  if (!config.employeeId || !config.companyCode) return;

  // Tick up active seconds if currently active
  let activeSeconds = state.todayActiveSeconds || 0;
  if (state.status === 'active') {
    const elapsed = computeElapsed(state);
    activeSeconds += elapsed;
    await chrome.storage.local.set({
      todayActiveSeconds: activeSeconds,
      lastTickTime: Date.now()
    });
  }

  const now = new Date().toISOString();
  const api = config.apiEndpoint || DEFAULT_API;

  try {
    await fetch(`${api}/api/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employee_id: config.employeeId,
        employee_name: config.employeeName,
        company_code: config.companyCode,
        session_id: state.sessionId,
        timestamp: now,
        status: state.status,
        total_active_seconds: activeSeconds,
        idle_seconds: state.totalIdleSeconds || 0
      })
    });
    await chrome.storage.local.set({ lastHeartbeat: now });
  } catch (e) {
    console.warn('[HonestHours] Heartbeat error:', e.message);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function computeElapsed(state) {
  if (!state.lastTickTime) return 0;
  return Math.floor((Date.now() - state.lastTickTime) / 1000);
}

function getState() {
  return new Promise(resolve => {
    chrome.storage.local.get([
      'status', 'sessionStart', 'sessionId', 'todayActiveSeconds',
      'totalIdleSeconds', 'idleStart', 'lastTickTime', 'lastHeartbeat'
    ], resolve);
  });
}

function getConfig() {
  return new Promise(resolve => {
    chrome.storage.sync.get(['employeeName', 'employeeId', 'companyCode', 'apiEndpoint'], resolve);
  });
}
