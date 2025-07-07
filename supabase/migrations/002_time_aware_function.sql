-- Create time-aware redirect function with pro user check
CREATE OR REPLACE FUNCTION get_redirect_url_for_short_code(p_short_code TEXT)
RETURNS TEXT AS $$
DECLARE
    qr_record RECORD;
    user_plan TEXT;
    rule JSONB;
    current_time_utc TIME;
    redirect_url TEXT;
BEGIN
    -- Get the QR code record
    SELECT * INTO qr_record FROM public.qr_codes WHERE short_code = p_short_code;

    -- If no record found, return null
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    -- Set the default URL first
    redirect_url := qr_record.original_url;

    -- Get the user's plan from their metadata. Default to 'free'.
    SELECT raw_user_meta_data->>'plan' INTO user_plan
    FROM auth.users WHERE id = qr_record.user_id;

    -- PAYWALL CHECK: Only apply rules if the user is on a 'pro' plan
    -- and the rules exist.
    IF (user_plan = 'pro' AND qr_record.qr_settings ? 'timeRules') THEN
        current_time_utc := (NOW() AT TIME ZONE 'UTC')::TIME;

        -- Loop through the rules to find a match
        FOR rule IN SELECT * FROM jsonb_array_elements(qr_record.qr_settings->'timeRules')
        LOOP
            IF current_time_utc >= (rule->>'startTime')::TIME AND current_time_utc < (rule->>'endTime')::TIME THEN
                redirect_url := rule->>'url';
                EXIT; -- Exit the loop once a matching rule is found
            END IF;
        END LOOP;
    END IF;

    RETURN redirect_url;
END;
$$ LANGUAGE plpgsql;