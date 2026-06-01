#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# AtalayaX · Activar SSL con Let's Encrypt
# Ejecutar desde J.A.R.V.I.S. DESPUÉS de que los DNS estén propagados:
#   bash infra/scripts/ssl-setup.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SSH_KEY="$REPO_ROOT/secrets/jutsu-key.key"
SERVER="ubuntu@80.225.189.112"

chmod 600 "$SSH_KEY"

echo "🔒 Activando SSL en el servidor..."

ssh -i "$SSH_KEY" \
    -o StrictHostKeyChecking=no \
    "$SERVER" bash -s << 'ENDSSH'
set -euo pipefail

echo "▶ Solicitando certificado SSL a Let's Encrypt..."
sudo certbot --nginx \
  -d atalayax.com \
  -d www.atalayax.com \
  -d api.atalayax.com \
  --non-interactive \
  --agree-tos \
  --email admin@atalayax.com \
  --redirect

echo "✓ SSL activado. Renovación automática ya configurada."
echo ""
echo "  🌍 https://atalayax.com"
echo "  🔌 https://api.atalayax.com"
ENDSSH

echo ""
echo "✅ HTTPS activado. Abre https://atalayax.com"
