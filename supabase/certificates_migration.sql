-- =====================================================
-- 🎓 Kodax Certificate System - Database Schema
-- Professional Certificate System (Silver → Gold → Platinum)
-- =====================================================

-- ===== 1. Certificate Level Enum =====
DO $$ BEGIN
  CREATE TYPE certificate_level AS ENUM ('silver', 'gold', 'platinum');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ===== 2. Certificate Status Enum =====
DO $$ BEGIN
  CREATE TYPE certificate_status AS ENUM ('valid', 'revoked', 'archived');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ===== 3. Certificate Requirements Configuration =====
-- Dynamic per-course requirements (can be overridden per course)
CREATE TABLE IF NOT EXISTS certificate_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id TEXT NOT NULL,
  level certificate_level NOT NULL,
  
  -- Lesson completion requirements
  min_lessons_percent INTEGER NOT NULL DEFAULT 60, -- e.g., 60% for Silver, 100% for Gold/Platinum
  
  -- Challenge requirements
  min_challenges_percent INTEGER NOT NULL DEFAULT 50, -- 50% for Silver, 80% Gold, 100% Platinum
  max_challenge_errors INTEGER DEFAULT NULL, -- NULL = unlimited, 0 = no critical errors for Platinum
  
  -- Quiz/Exam requirements
  min_exam_score INTEGER NOT NULL DEFAULT 60, -- 60% Silver, 80% Gold, 95% Platinum
  
  -- Project requirements
  requires_project BOOLEAN NOT NULL DEFAULT false, -- true for Gold+
  
  -- Time requirements (optional)
  max_completion_days INTEGER DEFAULT NULL, -- NULL = no limit, e.g., 90 days for Platinum
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Each course can only have one requirement set per level
  UNIQUE(course_id, level)
);

-- ===== 4. Certificates Table (Core) =====
CREATE TABLE IF NOT EXISTS certificates (
  -- Primary key is the Certificate ID (public-facing UUID)
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Owner and course
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  
  -- Certificate details
  level certificate_level NOT NULL,
  status certificate_status NOT NULL DEFAULT 'valid',
  
  -- Security: HMAC-SHA256 hash of (id + user_id + course_id + level + issued_at + server_secret)
  security_hash TEXT NOT NULL,
  
  -- Achievement snapshot at time of issuance (immutable proof)
  achievement_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Example: {
  --   "lessons_completed": 15,
  --   "lessons_total": 15,
  --   "lessons_percent": 100,
  --   "challenges_completed": 12,
  --   "challenges_total": 15,
  --   "challenges_percent": 80,
  --   "exam_score": 85,
  --   "critical_errors": 0,
  --   "completion_days": 14,
  --   "project_completed": true
  -- }
  
  -- User info snapshot (in case user changes name later)
  user_full_name TEXT NOT NULL,
  user_username TEXT,
  
  -- Course info snapshot
  course_title TEXT NOT NULL,
  course_title_ar TEXT,
  
  -- Timestamps
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  revocation_reason TEXT,
  
  -- Upgraded from (link to previous lower-level certificate)
  upgraded_from UUID REFERENCES certificates(id),
  
  -- Prevent duplicate active certificates for same user+course+level
  -- A user can have multiple certificates if lower ones are archived
  CONSTRAINT unique_active_certificate UNIQUE (user_id, course_id, level)
);

-- ===== 5. Certificate Audit Log =====
CREATE TABLE IF NOT EXISTS certificate_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id UUID NOT NULL REFERENCES certificates(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'issued', 'revoked', 'archived', 'upgraded', 'verified', 'downloaded'
  actor_id UUID, -- who performed the action (NULL for system)
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== 6. Final Exam Results Table =====
-- Stores final exam results for certification purposes
CREATE TABLE IF NOT EXISTS course_final_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  time_taken_seconds INTEGER, -- how long the exam took
  answers JSONB NOT NULL DEFAULT '[]'::jsonb, -- detailed answers for verification
  passed BOOLEAN NOT NULL DEFAULT false,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Composite index for quick lookups
  UNIQUE(user_id, course_id, attempt_number)
);

-- ===== 7. Indexes =====
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course_id ON certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);
CREATE INDEX IF NOT EXISTS idx_certificates_level ON certificates(level);
CREATE INDEX IF NOT EXISTS idx_certificates_user_course ON certificates(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_certificates_issued_at ON certificates(issued_at DESC);
CREATE INDEX IF NOT EXISTS idx_certificate_audit_cert_id ON certificate_audit_log(certificate_id);
CREATE INDEX IF NOT EXISTS idx_certificate_audit_action ON certificate_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_certificate_requirements_course ON certificate_requirements(course_id);
CREATE INDEX IF NOT EXISTS idx_final_exams_user_course ON course_final_exams(user_id, course_id);

-- ===== 8. Row Level Security =====
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_final_exams ENABLE ROW LEVEL SECURITY;

-- Certificates: Users can view their own + public verification
CREATE POLICY "Users can view own certificates"
  ON certificates FOR SELECT
  USING (auth.uid() = user_id);

-- Public verification: anyone can verify a certificate by ID
CREATE POLICY "Public certificate verification"
  ON certificates FOR SELECT
  USING (status = 'valid');

-- Only server (service_role) can INSERT/UPDATE/DELETE certificates
-- No direct user insert/update/delete policies = server-only issuance

-- Certificate Requirements: readable by all authenticated users
CREATE POLICY "Authenticated users can view requirements"
  ON certificate_requirements FOR SELECT
  TO authenticated
  USING (true);

-- Audit Log: users can view logs for their own certificates
CREATE POLICY "Users can view own certificate audit logs"
  ON certificate_audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM certificates c
      WHERE c.id = certificate_audit_log.certificate_id
      AND c.user_id = auth.uid()
    )
  );

-- Final Exams: users can view their own, server inserts
CREATE POLICY "Users can view own exam results"
  ON course_final_exams FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exam results"
  ON course_final_exams FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ===== 9. Default Certificate Requirements =====
-- These are the default requirements; can be overridden per course
-- We insert defaults for a special 'default' course_id that the Edge Function
-- will fall back to if no course-specific requirements exist

INSERT INTO certificate_requirements (course_id, level, min_lessons_percent, min_challenges_percent, max_challenge_errors, min_exam_score, requires_project, max_completion_days)
VALUES 
  ('__default__', 'silver', 60, 50, NULL, 60, false, NULL),
  ('__default__', 'gold', 100, 80, NULL, 80, false, NULL),
  ('__default__', 'platinum', 100, 100, 0, 95, false, NULL)
ON CONFLICT (course_id, level) DO NOTHING;

-- ===== 10. Updated_at Trigger =====
CREATE OR REPLACE FUNCTION update_certificate_requirements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS certificate_requirements_updated_at ON certificate_requirements;
CREATE TRIGGER certificate_requirements_updated_at
  BEFORE UPDATE ON certificate_requirements
  FOR EACH ROW
  EXECUTE FUNCTION update_certificate_requirements_updated_at();

-- ===== 11. Function: Verify Certificate (Public RPC) =====
CREATE OR REPLACE FUNCTION verify_certificate(cert_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cert RECORD;
  result JSON;
BEGIN
  SELECT 
    c.id,
    c.user_full_name,
    c.course_title,
    c.course_title_ar,
    c.level,
    c.status,
    c.issued_at,
    c.revoked_at,
    c.revocation_reason,
    c.achievement_snapshot
  INTO cert
  FROM certificates c
  WHERE c.id = cert_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'found', false,
      'message', 'Certificate not found'
    );
  END IF;
  
  -- Log the verification attempt
  INSERT INTO certificate_audit_log (certificate_id, action, metadata)
  VALUES (cert_id, 'verified', json_build_object('verified_at', NOW())::jsonb);
  
  RETURN json_build_object(
    'found', true,
    'certificate_id', cert.id,
    'holder_name', cert.user_full_name,
    'course_title', cert.course_title,
    'course_title_ar', cert.course_title_ar,
    'level', cert.level,
    'status', cert.status,
    'issued_at', cert.issued_at,
    'revoked_at', cert.revoked_at,
    'revocation_reason', cert.revocation_reason,
    'achievement_snapshot', cert.achievement_snapshot
  );
END;
$$;

-- ===== 12. Function: Get User Certificates Summary =====
CREATE OR REPLACE FUNCTION get_user_certificates_summary(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total', COUNT(*),
    'silver', COUNT(*) FILTER (WHERE level = 'silver' AND status = 'valid'),
    'gold', COUNT(*) FILTER (WHERE level = 'gold' AND status = 'valid'),
    'platinum', COUNT(*) FILTER (WHERE level = 'platinum' AND status = 'valid'),
    'certificates', COALESCE(
      json_agg(
        json_build_object(
          'id', id,
          'field_id', course_id,
          'field_name', course_title,
          'field_name_ar', course_title_ar,
          'course_id', course_id,
          'course_title', course_title,
          'course_title_ar', course_title_ar,
          'level', level,
          'status', status,
          'issued_at', issued_at,
          'achievement_snapshot', achievement_snapshot
        ) ORDER BY issued_at DESC
      ) FILTER (WHERE status IN ('valid', 'archived')),
      '[]'::json
    )
  )
  INTO result
  FROM certificates
  WHERE user_id = p_user_id;
  
  RETURN result;
END;
$$;
