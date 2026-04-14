-- =============================================
-- SUBSCRIPTION SYSTEM FOR KODAX
-- =============================================

-- =============================================
-- SUBSCRIPTION PLANS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  name_ar VARCHAR(100) NOT NULL,
  duration_months INTEGER NOT NULL,
  price_iqd INTEGER NOT NULL,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed subscription plans
INSERT INTO subscription_plans (name, name_ar, duration_months, price_iqd, features) VALUES
('Monthly', 'شهري', 1, 99900, '["ai_chat", "ai_code_review", "unlimited_challenges", "advanced_analytics", "premium_badges"]'),
('3 Months', '3 أشهر', 3, 199900, '["ai_chat", "ai_code_review", "unlimited_challenges", "advanced_analytics", "premium_badges", "priority_support"]'),
('Yearly', 'سنوي', 12, 499900, '["ai_chat", "ai_code_review", "unlimited_challenges", "advanced_analytics", "premium_badges", "priority_support", "exclusive_content"]')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- USER SUBSCRIPTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'expired', 'cancelled'
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  auto_renew BOOLEAN DEFAULT FALSE,
  payment_method VARCHAR(50),
  payment_reference VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for subscriptions
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expires_at ON user_subscriptions(expires_at);

-- Unique constraint: one active subscription per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_active_subscription 
ON user_subscriptions(user_id) 
WHERE status = 'active';

-- =============================================
-- FREE FEATURE LIMITS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS free_feature_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_name VARCHAR(100) NOT NULL,
  usage_count INTEGER DEFAULT 0,
  limit_count INTEGER NOT NULL,
  reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, feature_name)
);

-- Indexes for feature limits
CREATE INDEX IF NOT EXISTS idx_free_feature_limits_user_id ON free_feature_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_free_feature_limits_reset_date ON free_feature_limits(reset_date);

-- =============================================
-- SUBSCRIPTION HISTORY TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS subscription_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  action VARCHAR(50) NOT NULL, -- 'subscribed', 'renewed', 'cancelled', 'expired'
  amount_iqd INTEGER,
  payment_method VARCHAR(50),
  payment_reference VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for subscription history
CREATE INDEX IF NOT EXISTS idx_subscription_history_user_id ON subscription_history(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_created_at ON subscription_history(created_at DESC);

-- =============================================
-- TRIGGERS
-- =============================================

-- Auto-update updated_at timestamp
CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_free_feature_limits_updated_at
    BEFORE UPDATE ON free_feature_limits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-expire subscriptions
CREATE OR REPLACE FUNCTION check_subscription_expiry()
RETURNS void AS $$
BEGIN
  UPDATE user_subscriptions
  SET status = 'expired'
  WHERE status = 'active'
  AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE free_feature_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

-- Subscription Plans: Everyone can view
CREATE POLICY "Everyone can view subscription plans"
  ON subscription_plans FOR SELECT
  USING (true);

-- User Subscriptions: Users can view their own
CREATE POLICY "Users can view their own subscriptions"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Free Feature Limits: Users can view and update their own
CREATE POLICY "Users can view their own feature limits"
  ON free_feature_limits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feature limits"
  ON free_feature_limits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feature limits"
  ON free_feature_limits FOR UPDATE
  USING (auth.uid() = user_id);

-- Subscription History: Users can view their own
CREATE POLICY "Users can view their own subscription history"
  ON subscription_history FOR SELECT
  USING (auth.uid() = user_id);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Check if user has active subscription
CREATE OR REPLACE FUNCTION has_active_subscription(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_subscription BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM user_subscriptions
    WHERE user_id = p_user_id
    AND status = 'active'
    AND expires_at > NOW()
  ) INTO v_has_subscription;
  
  RETURN v_has_subscription;
END;
$$ LANGUAGE plpgsql;

-- Check if user can access feature
CREATE OR REPLACE FUNCTION can_access_feature(p_user_id UUID, p_feature_name VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_subscription BOOLEAN;
  v_usage_count INTEGER;
  v_limit_count INTEGER;
BEGIN
  -- Check if user has active subscription
  v_has_subscription := has_active_subscription(p_user_id);
  
  IF v_has_subscription THEN
    RETURN true;
  END IF;
  
  -- Check free tier limits
  SELECT usage_count, limit_count INTO v_usage_count, v_limit_count
  FROM free_feature_limits
  WHERE user_id = p_user_id
  AND feature_name = p_feature_name
  AND reset_date >= CURRENT_DATE;
  
  IF NOT FOUND THEN
    -- First time using this feature, create limit record
    INSERT INTO free_feature_limits (user_id, feature_name, usage_count, limit_count)
    VALUES (p_user_id, p_feature_name, 0, 
      CASE 
        WHEN p_feature_name = 'challenges' THEN 3
        WHEN p_feature_name = 'ai_chat' THEN 0
        WHEN p_feature_name = 'ai_code_review' THEN 0
        ELSE 0
      END
    );
    RETURN true;
  END IF;
  
  RETURN v_usage_count < v_limit_count;
END;
$$ LANGUAGE plpgsql;

-- Increment feature usage
CREATE OR REPLACE FUNCTION increment_feature_usage(p_user_id UUID, p_feature_name VARCHAR)
RETURNS void AS $$
BEGIN
  INSERT INTO free_feature_limits (user_id, feature_name, usage_count, limit_count)
  VALUES (
    p_user_id, 
    p_feature_name, 
    1, 
    CASE 
      WHEN p_feature_name = 'challenges' THEN 3
      ELSE 0
    END
  )
  ON CONFLICT (user_id, feature_name) 
  DO UPDATE SET 
    usage_count = free_feature_limits.usage_count + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Reset daily limits
CREATE OR REPLACE FUNCTION reset_daily_limits()
RETURNS void AS $$
BEGIN
  UPDATE free_feature_limits
  SET usage_count = 0, reset_date = CURRENT_DATE
  WHERE reset_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Create subscription
CREATE OR REPLACE FUNCTION create_subscription(
  p_user_id UUID,
  p_plan_id UUID,
  p_payment_method VARCHAR,
  p_payment_reference VARCHAR
)
RETURNS UUID AS $$
DECLARE
  v_subscription_id UUID;
  v_duration_months INTEGER;
  v_expires_at TIMESTAMPTZ;
  v_price INTEGER;
BEGIN
  -- Get plan duration and price
  SELECT duration_months, price_iqd INTO v_duration_months, v_price
  FROM subscription_plans
  WHERE id = p_plan_id;
  
  -- Calculate expiry date
  v_expires_at := NOW() + (v_duration_months || ' months')::INTERVAL;
  
  -- Cancel any existing active subscriptions
  UPDATE user_subscriptions
  SET status = 'cancelled', updated_at = NOW()
  WHERE user_id = p_user_id
  AND status = 'active';
  
  -- Create new subscription
  INSERT INTO user_subscriptions (
    user_id, plan_id, status, expires_at, payment_method, payment_reference
  ) VALUES (
    p_user_id, p_plan_id, 'active', v_expires_at, p_payment_method, p_payment_reference
  ) RETURNING id INTO v_subscription_id;
  
  -- Add to history
  INSERT INTO subscription_history (
    user_id, plan_id, action, amount_iqd, payment_method, payment_reference
  ) VALUES (
    p_user_id, p_plan_id, 'subscribed', v_price, p_payment_method, p_payment_reference
  );
  
  RETURN v_subscription_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- END OF SUBSCRIPTION SCHEMA
-- =============================================
