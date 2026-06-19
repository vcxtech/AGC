#!/bin/bash
# Upload AGC media files to Supabase Storage (run on your Mac)
#
# Prerequisites:
#   1. Supabase project with Storage bucket "media" (public read)
#   2. Supabase CLI: brew install supabase/tap/supabase
#   3. Logged in: supabase login
#   4. Linked: supabase link --project-ref YOUR_REF
#
# Or use Dashboard: Storage → New bucket → name "media" → Public bucket ON
#
# Usage:
#   export SUPABASE_PROJECT_REF='your-project-ref'
#   export SUPABASE_ACCESS_TOKEN='sbp_...'   # from supabase.com/dashboard/account/tokens
#   bash scripts/supabase-upload-media.sh
#
# Alternative without CLI: use Supabase Dashboard → Storage → media → Upload folder

set -euo pipefail

BACKUP_TAR="${BACKUP_TAR:-$HOME/Downloads/agc-full-backup-agc-backup-20260619-122244.tar.gz}"
UPLOADS_PATH="agc-backup-20260619-122244/agc-media-uploads.tar.gz"
WORK_DIR="${WORK_DIR:-/tmp/agc-media-restore}"
BUCKET="${SUPABASE_MEDIA_BUCKET:-media}"

mkdir -p "$WORK_DIR"
cd "$WORK_DIR"

echo "==> Extracting uploads from backup..."
tar -xzf <(tar -xOf "$BACKUP_TAR" "$UPLOADS_PATH") -C "$WORK_DIR"
FILE_COUNT=$(find "$WORK_DIR/uploads" -type f | wc -l | tr -d ' ')
echo "    $FILE_COUNT files ready in $WORK_DIR/uploads"

if command -v supabase >/dev/null 2>&1 && [[ -n "${SUPABASE_PROJECT_REF:-}" ]]; then
  echo "==> Uploading via Supabase CLI to bucket: $BUCKET"
  supabase storage cp -r "$WORK_DIR/uploads" "ss:///$BUCKET/" --experimental 2>/dev/null || {
    echo "CLI upload failed — use Dashboard method below."
  }
else
  echo ""
  echo "=============================================="
  echo "MANUAL UPLOAD (no CLI / link yet)"
  echo "=============================================="
  echo "1. Supabase Dashboard → Storage → New bucket"
  echo "   Name: media | Public: ON"
  echo "2. Open bucket → Upload"
  echo "3. Upload ALL files from this folder on your Mac:"
  echo "   $WORK_DIR/uploads"
  echo ""
  echo "Or install CLI:"
  echo "   brew install supabase/tap/supabase"
  echo "   supabase login"
  echo "   supabase link --project-ref YOUR_REF"
  echo "   supabase storage cp -r $WORK_DIR/uploads ss:///$BUCKET/"
  echo "=============================================="
fi

echo ""
echo "Media metadata file: extract with:"
echo "  tar -xOf \"$BACKUP_TAR\" agc-backup-20260619-122244/agc-media-metadata.tar.gz | tar -xz -C /tmp"
echo ""
echo "NOTE: Until app code uses Supabase Storage URLs, Coolify site still serves /uploads/ paths."
echo "      For Vercel you will need a code update to read/write Supabase Storage."
