-- Create a function to update scan metadata (count and timestamps)
CREATE OR REPLACE FUNCTION public.update_scan_metadata(p_qr_code_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY definer
AS $$
BEGIN
    UPDATE public.qr_codes
    SET
        scan_count = scan_count + 1,
        -- Set first_scanned_at only if it's currently NULL
        first_scanned_at = COALESCE(first_scanned_at, NOW()),
        -- Always update last_scanned_at to the current time
        last_scanned_at = NOW(),
        -- Always update the updated_at timestamp
        updated_at = NOW()
    WHERE id = p_qr_code_id;
END;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION public.update_scan_metadata(UUID) IS 'Updates scan count and timestamps for a QR code. Sets first_scanned_at on first scan and updates last_scanned_at on every scan.';