#!/bin/bash

# ========== CONFIGURAÇÕES ==========
FTP_HOST="ftp.seudominio.com"
FTP_USER="seuusuario@seudominio.com"
FTP_PASS="sua_senha"
LOCAL_DIR="dist"
REMOTE_DIR="public_html"

BACKEND_PORT_AUDIO=8010
BACKEND_PORT_TEXT=8000

# ========== FUNÇÃO: iniciar ngrok se necessário ==========
start_ngrok() {
  if ! pgrep -f "ngrok http $BACKEND_PORT_AUDIO" > /dev/null; then
    echo "🚀 Iniciando ngrok para porta $BACKEND_PORT_AUDIO..."
    nohup ngrok http $BACKEND_PORT_AUDIO > /dev/null 2>&1 &
    sleep 2
  else
    echo "✅ ngrok já está rodando"
  fi
}

# ========== FUNÇÃO: iniciar cloudflared se necessário ==========
start_cloudflared() {
  if ! pgrep -f "cloudflared tunnel" > /dev/null; then
    echo "🚀 Iniciando cloudflared para porta $BACKEND_PORT_TEXT..."
    nohup cloudflared tunnel --url http://localhost:$BACKEND_PORT_TEXT > cloudflared.log 2>&1 &
    sleep 3
  else
    echo "✅ cloudflared já está rodando"
  fi
}

gerar_env() {
  echo "🔍 Capturando endpoints..."

  NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url')
  CF_URL=$(grep -o 'https://.*\.trycloudflare\.com' cloudflared.log | head -n 1)

  if [[ -z "$NGROK_URL" || -z "$CF_URL" ]]; then
    echo "❌ Erro ao obter os URLs dos túneis"
    exit 1
  fi

  echo "🌐 ngrok: $NGROK_URL"
  echo "🌐 cloudflared: $CF_URL"

  cat <<EOF > .env.production
VITE_API_AUDIO_URL=$NGROK_URL/audio-inference/
VITE_API_TEXT_URL=$CF_URL/inference/
EOF

  echo "✅ .env.production atualizado!"
}

# ========== FUNÇÃO: build do frontend ==========
build_front() {
  echo "📦 Gerando build do frontend..."
  npm run build
}

# ========== FUNÇÃO: deploy via FTP ==========
deploy_ftp() {
  echo "📤 Subindo para Hostinger via FTP..."
  lftp -c "
  open -u $FTP_USER,$FTP_PASS $FTP_HOST
  lcd $LOCAL_DIR
  cd $REMOTE_DIR
  mirror --reverse --delete --verbose
  "
  echo "🎉 Deploy finalizado em https://seudominio.com"
}

# ========== EXECUÇÃO COMPLETA ==========
start_ngrok
start_cloudflared
gerar_env
build_front
deploy_ftp
