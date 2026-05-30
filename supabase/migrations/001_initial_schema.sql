-- ============================================
-- SoulMate.ai — Initial Schema Migration
-- Migration: 001_initial_schema
-- Description: Core tables, RLS policies, triggers
-- ============================================

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  full_name   TEXT,
  avatar_url  TEXT,
  age_verified         BOOLEAN NOT NULL DEFAULT FALSE,
  birth_date           DATE,
  daily_generations_used INTEGER NOT NULL DEFAULT 0,
  daily_messages_used    INTEGER NOT NULL DEFAULT 0,
  last_reset_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: users can only read/write their own profile
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. COMPANIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.companions (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name                   TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 20),
  relationship           TEXT NOT NULL CHECK (relationship IN ('romantic_partner', 'close_friend', 'life_mentor', 'fictional_character')),
  gender                 TEXT NOT NULL CHECK (gender IN ('male', 'female', 'non_binary', 'any')),
  style                  TEXT NOT NULL CHECK (style IN ('realistic', 'anime', 'fantasy')),
  avatar_url             TEXT,
  replicate_prediction_id TEXT,
  personality_summary    TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.companions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own companions"
  ON public.companions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own companions"
  ON public.companions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own companions"
  ON public.companions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own companions"
  ON public.companions FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER companions_updated_at
  BEFORE UPDATE ON public.companions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================
-- 3. MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.messages (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  companion_id        UUID NOT NULL REFERENCES public.companions(id) ON DELETE CASCADE,
  role                TEXT NOT NULL CHECK (role IN ('user', 'companion')),
  content             TEXT NOT NULL,
  moderated           BOOLEAN NOT NULL DEFAULT FALSE,
  moderation_flagged  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for efficient conversation loading
CREATE INDEX IF NOT EXISTS idx_messages_companion_time
  ON public.messages (companion_id, created_at DESC);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users can read messages for their own companions
CREATE POLICY "Users can view own messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.companions c
      WHERE c.id = messages.companion_id
        AND c.user_id = auth.uid()
    )
  );

-- Users can insert messages for their own companions
CREATE POLICY "Users can insert own messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companions c
      WHERE c.id = messages.companion_id
        AND c.user_id = auth.uid()
    )
  );

-- Users can update moderation status on own messages
CREATE POLICY "Users can update own messages"
  ON public.messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.companions c
      WHERE c.id = messages.companion_id
        AND c.user_id = auth.uid()
    )
  );

-- ============================================
-- 4. SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_customer_id    TEXT,
  stripe_subscription_id TEXT,
  status                TEXT NOT NULL DEFAULT 'free' CHECK (status IN ('free', 'trialing', 'active', 'past_due', 'canceled')),
  plan                  TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  trial_ends_at         TIMESTAMPTZ,
  current_period_end    TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Only service_role can fully manage subscriptions
CREATE POLICY "Service role can manage subscriptions"
  ON public.subscriptions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can cancel their own subscription (only allow status change to 'canceled')
CREATE POLICY "Users can cancel own subscription"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND status = 'canceled');

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create free subscription on profile creation
CREATE OR REPLACE FUNCTION public.handle_new_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, status, plan)
  VALUES (NEW.id, 'free', 'free');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_subscription();

-- ============================================
-- 5. DAILY_GREETINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.daily_greetings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  companion_id  UUID NOT NULL REFERENCES public.companions(id) ON DELETE CASCADE,
  greeting_text TEXT NOT NULL,
  date          DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (companion_id, date)
);

ALTER TABLE public.daily_greetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own greetings"
  ON public.daily_greetings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.companions c
      WHERE c.id = daily_greetings.companion_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own greetings"
  ON public.daily_greetings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companions c
      WHERE c.id = daily_greetings.companion_id
        AND c.user_id = auth.uid()
    )
  );

-- ============================================
-- 6. HELPER: daily usage reset function
-- ============================================
CREATE OR REPLACE FUNCTION public.reset_daily_limits()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET daily_generations_used = 0,
      daily_messages_used = 0,
      last_reset_at = now()
  WHERE last_reset_at < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
