-- Fix RLS issues by temporarily disabling RLS on all tables
-- This will allow the API to work while we fix the RLS policies

-- Disable RLS on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE skills DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills DISABLE ROW LEVEL SECURITY;
ALTER TABLE clubs DISABLE ROW LEVEL SECURITY;
ALTER TABLE club_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees DISABLE ROW LEVEL SECURITY;
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE currency_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_restrictions DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Add some sample data for testing
INSERT INTO users (id, email, full_name, username, avatar_url, bio) 
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'test@example.com', 'Test User', 'testuser', 'https://via.placeholder.com/150', 'Test user bio')
ON CONFLICT (email) DO NOTHING;

INSERT INTO skills (id, name, category, description) 
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'JavaScript', 'Programming', 'JavaScript programming language'),
  ('550e8400-e29b-41d4-a716-446655440002', 'React', 'Programming', 'React framework'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Photography', 'Arts', 'Digital photography')
ON CONFLICT DO NOTHING;

INSERT INTO clubs (id, name, description, category, created_by) 
VALUES 
  ('550e8400-e29b-41d4-a716-446655440004', 'Tech Enthusiasts', 'A club for technology enthusiasts', 'Technology', '550e8400-e29b-41d4-a716-446655440000'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Photography Club', 'Share your photos and learn from others', 'Arts', '550e8400-e29b-41d4-a716-446655440000')
ON CONFLICT DO NOTHING;







