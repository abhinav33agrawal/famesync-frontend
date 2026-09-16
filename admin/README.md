# FameSync Admin

The staff-only admin panel, deployed separately from the public site at
`admin.famesync.com`.

It is a standalone Vite app rather than a route inside the main site, so the
admin bundle is never shipped to ordinary visitors and the two deploys can be
rolled independently.

## Local development

```bash
cd frontend/admin
npm install
cp .env.example .env     # points at http://localhost:8000/api
npm run dev              # http://localhost:5174
```

`npm run build` type-checks with `tsc --noEmit` before bundling, so a type
error fails the build rather than shipping.

## Deploying to Vercel

Create a **second Vercel project** from the same `famesync-frontend`
repository — the existing project keeps serving `famesync.com`.

| Setting | Value |
| --- | --- |
| Root Directory | `admin` |
| Framework Preset | Vite |
| Build Command | `npm run build` (default) |
| Output Directory | `dist` (default) |
| Install Command | `npm install` (default) |

Then add `admin.famesync.com` under **Settings → Domains** and create the DNS
record Vercel shows you at Hostinger (a `CNAME` on `admin` pointing at
`cname.vercel-dns.com`).

`VITE_API_URL` is already committed in `.env.production`, so no environment
variable is required. Set one in the Vercel dashboard only to override it —
for example to point a preview deployment at a staging API.

## The backend must allow this origin

The API rejects cross-origin requests from anywhere not in
`CORS_ALLOWED_ORIGINS`. Until `https://admin.famesync.com` is added to the
backend `.env` **and gunicorn is restarted**, every request from this panel
fails in the CORS preflight and the panel shows a network error with nothing
useful in it. See the repository root `DEPLOYMENT.md`.

## Access control

There is no separate admin login. The panel signs in against the normal
`/api/auth/login/` endpoint and then calls an admin endpoint to establish
whether the account is staff — `/auth/me/` deliberately does not expose
`is_staff`, so asking the server is the only honest check. A non-staff account
authenticates successfully and is then rejected with a clear message.

Grant access by setting `is_staff` on the user:

```bash
cd /home/ubuntu/famesync-backend && .venv/bin/python manage.py shell -c "
from core.models import User
u = User.objects.get(email='someone@example.com')
u.is_staff = True
u.save()
print('granted:', u.username)
"
```

Tokens are stored under `famesync_admin_tokens`, distinct from the main site's
`famee_tokens`, so the two apps do not fight over a session during local
development on `localhost`.

## What is covered

| Page | Endpoints |
| --- | --- |
| Dashboard | `dashboard/stats/` |
| Approvals | `approvals/pending/`, `approvals/bulk-approve/`, `approvals/bulk-reject/` |
| Users | `users/`, `users/<id>/approve/`, `users/<id>/suspend/`, `users/<id>/adjust-credits/`, `PATCH users/<id>/` |
| Campaigns | `campaigns/`, `campaigns/<id>/force-close/` |
| Financial | `financial/metrics/` |
| Analytics | `analytics/` |
| Notifications | `notifications/broadcast/` |
| Audit log | `audit-logs/` |

`admin_api` exposes more than this — per-user activity, applications, payment
history, subscription detail, and CRUD for categories, cities, niches and
decline reasons. Those endpoints work; they simply have no screen yet.

## Notes on the numbers

Revenue is not real. `admin_api/views.py` computes MRR and lifetime revenue as
a flat ₹2,500 per active subscription, so both figures are a subscription
count wearing a currency symbol, not settled Razorpay revenue. The Financial
and Dashboard pages say so on screen — keep that caveat if you touch them.

DAU and MAU come from `last_login`, so a user who stays signed in for a month
without logging in again is not counted as active.
