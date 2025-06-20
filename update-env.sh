#!/bin/bash

echo "🔍 Capturando endpoints..."

NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url')
CF_URL=$(ps aux | grep cloudflared | grep -o 'https://.*\.trycloudflare\.com' | head -n 1)

if [[ -z "$NGROK_URL" || -z "$CF_URL" ]]; then
  echo "❌ Erro ao encontrar URLs do ngrok ou cloudflared!"
  exit 1
fi

echo "🌐 ngrok: $NGROK_URL"
echo "🌐 cloudflared: $CF_URL"

cat <<EOF > .env.production
VITE_API_AUDIO_URL=$NGROK_URL/audio-inference/
VITE_API_TEXT_URL=$CF_URL/inference/
EOF

echo "✅ .env.production criado!"
