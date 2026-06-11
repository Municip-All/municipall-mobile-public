#!/usr/bin/env bash
# Restaure les fichiers après diagnostic crash
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ -f debug-backup/_layout.full.tsx ]]; then
  mv debug-backup/_layout.full.tsx app/_layout.tsx
fi
if [[ -f debug-backup/index.full.tsx ]]; then
  mv debug-backup/index.full.tsx app/index.tsx
fi
if [[ -f debug-backup/home.full.tsx ]]; then
  mv debug-backup/home.full.tsx app/home.tsx
fi
if [[ -f app/_carte.tsx ]] && [[ ! -f app/carte.tsx ]]; then
  mv app/_carte.tsx app/carte.tsx
fi

echo "Fichiers restaurés."
