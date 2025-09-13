-- Add Test Meeting Invitations
-- Run this in your Supabase SQL editor

-- First, let's add some test meeting invitations
-- Make sure you have the meeting_invitations table created first

-- Insert test meeting invitations
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
) VALUES 
-- Pending invitation from Sarah to Ruslan for Guitar
(
  '11111111-1111-1111-1111-111111111111',
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
),

-- Accepted invitation from Mike to Ruslan for Programming
(
  '33333333-3333-3333-3333-333333333333',
  '2800e30d-a371-44e6-b229-e9eb573dfaa4', -- Use existing conversation ID
  '33333333-3333-3333-3333-333333333333', -- Mike Chen (inviter)
  '00c36067-0cc9-4d63-9d74-9366b71aad03', -- Ruslan Kan (invitee)
  '44444444-4444-4444-4444-444444444444', -- Programming skill
  'Online - Zoom Meeting',
  '2025-01-22 14:00:00+00',
  60,
  'accepted',
  'I can help you learn React and Next.js development. Let me know if you are interested!',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '1 day'
),

-- Completed meeting from Emma to Ruslan for Photography
(
  '55555555-5555-5555-5555-555555555555',
  '2800e30d-a371-44e6-b229-e9eb573dfaa4', -- Use existing conversation ID
  '55555555-5555-5555-5555-555555555555', -- Emma Rodriguez (inviter)
  '00c36067-0cc9-4d63-9d74-9366b71aad03', -- Ruslan Kan (invitee)
  '66666666-6666-6666-6666-666666666666', -- Photography skill
  'Central Park, NYC',
  '2025-01-15 10:00:00+00',
  120,
  'completed',
  'Great session! I taught you the basics of composition and lighting.',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '3 days'
),

-- Denied invitation from Alex to Ruslan for Cooking
(
  '77777777-7777-7777-7777-777777777777',
  '2800e30d-a371-44e6-b229-e9eb573dfaa4', -- Use existing conversation ID
  '77777777-7777-7777-7777-777777777777', -- Alex Thompson (inviter)
  '00c36067-0cc9-4d63-9d74-9366b71aad03', -- Ruslan Kan (invitee)
  '88888888-8888-8888-8888-888888888888', -- Cooking skill
  'My Kitchen, Brooklyn',
  '2025-01-25 18:00:00+00',
  90,
  'denied',
  'I can teach you Italian cooking techniques. Are you interested?',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '12 hours'
),

-- Started meeting from Priya to Ruslan for Yoga
(
  '99999999-9999-9999-9999-999999999999',
  '2800e30d-a371-44e6-b229-e9eb573dfaa4', -- Use existing conversation ID
  '99999999-9999-9999-9999-999999999999', -- Priya Patel (inviter)
  '00c36067-0cc9-4d63-9d74-9366b71aad03', -- Ruslan Kan (invitee)
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', -- Yoga skill
  'Yoga Studio, Manhattan',
  '2025-01-21 16:00:00+00',
  60,
  'started',
  'Let me help you with yoga basics and breathing techniques.',
  NOW() - INTERVAL '3 hours',
  NOW() - INTERVAL '1 hour'
)

ON CONFLICT (id) DO NOTHING;

-- Update the skills table to include hourly rates for better currency calculations
UPDATE skills SET hourly_rate = 30 WHERE id = '22222222-2222-2222-2222-222222222222'; -- Guitar
UPDATE skills SET hourly_rate = 50 WHERE id = '44444444-4444-4444-4444-444444444444'; -- Programming
UPDATE skills SET hourly_rate = 40 WHERE id = '66666666-6666-6666-6666-666666666666'; -- Photography
UPDATE skills SET hourly_rate = 35 WHERE id = '88888888-8888-8888-8888-888888888888'; -- Cooking
UPDATE skills SET hourly_rate = 25 WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'; -- Yoga

-- Add hourly_rate column to skills table if it doesn't exist
ALTER TABLE skills ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2) DEFAULT 25.00;








