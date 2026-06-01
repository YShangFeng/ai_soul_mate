-- ============================================
-- SoulMate 数据库初始化脚本（回归测试用）
-- 
-- 使用方法：Supabase Dashboard → SQL Editor → 粘贴执行
-- 
-- ⚠️  这会清空所有用户数据，包括注册账户！
-- ============================================

-- ============================================
-- 🔧 开关（上线前改成 false）
-- ============================================
DO $$
DECLARE
  _delete_auth_users boolean := true;  -- true=连注册账户一起删, false=只删业务数据
BEGIN

  -- 1. 清空业务数据表（按外键依赖顺序）
  RAISE NOTICE '🧹 清空业务数据...';
  TRUNCATE TABLE messages CASCADE;
  TRUNCATE TABLE companions CASCADE;
  TRUNCATE TABLE profiles CASCADE;
  TRUNCATE TABLE subscriptions CASCADE;
  TRUNCATE TABLE daily_greetings CASCADE;

  -- 2. 清空认证相关（如果开关打开）
  IF _delete_auth_users THEN
    RAISE NOTICE '🗑️  清空认证用户...';

    -- 先清理 sessions，再清理 users（外键依赖）
    DELETE FROM auth.sessions;
    DELETE FROM auth.refresh_tokens;
    DELETE FROM auth.mfa_factors;
    DELETE FROM auth.identities;
    DELETE FROM auth.users;

    RAISE NOTICE '✅ Auth 用户已清空，需重新注册';
  ELSE
    RAISE NOTICE '⏭️  跳过 Auth 用户清理（仅清空业务数据）';
  END IF;

END $$;

-- 3. 验证
SELECT 'messages'       AS "表", COUNT(*) AS "剩余行数" FROM messages
UNION ALL
SELECT 'companions',    COUNT(*) FROM companions
UNION ALL
SELECT 'profiles',      COUNT(*) FROM profiles
UNION ALL
SELECT 'subscriptions', COUNT(*) FROM subscriptions
UNION ALL
SELECT 'daily_greetings', COUNT(*) FROM daily_greetings
UNION ALL
SELECT 'auth.users',    COUNT(*) FROM auth.users
UNION ALL
SELECT 'auth.sessions', COUNT(*) FROM auth.sessions;
