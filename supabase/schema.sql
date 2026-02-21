-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  province TEXT,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Programming fields
CREATE TABLE programming_fields (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT
);

-- User selected fields
CREATE TABLE user_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  field_id TEXT REFERENCES programming_fields(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, field_id)
);

-- Lessons
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id TEXT REFERENCES programming_fields(id),
  title TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  xp_reward INTEGER DEFAULT 100,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User progress
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  score INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Challenges
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  description TEXT NOT NULL,
  field_id TEXT REFERENCES programming_fields(id),
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  xp_reward INTEGER DEFAULT 250,
  type TEXT CHECK (type IN ('daily', 'weekly', 'special')),
  test_cases JSONB NOT NULL,
  starter_code TEXT,
  solution_code TEXT,
  active BOOLEAN DEFAULT TRUE,
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User challenge attempts
CREATE TABLE challenge_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  passed BOOLEAN DEFAULT FALSE,
  tests_passed INTEGER DEFAULT 0,
  tests_total INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Badges
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT,
  description_ar TEXT,
  icon TEXT NOT NULL,
  condition_type TEXT NOT NULL,
  condition_value INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User badges
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Code snippets (posts)
CREATE TABLE code_snippets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Code snippet likes
CREATE TABLE code_likes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  snippet_id UUID REFERENCES code_snippets(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, snippet_id)
);

-- Code snippet comments
CREATE TABLE code_comments (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  snippet_id UUID REFERENCES code_snippets(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI chat history
CREATE TABLE ai_chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  mode TEXT,
  tokens_used INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'active', 'expired', 'cancelled')),
  plan_type TEXT,
  payment_proof_url TEXT,
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leaderboard view (materialized for performance)
CREATE MATERIALIZED VIEW leaderboard AS
SELECT 
  p.id,
  p.username,
  p.full_name,
  p.avatar_url,
  p.province,
  p.xp,
  p.level,
  ROW_NUMBER() OVER (ORDER BY p.xp DESC) as rank
FROM profiles p
ORDER BY p.xp DESC;

-- Refresh leaderboard function
CREATE OR REPLACE FUNCTION refresh_leaderboard()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW leaderboard;
END;
$$ LANGUAGE plpgsql;

-- Indexes for performance
CREATE INDEX idx_profiles_xp ON profiles(xp DESC);
CREATE INDEX idx_profiles_province ON profiles(province);
CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_lesson ON user_progress(lesson_id);
CREATE INDEX idx_code_snippets_user ON code_snippets(user_id);
CREATE INDEX idx_code_snippets_created ON code_snippets(created_at DESC);
CREATE INDEX idx_challenges_type ON challenges(type);
CREATE INDEX idx_challenges_active ON challenges(active);

-- جدول الدورات المفتوحة للمستخدم
CREATE TABLE user_unlocked_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- جدول النقاط المشتراة
CREATE TABLE user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  purchased_points INTEGER DEFAULT 0,
  earned_points INTEGER DEFAULT 0,
  spent_points INTEGER DEFAULT 0,
  premium_expires_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- جدول سجل المعاملات
CREATE TABLE point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('earned', 'spent', 'purchased')),
  amount INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_unlocked_courses_user ON user_unlocked_courses(user_id);
CREATE INDEX idx_user_points_user ON user_points(user_id);
CREATE INDEX idx_point_transactions_user ON point_transactions(user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_unlocked_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- User fields
CREATE POLICY "Users can view their own fields" ON user_fields
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own fields" ON user_fields
  FOR ALL USING (auth.uid() = user_id);

-- User progress
CREATE POLICY "Users can view their own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own progress" ON user_progress
  FOR ALL USING (auth.uid() = user_id);

-- Challenge attempts
CREATE POLICY "Users can view their own attempts" ON challenge_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create attempts" ON challenge_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User badges
CREATE POLICY "Users can view all badges" ON user_badges
  FOR SELECT USING (true);

-- Code snippets
CREATE POLICY "Public snippets are viewable by everyone" ON code_snippets
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own snippets" ON code_snippets
  FOR ALL USING (auth.uid() = user_id);

-- Code likes
CREATE POLICY "Users can view all likes" ON code_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own likes" ON code_likes
  FOR ALL USING (auth.uid() = user_id);

-- Code comments
CREATE POLICY "Users can view all comments" ON code_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own comments" ON code_comments
  FOR ALL USING (auth.uid() = user_id);

-- AI chat history
CREATE POLICY "Users can view their own chat history" ON ai_chat_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create chat messages" ON ai_chat_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Subscriptions
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- User unlocked courses
CREATE POLICY "Users can view their own unlocked courses" ON user_unlocked_courses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own unlocked courses" ON user_unlocked_courses
  FOR ALL USING (auth.uid() = user_id);

-- User points
CREATE POLICY "Users can view their own points" ON user_points
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own points" ON user_points
  FOR ALL USING (auth.uid() = user_id);

-- Point transactions
CREATE POLICY "Users can view their own transactions" ON point_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create transactions" ON point_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions
-- Update XP and level
CREATE OR REPLACE FUNCTION update_user_xp(user_id UUID, xp_amount INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET 
    xp = xp + xp_amount,
    level = FLOOR(SQRT((xp + xp_amount) / 100)),
    updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_code_snippets_updated_at
  BEFORE UPDATE ON code_snippets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default programming fields
INSERT INTO programming_fields (id, name, name_ar, icon, color, description) VALUES
  ('web-dev', 'Web Development', 'تطوير الويب', '🌐', '#3b82f6', 'Learn HTML, CSS, JavaScript, and modern web frameworks'),
  ('python', 'Python', 'بايثون', '🐍', '#10b981', 'Master Python programming from basics to advanced'),
  ('cpp', 'C++', 'سي++', '⚡', '#8b5cf6', 'Learn C++ and system programming'),
  ('cybersecurity', 'Cybersecurity', 'الأمن السيبراني', '🔒', '#ef4444', 'Learn ethical hacking and security'),
  ('ai-ml', 'AI & ML', 'الذكاء الاصطناعي', '🤖', '#f59e0b', 'Artificial Intelligence and Machine Learning');

-- Insert default badges
INSERT INTO badges (name, name_ar, icon, condition_type, condition_value) VALUES
  ('Beginner', 'مبتدئ', '🌱', 'xp', 100),
  ('Learner', 'متعلم', '📚', 'xp', 500),
  ('Developer', 'مطور', '💻', 'xp', 1000),
  ('Expert', 'خبير', '⭐', 'xp', 5000),
  ('Legend', 'أسطورة', '👑', 'xp', 10000),
  ('First Challenge', 'أول تحدي', '🎯', 'challenges', 1),
  ('Challenge Master', 'سيد التحديات', '🏆', 'challenges', 10),
  ('Code Publisher', 'ناشر الأكواد', '📝', 'posts', 1),
  ('Popular Coder', 'مبرمج مشهور', '⭐', 'likes', 100);
