-- Create QR Codes table
CREATE TABLE qr_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  original_url TEXT NOT NULL,
  short_code VARCHAR(10) UNIQUE NOT NULL,
  short_url TEXT NOT NULL,
  qr_settings JSONB DEFAULT '{}',
  scan_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create QR Analytics table
CREATE TABLE qr_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id uuid REFERENCES qr_codes(id) ON DELETE CASCADE,
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  referer TEXT,
  country VARCHAR(2),
  city VARCHAR(100),
  device_type VARCHAR(50),
  browser VARCHAR(100)
);

-- Create indexes for better performance
CREATE INDEX idx_qr_codes_user_id ON qr_codes(user_id);
CREATE INDEX idx_qr_codes_short_code ON qr_codes(short_code);
CREATE INDEX idx_qr_analytics_qr_code_id ON qr_analytics(qr_code_id);
CREATE INDEX idx_qr_analytics_scanned_at ON qr_analytics(scanned_at);

-- Enable Row Level Security
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for qr_codes
CREATE POLICY "Users can view their own QR codes" ON qr_codes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own QR codes" ON qr_codes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own QR codes" ON qr_codes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own QR codes" ON qr_codes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for qr_analytics
CREATE POLICY "Users can view analytics for their QR codes" ON qr_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM qr_codes 
      WHERE qr_codes.id = qr_analytics.qr_code_id 
      AND qr_codes.user_id = auth.uid()
    )
  );

CREATE POLICY "Analytics can be inserted for any QR code" ON qr_analytics
  FOR INSERT WITH CHECK (true);

-- Function to generate unique short codes
CREATE OR REPLACE FUNCTION generate_short_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INTEGER := 0;
  char_count INTEGER := length(chars);
BEGIN
  -- Generate 6 character short code
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * char_count + 1)::INTEGER, 1);
  END LOOP;
  
  -- Check if code already exists
  WHILE EXISTS (SELECT 1 FROM qr_codes WHERE short_code = result) LOOP
    result := '';
    FOR i IN 1..6 LOOP
      result := result || substr(chars, floor(random() * char_count + 1)::INTEGER, 1);
    END LOOP;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to increment scan count
CREATE OR REPLACE FUNCTION increment_scan_count(qr_code_uuid uuid)
RETURNS void AS $$
BEGIN
  UPDATE qr_codes 
  SET scan_count = scan_count + 1, updated_at = NOW()
  WHERE id = qr_code_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to get QR analytics summary
CREATE OR REPLACE FUNCTION get_qr_analytics_summary(qr_code_uuid uuid)
RETURNS TABLE (
  total_scans BIGINT,
  today_scans BIGINT,
  this_week_scans BIGINT,
  this_month_scans BIGINT,
  top_countries JSON,
  top_devices JSON,
  daily_scans JSON
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM qr_analytics WHERE qr_code_id = qr_code_uuid),
    (SELECT COUNT(*) FROM qr_analytics WHERE qr_code_id = qr_code_uuid AND DATE(scanned_at) = CURRENT_DATE),
    (SELECT COUNT(*) FROM qr_analytics WHERE qr_code_id = qr_code_uuid AND scanned_at >= CURRENT_DATE - INTERVAL '7 days'),
    (SELECT COUNT(*) FROM qr_analytics WHERE qr_code_id = qr_code_uuid AND scanned_at >= CURRENT_DATE - INTERVAL '30 days'),
    (SELECT JSON_AGG(JSON_BUILD_OBJECT('country', country, 'count', count)) FROM (
      SELECT country, COUNT(*) as count 
      FROM qr_analytics 
      WHERE qr_code_id = qr_code_uuid AND country IS NOT NULL 
      GROUP BY country 
      ORDER BY count DESC 
      LIMIT 5
    ) countries),
    (SELECT JSON_AGG(JSON_BUILD_OBJECT('device', device_type, 'count', count)) FROM (
      SELECT device_type, COUNT(*) as count 
      FROM qr_analytics 
      WHERE qr_code_id = qr_code_uuid AND device_type IS NOT NULL 
      GROUP BY device_type 
      ORDER BY count DESC 
      LIMIT 5
    ) devices),
    (SELECT JSON_AGG(JSON_BUILD_OBJECT('date', scan_date, 'count', count)) FROM (
      SELECT DATE(scanned_at) as scan_date, COUNT(*) as count 
      FROM qr_analytics 
      WHERE qr_code_id = qr_code_uuid AND scanned_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(scanned_at) 
      ORDER BY scan_date DESC
    ) daily);
END;
$$ LANGUAGE plpgsql;