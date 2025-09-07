-- Check current state of database
-- Run this to see what's currently in your database

-- Check existing skills
SELECT 'SKILLS:' as info;
SELECT id, name, category, description FROM skills ORDER BY name;

-- Check existing users
SELECT 'USERS:' as info;
SELECT id, email, full_name, username, location, level FROM users ORDER BY created_at;

-- Check existing user_skills
SELECT 'USER_SKILLS:' as info;
SELECT 
    us.id,
    u.full_name,
    s.name as skill_name,
    us.proficiency_level,
    us.can_teach,
    us.can_learn,
    us.hourly_rate
FROM user_skills us
JOIN users u ON us.user_id = u.id
JOIN skills s ON us.skill_id = s.id
ORDER BY u.full_name, s.name;





