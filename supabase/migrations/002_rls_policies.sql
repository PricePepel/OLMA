-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE currency_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view public profiles" ON users
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Skills policies (public read, admin write)
CREATE POLICY "Anyone can view skills" ON skills
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify skills" ON skills
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND status = 'active'
      -- Add admin check logic here if needed
    )
  );

-- User skills policies
CREATE POLICY "Users can view public user skills" ON user_skills
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = user_skills.user_id 
      AND users.status = 'active'
    )
  );

CREATE POLICY "Users can manage their own skills" ON user_skills
  FOR ALL USING (auth.uid() = user_id);

-- Clubs policies
CREATE POLICY "Anyone can view public clubs" ON clubs
  FOR SELECT USING (is_public = true OR auth.uid() = created_by);

CREATE POLICY "Club owners can update their clubs" ON clubs
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Active users can create clubs" ON clubs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND status = 'active'
    )
  );

-- Club members policies
CREATE POLICY "Club members can view club membership" ON club_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clubs 
      WHERE clubs.id = club_members.club_id 
      AND (clubs.is_public = true OR clubs.created_by = auth.uid())
    )
  );

CREATE POLICY "Club owners and moderators can manage members" ON club_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM club_members cm
      WHERE cm.club_id = club_members.club_id 
      AND cm.user_id = auth.uid()
      AND cm.role IN ('owner', 'moderator')
    )
  );

CREATE POLICY "Users can join public clubs" ON club_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM clubs 
      WHERE clubs.id = club_members.club_id 
      AND clubs.is_public = true
    )
  );

-- Events policies
CREATE POLICY "Anyone can view public events" ON events
  FOR SELECT USING (
    status = 'published' OR 
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM club_members 
      WHERE club_members.club_id = events.club_id 
      AND club_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Event creators and club moderators can manage events" ON events
  FOR ALL USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM club_members cm
      WHERE cm.club_id = events.club_id 
      AND cm.user_id = auth.uid()
      AND cm.role IN ('owner', 'moderator')
    )
  );

-- Event attendees policies
CREATE POLICY "Event attendees can view attendance" ON event_attendees
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_attendees.event_id 
      AND (events.status = 'published' OR events.created_by = auth.uid())
    )
  );

CREATE POLICY "Users can manage their own attendance" ON event_attendees
  FOR ALL USING (auth.uid() = user_id);

-- Posts policies
CREATE POLICY "Anyone can view public posts" ON posts
  FOR SELECT USING (
    is_public = true AND is_approved = true
  );

CREATE POLICY "Club members can view club posts" ON posts
  FOR SELECT USING (
    club_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM club_members 
      WHERE club_members.club_id = posts.club_id 
      AND club_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own posts" ON posts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Active users can create posts" ON posts
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    NOT EXISTS (
      SELECT 1 FROM user_restrictions 
      WHERE user_restrictions.user_id = auth.uid()
      AND user_restrictions.type = 'post_restriction'
      AND (user_restrictions.expires_at IS NULL OR user_restrictions.expires_at > NOW())
    )
  );

CREATE POLICY "Users can update their own posts" ON posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON posts
  FOR DELETE USING (auth.uid() = user_id);

-- Conversations policies
CREATE POLICY "Users can view their conversations" ON conversations
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Messages policies
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
    )
  );

-- Currency transactions policies
CREATE POLICY "Users can view their own transactions" ON currency_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view club transactions if member" ON currency_transactions
  FOR SELECT USING (
    club_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM club_members 
      WHERE club_members.club_id = currency_transactions.club_id 
      AND club_members.user_id = auth.uid()
      AND club_members.role IN ('owner', 'moderator')
    )
  );

-- Achievements policies (public read)
CREATE POLICY "Anyone can view achievements" ON achievements
  FOR SELECT USING (true);

-- User achievements policies
CREATE POLICY "Users can view their own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public achievements" ON user_achievements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = user_achievements.user_id 
      AND users.status = 'active'
    )
  );

-- Reports policies
CREATE POLICY "Users can view their own reports" ON reports
  FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports" ON reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Moderators can view all reports" ON reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND status = 'active'
      -- Add moderator check logic here
    )
  );

-- User restrictions policies
CREATE POLICY "Users can view their own restrictions" ON user_restrictions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Moderators can manage restrictions" ON user_restrictions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND status = 'active'
      -- Add moderator check logic here
    )
  );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, full_name, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Anonymous User'),
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to update user activity
CREATE OR REPLACE FUNCTION update_user_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users 
  SET last_activity = NOW()
  WHERE id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for user activity updates
CREATE TRIGGER update_activity_on_post
  AFTER INSERT ON posts
  FOR EACH ROW EXECUTE FUNCTION update_user_activity();

CREATE TRIGGER update_activity_on_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_user_activity();

CREATE TRIGGER update_activity_on_event_attend
  AFTER INSERT ON event_attendees
  FOR EACH ROW EXECUTE FUNCTION update_user_activity();

