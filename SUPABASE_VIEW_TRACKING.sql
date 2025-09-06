-- Create listing_views table for tracking profile views
CREATE TABLE IF NOT EXISTS listing_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Index for efficient queries
  CONSTRAINT unique_session_view UNIQUE (listing_id, session_id, created_at)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_listing_views_listing_id ON listing_views(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_views_session_id ON listing_views(session_id);
CREATE INDEX IF NOT EXISTS idx_listing_views_created_at ON listing_views(created_at);

-- Enable RLS
ALTER TABLE listing_views ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert views (tracking)
CREATE POLICY "Anyone can track views" ON listing_views
  FOR INSERT WITH CHECK (true);

-- Only allow listing owners to view their analytics
CREATE POLICY "Owners can view their listing analytics" ON listing_views
  FOR SELECT USING (
    listing_id IN (
      SELECT id FROM listings WHERE owner_id = auth.uid()
    )
  );

-- Function to clean up old views (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_views()
RETURNS void AS $$
BEGIN
  DELETE FROM listing_views WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Optional: Set up a cron job or trigger to run cleanup periodically
