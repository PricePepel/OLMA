-- OLMA MVP Seed Data
-- Realistic demo data for testing and development

-- Insert demo profiles (these will be linked to auth.users when created)
INSERT INTO profiles (id, email, full_name, username, bio, location, latitude, longitude, experience_points, personal_currency, level, streak_days, rating) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'alice@example.com', 'Alice Johnson', 'alice_dev', 'Full-stack developer passionate about teaching React and Node.js. Love helping beginners get started with web development!', 'San Francisco, CA', 37.7749, -122.4194, 1250, 450, 4, 12, 4.8),
('550e8400-e29b-41d4-a716-446655440002', 'bob@example.com', 'Bob Chen', 'bob_design', 'UI/UX designer with 5 years of experience. I can teach Figma, design principles, and user research methods.', 'New York, NY', 40.7128, -74.0060, 890, 320, 3, 8, 4.6),
('550e8400-e29b-41d4-a716-446655440003', 'carol@example.com', 'Carol Martinez', 'carol_spanish', 'Native Spanish speaker from Madrid. I can help you learn Spanish through conversation and cultural exchange.', 'Los Angeles, CA', 34.0522, -118.2437, 2100, 780, 5, 25, 4.9),
('550e8400-e29b-41d4-a716-446655440004', 'david@example.com', 'David Kim', 'david_music', 'Piano teacher and music producer. I can teach piano, music theory, and digital audio production.', 'Chicago, IL', 41.8781, -87.6298, 1560, 520, 4, 15, 4.7),
('550e8400-e29b-41d4-a716-446655440005', 'emma@example.com', 'Emma Wilson', 'emma_yoga', 'Certified yoga instructor and wellness coach. I can teach various yoga styles and meditation techniques.', 'Austin, TX', 30.2672, -97.7431, 980, 340, 3, 6, 4.5),
('550e8400-e29b-41d4-a716-446655440006', 'frank@example.com', 'Frank Rodriguez', 'frank_cooking', 'Professional chef with 10 years of experience. I can teach cooking techniques, recipe development, and kitchen management.', 'Miami, FL', 25.7617, -80.1918, 3200, 1200, 6, 30, 4.9),
('550e8400-e29b-41d4-a716-446655440007', 'grace@example.com', 'Grace Lee', 'grace_photography', 'Professional photographer specializing in portrait and street photography. I can teach camera basics, composition, and editing.', 'Seattle, WA', 47.6062, -122.3321, 1780, 650, 4, 18, 4.8),
('550e8400-e29b-41d4-a716-446655440008', 'henry@example.com', 'Henry Thompson', 'henry_fitness', 'Personal trainer and nutrition coach. I can help you with workout plans, nutrition advice, and fitness motivation.', 'Denver, CO', 39.7392, -104.9903, 1340, 480, 4, 10, 4.6),
('550e8400-e29b-41d4-a716-446655440009', 'iris@example.com', 'Iris Patel', 'iris_math', 'Math tutor with a PhD in Mathematics. I can help with algebra, calculus, statistics, and test preparation.', 'Boston, MA', 42.3601, -71.0589, 2450, 890, 5, 22, 4.9),
('550e8400-e29b-41d4-a716-446655440010', 'jack@example.com', 'Jack Anderson', 'jack_woodworking', 'Master woodworker and furniture maker. I can teach woodworking techniques, tool safety, and project planning.', 'Portland, OR', 45.5152, -122.6784, 1890, 720, 4, 14, 4.7);

-- Insert demo clubs
INSERT INTO clubs (id, name, description, is_private, owner_id, member_count, event_count) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Tech Learners Hub', 'A community for people learning programming and technology. Share resources, ask questions, and collaborate on projects.', false, '550e8400-e29b-41d4-a716-446655440001', 45, 8),
('660e8400-e29b-41d4-a716-446655440002', 'Creative Design Collective', 'A space for designers, artists, and creatives to share inspiration, get feedback, and collaborate on projects.', false, '550e8400-e29b-41d4-a716-446655440002', 32, 5),
('660e8400-e29b-41d4-a716-446655440003', 'Language Exchange Network', 'Connect with native speakers to practice languages through conversation, cultural exchange, and mutual learning.', false, '550e8400-e29b-41d4-a716-446655440003', 78, 12),
('660e8400-e29b-41d4-a716-446655440004', 'Music Makers Guild', 'A community for musicians, producers, and music enthusiasts. Share music, collaborate on projects, and learn from each other.', true, '550e8400-e29b-41d4-a716-446655440004', 28, 6),
('660e8400-e29b-41d4-a716-446655440005', 'Wellness Warriors', 'A supportive community focused on physical and mental wellness. Share tips, motivate each other, and practice healthy habits together.', false, '550e8400-e29b-41d4-a716-446655440005', 56, 10);

-- Insert club members
INSERT INTO club_members (club_id, profile_id, role) VALUES
-- Tech Learners Hub members
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'owner'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'member'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440007', 'member'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440009', 'moderator'),

-- Creative Design Collective members
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'owner'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440007', 'member'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440010', 'member'),

-- Language Exchange Network members
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'owner'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'member'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 'member'),

-- Music Makers Guild members
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'owner'),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440007', 'member'),

-- Wellness Warriors members
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 'owner'),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440008', 'member'),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', 'member');

-- Insert demo events
INSERT INTO events (id, title, description, start_time, end_time, location, max_participants, current_participants, status, club_id, creator_id) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'React Fundamentals Workshop', 'Learn the basics of React including components, state, props, and hooks. Perfect for beginners!', '2024-02-15 14:00:00+00', '2024-02-15 16:00:00+00', 'San Francisco Public Library', 20, 15, 'published', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440002', 'Design System Workshop', 'Learn how to create and maintain a design system using Figma. We\'ll cover components, tokens, and documentation.', '2024-02-20 10:00:00+00', '2024-02-20 12:00:00+00', 'Design Studio NYC', 15, 12, 'published', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440003', 'Spanish Conversation Meetup', 'Practice Spanish through casual conversation. All levels welcome! We\'ll have different groups based on proficiency.', '2024-02-18 18:00:00+00', '2024-02-18 20:00:00+00', 'Café Español', 25, 20, 'published', '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003'),
('770e8400-e29b-41d4-a716-446655440004', 'Piano Basics for Beginners', 'Learn piano fundamentals including proper posture, hand position, and basic music reading. No experience required!', '2024-02-22 19:00:00+00', '2024-02-22 21:00:00+00', 'Music Academy Chicago', 10, 8, 'published', '660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004'),
('770e8400-e29b-41d4-a716-446655440005', 'Yoga for Stress Relief', 'Join us for a gentle yoga session focused on stress relief and relaxation. Perfect for beginners and experienced practitioners alike.', '2024-02-16 09:00:00+00', '2024-02-16 10:30:00+00', 'Zen Yoga Studio', 30, 25, 'published', '660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005');

-- Insert event attendees
INSERT INTO event_attendees (event_id, profile_id) VALUES
-- React Workshop attendees
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440007'),
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440009'),

-- Design Workshop attendees
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440007'),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440010'),

-- Spanish Meetup attendees
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005'),

-- Piano Workshop attendees
('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440007'),

-- Yoga Session attendees
('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003'),
('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440008');

-- Insert demo skill offers
INSERT INTO skill_offers (id, skill_name, offer_type, description, location, latitude, longitude, profile_id, is_active) VALUES
('880e8400-e29b-41d4-a716-446655440001', 'React Development', 'teach', 'I can teach React fundamentals, hooks, state management, and best practices. Perfect for beginners and intermediate developers.', 'San Francisco, CA', 37.7749, -122.4194, '550e8400-e29b-41d4-a716-446655440001', true),
('880e8400-e29b-41d4-a716-446655440002', 'UI/UX Design', 'teach', 'Learn design principles, Figma, user research, and prototyping. I can help you build a strong design foundation.', 'New York, NY', 40.7128, -74.0060, '550e8400-e29b-41d4-a716-446655440002', true),
('880e8400-e29b-41d4-a716-446655440003', 'Spanish Language', 'teach', 'Native Spanish speaker offering conversational practice, grammar lessons, and cultural insights. All levels welcome!', 'Los Angeles, CA', 34.0522, -118.2437, '550e8400-e29b-41d4-a716-446655440003', true),
('880e8400-e29b-41d4-a716-446655440004', 'Piano Lessons', 'teach', 'Professional piano teacher offering lessons for all ages and skill levels. Learn classical, jazz, or contemporary styles.', 'Chicago, IL', 41.8781, -87.6298, '550e8400-e29b-41d4-a716-446655440004', true),
('880e8400-e29b-41d4-a716-446655440005', 'Yoga Instruction', 'teach', 'Certified yoga instructor offering private and group sessions. Learn various styles including Vinyasa, Hatha, and meditation.', 'Austin, TX', 30.2672, -97.7431, '550e8400-e29b-41d4-a716-446655440005', true),
('880e8400-e29b-41d4-a716-446655440006', 'Cooking Techniques', 'teach', 'Professional chef teaching cooking fundamentals, knife skills, recipe development, and international cuisines.', 'Miami, FL', 25.7617, -80.1918, '550e8400-e29b-41d4-a716-446655440006', true),
('880e8400-e29b-41d4-a716-446655440007', 'Photography', 'teach', 'Learn camera basics, composition, lighting, and post-processing. Perfect for beginners wanting to improve their photography skills.', 'Seattle, WA', 47.6062, -122.3321, '550e8400-e29b-41d4-a716-446655440007', true),
('880e8400-e29b-41d4-a716-446655440008', 'Personal Training', 'teach', 'Certified personal trainer offering workout plans, nutrition guidance, and motivation to help you reach your fitness goals.', 'Denver, CO', 39.7392, -104.9903, '550e8400-e29b-41d4-a716-446655440008', true),
('880e8400-e29b-41d4-a716-446655440009', 'Mathematics Tutoring', 'teach', 'PhD mathematician offering tutoring in algebra, calculus, statistics, and test preparation. All levels from high school to college.', 'Boston, MA', 42.3601, -71.0589, '550e8400-e29b-41d4-a716-446655440009', true),
('880e8400-e29b-41d4-a716-446655440010', 'Woodworking', 'teach', 'Master woodworker teaching basic to advanced techniques, tool safety, and project planning. Learn to create beautiful furniture.', 'Portland, OR', 45.5152, -122.6784, '550e8400-e29b-41d4-a716-446655440010', true),

-- Learning requests
('880e8400-e29b-41d4-a716-446655440011', 'Guitar Lessons', 'learn', 'I\'m a beginner looking to learn guitar. I prefer acoustic and would love to learn folk and rock styles.', 'San Francisco, CA', 37.7749, -122.4194, '550e8400-e29b-41d4-a716-446655440001', true),
('880e8400-e29b-41d4-a716-446655440012', 'French Language', 'learn', 'I want to learn French for travel and business. I\'m a complete beginner and prefer conversational learning.', 'New York, NY', 40.7128, -74.0060, '550e8400-e29b-41d4-a716-446655440002', true),
('880e8400-e29b-41d4-a716-446655440013', 'Data Science', 'learn', 'I\'m interested in learning data science and machine learning. I have some programming experience but need guidance on the fundamentals.', 'Los Angeles, CA', 34.0522, -118.2437, '550e8400-e29b-41d4-a716-446655440003', true);

-- Insert demo posts
INSERT INTO posts (id, content, privacy_level, profile_id, club_id, like_count, comment_count) VALUES
('990e8400-e29b-41d4-a716-446655440001', 'Just finished teaching my first React workshop! It was amazing to see everyone\'s progress. Remember, the best way to learn is by building real projects. What are you working on?', 'public', '550e8400-e29b-41d4-a716-446655440001', NULL, 12, 5),
('990e8400-e29b-41d4-a716-446655440002', 'Design tip of the day: Always start with user research before jumping into design. Understanding your users\' needs will save you hours of redesign later!', 'public', '550e8400-e29b-41d4-a716-446655440002', NULL, 8, 3),
('990e8400-e29b-41d4-a716-446655440003', '¡Hola a todos! Today I had a great Spanish conversation session. Learning a new language opens so many doors. What language are you currently learning?', 'public', '550e8400-e29b-41d4-a716-446655440003', NULL, 15, 7),
('990e8400-e29b-41d4-a716-446655440004', 'Music is such a powerful way to connect with others. Today\'s piano lesson reminded me why I love teaching. The joy on a student\'s face when they play their first song is priceless!', 'club', '550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440004', 6, 2),
('990e8400-e29b-41d4-a716-446655440005', 'Yoga session this morning was exactly what I needed. Remember to take care of your mental health, everyone. What\'s your favorite way to de-stress?', 'public', '550e8400-e29b-41d4-a716-446655440005', NULL, 20, 12),
('990e8400-e29b-41d4-a716-446655440006', 'Cooking tip: Always taste your food while cooking! Don\'t wait until the end. Seasoning is an art that develops with practice. What\'s your favorite dish to cook?', 'public', '550e8400-e29b-41d4-a716-446655440006', NULL, 18, 9),
('990e8400-e29b-41d4-a716-446655440007', 'Photography is all about capturing moments. Today I learned that sometimes the best photos come from unexpected situations. Keep your camera ready!', 'public', '550e8400-e29b-41d4-a716-446655440007', NULL, 14, 6),
('990e8400-e29b-41d4-a716-446655440008', 'Fitness journey update: Consistency is key! Even 20 minutes of exercise daily makes a huge difference. What\'s your fitness goal for this month?', 'public', '550e8400-e29b-41d4-a716-446655440008', NULL, 16, 8),
('990e8400-e29b-41d4-a716-446655440009', 'Math can be beautiful! Today we explored the golden ratio in nature and art. Mathematics is everywhere if you know where to look.', 'public', '550e8400-e29b-41d4-a716-446655440009', NULL, 11, 4),
('990e8400-e29b-41d4-a716-446655440010', 'Woodworking teaches patience and precision. Today I finished a custom coffee table. There\'s something special about creating with your hands.', 'public', '550e8400-e29b-41d4-a716-446655440010', NULL, 13, 5);

-- Insert demo post likes
INSERT INTO post_likes (post_id, profile_id) VALUES
-- Alice's post likes
('990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'),
('990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440007'),
('990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440009'),

-- Bob's post likes
('990e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001'),
('990e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440007'),

-- Carol's post likes
('990e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001'),
('990e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005'),
('990e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440008');

-- Insert demo conversations
INSERT INTO conversations (id) VALUES
('aa0e8400-e29b-41d4-a716-446655440001'),
('aa0e8400-e29b-41d4-a716-446655440002'),
('aa0e8400-e29b-41d4-a716-446655440003');

-- Insert conversation participants
INSERT INTO conversation_participants (conversation_id, profile_id) VALUES
-- Alice and Bob conversation
('aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001'),
('aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'),

-- Alice and Carol conversation
('aa0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001'),
('aa0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003'),

-- Bob and Grace conversation
('aa0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002'),
('aa0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440007');

-- Insert demo messages
INSERT INTO messages (content, conversation_id, sender_id) VALUES
('Hi Bob! I saw your design post and loved the tip about user research. Do you have any recommendations for good UX research methods?', 'aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001'),
('Thanks Alice! I\'d recommend starting with user interviews and surveys. Also, check out "Don\'t Make Me Think" by Steve Krug - it\'s a great book for beginners.', 'aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'),
('That sounds perfect! I\'ll definitely check out that book. Would you be interested in collaborating on a project sometime?', 'aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001'),
('Absolutely! I\'d love to work together. Maybe we could create something that combines both our skills?', 'aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'),

('¡Hola Alice! I noticed you\'re interested in learning Spanish. Would you like to practice with me?', 'aa0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003'),
('¡Hola Carol! That would be amazing! I\'m a complete beginner though. Is that okay?', 'aa0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001'),
('¡Por supuesto! Beginners are my favorite to teach. We can start with basic greetings and work our way up.', 'aa0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003'),

('Hi Grace! I loved your photography post. Do you offer any workshops or one-on-one sessions?', 'aa0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002'),
('Hi Bob! Yes, I do offer both workshops and private sessions. What are you most interested in learning?', 'aa0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440007'),
('I\'d love to learn about composition and lighting. I have a DSLR but I\'m not sure how to use it properly.', 'aa0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002');

-- Insert demo currency wallets
INSERT INTO currency_wallets (profile_id, type, balance) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'personal', 450),
('550e8400-e29b-41d4-a716-446655440002', 'personal', 320),
('550e8400-e29b-41d4-a716-446655440003', 'personal', 780),
('550e8400-e29b-41d4-a716-446655440004', 'personal', 520),
('550e8400-e29b-41d4-a716-446655440005', 'personal', 340),
('550e8400-e29b-41d4-a716-446655440006', 'personal', 1200),
('550e8400-e29b-41d4-a716-446655440007', 'personal', 650),
('550e8400-e29b-41d4-a716-446655440008', 'personal', 480),
('550e8400-e29b-41d4-a716-446655440009', 'personal', 890),
('550e8400-e29b-41d4-a716-446655440010', 'personal', 720);

-- Insert demo shop items
INSERT INTO shop_items (id, name, description, price, currency_type, category, is_active) VALUES
('bb0e8400-e29b-41d4-a716-446655440001', 'Premium Avatar Frame', 'A beautiful golden frame for your profile picture', 100, 'personal', 'avatar', true),
('bb0e8400-e29b-41d4-a716-446655440002', 'Skill Badge', 'Show off your expertise with a special badge', 50, 'personal', 'badge', true),
('bb0e8400-e29b-41d4-a716-446655440003', 'Dark Theme', 'Unlock a sleek dark theme for the app', 200, 'personal', 'theme', true),
('bb0e8400-e29b-41d4-a716-446655440004', 'Priority Support', 'Get faster response times from our support team', 150, 'personal', 'feature', true),
('bb0e8400-e29b-41d4-a716-446655440005', 'Club Banner', 'Custom banner for your club', 75, 'club', 'feature', true),
('bb0e8400-e29b-41d4-a716-446655440006', 'Event Promotion', 'Promote your event to more users', 120, 'club', 'feature', true);

-- Insert demo achievements
INSERT INTO achievements (id, name, description, type, criteria, rewards, icon_url) VALUES
('cc0e8400-e29b-41d4-a716-446655440001', 'First Steps', 'Create your first post', 'social_interaction', '{"action": "create_post", "count": 1}', '{"xp": 50, "personalCurrency": 25}', NULL),
('cc0e8400-e29b-41d4-a716-446655440002', 'Knowledge Sharer', 'Create your first skill offer', 'skill_teaching', '{"action": "create_skill_offer", "count": 1}', '{"xp": 100, "personalCurrency": 50}', NULL),
('cc0e8400-e29b-41d4-a716-446655440003', 'Community Leader', 'Create your first club', 'club_creation', '{"action": "create_club", "count": 1}', '{"xp": 200, "personalCurrency": 100, "clubCurrency": 50}', NULL),
('cc0e8400-e29b-41d4-a716-446655440004', 'Event Master', 'Create your first event', 'event_attendance', '{"action": "create_event", "count": 1}', '{"xp": 100, "personalCurrency": 50, "clubCurrency": 25}', NULL),
('cc0e8400-e29b-41d4-a716-446655440005', 'Week Warrior', 'Maintain a 7-day login streak', 'streak', '{"action": "daily_login", "count": 7, "timeframe": "week"}', '{"xp": 100, "personalCurrency": 50}', NULL),
('cc0e8400-e29b-41d4-a716-446655440006', 'Helpful Hand', 'Help 10 other users', 'social_interaction', '{"action": "help_other_user", "count": 10}', '{"xp": 200, "personalCurrency": 100}', NULL),
('cc0e8400-e29b-41d4-a716-446655440007', 'Currency Collector', 'Earn 1000 personal currency', 'currency_earned', '{"action": "earn_personal_currency", "count": 1000}', '{"xp": 300, "personalCurrency": 150}', NULL);

-- Insert demo user achievements
INSERT INTO user_achievements (achievement_id, profile_id) VALUES
('cc0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001'),
('cc0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001'),
('cc0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001'),
('cc0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001'),
('cc0e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001'),

('cc0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'),
('cc0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002'),
('cc0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002'),
('cc0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002'),

('cc0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003'),
('cc0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003'),
('cc0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003'),
('cc0e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003');

-- Insert demo leaderboard snapshots
INSERT INTO leaderboard_snapshots (profile_id, period, category, points, rank, snapshot_date) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'week', 'overall', 1250, 1, CURRENT_DATE),
('550e8400-e29b-41d4-a716-446655440003', 'week', 'overall', 2100, 2, CURRENT_DATE),
('550e8400-e29b-41d4-a716-446655440006', 'week', 'overall', 3200, 3, CURRENT_DATE),
('550e8400-e29b-41d4-a716-446655440009', 'week', 'overall', 2450, 4, CURRENT_DATE),
('550e8400-e29b-41d4-a716-446655440010', 'week', 'overall', 1890, 5, CURRENT_DATE),

('550e8400-e29b-41d4-a716-446655440001', 'month', 'overall', 1250, 1, CURRENT_DATE),
('550e8400-e29b-41d4-a716-446655440003', 'month', 'overall', 2100, 2, CURRENT_DATE),
('550e8400-e29b-41d4-a716-446655440006', 'month', 'overall', 3200, 3, CURRENT_DATE),
('550e8400-e29b-41d4-a716-446655440009', 'month', 'overall', 2450, 4, CURRENT_DATE),
('550e8400-e29b-41d4-a716-446655440010', 'month', 'overall', 1890, 5, CURRENT_DATE);

-- Insert demo reports
INSERT INTO reports (id, target_type, target_id, reason, description, reporter_id, status) VALUES
('dd0e8400-e29b-41d4-a716-446655440001', 'post', '990e8400-e29b-41d4-a716-446655440001', 'spam', 'This post seems to be promoting a commercial service', '550e8400-e29b-41d4-a716-446655440002', 'pending'),
('dd0e8400-e29b-41d4-a716-446655440002', 'user', '550e8400-e29b-41d4-a716-446655440001', 'harassment', 'User is sending unwanted messages', '550e8400-e29b-41d4-a716-446655440003', 'pending');

-- Insert demo purchases
INSERT INTO purchases (id, item_id, buyer_id, quantity, total_cost, currency_type, status) VALUES
('ee0e8400-e29b-41d4-a716-446655440001', 'bb0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 1, 100, 'personal', 'completed'),
('ee0e8400-e29b-41d4-a716-446655440002', 'bb0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 1, 50, 'personal', 'completed'),
('ee0e8400-e29b-41d4-a716-446655440003', 'bb0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 1, 200, 'personal', 'completed');

