#!/bin/bash
# Run this ON YOUR MAC after the VPS backup script finishes.
#
# Usage:
#   bash scripts/download-backup-to-mac.sh YOUR_VPS_IP
#
# Example:
#   bash scripts/download-backup-to-mac.sh 31.97.57.75

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 VPS_IP [remote_tarball_path]"
  echo "Example: $0 31.97.57.75"
  exit 1
fi

VPS_IP="$1"
REMOTE_PATH="${2:-}"

DEST="$HOME/Downloads"
mkdir -p "$DEST"

if [[ -z "$REMOTE_PATH" ]]; then
  echo "==> Finding latest backup on server..."
  REMOTE_PATH=$(ssh "root@${VPS_IP}" 'ls -t /root/agc-full-backup-*.tar.gz 2>/dev/null | head -1')
  if [[ -z "$REMOTE_PATH" ]]; then
    echo "ERROR: No /root/agc-full-backup-*.tar.gz found on server."
    echo "Run scripts/coolify-export-backup.sh on the VPS first."
    exit 1
  fi
fi

LOCAL_FILE="$DEST/$(basename "$REMOTE_PATH")"
echo "==> Downloading $REMOTE_PATH → $LOCAL_FILE"
scp "root@${VPS_IP}:${REMOTE_PATH}" "$LOCAL_FILE"

echo ""
echo "Downloaded: $LOCAL_FILE"
echo "Size: $(du -h "$LOCAL_FILE" | cut -f1)"
echo ""
echo "Verify:"
echo "  tar -tzf \"$LOCAL_FILE\" | head"
