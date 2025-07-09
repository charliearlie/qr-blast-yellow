-- Add columns to store the first and last scan timestamps
ALTER TABLE public.qr_codes
ADD COLUMN first_scanned_at TIMESTAMPTZ,
ADD COLUMN last_scanned_at TIMESTAMPTZ;

-- Create indexes for better query performance on these columns
CREATE INDEX IF NOT EXISTS idx_qr_codes_first_scanned_at ON public.qr_codes(first_scanned_at) WHERE first_scanned_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_qr_codes_last_scanned_at ON public.qr_codes(last_scanned_at) WHERE last_scanned_at IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN qr_codes.first_scanned_at IS 'Timestamp when the QR code was scanned for the first time';
COMMENT ON COLUMN qr_codes.last_scanned_at IS 'Timestamp when the QR code was most recently scanned';