-- supabase/migrations/003_geo_aware_function.sql

-- Helper function to calculate distance between two lat/lon points using Haversine formula
CREATE OR REPLACE FUNCTION public.calculate_distance(
    lat1 double precision,
    lon1 double precision,
    lat2 double precision,
    lon2 double precision)
RETURNS double precision
LANGUAGE plpgsql
AS $function$
DECLARE
    R integer = 6371; -- Earth's radius in kilometers
    dLat double precision;
    dLon double precision;
    a double precision;
    c double precision;
BEGIN
    dLat = radians(lat2 - lat1);
    dLon = radians(lon2 - lon1);
    a = sin(dLat / 2) * sin(dLat / 2) +
        cos(radians(lat1)) * cos(radians(lat2)) *
        sin(dLon / 2) * sin(dLon / 2);
    c = 2 * atan2(sqrt(a), sqrt(1 - a));
    RETURN R * c;
END;
$function$;

-- Main function to get URL based on short code and location
CREATE OR REPLACE FUNCTION get_url_for_location(p_short_code TEXT, p_latitude double precision, p_longitude double precision)
RETURNS TEXT AS $function$
DECLARE
    qr_record RECORD;
    user_plan TEXT;
    rule JSONB;
    redirect_url TEXT;
    distance double precision;
BEGIN
    -- Get the QR code record
    SELECT * INTO qr_record FROM public.qr_codes WHERE short_code = p_short_code;

    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    -- Default to the time-aware URL (or original if no time rules)
    SELECT get_redirect_url_for_short_code(p_short_code) INTO redirect_url;

    -- Get user plan for paywall check
    SELECT raw_user_meta_data->>'plan' INTO user_plan
    FROM auth.users WHERE id = qr_record.user_id;

    -- PAYWALL CHECK: Only apply geo-rules for 'pro' users
    IF (user_plan = 'pro' AND qr_record.qr_settings ? 'geoRules') THEN
        FOR rule IN SELECT * FROM jsonb_array_elements(qr_record.qr_settings->'geoRules')
        LOOP
            -- Check for radius-based rule
            IF rule->>'type' = 'radius' THEN
                distance := public.calculate_distance(
                    p_latitude,
                    p_longitude,
                    (rule->>'lat')::double precision,
                    (rule->>'lon')::double precision
                );

                IF distance <= (rule->>'radius_km')::double precision THEN
                    redirect_url := rule->>'url';
                    EXIT; -- Rule matched, exit loop
                END IF;
            END IF;
            -- Note: Country/city rules would be handled here in future versions
        END LOOP;
    END IF;

    RETURN redirect_url;
END;
$function$ LANGUAGE plpgsql;