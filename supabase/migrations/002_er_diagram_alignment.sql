-- Migration to align schema with ER Diagram
-- This migration updates the existing schema to match the provided ER Diagram

-- 1. Rename users table to profiles (keeping existing data)
ALTER TABLE users RENAME TO profiles;

-- 2. Add missing columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'friends_only'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location_id UUID;

-- 3. Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  address_text TEXT,
  privacy_level TEXT DEFAULT 'public' CHECK (privacy_level IN ('public', 'friends_only', 'private')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Add foreign key for location_id in profiles
ALTER TABLE profiles ADD CONSTRAINT fk_profiles_location 
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL;

-- 5. Rename user_skills to profile_skills
ALTER TABLE user_skills RENAME TO profile_skills;
ALTER TABLE profile_skills RENAME COLUMN user_id TO profile_id;

-- 6. Create skill_offers table
CREATE TABLE IF NOT EXISTS skill_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('teach', 'learn')),
  description TEXT,
  price_optional INTEGER, -- in personal currency
  availability_json JSONB, -- flexible availability schedule
  geo_opt_in BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create post_media table
CREATE TABLE IF NOT EXISTS post_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video', 'document')),
  file_name TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create conversation_participants table
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, profile_id)
);

-- 9. Rename events to club_events
ALTER TABLE events RENAME TO club_events;
ALTER TABLE club_events RENAME COLUMN created_by TO profile_id;

-- 10. Create currency_wallets table
CREATE TABLE IF NOT EXISTS currency_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('personal', 'club')),
  balance INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id, club_id, type)
);

-- 11. Create currency_ledger table
CREATE TABLE IF NOT EXISTS currency_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID REFERENCES currency_wallets(id) ON DELETE CASCADE,
  delta INTEGER NOT NULL, -- positive for credits, negative for debits
  reason TEXT NOT NULL,
  ref_table TEXT, -- reference to source table
  ref_id UUID, -- reference to source record
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Create shop_items table
CREATE TABLE IF NOT EXISTS shop_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('cosmetic', 'feature', 'boost')),
  price INTEGER NOT NULL,
  currency_type TEXT NOT NULL CHECK (currency_type IN ('personal', 'club')),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  item_id UUID REFERENCES shop_items(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  total_price INTEGER NOT NULL,
  currency_type TEXT NOT NULL CHECK (currency_type IN ('personal', 'club')),
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Rename user_achievements to achievements_user
ALTER TABLE user_achievements RENAME TO achievements_user;
ALTER TABLE achievements_user RENAME COLUMN user_id TO profile_id;

-- 15. Create leaderboard_snapshots table
CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('experience', 'currency', 'streak', 'achievements')),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  rank INTEGER NOT NULL,
  snapshot_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(type, profile_id, snapshot_date)
);

-- 16. Update foreign key references in existing tables
-- Update club_members
ALTER TABLE club_members RENAME COLUMN user_id TO profile_id;

-- Update event_attendees
ALTER TABLE event_attendees RENAME COLUMN user_id TO profile_id;

-- Update posts
ALTER TABLE posts RENAME COLUMN user_id TO profile_id;

-- Update conversations
ALTER TABLE conversations RENAME COLUMN user1_id TO profile1_id;
ALTER TABLE conversations RENAME COLUMN user2_id TO profile2_id;

-- Update messages
ALTER TABLE messages RENAME COLUMN sender_id TO profile_id;

-- Update currency_transactions
ALTER TABLE currency_transactions RENAME COLUMN user_id TO profile_id;

-- Update reports
ALTER TABLE reports RENAME COLUMN reporter_id TO profile_id;
ALTER TABLE reports RENAME COLUMN reported_user_id TO reported_profile_id;
ALTER TABLE reports RENAME COLUMN resolved_by TO resolved_by_profile_id;

-- Update user_restrictions
ALTER TABLE user_restrictions RENAME COLUMN user_id TO profile_id;
ALTER TABLE user_restrictions RENAME COLUMN created_by TO created_by_profile_id;

-- Update notifications
ALTER TABLE notifications RENAME COLUMN user_id TO profile_id;

-- 17. Update indexes for renamed columns
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_username;
DROP INDEX IF EXISTS idx_users_status;
DROP INDEX IF EXISTS idx_users_location;
DROP INDEX IF EXISTS idx_user_skills_user_id;
DROP INDEX IF EXISTS idx_user_skills_skill_id;
DROP INDEX IF EXISTS idx_club_members_user_id;
DROP INDEX IF EXISTS idx_posts_user_id;
DROP INDEX IF EXISTS idx_messages_created_at;
DROP INDEX IF EXISTS idx_currency_transactions_user_id;
DROP INDEX IF EXISTS idx_reports_reporter_id;
DROP INDEX IF EXISTS idx_notifications_user_id;

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_status ON profiles(status);
CREATE INDEX idx_profiles_location ON profiles(latitude, longitude);
CREATE INDEX idx_profile_skills_profile_id ON profile_skills(profile_id);
CREATE INDEX idx_profile_skills_skill_id ON profile_skills(skill_id);
CREATE INDEX idx_club_members_profile_id ON club_members(profile_id);
CREATE INDEX idx_posts_profile_id ON posts(profile_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_currency_transactions_profile_id ON currency_transactions(profile_id);
CREATE INDEX idx_reports_profile_id ON reports(profile_id);
CREATE INDEX idx_notifications_profile_id ON notifications(profile_id);

-- 18. Create new indexes for new tables
CREATE INDEX idx_skill_offers_profile_id ON skill_offers(profile_id);
CREATE INDEX idx_skill_offers_skill_id ON skill_offers(skill_id);
CREATE INDEX idx_post_media_post_id ON post_media(post_id);
CREATE INDEX idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX idx_conversation_participants_profile_id ON conversation_participants(profile_id);
CREATE INDEX idx_currency_wallets_profile_id ON currency_wallets(profile_id);
CREATE INDEX idx_currency_wallets_club_id ON currency_wallets(club_id);
CREATE INDEX idx_currency_ledger_wallet_id ON currency_ledger(wallet_id);
CREATE INDEX idx_purchases_profile_id ON purchases(profile_id);
CREATE INDEX idx_leaderboard_snapshots_type_date ON leaderboard_snapshots(type, snapshot_date);
CREATE INDEX idx_leaderboard_snapshots_profile_id ON leaderboard_snapshots(profile_id);

-- 19. Update triggers for renamed tables
DROP TRIGGER IF EXISTS update_users_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 20. Create function to handle new profile creation
CREATE OR REPLACE FUNCTION handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Create personal currency wallet
  INSERT INTO currency_wallets (profile_id, type, balance)
  VALUES (NEW.id, 'personal', 0);
  
  -- Create default location if coordinates are provided
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    INSERT INTO locations (lat, lng, address_text, privacy_level)
    VALUES (NEW.latitude, NEW.longitude, NEW.location, 'public')
    RETURNING id INTO NEW.location_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 21. Create trigger for new profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_profile();

-- 22. Update the handle_new_user function to work with profiles
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


