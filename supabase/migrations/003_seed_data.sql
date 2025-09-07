-- Seed skills data
INSERT INTO skills (name, category, description, icon) VALUES
-- Programming & Technology
('JavaScript', 'Programming', 'Modern JavaScript programming language', 'code'),
('Python', 'Programming', 'Python programming language', 'code'),
('React', 'Programming', 'React.js frontend framework', 'code'),
('Node.js', 'Programming', 'Node.js backend runtime', 'code'),
('TypeScript', 'Programming', 'TypeScript programming language', 'code'),
('SQL', 'Programming', 'Structured Query Language', 'database'),
('Git', 'Programming', 'Version control with Git', 'git-branch'),

-- Languages
('English', 'Languages', 'English language learning', 'languages'),
('Russian', 'Languages', 'Russian language learning', 'languages'),
('Spanish', 'Languages', 'Spanish language learning', 'languages'),
('French', 'Languages', 'French language learning', 'languages'),
('German', 'Languages', 'German language learning', 'languages'),

-- Arts & Creative
('Drawing', 'Arts', 'Drawing and sketching techniques', 'palette'),
('Painting', 'Arts', 'Painting techniques and styles', 'palette'),
('Photography', 'Arts', 'Digital and film photography', 'camera'),
('Music Production', 'Arts', 'Music production and composition', 'music'),
('Creative Writing', 'Arts', 'Creative writing and storytelling', 'pen-tool'),

-- Business & Professional
('Public Speaking', 'Business', 'Public speaking and presentation skills', 'mic'),
('Project Management', 'Business', 'Project management methodologies', 'briefcase'),
('Marketing', 'Business', 'Digital and traditional marketing', 'trending-up'),
('Sales', 'Business', 'Sales techniques and strategies', 'dollar-sign'),

-- Health & Fitness
('Yoga', 'Fitness', 'Yoga practice and meditation', 'heart'),
('Weight Training', 'Fitness', 'Strength training and bodybuilding', 'dumbbell'),
('Running', 'Fitness', 'Running and endurance training', 'zap'),
('Nutrition', 'Fitness', 'Nutrition and healthy eating', 'apple'),

-- Life Skills
('Cooking', 'Life Skills', 'Cooking and culinary arts', 'utensils'),
('Gardening', 'Life Skills', 'Gardening and plant care', 'leaf'),
('DIY & Crafts', 'Life Skills', 'Do-it-yourself projects and crafts', 'hammer'),
('Time Management', 'Life Skills', 'Time management and productivity', 'clock'),

-- Academic
('Mathematics', 'Academic', 'Mathematics and problem solving', 'calculator'),
('Physics', 'Academic', 'Physics concepts and applications', 'atom'),
('Chemistry', 'Academic', 'Chemistry and laboratory work', 'flask'),
('History', 'Academic', 'Historical knowledge and research', 'book-open');

-- Seed achievements data
INSERT INTO achievements (name, description, type, icon, points) VALUES
-- Skill Teaching Achievements
('First Teacher', 'Teach your first skill to someone', 'skill_teaching', 'graduation-cap', 50),
('Skill Master', 'Teach 10 different skills', 'skill_teaching', 'award', 200),
('Mentor', 'Teach 50 sessions', 'skill_teaching', 'users', 500),
('Expert Teacher', 'Teach 100 sessions', 'skill_teaching', 'star', 1000),

-- Skill Learning Achievements
('First Student', 'Learn your first skill from someone', 'skill_learning', 'book-open', 25),
('Knowledge Seeker', 'Learn 10 different skills', 'skill_learning', 'search', 150),
('Lifelong Learner', 'Learn 50 sessions', 'skill_learning', 'brain', 400),
('Scholar', 'Learn 100 sessions', 'skill_learning', 'graduation-cap', 800),

-- Club Achievements
('Club Founder', 'Create your first club', 'club_creation', 'users', 100),
('Community Builder', 'Create 5 clubs', 'club_creation', 'building', 300),
('Club Leader', 'Have 50 members across all your clubs', 'club_creation', 'crown', 600),

-- Event Achievements
('Event Organizer', 'Organize your first event', 'event_attendance', 'calendar', 75),
('Social Butterfly', 'Attend 10 events', 'event_attendance', 'heart', 200),
('Event Master', 'Organize 20 events', 'event_attendance', 'calendar-plus', 500),

-- Streak Achievements
('Consistent', 'Maintain a 7-day activity streak', 'streak', 'flame', 100),
('Dedicated', 'Maintain a 30-day activity streak', 'streak', 'fire', 300),
('Unstoppable', 'Maintain a 100-day activity streak', 'streak', 'zap', 1000),

-- Currency Achievements
('First Earnings', 'Earn your first 100 personal currency', 'currency_earned', 'dollar-sign', 50),
('Wealthy', 'Earn 10,000 personal currency', 'currency_earned', 'trending-up', 500),
('Millionaire', 'Earn 100,000 personal currency', 'currency_earned', 'gem', 2000);

-- Create sample clubs (these will be populated when users create them)
-- The clubs table will be populated by user actions

-- Create sample events (these will be populated when users create them)
-- The events table will be populated by user actions

-- Create sample posts (these will be populated when users create them)
-- The posts table will be populated by user actions

