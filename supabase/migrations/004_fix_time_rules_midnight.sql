-- Fix time-aware redirect function to handle midnight crossover
CREATE OR REPLACE FUNCTION get_redirect_url_for_short_code(p_short_code TEXT)
RETURNS TEXT AS $$
DECLARE
    qr_record RECORD;
    user_plan TEXT;
    rule JSONB;
    current_time_utc TIME;
    redirect_url TEXT;
    start_time TIME;
    end_time TIME;
    rule_matches BOOLEAN;
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
            start_time := (rule->>'startTime')::TIME;
            end_time := (rule->>'endTime')::TIME;
            
            -- Handle time ranges that cross midnight (e.g., 21:00 to 01:00)
            IF start_time > end_time THEN
                -- Midnight crossover: rule is active if current time is >= start_time OR < end_time
                rule_matches := (current_time_utc >= start_time) OR (current_time_utc < end_time);
            ELSE
                -- Normal range: rule is active if current time is >= start_time AND < end_time
                rule_matches := (current_time_utc >= start_time) AND (current_time_utc < end_time);
            END IF;
            
            IF rule_matches THEN
                redirect_url := rule->>'url';
                EXIT; -- Exit the loop once a matching rule is found
            END IF;
        END LOOP;
    END IF;

    RETURN redirect_url;
END;
$$ LANGUAGE plpgsql;