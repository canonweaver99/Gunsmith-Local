-- Create featured listings table
CREATE TABLE featured_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  state_code VARCHAR(2) NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  payment_amount DECIMAL(10,2) NOT NULL DEFAULT 50.00,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_active_listing UNIQUE(listing_id, status)
);

-- Create index for efficient queries
CREATE INDEX idx_featured_state_status ON featured_listings(state_code, status);
CREATE INDEX idx_featured_listing_status ON featured_listings(listing_id, status);
CREATE INDEX idx_featured_end_date ON featured_listings(end_date);

-- Create payment history table
CREATE TABLE featured_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  featured_listing_id UUID NOT NULL REFERENCES featured_listings(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  stripe_payment_intent_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create waitlist table
CREATE TABLE featured_waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  state_code VARCHAR(2) NOT NULL,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notified_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'converted', 'cancelled')),
  CONSTRAINT unique_waitlist_entry UNIQUE(listing_id, state_code, status)
);

-- Add featured fields to listings table
ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_featured_in_state VARCHAR(2);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS featured_until DATE;

-- Function to check featured slots availability
CREATE OR REPLACE FUNCTION check_featured_availability(p_state_code VARCHAR(2))
RETURNS INTEGER AS $$
DECLARE
  active_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO active_count
  FROM featured_listings
  WHERE state_code = p_state_code
    AND status = 'active'
    AND end_date >= CURRENT_DATE;
  
  RETURN 3 - active_count; -- 3 slots per state
END;
$$ LANGUAGE plpgsql;

-- Function to expire featured listings
CREATE OR REPLACE FUNCTION expire_featured_listings()
RETURNS void AS $$
BEGIN
  -- Update expired listings
  UPDATE featured_listings
  SET status = 'expired',
      updated_at = NOW()
  WHERE status = 'active'
    AND end_date < CURRENT_DATE;
  
  -- Update listings table
  UPDATE listings l
  SET is_featured_in_state = NULL,
      featured_until = NULL
  FROM featured_listings fl
  WHERE l.id = fl.listing_id
    AND fl.status = 'expired'
    AND fl.updated_at >= NOW() - INTERVAL '1 minute';
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE featured_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_waitlist ENABLE ROW LEVEL SECURITY;

-- Policies for featured_listings
CREATE POLICY "Public can view active featured listings"
  ON featured_listings FOR SELECT
  USING (status = 'active');

CREATE POLICY "Listing owners can view their own featured status"
  ON featured_listings FOR SELECT
  USING (
    listing_id IN (
      SELECT id FROM listings WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Listing owners can insert featured listings"
  ON featured_listings FOR INSERT
  WITH CHECK (
    listing_id IN (
      SELECT id FROM listings WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Listing owners can update their featured listings"
  ON featured_listings FOR UPDATE
  USING (
    listing_id IN (
      SELECT id FROM listings WHERE owner_id = auth.uid()
    )
  );

-- Policies for featured_payments
CREATE POLICY "Listing owners can view their payments"
  ON featured_payments FOR SELECT
  USING (
    featured_listing_id IN (
      SELECT fl.id FROM featured_listings fl
      JOIN listings l ON fl.listing_id = l.id
      WHERE l.owner_id = auth.uid()
    )
  );

-- Policies for featured_waitlist
CREATE POLICY "Public can view waitlist counts"
  ON featured_waitlist FOR SELECT
  USING (true);

CREATE POLICY "Listing owners can manage their waitlist"
  ON featured_waitlist FOR ALL
  USING (
    listing_id IN (
      SELECT id FROM listings WHERE owner_id = auth.uid()
    )
  );
