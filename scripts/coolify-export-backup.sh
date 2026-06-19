#!/bin/bash
# Export AGC database + media from Coolify (run ON THE VPS or in Coolify Terminal)
#
# Usage (on server):
#   bash coolify-export-backup.sh
#
# Optional overrides if container names change after redeploy:
#   DB_CONTAINER=agc-db-xxx WEB_CONTAINER=web-xxx bash coolify-export-backup.sh

set -euo pipefail

# From Coolify Logs tab (update after redeploy if names change)
DB_CONTAINER="${DB_CONTAINER:-agc-db-ug8wkck8ckc00oow0wkggc48-112418037736}"
WEB_CONTAINER="${WEB_CONTAINER:-web-ug8wkck8ckc00oow0wkggc48-112418007826}"

BACKUP_DIR="${BACKUP_DIR:-/root/agc-backup-$(date +%Y%m%d-%H%M%S)}"
mkdir -p "$BACKUP_DIR"
cd "$BACKUP_DIR"

echo "==> Backup folder: $BACKUP_DIR"
echo "==> DB container:  $DB_CONTAINER"
echo "==> Web container: $WEB_CONTAINER"
echo ""

if ! docker ps --format '{{.Names}}' | grep -qx "$DB_CONTAINER"; then
  echo "ERROR: DB container not running: $DB_CONTAINER"
  echo "Open Coolify → Logs and copy the current agc-db-... name, then:"
  echo "  DB_CONTAINER=agc-db-NEWNAME bash $0"
  exit 1
fi

if ! docker ps --format '{{.Names}}' | grep -qx "$WEB_CONTAINER"; then
  echo "ERROR: Web container not running: $WEB_CONTAINER"
  echo "Open Coolify → Logs and copy the current web-... name, then:"
  echo "  WEB_CONTAINER=web-NEWNAME bash $0"
  exit 1
fi

echo "==> 1/3 Exporting PostgreSQL database..."
docker exec "$DB_CONTAINER" pg_dump -U agc -d agc --no-owner --no-acl | gzip > agc-database.sql.gz
gzip -t agc-database.sql.gz
echo "    OK: agc-database.sql.gz ($(du -h agc-database.sql.gz | cut -f1))"

echo "==> 2/3 Exporting media uploads..."
docker exec "$WEB_CONTAINER" tar -czf - -C /app/public uploads > agc-media-uploads.tar.gz
echo "    OK: agc-media-uploads.tar.gz ($(du -h agc-media-uploads.tar.gz | cut -f1))"
echo "    Files: $(tar -tzf agc-media-uploads.tar.gz | wc -l | tr -d ' ') paths in archive"

echo "==> 3/3 Exporting media library metadata..."
docker exec "$WEB_CONTAINER" tar -czf - -C /app/data media-library.json > agc-media-metadata.tar.gz
echo "    OK: agc-media-metadata.tar.gz ($(du -h agc-media-metadata.tar.gz | cut -f1))"

TARBALL="/root/agc-full-backup-$(basename "$BACKUP_DIR").tar.gz"
tar -czf "$TARBALL" -C "$(dirname "$BACKUP_DIR")" "$(basename "$BACKUP_DIR")"

echo ""
echo "=============================================="
echo "BACKUP COMPLETE"
echo "=============================================="
echo "Folder:   $BACKUP_DIR"
echo "Bundle:   $TARBALL"
echo ""
echo "Download to your Mac (run ON YOUR MAC, replace IP):"
echo "  scp root@YOUR_VPS_IP:$TARBALL ~/Downloads/"
echo ""
echo "Or download the folder:"
echo "  scp -r root@YOUR_VPS_IP:$BACKUP_DIR ~/Downloads/"
echo "=============================================="
