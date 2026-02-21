-- ========================================
-- Migration: AI Conversations System
-- ========================================

-- إنشاء جدول المحادثات
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL, -- عنوان المحادثة (أول رسالة من المستخدم)
  mode TEXT DEFAULT 'general', -- نوع المحادثة
  total_messages INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إضافة conversation_id للجدول الحالي
ALTER TABLE ai_chat_history 
  ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE;

-- إنشاء indexes للبحث السريع
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON ai_conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_history_conversation ON ai_chat_history(conversation_id);

-- Row Level Security للمحادثات
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own conversations" ON ai_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create conversations" ON ai_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" ON ai_conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" ON ai_conversations
  FOR DELETE USING (auth.uid() = user_id);

-- Function لتحديث آخر رسالة تلقائياً
CREATE OR REPLACE FUNCTION update_conversation_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ai_conversations
  SET 
    total_messages = (
      SELECT COUNT(*) 
      FROM ai_chat_history 
      WHERE conversation_id = NEW.conversation_id
    ),
    last_message_at = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger لتحديث إحصائيات المحادثة عند إضافة رسالة
CREATE TRIGGER update_conversation_stats_trigger
  AFTER INSERT ON ai_chat_history
  FOR EACH ROW
  WHEN (NEW.conversation_id IS NOT NULL)
  EXECUTE FUNCTION update_conversation_stats();

-- جدول إحصائيات استخدام AI
CREATE TABLE IF NOT EXISTS ai_usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  total_tokens_used INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  conversations_count INTEGER DEFAULT 0,
  daily_limit INTEGER DEFAULT 300000, -- حد يومي 300k tokens (~$0.10/يوم، $3/شهر)
  tokens_used_today INTEGER DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- RLS for usage stats
ALTER TABLE ai_usage_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage stats" ON ai_usage_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage stats" ON ai_usage_stats
  FOR ALL USING (auth.uid() = user_id);

-- Function لتحديث إحصائيات الاستخدام
CREATE OR REPLACE FUNCTION update_ai_usage_stats()
RETURNS TRIGGER AS $$
DECLARE
  conv_count INTEGER;
BEGIN
  -- حساب عدد المحادثات
  SELECT COUNT(*) INTO conv_count
  FROM ai_conversations
  WHERE user_id = NEW.user_id;

  -- إدراج أو تحديث الإحصائيات
  INSERT INTO ai_usage_stats (user_id, total_tokens_used, total_messages, conversations_count, daily_limit)
  VALUES (NEW.user_id, COALESCE(NEW.tokens_used, 0), 1, conv_count, 300000)
  ON CONFLICT (user_id) DO UPDATE
  SET 
    total_tokens_used = ai_usage_stats.total_tokens_used + COALESCE(NEW.tokens_used, 0),
    total_messages = ai_usage_stats.total_messages + 1,
    conversations_count = conv_count,
    tokens_used_today = CASE
      WHEN ai_usage_stats.last_reset_date < CURRENT_DATE THEN COALESCE(NEW.tokens_used, 0)
      ELSE ai_usage_stats.tokens_used_today + COALESCE(NEW.tokens_used, 0)
    END,
    last_reset_date = CURRENT_DATE,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger لتحديث إحصائيات الاستخدام
CREATE TRIGGER track_ai_usage_trigger
  AFTER INSERT ON ai_chat_history
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_usage_stats();

-- View لعرض المحادثات مع آخر رسالة
CREATE OR REPLACE VIEW ai_conversations_with_preview AS
SELECT 
  c.id,
  c.user_id,
  c.title,
  c.mode,
  c.total_messages,
  c.total_tokens,
  c.last_message_at,
  c.created_at,
  (
    SELECT content 
    FROM ai_chat_history 
    WHERE conversation_id = c.id 
    ORDER BY created_at DESC 
    LIMIT 1
  ) as last_message_preview
FROM ai_conversations c;

-- Grant permissions
GRANT SELECT ON ai_conversations_with_preview TO authenticated;
