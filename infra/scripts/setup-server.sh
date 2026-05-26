#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# AtalayaX · Setup inicial del servidor Oracle Cloud (Ubuntu 22.04 ARM64)
# Ejecutar UNA SOLA VEZ como ubuntu: bash setup-server.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

REPO_URL="https://github.com/nehonar/atalayax.git"
APP_DIR="/opt/atalayax"
DOMAIN="atalayax.com"
API_DOMAIN="api.atalayax.com"

echo "▶ Actualizando sistema..."
sudo apt-get update -y && sudo apt-get upgrade -y

# ── Docker ────────────────────────────────────────────────────────────────────
if ! command -v docker &>/dev/null; then
  echo "▶ Instalando Docker..."
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker "$USER"
  echo "✓ Docker instalado. IMPORTANTE: cierra sesión y vuelve a entrar antes de continuar."
  echo "  Luego ejecuta el script de nuevo."
  exit 0
fi
echo "✓ Docker ya instalado: $(docker --version)"

# ── Nginx + Certbot ───────────────────────────────────────────────────────────
echo "▶ Instalando Nginx y Certbot..."
sudo apt-get install -y nginx certbot python3-certbot-nginx git

sudo systemctl enable nginx
sudo systemctl start nginx

# ── Clonar repositorio ────────────────────────────────────────────────────────
echo "▶ Clonando repositorio en $APP_DIR..."
sudo mkdir -p "$APP_DIR"
sudo chown "$USER:$USER" "$APP_DIR"

if [ -d "$APP_DIR/.git" ]; then
  echo "  Repositorio ya existe, haciendo pull..."
  git -C "$APP_DIR" pull origin master
else
  git clone "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"

# ── Crear .env.production ─────────────────────────────────────────────────────
if [ ! -f ".env.production" ]; then
  cp .env.production.example .env.production
  # Generar SESSION_SECRET automáticamente
  SECRET=$(openssl rand -hex 32)
  sed -i "s/CAMBIA_ESTO_POR_UN_SECRETO_LARGO_DE_64_CHARS/$SECRET/" .env.production
  echo "✓ .env.production creado con SESSION_SECRET generado automáticamente."
  echo "  Edítalo si necesitas añadir SMTP u otros valores:"
  echo "  nano $APP_DIR/.env.production"
fi

# ── Nginx: configurar sitio ───────────────────────────────────────────────────
echo "▶ Configurando Nginx..."
sudo cp infra/nginx/atalayax.conf /etc/nginx/sites-available/atalayax.conf

# Activar el sitio solo si no está ya activo
if [ ! -L /etc/nginx/sites-enabled/atalayax.conf ]; then
  sudo ln -s /etc/nginx/sites-available/atalayax.conf /etc/nginx/sites-enabled/atalayax.conf
fi

sudo nginx -t && sudo systemctl reload nginx
echo "✓ Nginx configurado para $DOMAIN y $API_DOMAIN"

# ── Firewall Oracle Cloud ─────────────────────────────────────────────────────
echo "▶ Abriendo puertos en el firewall del sistema..."
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save 2>/dev/null || true
echo "  RECUERDA: abre también los puertos 80 y 443 en las Security Lists de Oracle Cloud."

# ── SSL con Let's Encrypt ─────────────────────────────────────────────────────
echo "▶ Obteniendo certificado SSL..."
echo "  Asegúrate de que los registros DNS de GoDaddy ya apuntan a esta IP antes de continuar."
read -rp "  ¿Los DNS están ya configurados? (s/n): " dns_ready
if [[ "$dns_ready" =~ ^[sS]$ ]]; then
  sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" -d "$API_DOMAIN" --non-interactive --agree-tos -m "admin@$DOMAIN"
  echo "✓ SSL configurado. Renovación automática activa."
else
  echo "  Salta el SSL por ahora. Cuando los DNS estén listos ejecuta:"
  echo "  sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN -d $API_DOMAIN"
fi

# ── Build y arranque de contenedores ─────────────────────────────────────────
echo "▶ Construyendo y arrancando contenedores Docker..."
docker compose -f docker-compose.prod.yml up -d --build

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  ✅ Setup completado"
echo "  Web:  https://$DOMAIN"
echo "  API:  https://$API_DOMAIN"
echo "  Logs: docker compose -f $APP_DIR/docker-compose.prod.yml logs -f"
echo "═══════════════════════════════════════════════════════════"
