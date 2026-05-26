#!/bin/bash

# SUPER SAFE DEPLOYMENT - Execute no VPS
# Cada etapa é independente com verificação real

set -e

echo "════════════════════════════════════════════════════"
echo "🛡️ DEPLOY SUPER SEGURO COM BACKUP REAL"
echo "════════════════════════════════════════════════════"

cd /root/yeapy

# ─────────────────────────────────────────────────────
# Etapa 1: Fazer backup REAL (cópia física completa)
# ─────────────────────────────────────────────────────
echo ""
echo "1️⃣ Fazendo backup da versão atual..."
BACKUP_DIR="/root/yeapy.backup.$(date +%Y%m%d_%H%M%S)"
cp -r /root/yeapy "$BACKUP_DIR"
echo "✅ Backup criado em: $BACKUP_DIR"

# ─────────────────────────────────────────────────────
# Etapa 2: Trazer código novo
# ─────────────────────────────────────────────────────
echo ""
echo "2️⃣ Buscando código novo..."
if ! git pull origin main; then
  echo "❌ ERRO ao fazer git pull!"
  echo "Restaurando backup..."
  rm -rf /root/yeapy
  mv "$BACKUP_DIR" /root/yeapy
  echo "✅ Backup restaurado"
  exit 1
fi
echo "✅ Código novo baixado"

# ─────────────────────────────────────────────────────
# Etapa 3: Testar build ANTES de reiniciar
# ─────────────────────────────────────────────────────
echo ""
echo "3️⃣ Testando compilação..."
if ! npm run build; then
  echo "❌ ERRO na compilação!"
  echo "Restaurando backup..."
  rm -rf /root/yeapy
  mv "$BACKUP_DIR" /root/yeapy
  echo "✅ Backup restaurado"
  exit 1
fi
echo "✅ Compilação passou"

# ─────────────────────────────────────────────────────
# Etapa 4: Restart PM2 com zero downtime
# ─────────────────────────────────────────────────────
echo ""
echo "4️⃣ Reiniciando PM2 (zero downtime)..."
if ! pm2 reload yeapy --wait-ready; then
  echo "❌ ERRO ao reiniciar PM2!"
  echo "Restaurando backup..."
  rm -rf /root/yeapy
  mv "$BACKUP_DIR" /root/yeapy
  cd /root/yeapy
  npm run build > /dev/null 2>&1
  pm2 reload yeapy --wait-ready
  echo "✅ Backup restaurado"
  exit 1
fi
echo "✅ PM2 reiniciado"

# ─────────────────────────────────────────────────────
# Etapa 5: Aguardar site voltar
# ─────────────────────────────────────────────────────
echo ""
echo "5️⃣ Aguardando site ficar pronto..."
sleep 3

# ─────────────────────────────────────────────────────
# Etapa 6: Verificar se site está REALMENTE online
# ─────────────────────────────────────────────────────
echo ""
echo "6️⃣ Verificando se site está online..."
MAX_ATTEMPTS=5
ATTEMPT=1

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
  RESPONSE=$(curl -s -w "\n%{http_code}" https://yeapy.shop/api/offers?limit=1)
  HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)

  if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Site está online (HTTP 200)"
    break
  else
    echo "⚠️  Tentativa $ATTEMPT/$MAX_ATTEMPTS - HTTP $HTTP_CODE"
    if [ $ATTEMPT -lt $MAX_ATTEMPTS ]; then
      sleep 2
    fi
  fi
  ATTEMPT=$((ATTEMPT + 1))
done

# ─────────────────────────────────────────────────────
# Etapa 7: Decisão final
# ─────────────────────────────────────────────────────
if [ "$HTTP_CODE" = "200" ]; then
  echo ""
  echo "════════════════════════════════════════════════════"
  echo "✅ DEPLOY SUCESSO!"
  echo "════════════════════════════════════════════════════"
  echo ""
  echo "✓ Código novo em produção"
  echo "✓ Site está 100% online"
  echo "✓ Zero downtime"
  echo ""
  echo "Versão: $(git rev-parse --short HEAD)"
  echo "Timestamp: $(date)"
  echo ""

  # Limpar backup (não precisa mais)
  rm -rf "$BACKUP_DIR"
  echo "✓ Backup de segurança apagado"
  exit 0
else
  echo ""
  echo "════════════════════════════════════════════════════"
  echo "❌ SITE NÃO RESPONDEU! FAZENDO ROLLBACK!"
  echo "════════════════════════════════════════════════════"
  echo ""

  # Restaurar backup
  echo "Restaurando versão anterior..."
  rm -rf /root/yeapy
  mv "$BACKUP_DIR" /root/yeapy

  cd /root/yeapy
  echo "Compilando versão anterior..."
  npm run build > /dev/null 2>&1

  echo "Reiniciando PM2 com versão anterior..."
  pm2 reload yeapy --wait-ready > /dev/null 2>&1

  sleep 3

  # Verificar se rollback funcionou
  ROLLBACK_RESPONSE=$(curl -s -w "\n%{http_code}" https://yeapy.shop/api/offers?limit=1)
  ROLLBACK_CODE=$(echo "$ROLLBACK_RESPONSE" | tail -n 1)

  if [ "$ROLLBACK_CODE" = "200" ]; then
    echo "✅ Rollback bem-sucedido!"
    echo "✓ Versão anterior está online"
    echo ""
    echo "Problema: Deploy novo deixou site offline"
    echo "Solução: Volta para versão anterior"
    exit 1
  else
    echo "❌ CRÍTICO! Rollback FALHOU e site está offline!"
    echo "Precisa intervenção manual!"
    exit 1
  fi
fi
