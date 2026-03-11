// Honest Hours — popup.js

const app = document.getElementById('app');

function formatDuration(seconds) {
  if (!seconds || seconds < 0) return '0h 00m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

function formatTime(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function formatSynced(isoString) {
  if (!isoString) return 'Never';
  const d = new Date(isoString);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return formatTime(isoString);
}

function renderSetup() {
  app.innerHTML = `
    <div class="setup-prompt">
      <p>Set up your profile to start tracking your hours.</p>
      <button class="btn btn-setup" id="openOptions">Set up profile →</button>
    </div>
  `;
  document.getElementById('openOptions').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
}

function renderMain(state, config) {
  const isClockedIn = state.status === 'active' || state.status === 'idle';
  const isIdle = state.status === 'idle';

  let statusClass = 'clocked-out';
  let statusText = 'Clocked Out';
  let dotClass = 'status-dot';
  if (state.status === 'active') { statusClass = 'active'; statusText = 'Active'; dotClass = 'status-dot pulse'; }
  if (state.status === 'idle')   { statusClass = 'idle';   statusText = 'Idle';   dotClass = 'status-dot'; }

  app.innerHTML = `
    <div class="employee-name">👤 <span>${config.employeeName || 'Unknown'}</span></div>

    <div class="status-badge ${statusClass}">
      <div class="${dotClass}"></div>
      ${statusText}
    </div>

    <div class="hours-display" id="hoursDisplay">${formatDuration(state.todayActiveSeconds)}</div>
    <div class="hours-label">Today's tracked hours</div>

    ${isClockedIn
      ? `<button class="btn btn-stop" id="mainBtn">■ Stop</button>`
      : `<button class="btn btn-start" id="mainBtn">▶ Start</button>`
    }

    <div class="divider"></div>

    <div class="meta">
      Started: ${formatTime(state.sessionStart)} &nbsp;·&nbsp; Last sync: <span id="lastSynced">${formatSynced(state.lastHeartbeat)}</span>
      <br/>
      <a id="openOptions">Settings</a>
    </div>
  `;

  document.getElementById('mainBtn').addEventListener('click', () => {
    if (isClockedIn) {
      handleStop();
    } else {
      handleStart();
    }
  });

  document.getElementById('openOptions').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
}

async function handleStart() {
  const config = await getConfig();
  if (!config.employeeId || !config.companyCode) {
    chrome.runtime.openOptionsPage();
    return;
  }

  const now = new Date().toISOString();
  const sessionId = `${config.employeeId}-${Date.now()}`;

  await chrome.storage.local.set({
    status: 'active',
    sessionStart: now,
    sessionId,
    todayActiveSeconds: 0,
    totalIdleSeconds: 0,
    lastHeartbeat: null,
    lastTickTime: Date.now()
  });

  // Notify background to start
  chrome.runtime.sendMessage({ type: 'SESSION_START', sessionId, config, startTime: now });

  // Reload popup
  init();
}

async function handleStop() {
  const state = await getState();
  const config = await getConfig();

  const now = new Date().toISOString();
  await chrome.storage.local.set({ status: 'clocked-out', sessionEnd: now });

  chrome.runtime.sendMessage({
    type: 'SESSION_STOP',
    sessionId: state.sessionId,
    config,
    startTime: state.sessionStart,
    endTime: now,
    totalActiveSeconds: state.todayActiveSeconds || 0,
    totalIdleSeconds: state.totalIdleSeconds || 0
  });

  init();
}

async function getConfig() {
  return new Promise(resolve => {
    chrome.storage.sync.get(['employeeName', 'employeeId', 'companyCode', 'apiEndpoint'], resolve);
  });
}

async function getState() {
  return new Promise(resolve => {
    chrome.storage.local.get([
      'status', 'sessionStart', 'sessionEnd', 'sessionId',
      'todayActiveSeconds', 'totalIdleSeconds', 'lastHeartbeat', 'lastTickTime'
    ], resolve);
  });
}

async function init() {
  const [config, state] = await Promise.all([getConfig(), getState()]);

  if (!config.employeeId || !config.companyCode) {
    renderSetup();
    return;
  }

  renderMain(state, config);

  // Live tick if clocked in
  if (state.status === 'active') {
    const elapsed = Math.floor((Date.now() - (state.lastTickTime || Date.now())) / 1000);
    let displaySeconds = (state.todayActiveSeconds || 0) + elapsed;

    setInterval(() => {
      displaySeconds++;
      const el = document.getElementById('hoursDisplay');
      if (el) el.textContent = formatDuration(displaySeconds);
    }, 1000);
  }
}

init();
