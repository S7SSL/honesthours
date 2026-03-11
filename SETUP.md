# Honest Hours — Setup Guide

## 1. Apply the Supabase Schema (one-time, 2 minutes)

The database schema needs to be applied manually:

1. Go to: https://supabase.com/dashboard/project/gcsorjyxzyltzxpmaavt/sql/new
2. Copy the contents of `supabase/schema.sql`
3. Paste and click **Run**

That's it. Tables: `companies`, `employees`, `sessions` will be created with indexes and RLS policies.

---

## 2. API is live at:

```
https://honesthours-api.onrender.com
```

Test it:
```bash
curl https://honesthours-api.onrender.com/health
```

---

## 3. Install the Chrome Extension

1. Go to `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `extension/` folder
5. Click the ⏱ icon → **Set up profile**
6. Enter your name, employee ID, and company code

---

## 4. Use the Employer Dashboard

Open `dashboard.html` in a browser (or host it on any static host).

Or use the URL hash for bookmarks:
```
dashboard.html#YOUR-COMPANY-CODE
```

---

## 5. Alternative: Self-hosted schema migration

If you have the Supabase DB password (from Settings → Database):

```bash
cd supabase
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.gcsorjyxzyltzxpmaavt.supabase.co:5432/postgres?sslmode=require" \
npm install pg && node migrate.js
```
