# Deploying the FameSync frontend to Vercel

This is a Vite + React SPA. It is a static bundle — there is no server side,
no API routes and no serverless functions. Everything dynamic comes from the
Django API, which runs on EC2 (see `DEPLOYMENT.md` in `famesync-backend`).

`vercel.json` in this repo already pins the framework, the build command, the
output directory, the SPA rewrite and the cache/security headers, so the
dashboard does not need to be configured beyond the environment variables.

## 1. Import the project

1. vercel.com → **Add New** → **Project** → import `RIDAM7/famesync-frontend`.
2. Vercel reads `vercel.json` and fills in Framework **Vite**, build
   `npm run build`, output `dist`. Leave them as detected.
3. **Root Directory** stays `./`.
4. Do **not** deploy yet — add the environment variables first, or the build
   bakes in the localhost defaults.

## 2. Environment variables

Add these under **Settings → Environment Variables**. There are only two.

| Name | Environments | Value |
|---|---|---|
| `VITE_API_URL` | Production | `https://backend.famesync.com/api` |
| `VITE_API_URL` | Preview, Development | `https://backend.famesync.com/api` (there is no separate staging API; point previews at production, or at a staging host if you add one later) |
| `VITE_GOOGLE_CLIENT_ID` | Production, Preview, Development | the Web client ID from Google Cloud → Credentials, ending in `.apps.googleusercontent.com` |

Notes that matter:

- **Include the `/api` suffix and nothing after it.** The app derives the
  media origin by stripping a trailing `/api`, so `https://backend.famesync.com/api`
  yields `https://backend.famesync.com/media/...` for uploaded pictures. A value
  without `/api`, or with a trailing path, breaks image URLs.
- **No trailing slash** — `.../api`, not `.../api/`.
- **HTTPS only.** The Vercel site is HTTPS, so a plain-HTTP API URL is blocked
  as mixed content and every request fails.
- **`VITE_` variables are public.** Vite inlines them into the JavaScript
  bundle at build time, so anyone can read them in devtools. That is fine for
  these two (an API URL and a Google *client* ID are public by design). Never
  put a secret, an API key or a client *secret* behind a `VITE_` name.
- Changing a variable does not affect the running site until you **redeploy**;
  the value is compiled in, not read at runtime.

There is no `VITE_INSTAGRAM_SERVICE_URL` any more. Instagram OAuth is served
by the Django API, configured there with `INSTAGRAM_APP_ID`,
`INSTAGRAM_APP_SECRET` and `INSTAGRAM_REDIRECT_URI`.

## 3. Domains

**Settings → Domains** → add `famesync.com` and `www.famesync.com`, then point
DNS at Vercel:

| Record | Name | Value |
|---|---|---|
| `A` | `@` | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

Vercel shows the exact records for your domain — prefer what the dashboard
tells you over the table above if they differ. Certificates are issued
automatically once DNS resolves. Pick one canonical host and let Vercel
redirect the other (the usual choice is `famesync.com`, with `www`
redirecting to it).

## 4. Tell the backend about this origin

The SPA and the API are on different origins, so the API has to allow this
one. In the backend `.env` on EC2:

```bash
CORS_ALLOWED_ORIGINS=https://famesync.com,https://www.famesync.com
CSRF_TRUSTED_ORIGINS=https://famesync.com,https://www.famesync.com
FRONTEND_URL=https://famesync.com

# Optional: let Vercel preview deployments talk to the API too. The prefix
# must match your Vercel project name, which is what preview hostnames
# start with. This is the same value as in the backend's .env.example.
CORS_ALLOWED_ORIGIN_REGEXES=^https://famesync-[a-z0-9-]+\.vercel\.app$
```

Then `sudo systemctl restart gunicorn`. Skipping this is the single most
common cause of "the site loads but nothing works" — every API call fails CORS
preflight and the console fills with `No 'Access-Control-Allow-Origin'`.

Also add `https://famesync.com` to **Authorised JavaScript origins** for the
Google OAuth client, or the Google button fails with `origin_mismatch`.

## 5. Production branch

Vercel builds the repo's default branch as Production. Check
**Settings → Git → Production Branch** actually names the branch you intend to
ship; anything else you push becomes a Preview deployment with its own URL.

## 6. Verify

After the first deploy:

- [ ] Landing page renders with fonts and images.
- [ ] Hard-refresh a deep link such as `/pricing` — it must load, not 404.
      (That is the `vercel.json` rewrite doing its job.)
- [ ] Sign in. The Network tab should show calls to `backend.famesync.com`
      returning 200, not CORS errors.
- [ ] Upload a profile picture and confirm it renders — that exercises the
      media URL derived from `VITE_API_URL`.
- [ ] Click **Continue with Instagram**: it should call
      `/api/auth/instagram/start/` on your API and then redirect to
      `instagram.com`, landing back on `/auth/callback?code=...`.

## Notes on this repo

- **Two lockfiles are checked in** (`package-lock.json` and `bun.lockb`).
  Vercel picks bun when it sees `bun.lockb`, which can resolve a different
  dependency tree than the npm lockfile everything else here uses. Delete the
  one you do not want, or pin **Settings → Build → Install Command** to
  `npm ci`.
- `public/` is served at the site root, so `public/FameSync_QA_Testing_Checklist.md`
  is reachable at `https://famesync.com/FameSync_QA_Testing_Checklist.md`.
  Move it out of `public/` if that is not intended.
- The old S3 + CloudFront workflow was removed: it triggered on a `master`
  branch that does not exist, so it never ran, and it still injected the
  decommissioned Instagram microservice URL. Vercel replaces it.
