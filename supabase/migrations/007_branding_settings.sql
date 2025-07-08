-- Add branding settings to qr_codes table
ALTER TABLE qr_codes
ADD COLUMN branding_enabled BOOLEAN DEFAULT false,
ADD COLUMN branding_duration INTEGER DEFAULT 3 CHECK (branding_duration >= 1 AND branding_duration <= 10),
ADD COLUMN branding_style TEXT DEFAULT 'minimal' CHECK (branding_style IN ('minimal', 'full', 'custom')),
ADD COLUMN custom_branding_text TEXT;

-- Add comment for documentation
COMMENT ON COLUMN qr_codes.branding_enabled IS 'Whether QR Blast branding is shown on redirect page (pro feature)';
COMMENT ON COLUMN qr_codes.branding_duration IS 'Duration in seconds to show branding before redirect (1-10 seconds)';
COMMENT ON COLUMN qr_codes.branding_style IS 'Style of branding display: minimal, full, or custom';
COMMENT ON COLUMN qr_codes.custom_branding_text IS 'Custom text to display when branding_style is custom';

-- Update the master redirect function to include branding settings
CREATE OR REPLACE FUNCTION get_final_redirect_url(p_qr_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY definer
AS $$
DECLARE
  v_result JSON;
  v_url TEXT;
  v_expired_url TEXT;
  v_is_valid BOOLEAN := true;
  v_branding_enabled BOOLEAN;
  v_branding_duration INTEGER;
  v_branding_style TEXT;
  v_custom_branding_text TEXT;
BEGIN
  -- Get basic QR code info including branding settings
  SELECT 
    destination_url,
    expired_url,
    branding_enabled,
    branding_duration,
    branding_style,
    custom_branding_text
  INTO 
    v_url,
    v_expired_url,
    v_branding_enabled,
    v_branding_duration,
    v_branding_style,
    v_custom_branding_text
  FROM qr_codes
  WHERE id = p_qr_id;

  IF v_url IS NULL THEN
    RETURN json_build_object('error', 'QR code not found');
  END IF;

  -- Check scan limit first (highest priority)
  SELECT (scan_limit IS NOT NULL AND scan_count >= scan_limit)
  INTO v_is_valid
  FROM qr_codes
  WHERE id = p_qr_id;

  IF v_is_valid THEN
    -- Increment scan count
    UPDATE qr_codes
    SET scan_count = scan_count + 1
    WHERE id = p_qr_id;

    -- Return expired URL if scan limit reached
    SELECT scan_count >= scan_limit
    INTO v_is_valid
    FROM qr_codes
    WHERE id = p_qr_id
      AND scan_limit IS NOT NULL;

    IF v_is_valid AND v_expired_url IS NOT NULL THEN
      RETURN json_build_object(
        'url', v_expired_url,
        'is_expired', true,
        'reason', 'scan_limit_reached'
      );
    END IF;
  END IF;

  -- Check time rules (second priority)
  SELECT COUNT(*) = 0 OR SUM(
    CASE 
      WHEN tr.is_active 
           AND EXTRACT(dow FROM NOW()) = ANY(tr.days_of_week) 
           AND NOW()::time BETWEEN tr.start_time AND tr.end_time 
      THEN 1 
      ELSE 0 
    END
  ) > 0
  INTO v_is_valid
  FROM time_rules tr
  WHERE tr.qr_code_id = p_qr_id;

  IF NOT v_is_valid AND v_expired_url IS NOT NULL THEN
    RETURN json_build_object(
      'url', v_expired_url,
      'is_expired', true,
      'reason', 'time_rule_expired'
    );
  END IF;

  -- Check geo rules (third priority)
  -- For now, we'll return true for geo rules as they need to be checked client-side
  -- This is a placeholder for future server-side geo validation

  -- Return the valid URL with branding settings
  RETURN json_build_object(
    'url', v_url,
    'is_expired', false,
    'branding_enabled', v_branding_enabled,
    'branding_duration', v_branding_duration,
    'branding_style', v_branding_style,
    'custom_branding_text', v_custom_branding_text
  );
END;
$$;