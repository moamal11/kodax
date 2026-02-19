-- =============================================
-- Kodax Database Schema for Supabase
-- =============================================
-- This schema supports code snippets, AI reviews, notifications, and gamification

-- =============================================
-- CODE SNIPPETS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS code_snippets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  code TEXT NOT NULL,
  language VARCHAR(50) NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  forks_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_code_snippets_user_id ON code_snippets(user_id);
CREATE INDEX IF NOT EXISTS idx_code_snippets_language ON code_snippets(language);
CREATE INDEX IF NOT EXISTS idx_code_snippets_is_public ON code_snippets(is_public);
CREATE INDEX IF NOT EXISTS idx_code_snippets_created_at ON code_snippets(created_at DESC);

-- =============================================
-- SNIPPET VERSIONS TABLE (Version History)
-- =============================================
CREATE TABLE IF NOT EXISTS snippet_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snippet_id UUID NOT NULL REFERENCES code_snippets(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  description TEXT,
  version_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for version history
CREATE INDEX IF NOT EXISTS idx_snippet_versions_snippet_id ON snippet_versions(snippet_id);
CREATE INDEX IF NOT EXISTS idx_snippet_versions_created_at ON snippet_versions(created_at DESC);

-- =============================================
-- SNIPPET LIKES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS snippet_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snippet_id UUID NOT NULL REFERENCES code_snippets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(snippet_id, user_id)
);

-- Index for likes
CREATE INDEX IF NOT EXISTS idx_snippet_likes_snippet_id ON snippet_likes(snippet_id);
CREATE INDEX IF NOT EXISTS idx_snippet_likes_user_id ON snippet_likes(user_id);

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'achievement', 'like', 'comment', 'follow', 'system'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- =============================================
-- USER STATS TABLE (Gamification)
-- =============================================
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  last_active_date DATE DEFAULT CURRENT_DATE,
  total_code_executions INTEGER DEFAULT 0,
  total_snippets_created INTEGER DEFAULT 0,
  total_challenges_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user stats
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_level ON user_stats(level DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_xp ON user_stats(xp DESC);

-- =============================================
-- ACHIEVEMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon VARCHAR(100),
  xp_reward INTEGER DEFAULT 0,
  requirement_type VARCHAR(50) NOT NULL, -- 'code_executions', 'snippets', 'challenges', 'streak', etc.
  requirement_count INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- USER ACHIEVEMENTS TABLE (Junction)
-- =============================================
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Indexes for user achievements
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked_at ON user_achievements(unlocked_at DESC);

-- =============================================
-- CODE EXECUTION HISTORY TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS code_execution_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  language VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'success', 'error', 'timeout'
  output TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for execution history
CREATE INDEX IF NOT EXISTS idx_code_execution_history_user_id ON code_execution_history(user_id);
CREATE INDEX IF NOT EXISTS idx_code_execution_history_created_at ON code_execution_history(created_at DESC);

-- =============================================
-- AI REVIEWS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS ai_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snippet_id UUID REFERENCES code_snippets(id) ON DELETE SET NULL,
  code TEXT NOT NULL,
  language VARCHAR(50) NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  summary TEXT,
  suggestions JSONB DEFAULT '[]',
  strengths JSONB DEFAULT '[]',
  improvements JSONB DEFAULT '[]',
  optimizations JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for AI reviews
CREATE INDEX IF NOT EXISTS idx_ai_reviews_user_id ON ai_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_reviews_snippet_id ON ai_reviews(snippet_id);
CREATE INDEX IF NOT EXISTS idx_ai_reviews_created_at ON ai_reviews(created_at DESC);

-- =============================================
-- TRIGGERS
-- =============================================

-- Auto-update updated_at timestamp for code_snippets
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_code_snippets_updated_at
    BEFORE UPDATE ON code_snippets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at
    BEFORE UPDATE ON user_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-increment likes_count when a like is added
CREATE OR REPLACE FUNCTION increment_snippet_likes()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE code_snippets
    SET likes_count = likes_count + 1
    WHERE id = NEW.snippet_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER increment_snippet_likes_trigger
    AFTER INSERT ON snippet_likes
    FOR EACH ROW
    EXECUTE FUNCTION increment_snippet_likes();

-- Auto-decrement likes_count when a like is removed
CREATE OR REPLACE FUNCTION decrement_snippet_likes()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE code_snippets
    SET likes_count = likes_count - 1
    WHERE id = OLD.snippet_id;
    RETURN OLD;
END;
$$ language 'plpgsql';

CREATE TRIGGER decrement_snippet_likes_trigger
    AFTER DELETE ON snippet_likes
    FOR EACH ROW
    EXECUTE FUNCTION decrement_snippet_likes();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE code_snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE snippet_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE snippet_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_execution_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reviews ENABLE ROW LEVEL SECURITY;

-- Code Snippets Policies
CREATE POLICY "Public snippets are viewable by everyone"
  ON code_snippets FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can view their own snippets"
  ON code_snippets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own snippets"
  ON code_snippets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own snippets"
  ON code_snippets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own snippets"
  ON code_snippets FOR DELETE
  USING (auth.uid() = user_id);

-- Snippet Versions Policies
CREATE POLICY "Users can view versions of their snippets"
  ON snippet_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM code_snippets
      WHERE id = snippet_versions.snippet_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert versions for their snippets"
  ON snippet_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM code_snippets
      WHERE id = snippet_versions.snippet_id
      AND user_id = auth.uid()
    )
  );

-- Snippet Likes Policies
CREATE POLICY "Users can view all likes"
  ON snippet_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like any public snippet"
  ON snippet_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
  ON snippet_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Notifications Policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- User Stats Policies
CREATE POLICY "Users can view all user stats"
  ON user_stats FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own stats"
  ON user_stats FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats"
  ON user_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User Achievements Policies
CREATE POLICY "Users can view all achievements"
  ON user_achievements FOR SELECT
  USING (true);

-- Execution History Policies
CREATE POLICY "Users can view their own execution history"
  ON code_execution_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own execution history"
  ON code_execution_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- AI Reviews Policies
CREATE POLICY "Users can view their own AI reviews"
  ON ai_reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI reviews"
  ON ai_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- SEED DATA (Sample Achievements)
-- =============================================

INSERT INTO achievements (name, description, icon, xp_reward, requirement_type, requirement_count) VALUES
('First Steps', 'Execute your first code', 'rocket', 10, 'code_executions', 1),
('Code Explorer', 'Execute code 10 times', 'explore', 50, 'code_executions', 10),
('Coding Master', 'Execute code 100 times', 'star', 200, 'code_executions', 100),
('Snippet Creator', 'Save your first code snippet', 'bookmark', 25, 'snippets', 1),
('Snippet Library', 'Save 10 code snippets', 'collections_bookmark', 100, 'snippets', 10),
('Dedication', 'Maintain a 7-day streak', 'local_fire_department', 150, 'streak', 7),
('On Fire', 'Maintain a 30-day streak', 'whatshot', 500, 'streak', 30)
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to update user streak
CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_last_active DATE;
  v_current_streak INTEGER;
BEGIN
  SELECT last_active_date, streak_days INTO v_last_active, v_current_streak
  FROM user_stats
  WHERE user_id = p_user_id;

  IF v_last_active IS NULL THEN
    -- First time user
    INSERT INTO user_stats (user_id, streak_days, last_active_date)
    VALUES (p_user_id, 1, CURRENT_DATE)
    ON CONFLICT (user_id) DO UPDATE
    SET streak_days = 1, last_active_date = CURRENT_DATE;
  ELSIF v_last_active = CURRENT_DATE THEN
    -- Already active today, no change
    RETURN;
  ELSIF v_last_active = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Consecutive day, increment streak
    UPDATE user_stats
    SET streak_days = streak_days + 1,
        last_active_date = CURRENT_DATE
    WHERE user_id = p_user_id;
  ELSE
    -- Streak broken, reset to 1
    UPDATE user_stats
    SET streak_days = 1,
        last_active_date = CURRENT_DATE
    WHERE user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to award XP
CREATE OR REPLACE FUNCTION award_xp(p_user_id UUID, p_xp INTEGER)
RETURNS void AS $$
DECLARE
  v_new_xp INTEGER;
  v_new_level INTEGER;
BEGIN
  -- Update XP
  UPDATE user_stats
  SET xp = xp + p_xp,
      updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING xp INTO v_new_xp;

  -- Calculate new level (every 500 XP = 1 level)
  v_new_level := FLOOR(v_new_xp / 500.0) + 1;

  -- Update level
  UPDATE user_stats
  SET level = v_new_level
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- END OF SCHEMA
-- =============================================
