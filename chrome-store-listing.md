# Chrome Web Store Listing — Honest Hours

## Store Listing Copy

### Name
**Honest Hours**

### Short Description (132 chars max)
```
Free time tracking for SMEs. See who's working, who's idle, updated every 5 minutes. No micromanagement required.
```
*(114 characters — within limit)*

### Category
**Productivity**

### Full Description

```
Know when your team is actually working — without surveillance.

Honest Hours is a free Chrome extension for small and medium businesses. It tracks when your employees are active and idle at their computers, syncing a status update every 5 minutes to a live dashboard you can check any time.

No screenshots. No keystroke logging. No website monitoring. Just honest, transparent time tracking.

━━━━━━━━━━━━━━━━━━━━━━━━━
HOW IT WORKS
━━━━━━━━━━━━━━━━━━━━━━━━━

1. Install this extension on each team member's browser (one click, no IT needed)
2. Each person enters their name and your company code in the extension settings
3. They click "Clock In" when their workday starts
4. The extension automatically tracks active vs idle time
5. You see real-time status in your team dashboard at https://honesthours.io/dashboard

━━━━━━━━━━━━━━━━━━━━━━━━━
KEY FEATURES
━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 IDLE DETECTION
The extension detects when there's no keyboard or mouse activity for 5 minutes and marks the employee as idle. When they return, it resumes tracking active time automatically.

⏱ 5-MINUTE HEARTBEAT SYNC
A status update is sent to your dashboard every 5 minutes. You don't have to wait until end of day — you can see who's working right now.

👥 TEAM DASHBOARD
One simple view showing every team member: who's clocked in, who's idle, who's clocked out, and their total active hours today.

🔒 PRIVACY-FIRST DESIGN
Honest Hours tracks activity state only — not what you're doing. No website history. No app monitoring. No keystrokes. Employees see exactly what's being tracked. Full transparency.

⚡ ZERO SETUP HASSLE
No server to configure, no company account to create, no IT department needed. Install → enter your name and company code → clock in. That's it.

━━━━━━━━━━━━━━━━━━━━━━━━━
WHO IS IT FOR?
━━━━━━━━━━━━━━━━━━━━━━━━━

Honest Hours is built for:
• Remote and hybrid SME teams (2–10 people)
• Managers who need visibility without micromanaging
• Businesses trialling remote work policies
• Freelancers who want to track their own billable hours

━━━━━━━━━━━━━━━━━━━━━━━━━
PRICING
━━━━━━━━━━━━━━━━━━━━━━━━━

Free for teams up to 10. No credit card. No trial expiry. Just install and go.

━━━━━━━━━━━━━━━━━━━━━━━━━
BUILT BY INSTALLSMART.AI
━━━━━━━━━━━━━━━━━━━━━━━━━

Honest Hours is a free tool from InstallSmart.AI — the independent AI advisory firm for London SMEs. We build practical tools to show what modern software can do for small businesses.

Support: sat@installsmart.ai
Website: https://honesthours.io
Privacy Policy: https://honesthours.io/privacy.html
```

---

## Screenshots Needed (take manually)

### Screenshot 1 — Extension Popup (Clocked In, Active State)
- Show the popup with an employee name visible
- Status badge: "Active" (green)
- Hours display showing e.g. "3:42"
- Clock Out button visible
- Size: 1280×800 or 640×400

### Screenshot 2 — Extension Popup (Idle State)
- Same popup but status badge showing "Idle" (amber)
- Shows idle detection is working
- Size: 1280×800 or 640×400

### Screenshot 3 — Team Dashboard
- Open `dashboard.html` in browser
- Multiple team members visible
- Mix of active/idle/clocked-out statuses
- Shows the real-time data view
- Size: 1280×800

### Screenshot 4 — Options / Setup Page
- The `options.html` page with name and company code fields filled in
- Shows how easy setup is
- Size: 1280×800

### Screenshot 5 — Landing Page Hero
- Screenshot of https://s7ssl.github.io/honesthours/ or honesthours.io
- Shows the brand and value prop
- Size: 1280×800

---

## Store Assets Checklist

- [ ] 128×128 icon (extension/icons/icon128.png) ✅
- [ ] 440×280 promotional tile (create separately — dark bg, green logo)
- [ ] 920×680 large promotional image (optional but recommended)
- [ ] 5 screenshots (see above)
- [ ] Privacy policy URL: https://honesthours.io/privacy.html

---

## Developer Account Note

⚠️ **Action required from Sat:**
Google Chrome Web Store requires a **one-time $5 developer registration fee**.

Register at: https://chrome.google.com/webstore/devconsole

Steps:
1. Sign in with a Google account (use sat@installsmart.ai or a dedicated account)
2. Pay the $5 one-time fee
3. Accept the Developer Agreement
4. You can then upload the extension ZIP

---

## Packing the Extension

To create the ZIP for upload:
```bash
cd honesthours/extension
zip -r ../honesthours-extension-v1.0.0.zip . --exclude "*.DS_Store"
```

Upload the ZIP at: https://chrome.google.com/webstore/devconsole
