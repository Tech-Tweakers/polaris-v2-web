#!/bin/bash

# CONFIGURAÇÕES FTP
HOST="ftp://antiquewhite-goose-179199.hostingersite.com"
USER="u819566643.antiquewhite-goose-179199.hostingersite.com"
PASS="181899"
LOCAL_DIR="dist"
REMOTE_DIR="public_html"

# BUILD DO FRONT
echo "📦 Gerando build do frontend..."
npm run build

echo "📤 Subindo para Hostinger via FTP..."
lftp -c "
open -u $USER,$PASS $HOST
lcd $LOCAL_DIR
cd $REMOTE_DIR
mirror --reverse --delete --verbose
"

echo "🚀 Deploy finalizado em https://seudominio.com"
