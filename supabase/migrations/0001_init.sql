-- OLMA MVP Database Schema
-- Complete initialization script with enums, tables, constraints, RLS policies, and triggers

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types/enums
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'banned');
CREATE TYPE privacy_level AS ENUM ('public', 'club', 'private');
CREATE TYPE offer_type AS ENUM ('teach', 'learn');
CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');
CREATE TYPE member_role AS ENUM ('member', 'moderator', 'owner');
CREATE TYPE report_status AS ENUM ('pending', 'resolved', 'dismissed');
CREATE TYPE report_reason AS ENUM ('inappropriate_content', 'spam', 'harassment', 'fake_news', 'copyright', 'other');
CREATE TYPE restriction_type AS ENUM ('warning', 'mute', 'ban');
CREATE TYPE currency_type AS ENUM ('personal', 'club');
CREATE TYPE transaction_type AS ENUM ('earn', 'spend', 'transfer');
CREATE TYPE achievement_type AS ENUM ('skill_teaching', 'skill_learning', 'club_creation', 'event_attendance', 'streak', 'currency_earned', 'social_interaction');
CREATE TYPE leaderboard_period AS ENUM ('week', 'month', 'all_time');
CREATE TYPE leaderboard_category AS ENUM ('overall', 'skills', 'events', 'currency');

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    timezone TEXT DEFAULT 'UTC',
    language TEXT DEFAULT 'en',
    experience_points INTEGER DEFAULT 0,
    personal_currency INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak_days INTEGER DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    rating DECIMAL(3, 2) DEFAULT 0.0,
    status user_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clubs table
CREATE TABLE clubs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    banner_url TEXT,
    is_private BOOLEAN DEFAULT FALSE,
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    member_count INTEGER DEFAULT 0,
    event_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create club members table
CREATE TABLE club_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE NOT NULL,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    role member_role DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(club_id, profile_id)
);

-- Create events table
CREATE TABLE events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT NOT NULL,
    max_participants INTEGER DEFAULT 50,
    current_participants INTEGER DEFAULT 0,
    status event_status DEFAULT 'draft',
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE NOT NULL,
    creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event attendees table
CREATE TABLE event_attendees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'confirmed',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, profile_id)
);

-- Create skill offers table
CREATE TABLE skill_offers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    skill_name TEXT NOT NULL,
    offer_type offer_type NOT NULL,
    description TEXT NOT NULL,
    location TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table
CREATE TABLE posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content TEXT NOT NULL,
    media_urls TEXT[],
    privacy_level privacy_level DEFAULT 'public',
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create post likes table
CREATE TABLE post_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, profile_id)
);

-- Create conversations table
CREATE TABLE conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversation participants table
CREATE TABLE conversation_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(conversation_id, profile_id)
);

-- Create messages table
CREATE TABLE messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content TEXT NOT NULL,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reports table
CREATE TABLE reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    target_type TEXT NOT NULL CHECK (target_type IN ('post', 'user', 'club', 'event')),
    target_id UUID NOT NULL,
    reason report_reason NOT NULL,
    description TEXT,
    reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    status report_status DEFAULT 'pending',
    moderator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    moderator_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create user restrictions table
CREATE TABLE user_restrictions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    type restriction_type NOT NULL,
    reason TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    moderator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create currency wallets table
CREATE TABLE currency_wallets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    type currency_type NOT NULL,
    balance INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK ((profile_id IS NOT NULL AND club_id IS NULL) OR (profile_id IS NULL AND club_id IS NOT NULL))
);

-- Create currency ledger table
CREATE TABLE currency_ledger (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wallet_id UUID REFERENCES currency_wallets(id) ON DELETE CASCADE NOT NULL,
    delta INTEGER NOT NULL,
    reason TEXT NOT NULL,
    ref_table TEXT,
    ref_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shop items table
CREATE TABLE shop_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price INTEGER NOT NULL,
    currency_type currency_type NOT NULL,
    category TEXT NOT NULL,
    icon_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create purchases table
CREATE TABLE purchases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    item_id UUID REFERENCES shop_items(id) ON DELETE CASCADE NOT NULL,
    buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER DEFAULT 1,
    total_cost INTEGER NOT NULL,
    currency_type currency_type NOT NULL,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create achievements table
CREATE TABLE achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    type achievement_type NOT NULL,
    criteria JSONB NOT NULL,
    rewards JSONB NOT NULL,
    icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user achievements table
CREATE TABLE user_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress INTEGER DEFAULT 100,
    UNIQUE(achievement_id, profile_id)
);

-- Create leaderboard snapshots table
CREATE TABLE leaderboard_snapshots (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
    period leaderboard_period NOT NULL,
    category leaderboard_category NOT NULL,
    points INTEGER NOT NULL,
    rank INTEGER,
    snapshot_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profile_id, club_id, period, category, snapshot_date)
);

-- Create indexes for performance
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_location ON profiles(latitude, longitude);
CREATE INDEX idx_profiles_experience ON profiles(experience_points DESC);
CREATE INDEX idx_profiles_level ON profiles(level DESC);

CREATE INDEX idx_clubs_owner ON clubs(owner_id);
CREATE INDEX idx_clubs_private ON clubs(is_private);
CREATE INDEX idx_clubs_created ON clubs(created_at DESC);

CREATE INDEX idx_club_members_club ON club_members(club_id);
CREATE INDEX idx_club_members_profile ON club_members(profile_id);
CREATE INDEX idx_club_members_role ON club_members(role);

CREATE INDEX idx_events_club ON events(club_id);
CREATE INDEX idx_events_creator ON events(creator_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_location ON events(location);

CREATE INDEX idx_event_attendees_event ON event_attendees(event_id);
CREATE INDEX idx_event_attendees_profile ON event_attendees(profile_id);

CREATE INDEX idx_skill_offers_profile ON skill_offers(profile_id);
CREATE INDEX idx_skill_offers_type ON skill_offers(offer_type);
CREATE INDEX idx_skill_offers_location ON skill_offers(latitude, longitude);
CREATE INDEX idx_skill_offers_active ON skill_offers(is_active);

CREATE INDEX idx_posts_profile ON posts(profile_id);
CREATE INDEX idx_posts_club ON posts(club_id);
CREATE INDEX idx_posts_privacy ON posts(privacy_level);
CREATE INDEX idx_posts_created ON posts(created_at DESC);

CREATE INDEX idx_post_likes_post ON post_likes(post_id);
CREATE INDEX idx_post_likes_profile ON post_likes(profile_id);

CREATE INDEX idx_conversation_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX idx_conversation_participants_profile ON conversation_participants(profile_id);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

CREATE INDEX idx_reports_target ON reports(target_type, target_id);
CREATE INDEX idx_reports_reporter ON reports(reporter_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created ON reports(created_at DESC);

CREATE INDEX idx_user_restrictions_user ON user_restrictions(user_id);
CREATE INDEX idx_user_restrictions_type ON user_restrictions(type);
CREATE INDEX idx_user_restrictions_expires ON user_restrictions(expires_at);

CREATE INDEX idx_currency_wallets_profile ON currency_wallets(profile_id);
CREATE INDEX idx_currency_wallets_club ON currency_wallets(club_id);
CREATE INDEX idx_currency_wallets_type ON currency_wallets(type);

CREATE INDEX idx_currency_ledger_wallet ON currency_ledger(wallet_id);
CREATE INDEX idx_currency_ledger_created ON currency_ledger(created_at DESC);

CREATE INDEX idx_shop_items_category ON shop_items(category);
CREATE INDEX idx_shop_items_active ON shop_items(is_active);
CREATE INDEX idx_shop_items_currency ON shop_items(currency_type);

CREATE INDEX idx_purchases_buyer ON purchases(buyer_id);
CREATE INDEX idx_purchases_item ON purchases(item_id);
CREATE INDEX idx_purchases_created ON purchases(created_at DESC);

CREATE INDEX idx_achievements_type ON achievements(type);

CREATE INDEX idx_user_achievements_profile ON user_achievements(profile_id);
CREATE INDEX idx_user_achievements_achievement ON user_achievements(achievement_id);

CREATE INDEX idx_leaderboard_snapshots_profile ON leaderboard_snapshots(profile_id);
CREATE INDEX idx_leaderboard_snapshots_club ON leaderboard_snapshots(club_id);
CREATE INDEX idx_leaderboard_snapshots_period_category ON leaderboard_snapshots(period, category);
CREATE INDEX idx_leaderboard_snapshots_points ON leaderboard_snapshots(points DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clubs_updated_at BEFORE UPDATE ON clubs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_skill_offers_updated_at BEFORE UPDATE ON skill_offers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_currency_wallets_updated_at BEFORE UPDATE ON currency_wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shop_items_updated_at BEFORE UPDATE ON shop_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update member count
CREATE OR REPLACE FUNCTION update_club_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE clubs SET member_count = member_count + 1 WHERE id = NEW.club_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE clubs SET member_count = member_count - 1 WHERE id = OLD.club_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger for member count
CREATE TRIGGER update_club_member_count_trigger
    AFTER INSERT OR DELETE ON club_members
    FOR EACH ROW EXECUTE FUNCTION update_club_member_count();

-- Create function to update event participant count
CREATE OR REPLACE FUNCTION update_event_participant_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE events SET current_participants = current_participants + 1 WHERE id = NEW.event_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE events SET current_participants = current_participants - 1 WHERE id = OLD.event_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger for participant count
CREATE TRIGGER update_event_participant_count_trigger
    AFTER INSERT OR DELETE ON event_attendees
    FOR EACH ROW EXECUTE FUNCTION update_event_participant_count();

-- Create function to update post like count
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger for like count
CREATE TRIGGER update_post_like_count_trigger
    AFTER INSERT OR DELETE ON post_likes
    FOR EACH ROW EXECUTE FUNCTION update_post_like_count();

-- Create function to update conversation updated_at
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations SET updated_at = NOW() WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for conversation timestamp
CREATE TRIGGER update_conversation_timestamp_trigger
    AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_timestamp();

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE currency_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE currency_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_snapshots ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Profiles policies
CREATE POLICY "Users can view public profiles" ON profiles
    FOR SELECT USING (status = 'active');

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Clubs policies
CREATE POLICY "Anyone can view public clubs" ON clubs
    FOR SELECT USING (is_private = false);

CREATE POLICY "Members can view private clubs" ON clubs
    FOR SELECT USING (
        is_private = true AND EXISTS (
            SELECT 1 FROM club_members 
            WHERE club_id = clubs.id AND profile_id = auth.uid()
        )
    );

CREATE POLICY "Users can create clubs" ON clubs
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their clubs" ON clubs
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their clubs" ON clubs
    FOR DELETE USING (auth.uid() = owner_id);

-- Club members policies
CREATE POLICY "Members can view club members" ON club_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM club_members cm 
            WHERE cm.club_id = club_members.club_id AND cm.profile_id = auth.uid()
        )
    );

CREATE POLICY "Users can join public clubs" ON club_members
    FOR INSERT WITH CHECK (
        profile_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM clubs 
            WHERE id = club_id AND is_private = false
        )
    );

CREATE POLICY "Owners can add members to private clubs" ON club_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clubs 
            WHERE id = club_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can leave clubs" ON club_members
    FOR DELETE USING (profile_id = auth.uid());

CREATE POLICY "Owners can remove members" ON club_members
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM clubs 
            WHERE id = club_id AND owner_id = auth.uid()
        )
    );

-- Events policies
CREATE POLICY "Anyone can view public events" ON events
    FOR SELECT USING (status = 'published');

CREATE POLICY "Club members can view club events" ON events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM club_members 
            WHERE club_id = events.club_id AND profile_id = auth.uid()
        )
    );

CREATE POLICY "Club members can create events" ON events
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM club_members 
            WHERE club_id = events.club_id AND profile_id = auth.uid()
        )
    );

CREATE POLICY "Creators can update events" ON events
    FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete events" ON events
    FOR DELETE USING (auth.uid() = creator_id);

-- Event attendees policies
CREATE POLICY "Anyone can view event attendees" ON event_attendees
    FOR SELECT USING (true);

CREATE POLICY "Users can join events" ON event_attendees
    FOR INSERT WITH CHECK (
        profile_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM events 
            WHERE id = event_id AND status = 'published'
        )
    );

CREATE POLICY "Users can leave events" ON event_attendees
    FOR DELETE USING (profile_id = auth.uid());

-- Skill offers policies
CREATE POLICY "Anyone can view skill offers" ON skill_offers
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create skill offers" ON skill_offers
    FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their skill offers" ON skill_offers
    FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete their skill offers" ON skill_offers
    FOR DELETE USING (auth.uid() = profile_id);

-- Posts policies
CREATE POLICY "Anyone can view public posts" ON posts
    FOR SELECT USING (privacy_level = 'public');

CREATE POLICY "Club members can view club posts" ON posts
    FOR SELECT USING (
        privacy_level = 'club' AND
        EXISTS (
            SELECT 1 FROM club_members 
            WHERE club_id = posts.club_id AND profile_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own private posts" ON posts
    FOR SELECT USING (
        privacy_level = 'private' AND auth.uid() = profile_id
    );

CREATE POLICY "Users can create posts" ON posts
    FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their posts" ON posts
    FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete their posts" ON posts
    FOR DELETE USING (auth.uid() = profile_id);

-- Post likes policies
CREATE POLICY "Anyone can view post likes" ON post_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can like posts" ON post_likes
    FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can unlike posts" ON post_likes
    FOR DELETE USING (auth.uid() = profile_id);

-- Conversations policies
CREATE POLICY "Participants can view conversations" ON conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants 
            WHERE conversation_id = conversations.id AND profile_id = auth.uid()
        )
    );

CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT WITH CHECK (true);

-- Conversation participants policies
CREATE POLICY "Participants can view conversation participants" ON conversation_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = conversation_participants.conversation_id 
            AND cp.profile_id = auth.uid()
        )
    );

CREATE POLICY "Users can join conversations" ON conversation_participants
    FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can leave conversations" ON conversation_participants
    FOR DELETE USING (auth.uid() = profile_id);

-- Messages policies
CREATE POLICY "Participants can view messages" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants 
            WHERE conversation_id = messages.conversation_id AND profile_id = auth.uid()
        )
    );

CREATE POLICY "Participants can send messages" ON messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM conversation_participants 
            WHERE conversation_id = messages.conversation_id AND profile_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their messages" ON messages
    FOR DELETE USING (auth.uid() = sender_id);

-- Reports policies
CREATE POLICY "Users can view their own reports" ON reports
    FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Moderators can view all reports" ON reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND level >= 5
        )
    );

CREATE POLICY "Users can create reports" ON reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Moderators can update reports" ON reports
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND level >= 5
        )
    );

-- User restrictions policies
CREATE POLICY "Users can view their own restrictions" ON user_restrictions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Moderators can view all restrictions" ON user_restrictions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND level >= 5
        )
    );

CREATE POLICY "Moderators can create restrictions" ON user_restrictions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND level >= 5
        )
    );

-- Currency wallets policies
CREATE POLICY "Users can view their own wallets" ON currency_wallets
    FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Club members can view club wallets" ON currency_wallets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM club_members 
            WHERE club_id = currency_wallets.club_id AND profile_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own wallets" ON currency_wallets
    FOR UPDATE USING (auth.uid() = profile_id);

-- Currency ledger policies
CREATE POLICY "Users can view their own ledger entries" ON currency_ledger
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM currency_wallets 
            WHERE id = currency_ledger.wallet_id AND profile_id = auth.uid()
        )
    );

CREATE POLICY "Club members can view club ledger entries" ON currency_ledger
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM currency_wallets cw
            JOIN club_members cm ON cw.club_id = cm.club_id
            WHERE cw.id = currency_ledger.wallet_id AND cm.profile_id = auth.uid()
        )
    );

-- Shop items policies
CREATE POLICY "Anyone can view shop items" ON shop_items
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage shop items" ON shop_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND level >= 8
        )
    );

-- Purchases policies
CREATE POLICY "Users can view their own purchases" ON purchases
    FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Users can create purchases" ON purchases
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Achievements policies
CREATE POLICY "Anyone can view achievements" ON achievements
    FOR SELECT USING (true);

-- User achievements policies
CREATE POLICY "Users can view their own achievements" ON user_achievements
    FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Anyone can view public achievements" ON user_achievements
    FOR SELECT USING (true);

-- Leaderboard snapshots policies
CREATE POLICY "Anyone can view leaderboard snapshots" ON leaderboard_snapshots
    FOR SELECT USING (true);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('post-media', 'post-media', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('club-banners', 'club-banners', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('achievement-icons', 'achievement-icons', true);

-- Create storage policies
CREATE POLICY "Anyone can view avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Anyone can view post media" ON storage.objects
    FOR SELECT USING (bucket_id = 'post-media');

CREATE POLICY "Users can upload post media" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'post-media' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their post media" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'post-media' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Anyone can view club banners" ON storage.objects
    FOR SELECT USING (bucket_id = 'club-banners');

CREATE POLICY "Club owners can upload banners" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'club-banners' AND
        EXISTS (
            SELECT 1 FROM clubs 
            WHERE id::text = (storage.foldername(name))[1] AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can view achievement icons" ON storage.objects
    FOR SELECT USING (bucket_id = 'achievement-icons');

