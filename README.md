# ⏱ Honest Hours

**WFH time tracking built on trust, not surveillance.**

> Honest hours. That's it.

[honesthours.io](https://honesthours.io) · Part of the [InstallSmart.ai](https://installsmart.ai) suite for Gulf SMEs.

---

## What it is

Honest Hours is a lightweight WFH time tracker for distributed teams. Employees install a Chrome extension, click **Start** when their day begins and **Stop** when it ends. Managers get a clean dashboard showing who worked when — no screenshots, no keystroke logging, no surveillance.

Built for UAE and Gulf SMEs who need WFH accountability without the resentment that surveillance tools create.

---

## Architecture

```
honesthours/
├── extension/          # Chrome Extension (Manifest V3)
│   ├── manifest.json
│   ├── popup.html      # Extension popup UI
│   ├── popup.js        # Start/Stop logic, idle display
│   ├── background.js   # Service worker: heartbeats, idle detection
│   ├── options.html    # Employee setup page
│   └── options.js
│
├── api/                # Express.js REST API
│   ├── server.js
│   └── package.json
│
├── supabase/
│   └── schema.sql      # Supabase database schema
│
├── index.html          # Landing page (honesthours.io)
└── dashboard.html      # Employer dashboard (single-page, no auth yet)
```

---

## Quick Start

### Employee setup

1. Install the Chrome extension (load unpacked from `extension/` folder)
2. Click the ⏱ icon → **Set up profile**
3. Enter your name, employee ID (email works), and the **company code** from your employer
4. Click **Start** when your day begins — that's it

### Employer setup

1. Share a company code with your team (any string, e.g. `ACME-2024`)
2. Open `dashboard.html` (or `https://honesthours.io/dashboard.html`)
3. Enter your company code → **Load Dashboard**
4. See live status, today's hours, and the weekly grid

---

## API

Deployed at: `https://honesthours-api.onrender.com`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/health` | Health check |
| `POST` | `/api/session/start` | Employee clocked in |
| `POST` | `/api/session/stop` | Employee clocked out |
| `POST` | `/api/heartbeat` | Periodic ping (every 5 min) |
| `GET`  | `/api/dashboard/:company_code` | Employer dashboard data |
| `GET`  | `/api/employee/:employee_id/summary?company_code=X` | 30-day employee summary |

### POST /api/heartbeat
```json
{
  "employee_id": "ahmed@company.com",
  "employee_name": "Ahmed Al-Rashid",
  "company_code": "ACME-2024",
  "session_id": "ahmed@company.com-1712000000000",
  "timestamp": "2024-04-01T09:30:00Z",
  "status": "active",
  "total_active_seconds": 3600,
  "idle_seconds": 120
}
```

---

## Self-hosting

### Requirements
- Node.js 18+
- Supabase account (free tier works)

### Steps

1. **Clone the repo**
   ```bash
   git clone https://github.com/S7SSL/honesthours.git
   cd honesthours
   ```

2. **Set up the database**
   - Create a Supabase project
   - Run `supabase/schema.sql` in the SQL editor

3. **Configure the API**
   ```bash
   cd api
   npm install
   export SUPABASE_URL=https://your-project.supabase.co
   export SUPABASE_SERVICE_KEY=your-service-role-key
   npm start
   ```

4. **Update the extension** (optional)
   - Open `extension/options.html` (or the options page after install)
   - Set **API Endpoint** to your self-hosted URL

5. **Deploy**
   - API: works on Render, Railway, Fly.io, or any Node host
   - Dashboard/landing: static HTML — host on Netlify, Vercel, or Cloudflare Pages

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (not the anon key) |
| `PORT` | Port to listen on (default: 3000) |

---

## Pricing

- **Starter:** £9/employee/month (min. 3 employees)
- **Team:** £7/employee/month (10+ employees)
- **Self-host:** Free, open source

---

## Part of the InstallSmart.ai Suite

Honest Hours is one component of a growing suite of AI-native business tools for UAE and Gulf SMEs. Built by [InstallSmart.ai](https://installsmart.ai).

---

## Roadmap

- [ ] Auth layer (JWT / company admin accounts)
- [ ] Email reports (daily/weekly digest to managers)
- [ ] CSV/Excel export for payroll
- [ ] Slack/Teams status integration
- [ ] Mobile companion app
- [ ] Arabic language support
- [ ] Multi-timezone dashboard

---

## License

MIT — do whatever you want with it.
