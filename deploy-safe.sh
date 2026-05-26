#!/bin/bash

# Safe Deployment Script with Auto-Rollback
# Execute: bash deploy-safe.sh

set -e

echo "════════════════════════════════════════════"
echo "🚀 SAFE DEPLOYMENT WITH AUTO-ROLLBACK"
echo "════════════════════════════════════════════"

cd /root/yeapy

# ────────────────────────────────────────────────
# Step 1: Backup current version
# ────────────────────────────────────────────────
echo ""
echo "📦 Step 1: Creating backup..."
BACKUP_DIR="/root/yeapy-backup-$(date +%s)"
cp -r . "$BACKUP_DIR"
echo "✓ Backup created: $BACKUP_DIR"

# ────────────────────────────────────────────────
# Step 2: Get latest code
# ────────────────────────────────────────────────
echo ""
echo "📥 Step 2: Getting latest code..."
git fetch origin main
CURRENT_COMMIT=$(git rev-parse HEAD)
LATEST_COMMIT=$(git rev-parse origin/main)

if [ "$CURRENT_COMMIT" = "$LATEST_COMMIT" ]; then
  echo "⚠️  Already on latest version"
  echo "No deployment needed"
  rm -rf "$BACKUP_DIR"
  exit 0
fi

echo "Current: $CURRENT_COMMIT"
echo "Latest:  $LATEST_COMMIT"
git pull origin main
echo "✓ Code updated"

# ────────────────────────────────────────────────
# Step 3: Build test
# ────────────────────────────────────────────────
echo ""
echo "🔨 Step 3: Testing build..."
if ! npm run build > /tmp/build.log 2>&1; then
  echo "❌ BUILD FAILED! Rolling back..."
  cd /
  rm -rf /root/yeapy
  mv "$BACKUP_DIR" /root/yeapy
  cd /root/yeapy
  echo "✓ Rolled back to previous version"
  echo "Build error:"
  tail -20 /tmp/build.log
  exit 1
fi
echo "✓ Build successful"

# ────────────────────────────────────────────────
# Step 4: Restart PM2 (zero-downtime)
# ────────────────────────────────────────────────
echo ""
echo "🔄 Step 4: Restarting PM2..."
if ! pm2 reload yeapy --wait-ready > /tmp/pm2-reload.log 2>&1; then
  echo "❌ PM2 RELOAD FAILED! Rolling back..."
  cd /
  rm -rf /root/yeapy
  mv "$BACKUP_DIR" /root/yeapy
  cd /root/yeapy
  npm run build > /dev/null 2>&1
  pm2 reload yeapy --wait-ready > /dev/null 2>&1
  echo "✓ Rolled back to previous version"
  echo "PM2 error:"
  cat /tmp/pm2-reload.log
  exit 1
fi
echo "✓ PM2 reloaded"

# ────────────────────────────────────────────────
# Step 5: Verify deployment
# ────────────────────────────────────────────────
echo ""
echo "🔍 Step 5: Verifying deployment..."

# Wait for site to be ready
sleep 2

HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" https://yeapy.shop/api/offers?limit=1)

if [ "$HEALTH_CHECK" = "200" ]; then
  echo "✓ Site is online (HTTP 200)"
  echo ""
  echo "════════════════════════════════════════════"
  echo "✅ DEPLOYMENT SUCCESSFUL!"
  echo "════════════════════════════════════════════"
  echo ""
  echo "Deployed version: $(git rev-parse --short HEAD)"
  echo "Timestamp: $(date)"
  echo ""

  # Cleanup backup
  rm -rf "$BACKUP_DIR"
  echo "✓ Backup cleaned up"
  exit 0
else
  echo "❌ SITE OFFLINE! (HTTP $HEALTH_CHECK)"
  echo "Rolling back to previous version..."

  # Rollback
  cd /
  rm -rf /root/yeapy
  mv "$BACKUP_DIR" /root/yeapy
  cd /root/yeapy

  # Rebuild previous version
  npm run build > /dev/null 2>&1
  pm2 reload yeapy --wait-ready > /dev/null 2>&1

  # Wait for restart
  sleep 2

  # Verify rollback worked
  ROLLBACK_CHECK=$(curl -s -o /dev/null -w "%{http_code}" https://yeapy.shop/api/offers?limit=1)

  if [ "$ROLLBACK_CHECK" = "200" ]; then
    echo "✓ Rolled back successfully"
    echo ""
    echo "════════════════════════════════════════════"
    echo "⚠️  DEPLOYMENT ROLLED BACK"
    echo "════════════════════════════════════════════"
    echo ""
    echo "Issue: Site went offline after deployment"
    echo "Action: Automatically rolled back to previous version"
    echo "Status: Previous version is online"
    exit 1
  else
    echo "❌ CRITICAL: Rollback failed and site is offline!"
    echo "Manual intervention needed!"
    exit 1
  fi
fi
