-- Create master redirect function that checks all conditions in priority order
CREATE OR REPLACE FUNCTION get_final_redirect_url(
    p_short_code TEXT, 
    p_latitude double precision DEFAULT NULL, 
    p_longitude double precision DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
    qr_record RECORD;
    user_plan TEXT;
    final_url TEXT;
BEGIN
    -- Get the QR code record
    SELECT * INTO qr_record FROM public.qr_codes WHERE short_code = p_short_code;

    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    -- Get the user's plan from their metadata. Default to 'free'.
    SELECT COALESCE(raw_user_meta_data->>'plan', 'free') INTO user_plan
    FROM auth.users WHERE id = qr_record.user_id;

    -- 1. SCAN LIMIT CHECK (Highest Priority)
    -- This check applies to all users if they set a limit
    IF qr_record.scan_limit IS NOT NULL AND qr_record.scan_count >= qr_record.scan_limit THEN
        -- If an expired_url is set, use it. Otherwise, return null to show an error page.
        RETURN qr_record.expired_url;
    END IF;

    -- 2. GEO-AWARE CHECK (Pro users only)
    -- Only check geo rules if location is provided
    IF p_latitude IS NOT NULL AND p_longitude IS NOT NULL THEN
        SELECT get_url_for_location(p_short_code, p_latitude, p_longitude) INTO final_url;
        
        -- If geo function returns a different URL, use it
        IF final_url IS NOT NULL AND final_url != qr_record.original_url THEN
            RETURN final_url;
        END IF;
    END IF;

    -- 3. TIME-AWARE CHECK (Pro users only)
    -- This function already contains the paywall logic
    SELECT get_redirect_url_for_short_code(p_short_code) INTO final_url;
    
    -- Return the final URL (could be original or time-based)
    RETURN final_url;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_final_redirect_url TO authenticated;

-- Add comment to document the function
COMMENT ON FUNCTION get_final_redirect_url IS 'Master redirect function that checks scan limits, geo rules, and time rules in priority order';