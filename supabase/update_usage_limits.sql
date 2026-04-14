-- ========================================
-- تحديث نظام حد الاستخدام اليومي
-- Update Usage Limit System
-- ========================================

-- 1. تحديث daily_limit من 10,000 إلى 300,000 للسجلات الموجودة
UPDATE ai_usage_stats
SET daily_limit = 300000
WHERE daily_limit < 300000;

-- 2. تحديث conversations_count لكل المستخدمين
UPDATE ai_usage_stats AS stats
SET conversations_count = (
  SELECT COUNT(*)
  FROM ai_conversations AS conv
  WHERE conv.user_id = stats.user_id
)
WHERE conversations_count = 0 OR conversations_count IS NULL;

-- 3. إعادة حساب usage_percentage (سيحدث تلقائياً في التطبيق)
-- لكن يمكنك التحقق من النتائج:

SELECT 
  user_id,
  conversations_count,
  daily_limit,
  tokens_used_today,
  ROUND((tokens_used_today::FLOAT / daily_limit * 100), 2) as usage_percent,
  total_messages,
  total_tokens_used
FROM ai_usage_stats
ORDER BY tokens_used_today DESC;

-- 4. التحقق من صحة conversations_count
SELECT 
  stats.user_id,
  stats.conversations_count as stats_count,
  COUNT(conv.id) as actual_count,
  CASE 
    WHEN stats.conversations_count = COUNT(conv.id) THEN '✅ صحيح'
    ELSE '❌ يحتاج تحديث'
  END as status
FROM ai_usage_stats stats
LEFT JOIN ai_conversations conv ON conv.user_id = stats.user_id
GROUP BY stats.user_id, stats.conversations_count;

-- ========================================
-- اختياري: إعادة إنشاء الـ Trigger
-- ========================================

-- حذف الـ trigger القديم
DROP TRIGGER IF EXISTS track_ai_usage_trigger ON ai_chat_history;
DROP FUNCTION IF EXISTS update_ai_usage_stats();

-- إنشاء الـ trigger الجديد مع conversations_count
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

-- إنشاء الـ trigger
CREATE TRIGGER track_ai_usage_trigger
  AFTER INSERT ON ai_chat_history
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_usage_stats();

-- ========================================
-- التحقق من النتائج النهائية
-- ========================================

SELECT 
  '✅ تم التحديث بنجاح!' as status,
  COUNT(*) as total_users,
  AVG(daily_limit) as avg_daily_limit,
  AVG(conversations_count) as avg_conversations,
  AVG(ROUND((tokens_used_today::FLOAT / daily_limit * 100), 2)) as avg_usage_percent
FROM ai_usage_stats;

-- عرض المستخدمين الذين تجاوزوا 90% (للتحقق)
SELECT 
  user_id,
  conversations_count,
  tokens_used_today,
  daily_limit,
  ROUND((tokens_used_today::FLOAT / daily_limit * 100), 1) as usage_percent,
  CASE 
    WHEN tokens_used_today::FLOAT / daily_limit < 0.9 THEN '✅ طبيعي'
    WHEN tokens_used_today::FLOAT / daily_limit < 1.0 THEN '⚠️ اقترب من الحد'
    ELSE '🚫 تجاوز الحد'
  END as status
FROM ai_usage_stats
ORDER BY usage_percent DESC
LIMIT 10;
