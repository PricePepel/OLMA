-- Add Test Users with Skills
-- This migration creates test users who can teach various skills

-- Insert test users
INSERT INTO users (id, email, full_name, username, avatar_url, bio, location, level, experience_points, created_at, updated_at) VALUES
-- Photography Teacher
('11111111-1111-1111-1111-111111111111', 'photography.teacher@test.com', 'Sarah Johnson', 'sarah_photo', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', 'Professional photographer with 8+ years of experience. I love teaching beginners the art of photography!', 'New York, NY', 5, 2500, NOW(), NOW()),

-- Guitar Teacher
('22222222-2222-2222-2222-222222222222', 'guitar.teacher@test.com', 'Mike Chen', 'mike_guitar', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 'Experienced guitar instructor specializing in acoustic and electric guitar. Let me help you master those chords!', 'Los Angeles, CA', 4, 1800, NOW(), NOW()),

-- Cooking Teacher
('33333333-3333-3333-3333-333333333333', 'cooking.teacher@test.com', 'Emma Rodriguez', 'emma_cooks', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', 'Chef with culinary school background. I teach everything from basic cooking to advanced techniques!', 'Chicago, IL', 5, 2200, NOW(), NOW()),

-- Programming Teacher
('44444444-4444-4444-4444-444444444444', 'programming.teacher@test.com', 'Alex Thompson', 'alex_code', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 'Senior software engineer passionate about teaching programming fundamentals and best practices.', 'Seattle, WA', 5, 3000, NOW(), NOW()),

-- Yoga Teacher
('55555555-5555-5555-5555-555555555555', 'yoga.teacher@test.com', 'Priya Patel', 'priya_yoga', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face', 'Certified yoga instructor with 10+ years of experience. I teach all levels from beginner to advanced.', 'Austin, TX', 4, 1600, NOW(), NOW());

-- Insert user skills for these test users
INSERT INTO user_skills (id, user_id, skill_id, proficiency_level, can_teach, can_learn, hourly_rate, created_at) VALUES
-- Sarah Johnson - Photography (can teach)
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440012', 5, true, false, 25, NOW()),

-- Mike Chen - Guitar (can teach)
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440014', 4, true, false, 30, NOW()),

-- Emma Rodriguez - Cooking (can teach)
('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', '550e8400-e29b-41d4-a716-446655440016', 5, true, false, 35, NOW()),

-- Alex Thompson - Programming (can teach)
('dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444444', '550e8400-e29b-41d4-a716-446655440018', 5, true, false, 40, NOW()),

-- Priya Patel - Yoga (can teach)
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '55555555-5555-5555-5555-555555555555', '550e8400-e29b-41d4-a716-446655440020', 4, true, false, 28, NOW());

-- Add some additional skills to make it more interesting
INSERT INTO user_skills (id, user_id, skill_id, proficiency_level, can_teach, can_learn, hourly_rate, created_at) VALUES
-- Sarah also knows some guitar (can learn)
('ffffffff-ffff-ffff-ffff-ffffffffffff', '11111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440014', 2, false, true, NULL, NOW()),

-- Mike also knows some cooking (can learn)
('gggggggg-gggg-gggg-gggg-gggggggggggg', '22222222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440016', 1, false, true, NULL, NOW()),

-- Emma also knows some yoga (can learn)
('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', '33333333-3333-3333-3333-333333333333', '550e8400-e29b-41d4-a716-446655440020', 2, false, true, NULL, NOW());






