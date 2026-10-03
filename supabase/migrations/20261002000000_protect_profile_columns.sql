-- ============================================================================
-- حماية أعمدة profiles الحساسة من التعديل المباشر من العميل
--
-- السياسة "Users can update their own profile" (schema.sql) تسمح بتحديث الصف كاملاً:
-- أي مستخدم يستطيع عبر REST تعديل xp/level لنفسه (لوحة الصدارة)، أو إلغاء
-- is_purchase_blocked الذي وضعه المشرف (_coins_restricted تعتمد عليه).
-- وسياسة "Users can insert their own profile" تسمح بإنشاء الملف الشخصي بأي xp
-- (التطبيق ينشئه بـ xp = 0 و level = 1 عند التسجيل).
-- التطبيق لا يعدّل هذه الأعمدة مباشرة: XP يمر عبر دوال السيرفر (_xp_award)
-- (SECURITY DEFINER — current_user هو المالك، فلا يتأثران بهذا الـ trigger).
--
-- آمن: لا يحذف ولا يغيّر أي بيانات موجودة. قابل للتكرار.
-- ============================================================================

CREATE OR REPLACE FUNCTION _protect_profile_columns()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  -- طلب مباشر من العميل (anon/authenticated) وليس مشرفاً: الأعمدة الحساسة تبقى كما هي
  IF current_user IN ('anon', 'authenticated') AND NOT is_admin() THEN
    IF TG_OP = 'INSERT' THEN
      NEW.xp := 0;
      NEW.level := LEAST(COALESCE(NEW.level, 1), 1);
      NEW.is_purchase_blocked := FALSE;
    ELSE
      NEW.xp := OLD.xp;
      NEW.level := OLD.level;
      NEW.is_purchase_blocked := OLD.is_purchase_blocked;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_columns ON profiles;
CREATE TRIGGER trg_protect_profile_columns
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION _protect_profile_columns();
