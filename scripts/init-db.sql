-- ============================================
-- SoulMate 数据库初始化脚本
-- 执行前请确认：这会清空所有用户数据！
-- 
-- 使用方法：
--   1. Supabase Dashboard → SQL Editor
--   2. 粘贴此脚本 → Run
--
-- 或者命令行：
--   psql "postgresql://postgres:YOUR_PASSWORD@db.twggvitfktklzoagvefu.supabase.co:5432/postgres" -f init-db.sql
-- ============================================

BEGIN;

-- 1. 清空用户内容表（按外键依赖顺序）
TRUNCATE TABLE messages CASCADE;
TRUNCATE TABLE companions CASCADE;
TRUNCATE TABLE profiles CASCADE;
TRUNCATE TABLE subscriptions CASCADE;
TRUNCATE TABLE daily_greetings CASCADE;

-- 2. 重置自增序列（如果有）
-- (Supabase 表通常用 UUID 做主键，不需要重置序列)

-- 3. 验证数据已清空
SELECT 'messages' AS table_name, COUNT(*) AS remaining FROM messages
UNION ALL
SELECT 'companions', COUNT(*) FROM companions
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'subscriptions', COUNT(*) FROM subscriptions
UNION ALL
SELECT 'daily_greetings', COUNT(*) FROM daily_greetings;

COMMIT;

-- ============================================
-- ⚠️ Auth 用户的删除需要单独执行（需要 service_role key）
-- 以下 SQL 在 Supabase Dashboard SQL Editor 中可以执行：
-- ============================================

/*
-- 删除所有认证用户（数据库层面，不会触发 Supabase Auth 的清理）
DELETE FROM auth.users;

-- 如果你不需要保留任何用户，取消上面的注释执行即可。
-- 执行后用户需要重新注册。
*/
