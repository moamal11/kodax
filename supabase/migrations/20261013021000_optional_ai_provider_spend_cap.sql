BEGIN;
-- NULL disables the app ceiling. OpenAI prepaid balance remains provider-enforced.
CREATE OR REPLACE FUNCTION public.ai_provider_spend_reserve(p_micro_usd bigint, p_cap_micro_usd bigint)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_id uuid;
BEGIN
  IF p_micro_usd IS NULL OR p_micro_usd <= 0
     OR (p_cap_micro_usd IS NOT NULL AND p_cap_micro_usd <= 0) THEN RETURN NULL; END IF;
  PERFORM pg_advisory_xact_lock(130202610);
  IF p_cap_micro_usd IS NOT NULL THEN
    IF COALESCE((SELECT SUM(COALESCE(charged_micro_usd, reserved_micro_usd)) FROM ai_provider_spend), 0)
         + p_micro_usd > p_cap_micro_usd THEN RETURN NULL; END IF;
  END IF;
  INSERT INTO ai_provider_spend(reserved_micro_usd) VALUES(p_micro_usd) RETURNING id INTO v_id;
  RETURN v_id;
END $$;
REVOKE ALL ON FUNCTION public.ai_provider_spend_reserve(bigint,bigint) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ai_provider_spend_reserve(bigint,bigint) TO service_role;
COMMIT;
