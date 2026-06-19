# Deploy AGC to Vercel + Supabase

Use this after Coolify backup, Supabase DB restore, and media upload to Storage.

## 1. Upload `media-library.json` (one-time)

Admin and `media-xxx` IDs need the metadata file on Supabase:

```bash
tar -xOf ~/Downloads/agc-full-backup-agc-backup-20260619-122244.tar.gz \
  agc-backup-20260619-122244/agc-media-metadata.tar.gz \
  | tar -xz -O media-library.json > /tmp/media-library.json
```

Supabase → **Storage** → **media** bucket → **Upload** `media-library.json` at the **bucket root** (not inside `uploads/`).

## 2. Create Vercel project

1. [vercel.com](https://vercel.com) → **Add New** → **Project**
2. Import GitHub repo **`wastwagon/AGC`**
3. **Root Directory:** `agc-site` → Edit → set to `agc-site`
4. **Framework:** Next.js (auto)
5. **Build Command:** `npx prisma generate && npm run build`
6. **Install Command:** `npm ci`

Do **not** deploy yet — add env vars first.

## 3. Environment variables (Vercel → Settings → Environment Variables)

Set for **Production**, **Preview**, and **Development**:

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | Supabase **Transaction pooler** URI, port **6543**, append `?pgbouncer=true` |
| `NEXT_PUBLIC_SITE_URL` | Preview: `https://YOUR-PROJECT.vercel.app` — later `https://www.africagovernancecentre.org` |
| `AUTH_SECRET` | `openssl rand -base64 32` (same as Coolify or new) |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login password |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://qlvsxrrlalxhiocdzmku.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET` | `media` |
| `RESEND_API_KEY` | From Resend (optional but recommended) |
| `RESEND_FROM_EMAIL` | Verified sender |

### `DATABASE_URL` example (Transaction pooler)

From Supabase **Connect** → **Transaction pooler** → URI:

```text
postgresql://postgres.qlvsxrrlalxhiocdzmku:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

Migrations were already applied during restore. Re-run only when new migration files ship:

```bash
DATABASE_URL='...session pooler 5432...' npx prisma migrate deploy
```

## 4. Deploy

Click **Deploy**. First build takes ~3–5 minutes.

## 5. Test preview URL

| Check | URL |
|-------|-----|
| Home | `/` |
| News | `/news` |
| Admin login | `/admin/login` |
| Image | View page source — images should use `supabase.co/storage/...` |

## 6. Custom domain (after UAT)

1. Vercel → **Settings** → **Domains** → add `www.africagovernancecentre.org` and apex if needed
2. Update DNS at your registrar (remove Coolify A record when ready)
3. Set `NEXT_PUBLIC_SITE_URL` to `https://www.africagovernancecentre.org`
4. **Redeploy**

## 7. Coolify cutover

1. Run full UAT on Vercel preview
2. Lower DNS TTL
3. Point domain to Vercel
4. Keep Coolify running 7–14 days as rollback
5. Stop Coolify app when confident

## Limits on Vercel (vs Coolify)

| Feature | Vercel | Notes |
|---------|--------|--------|
| Public pages + DB | Works | Supabase Postgres |
| Images / PDFs | Works | Via Supabase Storage URLs |
| Admin media **upload** | Limited | New uploads need Supabase Storage API (future) — use Coolify admin until then, or upload via Supabase Dashboard |
| Redis rate limit | Optional | Add Upstash Redis + `REDIS_URL`, or use in-memory |

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails on Prisma | Ensure `DATABASE_URL` is set; use pooler `6543` + `pgbouncer=true` |
| Admin login fails | Check `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` |
| Images 404 | Confirm files in `media/uploads/` and `media-library.json` at bucket root |
| DB connection error | Reset Supabase password; update `DATABASE_URL` |
