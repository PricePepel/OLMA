-- Add hourly_rate column to skills table and set default rates
-- Run this in your Supabase SQL editor

-- Add hourly_rate column to skills table if it doesn't exist
ALTER TABLE skills ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2) DEFAULT 25.00;

-- Update existing skills with reasonable hourly rates
UPDATE skills SET hourly_rate = 30.00 WHERE name = 'Guitar';
UPDATE skills SET hourly_rate = 50.00 WHERE name = 'Programming';
UPDATE skills SET hourly_rate = 40.00 WHERE name = 'Photography';
UPDATE skills SET hourly_rate = 35.00 WHERE name = 'Cooking';
UPDATE skills SET hourly_rate = 25.00 WHERE name = 'Yoga';

-- If you want to add some test meeting invitations, uncomment the following:

/*
-- Insert a simple test meeting invitation
INSERT INTO meeting_invitations (
  id,
  conversation_id,
  inviter_id,
  invitee_id,
  skill_id,
  meeting_location,
  meeting_date,
  meeting_duration,
  status,
  inviter_message,
  created_at,
  updated_at
) VALUES (
  'test-meeting-001',
  '2800e30d-a371-44e6-b229-e9eb573dfaa4', -- Use existing conversation ID
  '11111111-1111-1111-1111-111111111111', -- Sarah Johnson (inviter)
  '00c36067-0cc9-4d63-9d74-9366b71aad03', -- Ruslan Kan (invitee)
  '22222222-2222-2222-2222-222222222222', -- Guitar skill
  'Tashkent, Uzbekistan',
  '2025-01-20 12:59:00+00',
  90,
  'pending',
  'Hi! I would love to teach you guitar. I have been playing for 5 years and can help you learn the basics.',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;
*/







