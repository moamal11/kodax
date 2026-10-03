-- ========================================
-- جدول تتبع استخدام نظام الذكاء الاصطناعي
-- AI Usage Tracking Table
-- ========================================

-- إنشاء الجدول
CREATE TABLE IF NOT EXISTS ai_usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- معلومات التصنيف
  complexity TEXT NOT NULL CHECK (complexity IN ('simple', 'moderate', 'advanced')),
  model TEXT NOT NULL,
  mode TEXT, -- general, explain, fix, optimize, challenge
  
  -- معلومات الاستخدام
  tokens_used INTEGER NOT NULL DEFAULT 0,
  estimated_cost_usd DECIMAL(10, 6) GENERATED ALWAYS AS (
    CASE complexity
      WHEN 'simple' THEN tokens_used * 0.0000015
      WHEN 'moderate' THEN tokens_used * 0.000006
      WHEN 'advanced' THEN tokens_used * 0.00003
    END
  ) STORED,
  
  -- المعلومات الزمنية
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- معلومات إضافية (اختياري)
  response_time_ms INTEGER,
  question_length INTEGER,
  was_cached BOOLEAN DEFAULT FALSE
);

-- ========================================
-- Indexes للأداء
-- ========================================

-- Index رئيسي: البحث حسب المستخدم والوقت
CREATE INDEX idx_usage_user_timestamp ON ai_usage_tracking(user_id, timestamp DESC);

-- Index للتقارير: التجميع حسب المستوى
CREATE INDEX idx_usage_complexity ON ai_usage_tracking(complexity, timestamp DESC);

-- Index للتحليلات: النموذج والوقت
CREATE INDEX idx_usage_model ON ai_usage_tracking(model, timestamp DESC);

-- ========================================
-- Row Level Security (RLS)
-- ========================================

-- تفعيل RLS
ALTER TABLE ai_usage_tracking ENABLE ROW LEVEL SECURITY;

-- المستخدم يرى بياناته فقط
CREATE POLICY "Users can view own usage"
  ON ai_usage_tracking
  FOR SELECT
  USING (auth.uid() = user_id);

-- السماح بالإضافة للجميع
CREATE POLICY "Users can insert own usage"
  ON ai_usage_tracking
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ========================================
-- Useful Queries & Views
-- ========================================

-- View 1: ملخص الاستخدام الشهري لكل مستخدم
CREATE OR REPLACE VIEW user_monthly_ai_usage AS
SELECT 
  user_id,
  DATE_TRUNC('month', timestamp) as month,
  COUNT(*) as total_questions,
  SUM(tokens_used) as total_tokens,
  SUM(estimated_cost_usd) as total_cost,
  
  -- توزيع الأسئلة
  COUNT(*) FILTER (WHERE complexity = 'simple') as simple_questions,
  COUNT(*) FILTER (WHERE complexity = 'moderate') as moderate_questions,
  COUNT(*) FILTER (WHERE complexity = 'advanced') as advanced_questions,
  
  -- متوسطات
  AVG(tokens_used) as avg_tokens_per_question,
  AVG(response_time_ms) as avg_response_time_ms
FROM ai_usage_tracking
GROUP BY user_id, DATE_TRUNC('month', timestamp);

-- View 2: إحصائيات عامة يومية
CREATE OR REPLACE VIEW daily_ai_stats AS
SELECT 
  DATE(timestamp) as date,
  complexity,
  model,
  COUNT(*) as questions_count,
  SUM(tokens_used) as total_tokens,
  SUM(estimated_cost_usd) as total_cost,
  AVG(response_time_ms) as avg_response_time
FROM ai_usage_tracking
GROUP BY DATE(timestamp), complexity, model
ORDER BY date DESC, complexity;

-- ========================================
-- Functions للتحليلات
-- ========================================

-- Function 1: حساب التكلفة لمستخدم معين في فترة زمنية
CREATE OR REPLACE FUNCTION get_user_ai_cost(
  p_user_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS TABLE (
  complexity TEXT,
  questions INTEGER,
  tokens INTEGER,
  cost_usd DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ai_usage_tracking.complexity,
    COUNT(*)::INTEGER as questions,
    SUM(tokens_used)::INTEGER as tokens,
    SUM(estimated_cost_usd) as cost_usd
  FROM ai_usage_tracking
  WHERE user_id = p_user_id
    AND timestamp BETWEEN p_start_date AND p_end_date
  GROUP BY ai_usage_tracking.complexity
  ORDER BY 
    CASE ai_usage_tracking.complexity
      WHEN 'simple' THEN 1
      WHEN 'moderate' THEN 2
      WHEN 'advanced' THEN 3
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 2: التحقق من تجاوز حد الاستخدام
CREATE OR REPLACE FUNCTION check_user_ai_limit(
  p_user_id UUID,
  p_monthly_limit INTEGER DEFAULT 1000
)
RETURNS BOOLEAN AS $$
DECLARE
  current_month_usage INTEGER;
BEGIN
  SELECT COUNT(*) INTO current_month_usage
  FROM ai_usage_tracking
  WHERE user_id = p_user_id
    AND timestamp >= DATE_TRUNC('month', NOW())
    AND timestamp < DATE_TRUNC('month', NOW()) + INTERVAL '1 month';
  
  RETURN current_month_usage < p_monthly_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- Sample Queries
-- ========================================

-- استعلام 1: ملخص شهري للمستخدم الحالي
/*
SELECT * FROM user_monthly_ai_usage
WHERE user_id = auth.uid()
ORDER BY month DESC
LIMIT 3;
*/

-- استعلام 2: التكلفة الإجمالية خلال 30 يوم
/*
SELECT 
  complexity,
  COUNT(*) as questions,
  SUM(tokens_used) as total_tokens,
  ROUND(SUM(estimated_cost_usd)::NUMERIC, 4) as cost_usd
FROM ai_usage_tracking
WHERE timestamp >= NOW() - INTERVAL '30 days'
  AND user_id = auth.uid()
GROUP BY complexity;
*/

-- استعلام 3: مقارنة التوفير مع استخدام نموذج واحد
/*
WITH current_cost AS (
  SELECT SUM(estimated_cost_usd) as actual
  FROM ai_usage_tracking
  WHERE timestamp >= NOW() - INTERVAL '30 days'
),
theoretical_cost AS (
  SELECT COUNT(*) * 0.03 as if_only_gpt4
  FROM ai_usage_tracking
  WHERE timestamp >= NOW() - INTERVAL '30 days'
)
SELECT 
  ROUND(c.actual::NUMERIC, 2) as actual_cost_usd,
  ROUND(t.if_only_gpt4::NUMERIC, 2) as theoretical_cost_usd,
  ROUND((t.if_only_gpt4 - c.actual)::NUMERIC, 2) as savings_usd,
  ROUND(((t.if_only_gpt4 - c.actual) / t.if_only_gpt4 * 100)::NUMERIC, 1) as savings_percent
FROM current_cost c, theoretical_cost t;
*/

-- استعلام 4: أكثر الأوقات استخداماً
/*
SELECT 
  EXTRACT(HOUR FROM timestamp) as hour,
  COUNT(*) as questions,
  ROUND(AVG(response_time_ms)) as avg_response_time
FROM ai_usage_tracking
WHERE user_id = auth.uid()
  AND timestamp >= NOW() - INTERVAL '7 days'
GROUP BY EXTRACT(HOUR FROM timestamp)
ORDER BY hour;
*/

-- استعلام 5: توزيع الأسئلة حسب Mode
/*
SELECT 
  mode,
  COUNT(*) as count,
  ROUND(AVG(tokens_used)) as avg_tokens
FROM ai_usage_tracking
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY mode
ORDER BY count DESC;
*/

-- ========================================
-- Maintenance & Cleanup
-- ========================================

-- حذف البيانات القديمة (أكثر من 6 أشهر)
-- يُنفذ بشكل دوري عبر cron job
CREATE OR REPLACE FUNCTION cleanup_old_ai_usage()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM ai_usage_tracking
  WHERE timestamp < NOW() - INTERVAL '6 months';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- Triggers (اختياري)
-- ========================================

-- Trigger 1: تسجيل تلقائي للمعلومات الإضافية
CREATE OR REPLACE FUNCTION set_ai_tracking_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- حساب طول السؤال تلقائياً (يمكن تمريره من التطبيق)
  IF NEW.question_length IS NULL THEN
    NEW.question_length := 0; -- يتم تحديثه من التطبيق
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_ai_tracking
  BEFORE INSERT ON ai_usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION set_ai_tracking_metadata();

-- ========================================
-- Comments للتوثيق
-- ========================================

COMMENT ON TABLE ai_usage_tracking IS 'تتبع استخدام نظام الذكاء الاصطناعي لإدارة التكاليف وتحسين الأداء';
COMMENT ON COLUMN ai_usage_tracking.complexity IS 'مستوى صعوبة السؤال: simple, moderate, advanced';
COMMENT ON COLUMN ai_usage_tracking.model IS 'اسم النموذج المستخدم (Gemini): gemini-3.5-flash-lite, gemini-3.8-flash';
COMMENT ON COLUMN ai_usage_tracking.tokens_used IS 'عدد الـ tokens المستخدمة في الطلب';
COMMENT ON COLUMN ai_usage_tracking.estimated_cost_usd IS 'التكلفة التقديرية بالدولار (محسوبة تلقائياً)';

-- ========================================
-- Sample Data للاختبار
-- ========================================

/*
-- إضافة بيانات تجريبية (للتطوير فقط)
INSERT INTO ai_usage_tracking (user_id, complexity, model, mode, tokens_used, response_time_ms, question_length)
VALUES
  (auth.uid(), 'simple', 'gemini-3.5-flash-lite', 'general', 250, 1200, 15),
  (auth.uid(), 'simple', 'gemini-3.5-flash-lite', 'explain', 300, 1100, 20),
  (auth.uid(), 'moderate', 'gemini-3.8-flash', 'fix', 650, 1800, 45),
  (auth.uid(), 'moderate', 'gemini-3.8-flash', 'optimize', 700, 1900, 50),
  (auth.uid(), 'advanced', 'gemini-3.8-flash', 'general', 1500, 2500, 120);
*/

-- ========================================
-- ✅ Installation Complete!
-- ========================================

-- لإضافة هذا الجدول إلى قاعدة البيانات:
-- 1. افتح Supabase Dashboard → SQL Editor
-- 2. الصق كامل محتوى هذا الملف
-- 3. اضغط Run

-- نصائح:
-- - راقب الـ Views للحصول على إحصائيات سريعة
-- - استخدم Functions للتحقق من الحدود
-- - فعّل Cleanup دورياً للحفاظ على الأداء
