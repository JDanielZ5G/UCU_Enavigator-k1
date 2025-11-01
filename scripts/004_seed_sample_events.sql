-- Seed some sample approved events for testing
-- Modified to use the first authenticated user's ID instead of placeholder UUID

-- This script will only work after at least one user has signed up
-- It uses a dynamic query to get the first user's ID

DO $$
DECLARE
  first_user_id UUID;
BEGIN
  -- Get the first user ID from auth.users
  SELECT id INTO first_user_id FROM auth.users LIMIT 1;
  
  -- Only insert if we found a user
  IF first_user_id IS NOT NULL THEN
    INSERT INTO public.events (title, description, department, date, venue, latitude, longitude, google_form_url, status, created_by)
    VALUES
      (
        'Tech Innovation Workshop',
        'Join us for an exciting workshop on the latest innovations in technology. Learn about AI, blockchain, and cloud computing.',
        'Computing and Technology',
        NOW() + INTERVAL '7 days',
        'Engineering Block, Room 201',
        0.3476,
        32.6256,
        'https://forms.google.com/sample1',
        'approved',
        first_user_id
      ),
      (
        'Design Thinking Seminar',
        'Explore the principles of design thinking and how to apply them to real-world problems.',
        'Visual Art and Design',
        NOW() + INTERVAL '10 days',
        'Art Studio, Main Campus',
        0.3478,
        32.6258,
        'https://forms.google.com/sample2',
        'approved',
        first_user_id
      ),
      (
        'Engineering Ethics Conference',
        'A comprehensive discussion on ethical considerations in modern engineering practices.',
        'Engineering',
        NOW() + INTERVAL '14 days',
        'Conference Hall, Block A',
        0.3480,
        32.6260,
        'https://forms.google.com/sample3',
        'approved',
        first_user_id
      )
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Sample events created successfully with user ID: %', first_user_id;
  ELSE
    RAISE NOTICE 'No users found. Please create a user account first, then run this script again.';
  END IF;
END $$;
