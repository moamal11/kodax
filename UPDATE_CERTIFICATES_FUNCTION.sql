-- =====================================================
-- Update get_user_certificates_summary function
-- To include field_id, field_name, field_name_ar
-- =====================================================

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

-- Verify the function was created
SELECT 'Function updated successfully' as status;
