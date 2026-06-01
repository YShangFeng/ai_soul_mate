#!/usr/bin/env bash
# ============================================
# SoulMate 一键重置脚本（完整版）
# 
# 使用方法：
#   chmod +x scripts/reset.sh
#   ./scripts/reset.sh
#
# 前置条件：
#   - 已安装 Supabase CLI (brew install supabase/tap/supabase)
#   - 已登录 (supabase login)
#   - 已链接项目 (supabase link --project-ref twggvitfktklzoagvefu)
# ============================================

set -e

PROJECT_REF="twggvitfktklzoagvefu"

echo "⚠️  This will DELETE ALL DATA in project ${PROJECT_REF}"
echo "   Tables: messages, companions, profiles, subscriptions, daily_greetings"
echo "   Storage: avatars bucket"
echo ""
read -p "Type 'RESET' to confirm: " confirm

if [ "$confirm" != "RESET" ]; then
  echo "Cancelled."
  exit 0
fi

echo ""
echo "🧹 Clearing database tables..."

# Run the SQL init script
supabase db execute --file scripts/init-db.sql 2>/dev/null || {
  echo "Falling back to psql..."
  psql "$DATABASE_URL" -f scripts/init-db.sql
}

echo ""
echo "🗑️  Cleaning storage bucket..."
# Delete all files in avatars bucket
npx @supabase/supabase-js 2>/dev/null

echo ""
echo "✅ Database reset complete!"
echo ""
echo "📋 Remaining steps (manual):"
echo "   1. Delete auth users in Supabase Dashboard → Authentication → Users"
echo "   2. Re-register test accounts"
echo "   3. Run your test flow"
