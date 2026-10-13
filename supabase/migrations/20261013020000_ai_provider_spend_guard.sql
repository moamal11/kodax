BEGIN;
-- A shared, lifetime app ceiling. Settled spend and in-flight holds both count.
CREATE TABLE public.ai_provider_spend (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reserved_micro_usd bigint NOT NULL CHECK (reserved_micro_usd > 0),
  charged_micro_usd bigint CHECK (charged_micro_usd >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_provider_spend ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ai_provider_spend FROM anon, authenticated;

CREATE FUNCTION public.ai_provider_spend_reserve(p_micro_usd bigint, p_cap_micro_usd bigint)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_id uuid;
BEGIN
  IF p_micro_usd <= 0 OR p_cap_micro_usd <= 0 THEN RETURN NULL; END IF;
  PERFORM pg_advisory_xact_lock(130202610);
  IF COALESCE((SELECT SUM(COALESCE(charged_micro_usd, reserved_micro_usd)) FROM ai_provider_spend), 0)
       + p_micro_usd > p_cap_micro_usd THEN RETURN NULL; END IF;
  INSERT INTO ai_provider_spend(reserved_micro_usd) VALUES(p_micro_usd) RETURNING id INTO v_id;
  RETURN v_id;
END $$;
CREATE FUNCTION public.ai_provider_spend_settle(p_id uuid, p_micro_usd bigint)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  IF p_micro_usd < 0 THEN RAISE EXCEPTION 'Invalid cost'; END IF;
  PERFORM pg_advisory_xact_lock(130202610);
  UPDATE ai_provider_spend SET charged_micro_usd = p_micro_usd WHERE id = p_id AND charged_micro_usd IS NULL;
END $$;
REVOKE ALL ON FUNCTION public.ai_provider_spend_reserve(bigint,bigint) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.ai_provider_spend_settle(uuid,bigint) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ai_provider_spend_reserve(bigint,bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.ai_provider_spend_settle(uuid,bigint) TO service_role;
COMMIT;
