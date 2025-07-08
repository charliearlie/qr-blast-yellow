-- Add columns for scan limit functionality
ALTER TABLE public.qr_codes
ADD COLUMN IF NOT EXISTS scan_limit INTEGER,
ADD COLUMN IF NOT EXISTS expired_url TEXT;

-- Create index on scan_limit for faster queries
CREATE INDEX IF NOT EXISTS idx_qr_codes_scan_limit ON public.qr_codes(scan_limit) WHERE scan_limit IS NOT NULL;

-- Update RLS policies to ensure users can update these new columns
DROP POLICY IF EXISTS "Users can update their own QR codes" ON public.qr_codes;
CREATE POLICY "Users can update their own QR codes" ON public.qr_codes
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ensure the columns are included in the view if there is one
-- (No views found in existing migrations, so skipping this step)