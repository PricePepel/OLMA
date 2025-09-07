-- Fix infinite recursion in club_members policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Club members can view club members" ON club_members;
DROP POLICY IF EXISTS "Club owners can manage members" ON club_members;
DROP POLICY IF EXISTS "Users can join clubs" ON club_members;

-- Create simplified policies that don't cause recursion
CREATE POLICY "Anyone can view club members for public clubs" ON club_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clubs 
      WHERE clubs.id = club_members.club_id 
      AND clubs.is_public = true
    )
  );

CREATE POLICY "Club members can view their own membership" ON club_members
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Club owners can view all members in their clubs" ON club_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM club_members cm
      WHERE cm.club_id = club_members.club_id 
      AND cm.user_id = auth.uid()
      AND cm.role = 'owner'
    )
  );

CREATE POLICY "Club owners can manage members" ON club_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM club_members cm
      WHERE cm.club_id = club_members.club_id 
      AND cm.user_id = auth.uid()
      AND cm.role = 'owner'
    )
  );

CREATE POLICY "Users can join public clubs" ON club_members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM clubs 
      WHERE clubs.id = club_members.club_id 
      AND clubs.is_public = true
    )
  );

-- Also fix the clubs policy that might cause issues
DROP POLICY IF EXISTS "Users can view public clubs" ON clubs;
CREATE POLICY "Anyone can view public clubs" ON clubs
  FOR SELECT USING (is_public = true);

CREATE POLICY "Club members can view their clubs" ON clubs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM club_members 
      WHERE club_members.club_id = clubs.id 
      AND club_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Club owners can view their clubs" ON clubs
  FOR SELECT USING (auth.uid() = created_by);
