#!/bin/bash

# Script de Deploy - Execute no terminal da VPS
# Copie e cole tudo no terminal: ssh root@69.62.93.231

set -e

echo "========================================="
echo "DEPLOY - Yeapy Security Features"
echo "========================================="

# 1. Navegar para projeto
cd /root/yeapy
echo "✓ Diretório: $(pwd)"

# 2. Atualizar repositório
echo ""
echo "2. Fazendo git pull..."
git pull origin main
echo "✓ Git pull concluído"

# 3. Build
echo ""
echo "3. Fazendo npm build..."
npm run build
echo "✓ Build concluído"

# 4. Restart PM2
echo ""
echo "4. Restarting PM2 (zero-downtime)..."
pm2 reload yeapy --wait-ready
echo "✓ PM2 restarted"

# 5. Verificar status
echo ""
echo "5. Status do PM2:"
pm2 status

# 6. Testar site
echo ""
echo "6. Testando site..."
curl -s https://yeapy.shop/api/offers?limit=1 | jq '.count' > /dev/null
if [ $? -eq 0 ]; then
  echo "✓ Site está online!"
else
  echo "✗ Erro ao acessar site"
fi

echo ""
echo "========================================="
echo "✅ DEPLOY CONCLUÍDO COM SUCESSO!"
echo "========================================="
echo ""
echo "Próximos passos:"
echo "1. Adicionar ASAAS_WEBHOOK_SECRET em .env.local"
echo "2. Executar: pm2 reload yeapy --wait-ready"
echo "3. Testar endpoints de segurança"
echo ""
