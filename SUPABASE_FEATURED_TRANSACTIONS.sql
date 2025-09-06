-- Create featured_transactions table to track payment history
CREATE TABLE IF NOT EXISTS public.featured_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Stripe payment details
    stripe_session_id VARCHAR(255) UNIQUE,
    stripe_payment_intent_id VARCHAR(255),
    amount_paid INTEGER, -- Amount in cents
    
    -- Featured listing details
    duration_days INTEGER NOT NULL,
    featured_until TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed, refunded
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_featured_transactions_listing_id ON public.featured_transactions(listing_id);
CREATE INDEX idx_featured_transactions_user_id ON public.featured_transactions(user_id);
CREATE INDEX idx_featured_transactions_status ON public.featured_transactions(status);
CREATE INDEX idx_featured_transactions_created_at ON public.featured_transactions(created_at);

-- Add columns to listings table for featured functionality
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS featured_payment_id VARCHAR(255);

-- Create index for featured listings
CREATE INDEX IF NOT EXISTS idx_listings_featured ON public.listings(is_featured, featured_until);

-- Enable RLS
ALTER TABLE public.featured_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for featured_transactions
CREATE POLICY "Users can view their own transactions" ON public.featured_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON public.featured_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin policy to view all transactions
CREATE POLICY "Admins can view all transactions" ON public.featured_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Grant permissions
GRANT ALL ON public.featured_transactions TO authenticated;
GRANT ALL ON public.featured_transactions TO service_role;

-- Create a function to automatically expire featured listings
CREATE OR REPLACE FUNCTION public.expire_featured_listings()
RETURNS void AS $$
BEGIN
    UPDATE public.listings 
    SET 
        is_featured = FALSE,
        updated_at = NOW()
    WHERE 
        is_featured = TRUE 
        AND featured_until < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a function to get active featured listings
CREATE OR REPLACE FUNCTION public.get_featured_listings()
RETURNS TABLE (
    id UUID,
    business_name VARCHAR,
    description TEXT,
    street_address VARCHAR,
    city VARCHAR,
    state_province VARCHAR,
    phone VARCHAR,
    email VARCHAR,
    website VARCHAR,
    logo_url TEXT,
    cover_image_url TEXT,
    gallery_urls TEXT[],
    services TEXT[],
    specialties TEXT[],
    business_hours JSONB,
    rating DECIMAL,
    review_count INTEGER,
    view_count INTEGER,
    is_verified BOOLEAN,
    verification_status VARCHAR,
    featured_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    -- First, expire any outdated featured listings
    PERFORM public.expire_featured_listings();
    
    -- Return active featured listings
    RETURN QUERY
    SELECT 
        l.id,
        l.business_name,
        l.description,
        l.street_address,
        l.city,
        l.state_province,
        l.phone,
        l.email,
        l.website,
        l.logo_url,
        l.cover_image_url,
        l.gallery_urls,
        l.services,
        l.specialties,
        l.business_hours,
        l.rating,
        l.review_count,
        l.view_count,
        l.is_verified,
        l.verification_status,
        l.featured_until,
        l.created_at,
        l.updated_at
    FROM public.listings l
    WHERE 
        l.is_featured = TRUE 
        AND l.featured_until > NOW()
        AND l.status = 'active'
    ORDER BY l.featured_until DESC, l.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.expire_featured_listings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.expire_featured_listings() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_featured_listings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_featured_listings() TO service_role;

COMMENT ON TABLE public.featured_transactions IS 'Tracks payment transactions for featured listings';
COMMENT ON COLUMN public.featured_transactions.amount_paid IS 'Amount paid in cents (USD)';
COMMENT ON COLUMN public.featured_transactions.duration_days IS 'Number of days the listing will be featured';
COMMENT ON COLUMN public.featured_transactions.status IS 'Payment status: pending, completed, failed, refunded';
COMMENT ON FUNCTION public.expire_featured_listings() IS 'Automatically expires featured listings that have passed their end date';
COMMENT ON FUNCTION public.get_featured_listings() IS 'Returns all active featured listings, automatically expiring outdated ones';
