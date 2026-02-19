-- ================================================
-- جدول تحديثات التطبيق - Smart OTA Update System
-- ================================================

-- جدول التحديثات
CREATE TABLE IF NOT EXISTS app_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  version TEXT NOT NULL,                    -- رقم الإصدار e.g. "1.2.0"
  build_number INTEGER NOT NULL,            -- رقم البناء e.g. 15
  platform TEXT NOT NULL DEFAULT 'all',     -- 'android' | 'ios' | 'all'
  release_notes TEXT,                       -- ملاحظات الإصدار
  force_update BOOLEAN NOT NULL DEFAULT false, -- هل التحديث إجباري؟
  is_active BOOLEAN NOT NULL DEFAULT true,  -- هل التحديث فعّال؟
  min_supported_version TEXT,               -- الحد الأدنى للإصدار المدعوم
  download_url TEXT,                        -- رابط التحميل (APK/IPA)
  eas_update_id TEXT,                       -- معرف تحديث EAS (للتحديثات OTA)
  channel TEXT DEFAULT 'production',        -- قناة التحديث
  published_by UUID REFERENCES auth.users(id), -- من نشر التحديث
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- فهرس للبحث السريع عن آخر تحديث
CREATE INDEX idx_app_updates_active ON app_updates(is_active, platform, created_at DESC);
CREATE INDEX idx_app_updates_version ON app_updates(version, build_number);

-- تحديث تلقائي لـ updated_at
CREATE OR REPLACE FUNCTION update_app_updates_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_app_updates_updated
  BEFORE UPDATE ON app_updates
  FOR EACH ROW
  EXECUTE FUNCTION update_app_updates_timestamp();

-- سياسات الأمان (RLS)
ALTER TABLE app_updates ENABLE ROW LEVEL SECURITY;

-- السماح لجميع المستخدمين بقراءة التحديثات الفعّالة
CREATE POLICY "Everyone can read active updates"
  ON app_updates FOR SELECT
  USING (is_active = true);

-- السماح للمسؤولين فقط بإدارة التحديثات
CREATE POLICY "Admins can manage updates"
  ON app_updates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ================================================
-- إدخال سجل أولي (الإصدار الحالي)
-- ================================================
INSERT INTO app_updates (version, build_number, platform, release_notes, force_update, is_active)
VALUES ('1.0.0', 1, 'all', 'الإصدار الأول من تطبيق كوداكس', false, true);
