#!/bin/bash
# Restore AGC PostgreSQL dump into Supabase (run on your Mac)
#
# Prerequisites:
#   1. Supabase project created
#   2. psql installed (brew install libpq)
#   3. Backup tarball in ~/Downloads/
#
# Usage:
#   export SUPABASE_DB_URL='postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres'
#   bash scripts/supabase-restore-database.sh
#
# Use the DIRECT connection string from Supabase:
#   Project Settings → Database → Connection string → URI → "Direct connection"
#   Host looks like: db.xxxxxxxxxxxx.supabase.co:5432

set -euo pipefail

BACKUP_TAR="${BACKUP_TAR:-$HOME/Downloads/agc-full-backup-agc-backup-20260619-122244.tar.gz}"
SQL_GZ_PATH="agc-backup-20260619-122244/agc-database.sql.gz"

if [[ -z "${SUPABASE_DB_URL:-}" ]]; then
  echo "ERROR: Set SUPABASE_DB_URL first."
  echo ""
  echo "  export SUPABASE_DB_URL='postgresql://postgres:YOUR_PASSWORD@db.YOUR_REF.supabase.co:5432/postgres'"
  echo "  bash scripts/supabase-restore-database.sh"
  exit 1
fi

if [[ ! -f "$BACKUP_TAR" ]]; then
  echo "ERROR: Backup not found: $BACKUP_TAR"
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
AGC_SITE="$REPO_ROOT/agc-site"

echo "==> Testing Supabase connection..."
psql "$SUPABASE_DB_URL" -c "SELECT version();" >/dev/null
echo "    Connected."

echo "==> Restoring database from backup (1–2 min)..."
# Strip pg_dump 16 \\restrict lines if Supabase Postgres is older
tar -xOf "$BACKUP_TAR" "$SQL_GZ_PATH" | gunzip \
  | grep -v '^\\restrict ' \
  | grep -v '^\\unrestrict ' \
  | psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 2>&1 | tail -30

echo "==> Running Prisma migrations (applies any schema newer than dump)..."
cd "$AGC_SITE"
DATABASE_URL="$SUPABASE_DB_URL" npx prisma migrate deploy

echo "==> Row counts (sanity check):"
psql "$SUPABASE_DB_URL" -t -c "
  SELECT 'events' AS t, COUNT(*) FROM events
  UNION ALL SELECT 'news', COUNT(*) FROM news
  UNION ALL SELECT 'page_content', COUNT(*) FROM page_content
  UNION ALL SELECT 'event_registrations', COUNT(*) FROM event_registrations
  UNION ALL SELECT 'contact_submissions', COUNT(*) FROM contact_submissions;
"

echo ""
echo "=============================================="
echo "DATABASE RESTORE COMPLETE"
echo "=============================================="
echo "Save these for Vercel later:"
echo "  DIRECT (migrations):  db.*.supabase.co:5432"
echo "  POOLED (runtime):   port 6543 + ?pgbouncer=true"
echo "Next: upload media — bash scripts/supabase-upload-media.sh"
echo "=============================================="
