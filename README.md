# ScholarPath USA

U.S. university scholarship directory (React + Vite + Express + SQLite).

## Run
```
npm install --legacy-peer-deps
ADMIN_EMAIL=you@domain.com ADMIN_PASSWORD='a-long-password' npm run dev   # http://localhost:3000
npm run build && npm start                                               # production
```
Requires Node 22+ (uses `node:sqlite`). See `MONETIZATION_READINESS_REPORT.md` for the audit and the remaining owner tasks.
