/**
 * يولّد migration لكتالوج التحديات على السيرفر (المعرّف ← الصعوبة) من ALL_CHALLENGES،
 * حتى لا تعتمد مكافأة الكوينات على صعوبة يرسلها العميل.
 * التشغيل: npx tsx scripts/challenge-audit/gen-catalog-migration.ts
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ALL_CHALLENGES } from '../../src/constants/courseData';

const q = (s: string) => `'${s.replace(/'/g, "''")}'`;
const rows = ALL_CHALLENGES.map((c) => `  (${q(c.id)}, ${q(c.difficulty)})`).join(',\n');

const sql = `-- ============================================================================
-- كتالوج التحديات على السيرفر + تشديد مكافأة التحديات
-- (مولّد من scripts/challenge-audit/gen-catalog-migration.ts — ${ALL_CHALLENGES.length} تحدياً)
--
-- المشكلة: coins_reward_challenge كانت تأخذ الصعوبة من العميل (يمكن ادعاء "hard"
-- لتحدٍ سهل) وتقبل أي معرّف تحدٍ (يمكن اختلاق معرّفات حتى الحد اليومي).
-- الحل: الصعوبة تُقرأ من الكتالوج، والمعرّف غير الموجود يُرفض.
-- آمن: إضافة جدول + استبدال الدالة فقط. لا حذف لأي بيانات.
-- ============================================================================

CREATE TABLE IF NOT EXISTS challenge_catalog (
  id TEXT PRIMARY KEY,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE challenge_catalog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS challenge_catalog_read ON challenge_catalog;
DROP POLICY IF EXISTS challenge_catalog_admin_write ON challenge_catalog;
CREATE POLICY challenge_catalog_read ON challenge_catalog FOR SELECT USING (true);
CREATE POLICY challenge_catalog_admin_write ON challenge_catalog FOR ALL USING (is_admin()) WITH CHECK (is_admin());

INSERT INTO challenge_catalog (id, difficulty) VALUES
${rows}
ON CONFLICT (id) DO UPDATE SET difficulty = EXCLUDED.difficulty, updated_at = now();

-- نفس التوقيع (توافق مع التطبيق الحالي)؛ p_difficulty يُتجاهل لصالح الكتالوج
CREATE OR REPLACE FUNCTION coins_reward_challenge(p_challenge_id TEXT, p_difficulty TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_cfg JSONB := _coin_cfg('challenge_rewards');
  v_cap INTEGER := COALESCE((v_cfg->>'daily_cap')::INTEGER, 60);
  v_today DATE := _coin_today();
  v_tz TEXT := COALESCE(_coin_cfg('daily_ladder')->>'timezone', 'Asia/Baghdad');
  v_difficulty TEXT;
  v_earned INTEGER;
  v_amount INTEGER;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_authenticated');
  END IF;
  IF _coins_restricted(v_uid) THEN
    RETURN jsonb_build_object('success', false, 'code', 'restricted');
  END IF;

  SELECT difficulty INTO v_difficulty FROM challenge_catalog WHERE id = p_challenge_id;
  IF v_difficulty IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'invalid');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM user_lesson_progress
                 WHERE user_id = v_uid AND lesson_id = p_challenge_id
                   AND course_id = 'challenges' AND completed = TRUE) THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_completed');
  END IF;

  PERFORM 1 FROM profiles WHERE id = v_uid FOR UPDATE;
  SELECT COALESCE(SUM(amount), 0) INTO v_earned FROM point_transactions
  WHERE user_id = v_uid AND source = 'challenge'
    AND (created_at AT TIME ZONE v_tz)::date = v_today;

  v_amount := LEAST(COALESCE((v_cfg->>v_difficulty)::INTEGER, 5), v_cap - v_earned);
  IF v_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'code', 'daily_cap', 'cap', v_cap);
  END IF;

  RETURN _coins_apply(v_uid, v_amount, 'challenge', 'حل تحدي', p_challenge_id,
                      'challenge:' || p_challenge_id) || jsonb_build_object('reward', v_amount);
END;
$$;
`;

const out = join(__dirname, '../../supabase/migrations/20261001000000_challenge_catalog.sql');
writeFileSync(out, sql, 'utf8');
console.log('wrote', out, ALL_CHALLENGES.length, 'challenges');
