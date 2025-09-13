-- Add comprehensive skills to the database
-- This script adds all the skills organized by categories

-- Clear existing skills (optional - remove this if you want to keep existing skills)
-- DELETE FROM skills;

-- Academic Sciences
INSERT INTO skills (name, description, category) VALUES
('Mathematics (algebra, geometry, trigonometry, calculus)', 'Mathematical concepts and problem-solving', 'Academic Sciences'),
('Physics (mechanics, electricity, optics, quantum)', 'Physical sciences and natural phenomena', 'Academic Sciences'),
('Chemistry (general, organic, inorganic, biochemistry)', 'Chemical sciences and laboratory work', 'Academic Sciences'),
('Biology (anatomy, zoology, botany, genetics)', 'Life sciences and biological systems', 'Academic Sciences'),
('Astronomy', 'Study of celestial objects and space', 'Academic Sciences'),
('Economics', 'Economic theory and market analysis', 'Academic Sciences'),
('History (world, local, art history)', 'Historical knowledge and analysis', 'Academic Sciences'),
('Geography', 'Physical and human geography', 'Academic Sciences'),
('Political Science', 'Government systems and political theory', 'Academic Sciences'),
('Sociology', 'Social behavior and society studies', 'Academic Sciences');

-- IT & Digital Skills
INSERT INTO skills (name, description, category) VALUES
('Python', 'Python programming language', 'IT & Digital Skills', 3),
('JavaScript', 'JavaScript programming for web development', 'IT & Digital Skills', 3),
('C++', 'C++ programming language', 'IT & Digital Skills', 4),
('Java', 'Java programming language', 'IT & Digital Skills', 3),
('Go', 'Go programming language', 'IT & Digital Skills', 4),
('Rust', 'Rust systems programming language', 'IT & Digital Skills', 5),
('HTML & CSS', 'Web markup and styling', 'IT & Digital Skills', 2),
('React', 'React JavaScript library for UI', 'IT & Digital Skills', 4),
('Next.js', 'Next.js React framework', 'IT & Digital Skills', 4),
('Node.js', 'Node.js JavaScript runtime', 'IT & Digital Skills', 4),
('Flutter', 'Flutter mobile app development', 'IT & Digital Skills', 4),
('Kotlin', 'Kotlin programming for Android', 'IT & Digital Skills', 4),
('Swift', 'Swift programming for iOS', 'IT & Digital Skills', 4),
('Figma', 'Figma design and prototyping tool', 'IT & Digital Skills', 3),
('Photoshop', 'Adobe Photoshop image editing', 'IT & Digital Skills', 3),
('Illustrator', 'Adobe Illustrator vector graphics', 'IT & Digital Skills', 3),
('Blender', 'Blender 3D modeling and animation', 'IT & Digital Skills', 4),
('SQL', 'Structured Query Language', 'IT & Digital Skills', 3),
('Machine Learning', 'Machine learning algorithms and models', 'IT & Digital Skills', 5),
('Deep Learning', 'Deep learning and neural networks', 'IT & Digital Skills', 5),
('Artificial Intelligence', 'AI concepts and applications', 'IT & Digital Skills', 5),
('Cybersecurity', 'Information security and protection', 'IT & Digital Skills', 4),
('PostgreSQL', 'PostgreSQL database management', 'IT & Digital Skills', 4),
('MongoDB', 'MongoDB NoSQL database', 'IT & Digital Skills', 4),
('Supabase', 'Supabase backend-as-a-service', 'IT & Digital Skills', 3),
('Excel', 'Microsoft Excel spreadsheet software', 'IT & Digital Skills', 2),
('PowerPoint', 'Microsoft PowerPoint presentations', 'IT & Digital Skills', 2),
('Word', 'Microsoft Word document processing', 'IT & Digital Skills', 2),
('Notion', 'Notion workspace and productivity tool', 'IT & Digital Skills', 2);

-- Languages
INSERT INTO skills (name, description, category) VALUES
('English (IELTS, TOEFL, conversational, grammar)', 'English language proficiency', 'Languages', 3),
('Russian (grammar, writing, public speaking)', 'Russian language and communication', 'Languages', 3),
('Uzbek (literature, grammar, history of language)', 'Uzbek language and culture', 'Languages', 3),
('Chinese (HSK)', 'Chinese language proficiency', 'Languages', 4),
('German', 'German language learning', 'Languages', 3),
('French', 'French language learning', 'Languages', 3),
('Spanish', 'Spanish language learning', 'Languages', 3),
('Japanese', 'Japanese language learning', 'Languages', 4),
('Korean', 'Korean language learning', 'Languages', 4);

-- Creativity & Arts
INSERT INTO skills (name, description, category) VALUES
('Drawing (traditional, digital)', 'Artistic drawing techniques', 'Creativity & Arts', 3),
('Music (piano, guitar, singing, music theory)', 'Musical instruments and theory', 'Creativity & Arts', 3),
('Photography', 'Photographic techniques and composition', 'Creativity & Arts', 3),
('Video Editing', 'Video production and editing', 'Creativity & Arts', 3),
('Dancing (hip-hop, contemporary, ballroom, folk)', 'Various dance styles and techniques', 'Creativity & Arts', 3),
('Theater & Acting', 'Theatrical performance and acting', 'Creativity & Arts', 3),
('Writing (essays, stories, poetry)', 'Creative and academic writing', 'Creativity & Arts', 3);

-- Soft Skills
INSERT INTO skills (name, description, category) VALUES
('Public Speaking', 'Presentation and communication skills', 'Soft Skills', 3),
('Debating', 'Argumentation and debate techniques', 'Soft Skills', 3),
('Time Management', 'Personal productivity and organization', 'Soft Skills', 2),
('Leadership', 'Team leadership and management', 'Soft Skills', 4),
('Teamwork', 'Collaborative work skills', 'Soft Skills', 2),
('Critical Thinking', 'Analytical and logical reasoning', 'Soft Skills', 3),
('Creativity', 'Creative thinking and innovation', 'Soft Skills', 3),
('Emotional Intelligence', 'Self-awareness and empathy', 'Soft Skills', 3),
('Negotiation Skills', 'Conflict resolution and negotiation', 'Soft Skills', 4);

-- Careers & Professions
INSERT INTO skills (name, description, category) VALUES
('Entrepreneurship', 'Business creation and management', 'Careers & Professions', 4),
('Financial Literacy', 'Personal finance and money management', 'Careers & Professions', 3),
('Investments', 'Investment strategies and portfolio management', 'Careers & Professions', 4),
('Marketing (SMM, digital, copywriting)', 'Marketing strategies and digital campaigns', 'Careers & Professions', 3),
('Sales', 'Sales techniques and customer relations', 'Careers & Professions', 3),
('Project Management (Agile, Scrum, Kanban)', 'Project planning and execution methodologies', 'Careers & Professions', 4),
('HR & Recruiting', 'Human resources and talent acquisition', 'Careers & Professions', 3),
('Journalism', 'News reporting and media communication', 'Careers & Professions', 3),
('Law', 'Legal concepts and procedures', 'Careers & Professions', 5),
('Medicine (first aid, anatomy, basics of pharmacology)', 'Medical knowledge and emergency response', 'Careers & Professions', 4);

-- Sports & Health
INSERT INTO skills (name, description, category) VALUES
('Football', 'Football/soccer playing and coaching', 'Sports & Health', 3),
('Basketball', 'Basketball playing and coaching', 'Sports & Health', 3),
('Volleyball', 'Volleyball playing and coaching', 'Sports & Health', 3),
('Chess', 'Chess strategy and tactics', 'Sports & Health', 4),
('Athletics', 'Track and field sports', 'Sports & Health', 3),
('Fitness', 'Physical fitness and training', 'Sports & Health', 3),
('Yoga', 'Yoga practice and instruction', 'Sports & Health', 3),
('Meditation', 'Mindfulness and meditation techniques', 'Sports & Health', 3),
('Karate', 'Karate martial arts training', 'Sports & Health', 4),
('Taekwondo', 'Taekwondo martial arts training', 'Sports & Health', 4),
('Boxing', 'Boxing training and techniques', 'Sports & Health', 4),
('Judo', 'Judo martial arts training', 'Sports & Health', 4),
('Healthy Nutrition', 'Nutritional science and healthy eating', 'Sports & Health', 3);

-- Hobbies & Everyday Skills
INSERT INTO skills (name, description, category) VALUES
('Cooking (national cuisines, baking, barista)', 'Culinary arts and food preparation', 'Hobbies & Everyday Skills', 3),
('Travel & Tourism', 'Travel planning and cultural exploration', 'Hobbies & Everyday Skills', 2),
('Board Games', 'Strategy and social board games', 'Hobbies & Everyday Skills', 2),
('Event Organization', 'Planning and managing events', 'Hobbies & Everyday Skills', 3),
('Volunteering', 'Community service and social impact', 'Hobbies & Everyday Skills', 2),
('Social Projects', 'Community development and social initiatives', 'Hobbies & Everyday Skills', 3),
('Mentorship', 'Guiding and supporting others development', 'Hobbies & Everyday Skills', 4);

-- Update category icons mapping
-- This would need to be updated in the frontend component as well
