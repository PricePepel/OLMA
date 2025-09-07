-- Updated RLS policies for ER Diagram aligned schema

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE currency_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE currency_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE currency_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view public users" ON users
  FOR SELECT USING (status = 'active' OR auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Skills policies (public read, admin write)
CREATE POLICY "Anyone can view skills" ON skills
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify skills" ON skills
  FOR ALL USING (auth.uid() IN (
    SELECT user_id FROM user_restrictions WHERE type = 'admin' AND expires_at > NOW()
  ));

-- User skills policies
CREATE POLICY "Users can view user skills" ON user_skills
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = user_skills.user_id AND status = 'active'
    ) OR auth.uid() = user_id
  );

CREATE POLICY "Users can manage own user skills" ON user_skills
  FOR ALL USING (auth.uid() = user_id);

-- Skill offers policies (if table exists)
-- Note: skill_offers table might not exist in the current schema
-- CREATE POLICY "Users can view skill offers" ON skill_offers
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM users WHERE id = skill_offers.user_id AND status = 'active'
--     ) OR auth.uid() = user_id
--   );

-- CREATE POLICY "Users can manage own skill offers" ON skill_offers
--   FOR ALL USING (auth.uid() = user_id);

-- Clubs policies
CREATE POLICY "Users can view public clubs" ON clubs
  FOR SELECT USING (is_public = true OR auth.uid() IN (
    SELECT user_id FROM club_members WHERE club_id = clubs.id
  ));

CREATE POLICY "Club owners and moderators can update clubs" ON clubs
  FOR UPDATE USING (auth.uid() IN (
    SELECT user_id FROM club_members 
    WHERE club_id = clubs.id AND role IN ('owner', 'moderator')
  ));

CREATE POLICY "Users can create clubs" ON clubs
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Club members policies
CREATE POLICY "Club members can view club members" ON club_members
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM club_members WHERE club_id = club_members.club_id
  ));

CREATE POLICY "Club owners can manage members" ON club_members
  FOR ALL USING (auth.uid() IN (
    SELECT user_id FROM club_members 
    WHERE club_id = club_members.club_id AND role = 'owner'
  ));

CREATE POLICY "Users can join clubs" ON club_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Club events policies
CREATE POLICY "Users can view club events" ON events
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM club_members WHERE club_id = events.club_id
  ) OR EXISTS (
    SELECT 1 FROM clubs WHERE id = events.club_id AND is_public = true
  ));

CREATE POLICY "Club members can create events" ON events
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT user_id FROM club_members WHERE club_id = events.club_id
  ));

CREATE POLICY "Event creators and club moderators can update events" ON events
  FOR UPDATE USING (auth.uid() = created_by OR auth.uid() IN (
    SELECT user_id FROM club_members 
    WHERE club_id = events.club_id AND role IN ('owner', 'moderator')
  ));

-- Event attendees policies
CREATE POLICY "Users can view event attendees" ON event_attendees
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM club_members WHERE club_id = (
      SELECT club_id FROM events WHERE id = event_attendees.event_id
    )
  ));

CREATE POLICY "Users can manage own event attendance" ON event_attendees
  FOR ALL USING (auth.uid() = user_id);

-- Posts policies
CREATE POLICY "Users can view public posts" ON posts
  FOR SELECT USING (is_public = true OR auth.uid() IN (
    SELECT user_id FROM club_members WHERE club_id = posts.club_id
  ) OR auth.uid() = user_id);

CREATE POLICY "Users can create posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON posts
  FOR DELETE USING (auth.uid() = user_id);

-- Post media policies (if table exists)
-- Note: post_media table might not exist in the current schema
-- CREATE POLICY "Users can view post media" ON post_media
--   FOR SELECT USING (auth.uid() IN (
--     SELECT user_id FROM posts WHERE id = post_media.post_id
--   ));

-- CREATE POLICY "Post owners can manage post media" ON post_media
--   FOR ALL USING (auth.uid() IN (
--     SELECT user_id FROM posts WHERE id = post_media.post_id
--   ));

-- Conversations policies
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Conversation participants policies (if table exists)
-- Note: conversation_participants table might not exist in the current schema
-- CREATE POLICY "Conversation participants can view participants" ON conversation_participants
--   FOR SELECT USING (auth.uid() IN (
--     SELECT user1_id FROM conversations WHERE id = conversation_participants.conversation_id
--     UNION
--     SELECT user2_id FROM conversations WHERE id = conversation_participants.conversation_id
--   ));

-- CREATE POLICY "Users can join conversations" ON conversation_participants
--   FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Conversation participants can view messages" ON messages
  FOR SELECT USING (auth.uid() IN (
    SELECT user1_id FROM conversations WHERE id = messages.conversation_id
    UNION
    SELECT user2_id FROM conversations WHERE id = messages.conversation_id
  ));

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE USING (auth.uid() = sender_id);

-- Currency wallets policies (if table exists)
-- Note: currency_wallets table might not exist in the current schema
-- CREATE POLICY "Users can view own wallets" ON currency_wallets
--   FOR SELECT USING (auth.uid() = user_id);

-- CREATE POLICY "Users can manage own wallets" ON currency_wallets
--   FOR ALL USING (auth.uid() = user_id);

-- Currency ledger policies (if table exists)
-- Note: currency_ledger table might not exist in the current schema
-- CREATE POLICY "Users can view own ledger entries" ON currency_ledger
--   FOR SELECT USING (auth.uid() IN (
--     SELECT user_id FROM currency_wallets WHERE id = currency_ledger.wallet_id
--   ));

-- CREATE POLICY "System can create ledger entries" ON currency_ledger
--   FOR INSERT WITH CHECK (true); -- This should be restricted in production

-- Currency transactions policies
CREATE POLICY "Users can view own transactions" ON currency_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create transactions" ON currency_transactions
  FOR INSERT WITH CHECK (true); -- This should be restricted in production

-- Shop items policies (if table exists)
-- Note: shop_items table might not exist in the current schema
-- CREATE POLICY "Anyone can view shop items" ON shop_items
--   FOR SELECT USING (is_active = true);

-- CREATE POLICY "Only admins can modify shop items" ON shop_items
--   FOR ALL USING (auth.uid() IN (
--     SELECT user_id FROM user_restrictions WHERE type = 'admin' AND expires_at > NOW()
--   ));

-- Purchases policies (if table exists)
-- Note: purchases table might not exist in the current schema
-- CREATE POLICY "Users can view own purchases" ON purchases
--   FOR SELECT USING (auth.uid() = user_id);

-- CREATE POLICY "Users can create purchases" ON purchases
--   FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Achievements policies (public read)
CREATE POLICY "Anyone can view achievements" ON achievements
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify achievements" ON achievements
  FOR ALL USING (auth.uid() IN (
    SELECT user_id FROM user_restrictions WHERE type = 'admin' AND expires_at > NOW()
  ));

-- User achievements policies
CREATE POLICY "Users can view achievements" ON user_achievements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = user_achievements.user_id AND status = 'active'
    ) OR auth.uid() = user_id
  );

CREATE POLICY "System can award achievements" ON user_achievements
  FOR INSERT WITH CHECK (true); -- This should be restricted in production

-- Leaderboard snapshots policies (if table exists)
-- Note: leaderboard_snapshots table might not exist in the current schema
-- CREATE POLICY "Anyone can view leaderboard snapshots" ON leaderboard_snapshots
--   FOR SELECT USING (true);

-- CREATE POLICY "System can create leaderboard snapshots" ON leaderboard_snapshots
--   FOR INSERT WITH CHECK (true); -- This should be restricted in production

-- Reports policies
CREATE POLICY "Users can view own reports" ON reports
  FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports" ON reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Moderators can view and update reports" ON reports
  FOR ALL USING (auth.uid() IN (
    SELECT user_id FROM user_restrictions WHERE type = 'moderator' AND expires_at > NOW()
  ));

-- User restrictions policies
CREATE POLICY "Users can view own restrictions" ON user_restrictions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Moderators can manage restrictions" ON user_restrictions
  FOR ALL USING (auth.uid() IN (
    SELECT user_id FROM user_restrictions WHERE type = 'moderator' AND expires_at > NOW()
  ));

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true); -- This should be restricted in production

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Locations policies (if table exists)
-- Note: locations table might not exist in the current schema
-- CREATE POLICY "Users can view public locations" ON locations
--   FOR SELECT USING (privacy_level = 'public' OR auth.uid() IN (
--     SELECT id FROM users WHERE location = locations.id
--   ));

-- CREATE POLICY "Users can create locations" ON locations
--   FOR INSERT WITH CHECK (true);

-- CREATE POLICY "Location owners can update locations" ON locations
--   FOR UPDATE USING (auth.uid() IN (
--     SELECT id FROM users WHERE location = locations.id
--   ));

-- Functions for automatic profile creation and activity tracking
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, full_name, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update user activity
CREATE OR REPLACE FUNCTION update_user_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users 
  SET last_activity = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for activity tracking
CREATE TRIGGER update_activity_on_post
  AFTER INSERT ON posts
  FOR EACH ROW EXECUTE FUNCTION update_user_activity();

CREATE TRIGGER update_activity_on_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_user_activity();

CREATE TRIGGER update_activity_on_event_attend
  AFTER INSERT ON event_attendees
  FOR EACH ROW EXECUTE FUNCTION update_user_activity();


