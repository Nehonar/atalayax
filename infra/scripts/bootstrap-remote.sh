#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# AtalayaX · Bootstrap remoto
# Ejecutar desde J.A.R.V.I.S.:  bash infra/scripts/bootstrap-remote.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SSH_KEY="$HOME/ben/jutsu-key/jutsu-key.key"
SERVER="ubuntu@80.225.189.112"
REPO="https://github.com/nehonar/atalayax.git"
APP_DIR="/opt/atalayax"

# ── Verificar clave local ─────────────────────────────────────────────────────
if [ ! -f "$SSH_KEY" ]; then
  echo "❌ No encuentro la clave SSH en: $SSH_KEY"
  exit 1
fi
chmod 600 "$SSH_KEY"

echo "🔗 Conectando a $SERVER..."

ssh -i "$SSH_KEY" \
    -o StrictHostKeyChecking=no \
    -o ConnectTimeout=10 \
    "$SERVER" bash -s << ENDSSH
set -euo pipefail

echo ""
echo "════════════════════════════════════════════"
echo "  AtalayaX · Setup en el servidor"
echo "════════════════════════════════════════════"

# ── Sistema ────────────────────────────────────────────────────────────────
echo "▶ Actualizando paquetes..."
sudo apt-get update -y -q

# ── Docker ─────────────────────────────────────────────────────────────────
if ! command -v docker &>/dev/null; then
  echo "▶ Instalando Docker..."
  curl -fsSL https://get.docker.com | sudo sh -s -- -q
  sudo usermod -aG docker ubuntu
  echo "✓ Docker instalado"
else
  echo "✓ Docker ya instalado: \$(docker --version)"
fi

# ── Nginx ──────────────────────────────────────────────────────────────────
if ! command -v nginx &>/dev/null; then
  echo "▶ Instalando Nginx y Certbot..."
  sudo apt-get install -y -q nginx certbot python3-certbot-nginx
  sudo systemctl enable nginx
  sudo systemctl start nginx
  echo "✓ Nginx instalado"
else
  echo "✓ Nginx ya instalado"
fi

# ── Repositorio ────────────────────────────────────────────────────────────
sudo mkdir -p "$APP_DIR"
sudo chown ubuntu:ubuntu "$APP_DIR"

if [ -d "$APP_DIR/.git" ]; then
  echo "▶ Actualizando repositorio..."
  git -C "$APP_DIR" fetch origin master
  git -C "$APP_DIR" reset --hard origin/master
else
  echo "▶ Clonando repositorio..."
  git clone "$REPO" "$APP_DIR"
fi

cd "$APP_DIR"

# ── .env.production ────────────────────────────────────────────────────────
if [ ! -f ".env.production" ]; then
  cp .env.production.example .env.production
  SECRET=\$(openssl rand -hex 32)
  sed -i "s/CAMBIA_ESTO_POR_UN_SECRETO_LARGO_DE_64_CHARS/\$SECRET/" .env.production
  echo "✓ .env.production creado con SESSION_SECRET generado"
else
  echo "✓ .env.production ya existe, no se sobreescribe"
fi

# ── Nginx config ───────────────────────────────────────────────────────────
echo "▶ Configurando Nginx..."
sudo cp infra/nginx/atalayax.conf /etc/nginx/sites-available/atalayax.conf
sudo ln -sf /etc/nginx/sites-available/atalayax.conf /etc/nginx/sites-enabled/atalayax.conf
sudo nginx -t && sudo systemctl reload nginx
echo "✓ Nginx configurado"

# ── Firewall del sistema (iptables) ────────────────────────────────────────
echo "▶ Abriendo puertos en iptables..."
sudo iptables -C INPUT -p tcp --dport 443 -j ACCEPT 2>/dev/null || \
  sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo iptables -C INPUT -p tcp --dport 80 -j ACCEPT 2>/dev/null || \
  sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo sh -c "iptables-save > /etc/iptables/rules.v4" 2>/dev/null || true
echo "✓ Puertos abiertos"

# ── Docker Compose ─────────────────────────────────────────────────────────
echo "▶ Construyendo y arrancando contenedores (puede tardar 3-5 min)..."
sudo docker compose -f docker-compose.prod.yml up -d --build
echo "✓ Contenedores en marcha"

echo ""
echo "════════════════════════════════════════════"
echo "  ✅ Setup completado"
echo ""
echo "  🌍 Web (HTTP por ahora): http://atalayax.com"
echo "  🔌 API (HTTP por ahora): http://api.atalayax.com"
echo ""
echo "  Cuando los DNS de GoDaddy propaguen, activa SSL con:"
echo "  bash infra/scripts/ssl-setup.sh"
echo "════════════════════════════════════════════"
ENDSSH

echo ""
echo "✅ Proceso completado desde local."
echo "   Comprueba http://atalayax.com en el navegador."
echo ""
echo "   Cuando veas la web funcionando (puede tardar unos minutos en arrancar),"
echo "   ejecuta esto para activar HTTPS:"
echo "   bash infra/scripts/ssl-setup.sh"
