-- ========================================
-- حذف جداول المراسلات القديمة
-- Delete Old Messages Tables
-- ========================================

-- استخدم هذا الملف إذا كنت قد شغّلت النسخة القديمة من schema
-- وتحتاج لحذف الجداول وإعادة إنشائها بالـ foreign keys الصحيحة

-- ⚠️ تحذير: هذا سيحذف جميع المحادثات والرسائل الموجودة
-- احتفظ بنسخة احتياطية إذا كانت لديك بيانات مهمة

DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- بعد تشغيل هذا الأمر، شغّل محتوى ملف messages_schema.sql كاملاً
