-- Sample data for GunsmithLocal
-- Run this in your Supabase SQL Editor after setting up the database

-- Insert sample profiles (you'll need to replace these UUIDs with actual user IDs from your auth.users table)
-- First, get your user ID from the auth.users table:
-- SELECT id FROM auth.users LIMIT 1;

-- Then replace the UUIDs below with your actual user ID

-- Sample listings
INSERT INTO listings (
  id,
  owner_id,
  business_name,
  slug,
  description,
  category,
  address,
  city,
  state_province,
  postal_code,
  country,
  latitude,
  longitude,
  phone,
  email,
  website,
  services,
  year_established,
  is_verified,
  is_featured,
  status
) VALUES 
(
  gen_random_uuid(),
  (SELECT id FROM auth.users LIMIT 1), -- Replace with your actual user ID
  'Precision Gunsmithing',
  'precision-gunsmithing',
  'Professional gunsmithing services specializing in custom rifle builds, barrel threading, and precision accuracy work. Over 20 years of experience.',
  'Gunsmith',
  '123 Main Street',
  'Austin',
  'TX',
  '78701',
  'US',
  30.2672,
  -97.7431,
  '(512) 555-0123',
  'info@precisiongunsmithing.com',
  'https://precisiongunsmithing.com',
  ARRAY['Custom Builds', 'Barrel Threading', 'Accuracy Work', 'Gun Repair', 'Cerakote'],
  2003,
  true,
  true,
  'active'
),
(
  gen_random_uuid(),
  (SELECT id FROM auth.users LIMIT 1), -- Replace with your actual user ID
  'Elite Firearms Service',
  'elite-firearms-service',
  'Full-service gunsmithing shop offering repairs, modifications, and custom work. Specializing in AR-15 builds and pistol customization.',
  'Gunsmith',
  '456 Oak Avenue',
  'Dallas',
  'TX',
  '75201',
  'US',
  32.7767,
  -96.7970,
  '(214) 555-0456',
  'contact@elitefirearms.com',
  'https://elitefirearms.com',
  ARRAY['AR-15 Builds', 'Pistol Customization', 'Gun Repair', 'Optics Installation', 'Trigger Work'],
  2010,
  true,
  false,
  'active'
),
(
  gen_random_uuid(),
  (SELECT id FROM auth.users LIMIT 1), -- Replace with your actual user ID
  'Mountain View Gunsmith',
  'mountain-view-gunsmith',
  'Family-owned gunsmithing business serving the mountain region. Specializing in hunting rifle maintenance and custom stock work.',
  'Gunsmith',
  '789 Pine Street',
  'Denver',
  'CO',
  '80202',
  'US',
  39.7392,
  -104.9903,
  '(303) 555-0789',
  'info@mountainviewgunsmith.com',
  'https://mountainviewgunsmith.com',
  ARRAY['Hunting Rifle Maintenance', 'Custom Stock Work', 'Gun Repair', 'Scope Mounting', 'Barrel Work'],
  1998,
  true,
  false,
  'active'
),
(
  gen_random_uuid(),
  (SELECT id FROM auth.users LIMIT 1), -- Replace with your actual user ID
  'Coastal Arms & Ammo',
  'coastal-arms-ammo',
  'Complete firearms services including gunsmithing, ammunition sales, and training. Authorized dealer for major manufacturers.',
  'Gunsmith',
  '321 Harbor Drive',
  'San Diego',
  'CA',
  '92101',
  'US',
  32.7157,
  -117.1611,
  '(619) 555-0321',
  'service@coastalarms.com',
  'https://coastalarms.com',
  ARRAY['Gun Repair', 'Ammunition Sales', 'Training', 'Gun Sales', 'Custom Work'],
  2015,
  false,
  false,
  'active'
),
(
  gen_random_uuid(),
  (SELECT id FROM auth.users LIMIT 1), -- Replace with your actual user ID
  'Desert Precision Works',
  'desert-precision-works',
  'High-precision gunsmithing specializing in long-range shooting and tactical firearms. Custom builds and modifications.',
  'Gunsmith',
  '654 Desert Road',
  'Phoenix',
  'AZ',
  '85001',
  'US',
  33.4484,
  -112.0740,
  '(602) 555-0654',
  'info@desertprecision.com',
  'https://desertprecision.com',
  ARRAY['Long-Range Builds', 'Tactical Firearms', 'Custom Modifications', 'Precision Work', 'Gun Repair'],
  2012,
  true,
  true,
  'active'
);

-- Sample reviews
INSERT INTO reviews (
  id,
  listing_id,
  user_id,
  rating,
  comment,
  created_at
) VALUES 
(
  gen_random_uuid(),
  (SELECT id FROM listings WHERE slug = 'precision-gunsmithing' LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1),
  5,
  'Excellent work on my custom AR-15 build. The attention to detail and communication throughout the process was outstanding.',
  NOW() - INTERVAL '30 days'
),
(
  gen_random_uuid(),
  (SELECT id FROM listings WHERE slug = 'precision-gunsmithing' LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1),
  5,
  'Professional service and fair pricing. My rifle shoots like a dream after their accuracy work.',
  NOW() - INTERVAL '15 days'
),
(
  gen_random_uuid(),
  (SELECT id FROM listings WHERE slug = 'elite-firearms-service' LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1),
  4,
  'Great work on my pistol customization. Quick turnaround and good communication.',
  NOW() - INTERVAL '20 days'
),
(
  gen_random_uuid(),
  (SELECT id FROM listings WHERE slug = 'mountain-view-gunsmith' LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1),
  5,
  'Perfect work on my hunting rifle. They really understand what hunters need.',
  NOW() - INTERVAL '10 days'
);

-- Sample contact messages
INSERT INTO contact_messages (
  id,
  listing_id,
  sender_name,
  sender_email,
  sender_phone,
  subject,
  message,
  status,
  created_at
) VALUES 
(
  gen_random_uuid(),
  (SELECT id FROM listings WHERE slug = 'precision-gunsmithing' LIMIT 1),
  'John Smith',
  'john.smith@email.com',
  '(555) 123-4567',
  'Custom AR-15 Build Inquiry',
  'Hi, I''m interested in having a custom AR-15 built. I''d like to discuss specifications and pricing. When would be a good time to call?',
  'unread',
  NOW() - INTERVAL '5 days'
),
(
  gen_random_uuid(),
  (SELECT id FROM listings WHERE slug = 'elite-firearms-service' LIMIT 1),
  'Sarah Johnson',
  'sarah.j@email.com',
  '(555) 987-6543',
  'Pistol Repair Question',
  'I have a Glock 19 that needs some work. Can you give me an estimate for trigger work and slide refinishing?',
  'unread',
  NOW() - INTERVAL '2 days'
);
