-- Add Meeting Ratings and Reports Tables
-- Run this in your Supabase SQL editor

-- Create meeting ratings table
CREATE TABLE IF NOT EXISTS meeting_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES meeting_invitations(id) ON DELETE CASCADE,
  rater_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rated_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(meeting_id, rater_id, rated_user_id)
);

-- Create meeting reports table
CREATE TABLE IF NOT EXISTS meeting_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES meeting_invitations(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  report_category TEXT NOT NULL CHECK (report_category IN ('easy', 'medium', 'hard')),
  report_reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(meeting_id, reporter_id, reported_user_id)
);

-- Create user violations tracking table
CREATE TABLE IF NOT EXISTS user_violations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  violation_type TEXT NOT NULL CHECK (violation_type IN ('easy', 'medium', 'hard')),
  report_id UUID REFERENCES meeting_reports(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, report_id)
);

-- Create user ban status table
CREATE TABLE IF NOT EXISTS user_ban_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_banned BOOLEAN DEFAULT FALSE,
  ban_reason TEXT,
  banned_at TIMESTAMP WITH TIME ZONE,
  banned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meeting_ratings_meeting_id ON meeting_ratings(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_ratings_rater_id ON meeting_ratings(rater_id);
CREATE INDEX IF NOT EXISTS idx_meeting_ratings_rated_user_id ON meeting_ratings(rated_user_id);

CREATE INDEX IF NOT EXISTS idx_meeting_reports_meeting_id ON meeting_reports(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_reports_reporter_id ON meeting_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_meeting_reports_reported_user_id ON meeting_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_reports_status ON meeting_reports(status);

CREATE INDEX IF NOT EXISTS idx_user_violations_user_id ON user_violations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_violations_type ON user_violations(violation_type);

CREATE INDEX IF NOT EXISTS idx_user_ban_status_user_id ON user_ban_status(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ban_status_is_banned ON user_ban_status(is_banned);

-- Add RLS policies for meeting_ratings
ALTER TABLE meeting_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ratings for their meetings" ON meeting_ratings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM meeting_invitations 
      WHERE id = meeting_ratings.meeting_id 
      AND (inviter_id = auth.uid() OR invitee_id = auth.uid())
    )
  );

CREATE POLICY "Users can create ratings for their meetings" ON meeting_ratings
  FOR INSERT WITH CHECK (
    rater_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM meeting_invitations 
      WHERE id = meeting_ratings.meeting_id 
      AND (inviter_id = auth.uid() OR invitee_id = auth.uid())
      AND status = 'completed'
    )
  );

CREATE POLICY "Users can update their own ratings" ON meeting_ratings
  FOR UPDATE USING (rater_id = auth.uid());

-- Add RLS policies for meeting_reports
ALTER TABLE meeting_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reports for their meetings" ON meeting_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM meeting_invitations 
      WHERE id = meeting_reports.meeting_id 
      AND (inviter_id = auth.uid() OR invitee_id = auth.uid())
    )
  );

CREATE POLICY "Users can create reports for their meetings" ON meeting_reports
  FOR INSERT WITH CHECK (
    reporter_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM meeting_invitations 
      WHERE id = meeting_reports.meeting_id 
      AND (inviter_id = auth.uid() OR invitee_id = auth.uid())
      AND status = 'completed'
    )
  );

-- Add RLS policies for user_violations
ALTER TABLE user_violations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own violations" ON user_violations
  FOR SELECT USING (user_id = auth.uid());

-- Add RLS policies for user_ban_status
ALTER TABLE user_ban_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own ban status" ON user_ban_status
  FOR SELECT USING (user_id = auth.uid());

-- Create function to automatically create violations when reports are created
CREATE OR REPLACE FUNCTION create_violation_from_report()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_violations (user_id, violation_type, report_id)
  VALUES (NEW.reported_user_id, NEW.report_category, NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create violations
CREATE TRIGGER trigger_create_violation_from_report
  AFTER INSERT ON meeting_reports
  FOR EACH ROW
  EXECUTE FUNCTION create_violation_from_report();

-- Create function to check and apply bans based on violation counts
CREATE OR REPLACE FUNCTION check_and_apply_ban()
RETURNS TRIGGER AS $$
DECLARE
  easy_count INTEGER;
  medium_count INTEGER;
  hard_count INTEGER;
  user_id_to_check UUID;
BEGIN
  user_id_to_check := NEW.user_id;
  
  -- Count violations by type
  SELECT 
    COUNT(*) FILTER (WHERE violation_type = 'easy'),
    COUNT(*) FILTER (WHERE violation_type = 'medium'),
    COUNT(*) FILTER (WHERE violation_type = 'hard')
  INTO easy_count, medium_count, hard_count
  FROM user_violations
  WHERE user_id = user_id_to_check;
  
  -- Check if user should be banned
  IF hard_count >= 3 OR medium_count >= 10 OR easy_count >= 15 THEN
    -- Insert or update ban status
    INSERT INTO user_ban_status (user_id, is_banned, ban_reason, banned_at)
    VALUES (
      user_id_to_check, 
      TRUE, 
      CASE 
        WHEN hard_count >= 3 THEN '3+ hard violations'
        WHEN medium_count >= 10 THEN '10+ medium violations'
        WHEN easy_count >= 15 THEN '15+ easy violations'
      END,
      NOW()
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      is_banned = TRUE,
      ban_reason = EXCLUDED.ban_reason,
      banned_at = EXCLUDED.banned_at,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to check for bans when violations are added
CREATE TRIGGER trigger_check_and_apply_ban
  AFTER INSERT ON user_violations
  FOR EACH ROW
  EXECUTE FUNCTION check_and_apply_ban();
