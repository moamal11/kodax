-- ============================================================================
-- كتالوج الدروس + مزامنة تقدم المستخدمين بعد مراجعة المناهج
-- مولَّد تلقائياً بـ scripts/curriculum/gen-lesson-catalog.ts — لا تعدّله يدوياً
-- عدد الدروس: 344 في 32 دورة
--
-- آمن:
--   * لا يحذف أي صف من تقدم المستخدمين ولا من النقاط ولا التحديات.
--   * unlock_cost (السعر الذي يدفعه المستخدم) لا يتغير؛ total_lessons فقط.
--   * إعادة التشغيل آمنة (idempotent).
-- ============================================================================
BEGIN;

-- 1) كتالوج الدروس الفعلي
CREATE TABLE IF NOT EXISTS lesson_catalog (
  lesson_id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- XP الدرس كما في المحتوى: مصدر XP الدروس على السيرفر (لا يُقبل XP يرسله العميل)
ALTER TABLE lesson_catalog ADD COLUMN IF NOT EXISTS xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0);
CREATE INDEX IF NOT EXISTS lesson_catalog_course_idx ON lesson_catalog(course_id);

ALTER TABLE lesson_catalog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS lesson_catalog_read ON lesson_catalog;
DROP POLICY IF EXISTS lesson_catalog_admin_write ON lesson_catalog;
CREATE POLICY lesson_catalog_read ON lesson_catalog FOR SELECT USING (true);
CREATE POLICY lesson_catalog_admin_write ON lesson_catalog FOR ALL USING (is_admin()) WITH CHECK (is_admin());

INSERT INTO lesson_catalog (lesson_id, course_id, position, xp) VALUES
  ('ai-1', 'ai-basics', 1, 150),
  ('ai-2', 'ai-basics', 2, 180),
  ('ai-3', 'ai-basics', 3, 200),
  ('ai-4', 'ai-basics', 4, 250),
  ('ai-5', 'ai-basics', 5, 200),
  ('dl-1', 'ai-deep-learning', 1, 160),
  ('dl-2', 'ai-deep-learning', 2, 180),
  ('dl-3', 'ai-deep-learning', 3, 170),
  ('dl-4', 'ai-deep-learning', 4, 180),
  ('dl-6', 'ai-deep-learning', 5, 200),
  ('dl-5', 'ai-deep-learning', 6, 190),
  ('dl-7', 'ai-deep-learning', 7, 250),
  ('dl-13', 'ai-deep-learning', 8, 190),
  ('dl-14', 'ai-deep-learning', 9, 200),
  ('dl-8', 'ai-deep-learning', 10, 220),
  ('dl-9', 'ai-deep-learning', 11, 180),
  ('dl-10', 'ai-deep-learning', 12, 230),
  ('dl-11', 'ai-deep-learning', 13, 220),
  ('dl-12', 'ai-deep-learning', 14, 200),
  ('dl-transformers', 'ai-deep-learning', 15, 220),
  ('dl-15', 'ai-deep-learning', 16, 350),
  ('ml-1', 'ai-ml-basics', 1, 150),
  ('ml-2', 'ai-ml-basics', 2, 160),
  ('ml-3', 'ai-ml-basics', 3, 170),
  ('ml-4', 'ai-ml-basics', 4, 180),
  ('ml-10', 'ai-ml-basics', 5, 200),
  ('ml-11', 'ai-ml-basics', 6, 200),
  ('ml-5', 'ai-ml-basics', 7, 180),
  ('ml-6', 'ai-ml-basics', 8, 190),
  ('ml-7', 'ai-ml-basics', 9, 170),
  ('ml-8', 'ai-ml-basics', 10, 190),
  ('ml-9', 'ai-ml-basics', 11, 180),
  ('ml-pipelines', 'ai-ml-basics', 12, 200),
  ('ml-12', 'ai-ml-basics', 13, 300),
  ('auth-1', 'backend-auth', 1, 180),
  ('auth-3', 'backend-auth', 2, 180),
  ('auth-2', 'backend-auth', 3, 200),
  ('auth-4', 'backend-auth', 4, 190),
  ('auth-5', 'backend-auth', 5, 200),
  ('auth-6', 'backend-auth', 6, 200),
  ('auth-rate-limit-mfa', 'backend-auth', 7, 190),
  ('auth-project', 'backend-auth', 8, 280),
  ('firebase-1', 'backend-firebase', 1, 180),
  ('firebase-2', 'backend-firebase', 2, 180),
  ('firebase-3', 'backend-firebase', 3, 200),
  ('firebase-4', 'backend-firebase', 4, 180),
  ('firebase-5', 'backend-firebase', 5, 200),
  ('firebase-project', 'backend-firebase', 6, 240),
  ('mongo-1', 'backend-mongodb', 1, 180),
  ('mongo-2', 'backend-mongodb', 2, 200),
  ('mongo-3', 'backend-mongodb', 3, 180),
  ('mongo-4', 'backend-mongodb', 4, 200),
  ('mongo-5', 'backend-mongodb', 5, 220),
  ('mongo-indexes', 'backend-mongodb', 6, 170),
  ('mongo-transactions', 'backend-mongodb', 7, 170),
  ('mongo-project', 'backend-mongodb', 8, 250),
  ('node-1', 'backend-nodejs', 1, 150),
  ('node-2', 'backend-nodejs', 2, 120),
  ('node-3', 'backend-nodejs', 3, 140),
  ('node-4', 'backend-nodejs', 4, 100),
  ('node-5', 'backend-nodejs', 5, 180),
  ('node-streams-events', 'backend-nodejs', 6, 160),
  ('node-testing', 'backend-nodejs', 7, 170),
  ('node-project-structure', 'backend-nodejs', 8, 170),
  ('rest-1', 'backend-rest-api', 1, 180),
  ('rest-2', 'backend-rest-api', 2, 160),
  ('rest-3', 'backend-rest-api', 3, 170),
  ('rest-4', 'backend-rest-api', 4, 180),
  ('rest-5', 'backend-rest-api', 5, 180),
  ('rest-6', 'backend-rest-api', 6, 190),
  ('rest-7', 'backend-rest-api', 7, 200),
  ('rest-8', 'backend-rest-api', 8, 190),
  ('rest-db-layers', 'backend-rest-api', 9, 180),
  ('rest-openapi', 'backend-rest-api', 10, 150),
  ('rest-project', 'backend-rest-api', 11, 280),
  ('sql-1', 'backend-sql', 1, 150),
  ('sql-schema-design', 'backend-sql', 2, 150),
  ('sql-2', 'backend-sql', 3, 160),
  ('sql-3', 'backend-sql', 4, 180),
  ('sql-4', 'backend-sql', 5, 170),
  ('sql-6', 'backend-sql', 6, 190),
  ('sql-5', 'backend-sql', 7, 180),
  ('sql-7', 'backend-sql', 8, 200),
  ('sql-injection', 'backend-sql', 9, 150),
  ('sql-postgres-node', 'backend-sql', 10, 180),
  ('sql-migrations', 'backend-sql', 11, 160),
  ('sql-project', 'backend-sql', 12, 250),
  ('supa-1', 'backend-supabase', 1, 200),
  ('supa-2', 'backend-supabase', 2, 180),
  ('supa-6', 'backend-supabase', 3, 190),
  ('supa-3', 'backend-supabase', 4, 170),
  ('supa-4', 'backend-supabase', 5, 180),
  ('supa-5', 'backend-supabase', 6, 200),
  ('supa-project', 'backend-supabase', 7, 260),
  ('cpp-adv-13', 'cpp-advanced', 1, 180),
  ('cpp-adv-19', 'cpp-advanced', 2, 200),
  ('cpp-advanced-stl-containers', 'cpp-advanced', 3, 180),
  ('cpp-adv-16', 'cpp-advanced', 4, 170),
  ('cpp-adv-15', 'cpp-advanced', 5, 180),
  ('cpp-adv-17', 'cpp-advanced', 6, 160),
  ('cpp-adv-18', 'cpp-advanced', 7, 180),
  ('cpp-advanced-modern', 'cpp-advanced', 8, 70),
  ('cpp-adv-21', 'cpp-advanced', 9, 160),
  ('cpp-adv-20', 'cpp-advanced', 10, 200),
  ('cpp-adv-22', 'cpp-advanced', 11, 300),
  ('cpp-1', 'cpp-basics', 1, 100),
  ('cpp-2', 'cpp-basics', 2, 100),
  ('cpp-3', 'cpp-basics', 3, 100),
  ('cpp-4', 'cpp-basics', 4, 100),
  ('cpp-5', 'cpp-basics', 5, 100),
  ('cpp-6', 'cpp-basics', 6, 100),
  ('cpp-7', 'cpp-basics', 7, 100),
  ('cpp-basics-strings', 'cpp-basics', 8, 100),
  ('cpp-8', 'cpp-basics', 9, 100),
  ('cpp-basics-vector', 'cpp-basics', 10, 110),
  ('cpp-9', 'cpp-basics', 11, 100),
  ('cpp-10', 'cpp-basics', 12, 120),
  ('cpp-basics-errors', 'cpp-basics', 13, 100),
  ('cpp-basics-project', 'cpp-basics', 14, 150),
  ('cpp-adv-1', 'cpp-oop', 1, 150),
  ('cpp-adv-3', 'cpp-oop', 2, 140),
  ('cpp-adv-8', 'cpp-oop', 3, 150),
  ('cpp-oop-lifetime', 'cpp-oop', 4, 60),
  ('cpp-adv-6', 'cpp-oop', 5, 160),
  ('cpp-adv-7', 'cpp-oop', 6, 170),
  ('cpp-adv-2', 'cpp-oop', 7, 150),
  ('cpp-adv-4', 'cpp-oop', 8, 150),
  ('cpp-adv-5', 'cpp-oop', 9, 150),
  ('cpp-adv-10', 'cpp-oop', 10, 170),
  ('cpp-adv-9', 'cpp-oop', 11, 140),
  ('cpp-adv-11', 'cpp-oop', 12, 150),
  ('cpp-adv-12', 'cpp-oop', 13, 250),
  ('cpp-ptr-1', 'cpp-pointers', 1, 120),
  ('cpp-ptr-2', 'cpp-pointers', 2, 120),
  ('cpp-ptr-3', 'cpp-pointers', 3, 130),
  ('cpp-ptr-6', 'cpp-pointers', 4, 130),
  ('cpp-pointers-memory', 'cpp-pointers', 5, 130),
  ('cpp-ptr-4', 'cpp-pointers', 6, 140),
  ('cpp-ptr-5', 'cpp-pointers', 7, 130),
  ('cpp-ptr-7', 'cpp-pointers', 8, 150),
  ('cpp-ptr-8', 'cpp-pointers', 9, 200),
  ('cyber-adv-1', 'cyber-advanced', 1, 150),
  ('cyber-sql-001', 'cyber-advanced', 2, 200),
  ('cyber-adv-2', 'cyber-advanced', 3, 150),
  ('cyber-xss-001', 'cyber-advanced', 4, 200),
  ('cyber-csrf', 'cyber-advanced', 5, 180),
  ('cyber-adv-3', 'cyber-advanced', 6, 180),
  ('cyber-1', 'cyber-basics', 1, 100),
  ('cyber-2', 'cyber-basics', 2, 100),
  ('cyber-3', 'cyber-basics', 3, 100),
  ('cyber-4', 'cyber-basics', 4, 100),
  ('cyber-5', 'cyber-basics', 5, 120),
  ('cyber-http-basics', 'cyber-basics', 6, 100),
  ('cyber-cookies-sessions', 'cyber-basics', 7, 120),
  ('cyber-6', 'cyber-basics', 8, 120),
  ('ethical-intro', 'cyber-ethical-hacking', 1, 100),
  ('ethical-recon', 'cyber-ethical-hacking', 2, 120),
  ('ethical-scanning', 'cyber-ethical-hacking', 3, 150),
  ('ethical-exploitation-basics', 'cyber-ethical-hacking', 4, 180),
  ('ethical-web-hacking', 'cyber-ethical-hacking', 5, 200),
  ('ethical-web-advanced', 'cyber-ethical-hacking', 6, 180),
  ('ethical-password-cracking', 'cyber-ethical-hacking', 7, 180),
  ('ethical-privilege-escalation', 'cyber-ethical-hacking', 8, 180),
  ('ethical-post-exploitation', 'cyber-ethical-hacking', 9, 200),
  ('ethical-wireless-hacking', 'cyber-ethical-hacking', 10, 180),
  ('ethical-social-engineering', 'cyber-ethical-hacking', 11, 150),
  ('ethical-reporting', 'cyber-ethical-hacking', 12, 150),
  ('ethical-report-writing', 'cyber-ethical-hacking', 13, 140),
  ('ethical-ctf', 'cyber-ethical-hacking', 14, 160),
  ('ethical-career-path', 'cyber-ethical-hacking', 15, 100),
  ('cyber-network-001', 'cyber-network', 1, 150),
  ('cyber-firewall-basics', 'cyber-network', 2, 140),
  ('cyber-encryption-001', 'cyber-network', 3, 180),
  ('cyber-vpn-security', 'cyber-network', 4, 120),
  ('cyber-wifi-security', 'cyber-network', 5, 140),
  ('cyber-network-segmentation', 'cyber-network', 6, 150),
  ('cyber-dmz-architecture', 'cyber-network', 7, 140),
  ('cyber-zero-trust', 'cyber-network', 8, 160),
  ('cyber-ids-ips', 'cyber-network', 9, 150),
  ('cyber-network-monitoring', 'cyber-network', 10, 130),
  ('flutter-architecture-004', 'flutter-advanced', 1, 200),
  ('flutter-riverpod-001', 'flutter-advanced', 2, 200),
  ('flutter-dio-005', 'flutter-advanced', 3, 180),
  ('flutter-testing-003', 'flutter-advanced', 4, 180),
  ('flutter-animations-002', 'flutter-advanced', 5, 190),
  ('flutter-localization-006', 'flutter-advanced', 6, 170),
  ('flutter-performance-007', 'flutter-advanced', 7, 190),
  ('flutter-intro-001', 'flutter-basics', 1, 100),
  ('flutter-setup-002', 'flutter-basics', 2, 100),
  ('flutter-widgets-001', 'flutter-basics', 3, 180),
  ('flutter-widgets-003', 'flutter-basics', 4, 120),
  ('flutter-layout-004', 'flutter-basics', 5, 130),
  ('flutter-stateful-005', 'flutter-basics', 6, 150),
  ('flutter-navigation-006', 'flutter-basics', 7, 160),
  ('flutter-async-007', 'flutter-basics', 8, 170),
  ('flutter-http-008', 'flutter-basics', 9, 180),
  ('flutter-storage-009', 'flutter-basics', 10, 160),
  ('flutter-provider-010', 'flutter-basics', 11, 180),
  ('py-adv-7', 'py-advanced', 1, 150),
  ('py-adv-3', 'py-advanced', 2, 150),
  ('py-adv-6', 'py-advanced', 3, 150),
  ('py-adv-4', 'py-advanced', 4, 150),
  ('py-adv-5', 'py-advanced', 5, 150),
  ('py-adv-8', 'py-advanced', 6, 150),
  ('py-adv-10', 'py-advanced', 7, 150),
  ('py-adv-11', 'py-advanced', 8, 140),
  ('py-adv-12', 'py-advanced', 9, 130),
  ('py-adv-13', 'py-advanced', 10, 130),
  ('py-adv-14', 'py-advanced', 11, 120),
  ('py-adv-9', 'py-advanced', 12, 150),
  ('py-adv-concurrency', 'py-advanced', 13, 130),
  ('py-adv-project', 'py-advanced', 14, 180),
  ('py-1', 'py-basics', 1, 100),
  ('py-2', 'py-basics', 2, 100),
  ('py-3', 'py-basics', 3, 100),
  ('py-basics-strings', 'py-basics', 4, 100),
  ('py-4', 'py-basics', 5, 100),
  ('py-basics-booleans', 'py-basics', 6, 100),
  ('py-5', 'py-basics', 7, 100),
  ('py-6', 'py-basics', 8, 100),
  ('py-7', 'py-basics', 9, 100),
  ('py-basics-loop-patterns', 'py-basics', 10, 100),
  ('py-basics-project-guess', 'py-basics', 11, 120),
  ('py-8', 'py-basics', 12, 100),
  ('py-10', 'py-basics', 13, 100),
  ('py-9', 'py-basics', 14, 100),
  ('py-basics-scope-modules', 'py-basics', 15, 100),
  ('py-basics-debugging', 'py-basics', 16, 100),
  ('py-basics-final-project', 'py-basics', 17, 150),
  ('py-ds-1', 'py-data-structures', 1, 100),
  ('py-ds-2', 'py-data-structures', 2, 100),
  ('py-ds-sorting', 'py-data-structures', 3, 100),
  ('py-ds-4', 'py-data-structures', 4, 100),
  ('py-ds-8', 'py-data-structures', 5, 100),
  ('py-ds-3', 'py-data-structures', 6, 100),
  ('py-ds-6', 'py-data-structures', 7, 100),
  ('py-ds-5', 'py-data-structures', 8, 100),
  ('py-ds-json-csv', 'py-data-structures', 9, 110),
  ('py-ds-7', 'py-data-structures', 10, 100),
  ('py-ds-project', 'py-data-structures', 11, 150),
  ('py-adv-1', 'py-oop', 1, 120),
  ('py-oop-3', 'py-oop', 2, 120),
  ('py-oop-7', 'py-oop', 3, 120),
  ('py-adv-2', 'py-oop', 4, 120),
  ('py-oop-4', 'py-oop', 5, 120),
  ('py-oop-6', 'py-oop', 6, 120),
  ('py-oop-5', 'py-oop', 7, 120),
  ('py-oop-8', 'py-oop', 8, 120),
  ('py-oop-9', 'py-oop', 9, 130),
  ('py-oop-10', 'py-oop', 10, 150),
  ('py-oop-project', 'py-oop', 11, 160),
  ('rn-forms-002', 'rn-advanced', 1, 180),
  ('rn-animations-001', 'rn-advanced', 2, 200),
  ('rn-state-management-003', 'rn-advanced', 3, 200),
  ('rn-performance-004', 'rn-advanced', 4, 190),
  ('rn-native-features-005', 'rn-advanced', 5, 200),
  ('rn-intro-001', 'rn-basics', 1, 100),
  ('rn-setup-002', 'rn-basics', 2, 100),
  ('rn-components-003', 'rn-basics', 3, 120),
  ('rn-styling-004', 'rn-basics', 4, 130),
  ('rn-props-006', 'rn-basics', 5, 140),
  ('rn-state-005', 'rn-basics', 6, 150),
  ('rn-state-001', 'rn-basics', 7, 150),
  ('rn-hooks-008', 'rn-basics', 8, 180),
  ('rn-navigation-007', 'rn-basics', 9, 160),
  ('rn-navigation-001', 'rn-basics', 10, 200),
  ('rn-api-009', 'rn-basics', 11, 170),
  ('rn-storage-010', 'rn-basics', 12, 160),
  ('css-adv-1', 'web-css-advanced', 1, 120),
  ('css-adv-2', 'web-css-advanced', 2, 120),
  ('css-adv-3', 'web-css-advanced', 3, 120),
  ('css-adv-4', 'web-css-advanced', 4, 120),
  ('css-adv-5', 'web-css-advanced', 5, 120),
  ('css-adv-project', 'web-css-advanced', 6, 150),
  ('css-1', 'web-css-styling', 1, 100),
  ('css-2', 'web-css-styling', 2, 100),
  ('css-cascade', 'web-css-styling', 3, 100),
  ('css-3', 'web-css-styling', 4, 100),
  ('css-units', 'web-css-styling', 5, 100),
  ('css-4', 'web-css-styling', 6, 100),
  ('css-5', 'web-css-styling', 7, 100),
  ('css-6', 'web-css-styling', 8, 100),
  ('css-7', 'web-css-styling', 9, 100),
  ('css-14', 'web-css-styling', 10, 100),
  ('css-8', 'web-css-styling', 11, 100),
  ('css-9', 'web-css-styling', 12, 100),
  ('css-10', 'web-css-styling', 13, 100),
  ('css-11', 'web-css-styling', 14, 100),
  ('css-12', 'web-css-styling', 15, 100),
  ('css-logical', 'web-css-styling', 16, 100),
  ('css-13', 'web-css-styling', 17, 100),
  ('css-15', 'web-css-styling', 18, 150),
  ('deploy-git-basics', 'web-deployment', 1, 120),
  ('deploy-1', 'web-deployment', 2, 100),
  ('deploy-env', 'web-deployment', 3, 120),
  ('deploy-4', 'web-deployment', 4, 120),
  ('deploy-3', 'web-deployment', 5, 150),
  ('deploy-2', 'web-deployment', 6, 150),
  ('deploy-5', 'web-deployment', 7, 180),
  ('html-1', 'web-html-basics', 1, 100),
  ('html-document', 'web-html-basics', 2, 100),
  ('html-2', 'web-html-basics', 3, 100),
  ('html-3', 'web-html-basics', 4, 100),
  ('html-4', 'web-html-basics', 5, 100),
  ('html-5', 'web-html-basics', 6, 100),
  ('html-media', 'web-html-basics', 7, 100),
  ('html-6', 'web-html-basics', 8, 100),
  ('html-7', 'web-html-basics', 9, 100),
  ('html-8', 'web-html-basics', 10, 100),
  ('html-a11y', 'web-html-basics', 11, 100),
  ('html-project', 'web-html-basics', 12, 150),
  ('js-1', 'web-js-basics', 1, 100),
  ('js-2', 'web-js-basics', 2, 120),
  ('js-3', 'web-js-basics', 3, 100),
  ('js-4', 'web-js-basics', 4, 120),
  ('js-5', 'web-js-basics', 5, 130),
  ('js-6', 'web-js-basics', 6, 150),
  ('js-7', 'web-js-basics', 7, 150),
  ('js-8', 'web-js-basics', 8, 150),
  ('js-json-basics', 'web-js-basics', 9, 120),
  ('js-adv-1', 'web-js-basics', 10, 180),
  ('js-adv-2', 'web-js-basics', 11, 200),
  ('js-errors', 'web-js-basics', 12, 150),
  ('js-modules', 'web-js-basics', 13, 150),
  ('js-9', 'web-js-basics', 14, 180),
  ('js-10', 'web-js-basics', 15, 200),
  ('js-11', 'web-js-basics', 16, 150),
  ('js-12', 'web-js-basics', 17, 200),
  ('react-1', 'web-react-intro', 1, 150),
  ('react-2', 'web-react-intro', 2, 160),
  ('react-3', 'web-react-intro', 3, 180),
  ('react-lists', 'web-react-intro', 4, 150),
  ('react-4', 'web-react-intro', 5, 200),
  ('react-5', 'web-react-intro', 6, 220),
  ('react-8', 'web-react-intro', 7, 150),
  ('react-6', 'web-react-intro', 8, 200),
  ('react-7', 'web-react-intro', 9, 150),
  ('react-14', 'web-react-intro', 10, 150),
  ('react-9', 'web-react-intro', 11, 150),
  ('react-10', 'web-react-intro', 12, 150),
  ('react-13', 'web-react-intro', 13, 150),
  ('react-11', 'web-react-intro', 14, 150),
  ('react-12', 'web-react-intro', 15, 150),
  ('react-15', 'web-react-intro', 16, 200)
ON CONFLICT (lesson_id) DO UPDATE
  SET course_id = EXCLUDED.course_id, position = EXCLUDED.position, xp = EXCLUDED.xp, updated_at = NOW();

-- دروس لم تعد في المحتوى تُزال من الكتالوج فقط (لا من تقدم المستخدمين)
DELETE FROM lesson_catalog WHERE lesson_id NOT IN ('ai-1', 'ai-2', 'ai-3', 'ai-4', 'ai-5', 'dl-1', 'dl-2', 'dl-3', 'dl-4', 'dl-6', 'dl-5', 'dl-7', 'dl-13', 'dl-14', 'dl-8', 'dl-9', 'dl-10', 'dl-11', 'dl-12', 'dl-transformers', 'dl-15', 'ml-1', 'ml-2', 'ml-3', 'ml-4', 'ml-10', 'ml-11', 'ml-5', 'ml-6', 'ml-7', 'ml-8', 'ml-9', 'ml-pipelines', 'ml-12', 'auth-1', 'auth-3', 'auth-2', 'auth-4', 'auth-5', 'auth-6', 'auth-rate-limit-mfa', 'auth-project', 'firebase-1', 'firebase-2', 'firebase-3', 'firebase-4', 'firebase-5', 'firebase-project', 'mongo-1', 'mongo-2', 'mongo-3', 'mongo-4', 'mongo-5', 'mongo-indexes', 'mongo-transactions', 'mongo-project', 'node-1', 'node-2', 'node-3', 'node-4', 'node-5', 'node-streams-events', 'node-testing', 'node-project-structure', 'rest-1', 'rest-2', 'rest-3', 'rest-4', 'rest-5', 'rest-6', 'rest-7', 'rest-8', 'rest-db-layers', 'rest-openapi', 'rest-project', 'sql-1', 'sql-schema-design', 'sql-2', 'sql-3', 'sql-4', 'sql-6', 'sql-5', 'sql-7', 'sql-injection', 'sql-postgres-node', 'sql-migrations', 'sql-project', 'supa-1', 'supa-2', 'supa-6', 'supa-3', 'supa-4', 'supa-5', 'supa-project', 'cpp-adv-13', 'cpp-adv-19', 'cpp-advanced-stl-containers', 'cpp-adv-16', 'cpp-adv-15', 'cpp-adv-17', 'cpp-adv-18', 'cpp-advanced-modern', 'cpp-adv-21', 'cpp-adv-20', 'cpp-adv-22', 'cpp-1', 'cpp-2', 'cpp-3', 'cpp-4', 'cpp-5', 'cpp-6', 'cpp-7', 'cpp-basics-strings', 'cpp-8', 'cpp-basics-vector', 'cpp-9', 'cpp-10', 'cpp-basics-errors', 'cpp-basics-project', 'cpp-adv-1', 'cpp-adv-3', 'cpp-adv-8', 'cpp-oop-lifetime', 'cpp-adv-6', 'cpp-adv-7', 'cpp-adv-2', 'cpp-adv-4', 'cpp-adv-5', 'cpp-adv-10', 'cpp-adv-9', 'cpp-adv-11', 'cpp-adv-12', 'cpp-ptr-1', 'cpp-ptr-2', 'cpp-ptr-3', 'cpp-ptr-6', 'cpp-pointers-memory', 'cpp-ptr-4', 'cpp-ptr-5', 'cpp-ptr-7', 'cpp-ptr-8', 'cyber-adv-1', 'cyber-sql-001', 'cyber-adv-2', 'cyber-xss-001', 'cyber-csrf', 'cyber-adv-3', 'cyber-1', 'cyber-2', 'cyber-3', 'cyber-4', 'cyber-5', 'cyber-http-basics', 'cyber-cookies-sessions', 'cyber-6', 'ethical-intro', 'ethical-recon', 'ethical-scanning', 'ethical-exploitation-basics', 'ethical-web-hacking', 'ethical-web-advanced', 'ethical-password-cracking', 'ethical-privilege-escalation', 'ethical-post-exploitation', 'ethical-wireless-hacking', 'ethical-social-engineering', 'ethical-reporting', 'ethical-report-writing', 'ethical-ctf', 'ethical-career-path', 'cyber-network-001', 'cyber-firewall-basics', 'cyber-encryption-001', 'cyber-vpn-security', 'cyber-wifi-security', 'cyber-network-segmentation', 'cyber-dmz-architecture', 'cyber-zero-trust', 'cyber-ids-ips', 'cyber-network-monitoring', 'flutter-architecture-004', 'flutter-riverpod-001', 'flutter-dio-005', 'flutter-testing-003', 'flutter-animations-002', 'flutter-localization-006', 'flutter-performance-007', 'flutter-intro-001', 'flutter-setup-002', 'flutter-widgets-001', 'flutter-widgets-003', 'flutter-layout-004', 'flutter-stateful-005', 'flutter-navigation-006', 'flutter-async-007', 'flutter-http-008', 'flutter-storage-009', 'flutter-provider-010', 'py-adv-7', 'py-adv-3', 'py-adv-6', 'py-adv-4', 'py-adv-5', 'py-adv-8', 'py-adv-10', 'py-adv-11', 'py-adv-12', 'py-adv-13', 'py-adv-14', 'py-adv-9', 'py-adv-concurrency', 'py-adv-project', 'py-1', 'py-2', 'py-3', 'py-basics-strings', 'py-4', 'py-basics-booleans', 'py-5', 'py-6', 'py-7', 'py-basics-loop-patterns', 'py-basics-project-guess', 'py-8', 'py-10', 'py-9', 'py-basics-scope-modules', 'py-basics-debugging', 'py-basics-final-project', 'py-ds-1', 'py-ds-2', 'py-ds-sorting', 'py-ds-4', 'py-ds-8', 'py-ds-3', 'py-ds-6', 'py-ds-5', 'py-ds-json-csv', 'py-ds-7', 'py-ds-project', 'py-adv-1', 'py-oop-3', 'py-oop-7', 'py-adv-2', 'py-oop-4', 'py-oop-6', 'py-oop-5', 'py-oop-8', 'py-oop-9', 'py-oop-10', 'py-oop-project', 'rn-forms-002', 'rn-animations-001', 'rn-state-management-003', 'rn-performance-004', 'rn-native-features-005', 'rn-intro-001', 'rn-setup-002', 'rn-components-003', 'rn-styling-004', 'rn-props-006', 'rn-state-005', 'rn-state-001', 'rn-hooks-008', 'rn-navigation-007', 'rn-navigation-001', 'rn-api-009', 'rn-storage-010', 'css-adv-1', 'css-adv-2', 'css-adv-3', 'css-adv-4', 'css-adv-5', 'css-adv-project', 'css-1', 'css-2', 'css-cascade', 'css-3', 'css-units', 'css-4', 'css-5', 'css-6', 'css-7', 'css-14', 'css-8', 'css-9', 'css-10', 'css-11', 'css-12', 'css-logical', 'css-13', 'css-15', 'deploy-git-basics', 'deploy-1', 'deploy-env', 'deploy-4', 'deploy-3', 'deploy-2', 'deploy-5', 'html-1', 'html-document', 'html-2', 'html-3', 'html-4', 'html-5', 'html-media', 'html-6', 'html-7', 'html-8', 'html-a11y', 'html-project', 'js-1', 'js-2', 'js-3', 'js-4', 'js-5', 'js-6', 'js-7', 'js-8', 'js-json-basics', 'js-adv-1', 'js-adv-2', 'js-errors', 'js-modules', 'js-9', 'js-10', 'js-11', 'js-12', 'react-1', 'react-2', 'react-3', 'react-lists', 'react-4', 'react-5', 'react-8', 'react-6', 'react-7', 'react-14', 'react-9', 'react-10', 'react-13', 'react-11', 'react-12', 'react-15');

-- 2) المعرّف المكرر cpp-adv-4
-- كان نفس المعرّف لدرسين (cpp-oop: تعدد الأشكال، cpp-advanced: حاويات STL)، والتقدم مفتاحه
-- (user_id, lesson_id) فكان صف واحد يُستبدل course_id فيه بآخر درس حُفظ.
-- درس cpp-advanced صار cpp-advanced-stl-containers: ننقل صفوفه فقط.
UPDATE user_lesson_progress p
SET lesson_id = 'cpp-advanced-stl-containers', updated_at = NOW()
WHERE p.lesson_id = 'cpp-adv-4'
  AND p.course_id = 'cpp-advanced'
  AND NOT EXISTS (
    SELECT 1 FROM user_lesson_progress x
    WHERE x.user_id = p.user_id AND x.lesson_id = 'cpp-advanced-stl-containers'
  );

-- 3) دروس نُقلت لدورة أخرى (js-adv-1/2 ← web-js-basics، rn-state-001/rn-navigation-001 ← rn-basics):
-- نصحح course_id في التقدم ليطابق الكتالوج (التحديات course_id = 'challenges' لا تُلمس)
UPDATE user_lesson_progress p
SET course_id = lc.course_id, updated_at = NOW()
FROM lesson_catalog lc
WHERE lc.lesson_id = p.lesson_id
  AND p.course_id IS DISTINCT FROM lc.course_id
  AND p.course_id <> 'challenges'
  -- صف cpp-adv-4 القديم الذي لم يُنقل في الخطوة 2 (للمستخدم صف للدرس الجديد مسبقاً) يبقى كما هو:
  -- نقله إلى cpp-oop يمنح المستخدم درس cpp-oop لم يكمله
  AND NOT (p.lesson_id = 'cpp-adv-4' AND p.course_id = 'cpp-advanced');

-- 4) عدد الدروس الحقيقي لكل دورة (كان مثلاً 12 لـ HTML و 8 فقط موجودة ← الدورة لا تكتمل)
UPDATE course_coin_catalog c
SET total_lessons = sub.n
FROM (SELECT course_id, COUNT(*)::INTEGER AS n FROM lesson_catalog GROUP BY course_id) sub
WHERE sub.course_id = c.course_id AND c.total_lessons IS DISTINCT FROM sub.n;

-- اقتراح السعر يُحدَّث فقط؛ unlock_cost لا يتغير إلا بقرار المشرف (admin_apply_suggested_prices)
UPDATE course_coin_catalog
SET suggested_cost = coins_suggest_price(difficulty, total_lessons, has_project, demand_factor);

-- 5) مكافأة إكمال الدورة: تُحسب دروس الكتالوج فقط (لا معرّفات مختلقة يرسلها العميل)
CREATE OR REPLACE FUNCTION coins_reward_course_completion(p_course_id TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_c course_coin_catalog%ROWTYPE;
  v_total INTEGER;
  v_done INTEGER;
  v_amount INTEGER;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_authenticated');
  END IF;
  IF _coins_restricted(v_uid) THEN
    RETURN jsonb_build_object('success', false, 'code', 'restricted');
  END IF;
  SELECT * INTO v_c FROM course_coin_catalog WHERE course_id = p_course_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'code', 'unknown_course');
  END IF;
  IF v_c.unlock_cost > 0 AND NOT EXISTS (
    SELECT 1 FROM user_unlocked_courses WHERE user_id = v_uid AND course_id = p_course_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'code', 'locked');
  END IF;

  SELECT COUNT(*) INTO v_total FROM lesson_catalog WHERE course_id = p_course_id;
  IF v_total = 0 THEN
    v_total := v_c.total_lessons;   -- احتياط إن لم يُملأ الكتالوج
  END IF;

  SELECT COUNT(DISTINCT p.lesson_id) INTO v_done
  FROM user_lesson_progress p
  JOIN lesson_catalog lc ON lc.lesson_id = p.lesson_id AND lc.course_id = p_course_id
  WHERE p.user_id = v_uid AND p.completed = TRUE;

  IF v_done < v_total THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_completed', 'completed', v_done, 'total', v_total);
  END IF;

  v_amount := COALESCE((_coin_cfg('course_completion_rewards')->>v_c.difficulty)::INTEGER, 30);
  RETURN _coins_apply(v_uid, v_amount, 'course_complete', 'إكمال دورة: ' || v_c.title,
                      p_course_id, 'course_complete:' || p_course_id)
         || jsonb_build_object('reward', v_amount);
END;
$$;

REVOKE ALL ON FUNCTION coins_reward_course_completion(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION coins_reward_course_completion(TEXT) TO authenticated;

COMMIT;
