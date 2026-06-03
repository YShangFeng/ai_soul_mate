-- ============================================
-- SoulMate.ai — Update plan CHECK constraint
-- Migration: 002_update_plan_check
-- Description: Allow moon/starlight plan values (previously only free/pro)
-- ============================================

ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_plan_check;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_plan_check
  CHECK (plan IN ('free', 'moon', 'starlight'));
