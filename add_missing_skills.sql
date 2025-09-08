-- Add missing skills that test users need
-- Run this first if the skills don't exist

INSERT INTO skills (id, name, category, description, icon, created_at) VALUES
-- Photography
('550e8400-e29b-41d4-a716-446655440012', 'Photography', 'Arts', 'Digital photography', '📷', NOW()),

-- Guitar
('550e8400-e29b-41d4-a716-446655440014', 'Guitar', 'Music', 'Acoustic guitar playing', '🎸', NOW()),

-- Cooking
('550e8400-e29b-41d4-a716-446655440016', 'Cooking', 'Culinary', 'Basic to advanced cooking techniques', '👨‍🍳', NOW()),

-- Programming
('550e8400-e29b-41d4-a716-446655440018', 'Programming', 'Technology', 'Software development and coding', '💻', NOW()),

-- Yoga
('550e8400-e29b-41d4-a716-446655440020', 'Yoga', 'Fitness', 'Yoga practice and meditation', '🧘‍♀️', NOW())
ON CONFLICT (id) DO NOTHING; -- Skip if skills already exist






