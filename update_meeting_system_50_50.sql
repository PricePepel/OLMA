-- Update Meeting System for 50/50 Skill Exchange
-- This migration updates the meeting system to support bidirectional skill exchange

-- 1. Update meeting_invitations table to support dual skills
ALTER TABLE meeting_invitations 
ADD COLUMN IF NOT EXISTS inviter_skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS invitee_skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS actual_duration INTEGER, -- actual meeting duration in minutes
ADD COLUMN IF NOT EXISTS coins_earned INTEGER DEFAULT 0; -- coins earned from this meeting

-- 2. Update the existing skill_id to be inviter_skill_id for backward compatibility
UPDATE meeting_invitations 
SET inviter_skill_id = skill_id 
WHERE inviter_skill_id IS NULL AND skill_id IS NOT NULL;

-- 3. Create function to calculate coins based on meeting duration
CREATE OR REPLACE FUNCTION calculate_meeting_coins(duration_minutes INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- 1 coin per minute of meeting
  RETURN GREATEST(0, duration_minutes);
END;
$$ LANGUAGE plpgsql;

-- 4. Create function to award coins when meeting is completed
CREATE OR REPLACE FUNCTION award_meeting_coins()
RETURNS TRIGGER AS $$
DECLARE
  coins_to_award INTEGER;
BEGIN
  -- Only process when status changes to 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Calculate coins based on actual duration or planned duration
    coins_to_award := calculate_meeting_coins(
      COALESCE(NEW.actual_duration, NEW.meeting_duration)
    );
    
    -- Update the meeting record with coins earned
    NEW.coins_earned := coins_to_award;
    
    -- Award coins to both participants
    -- Award to inviter
    INSERT INTO currency_ledger (wallet_id, delta, reason, ref_table, ref_id)
    SELECT 
      cw.id,
      coins_to_award,
      'Meeting completion reward',
      'meeting_invitations',
      NEW.id
    FROM currency_wallets cw
    WHERE cw.profile_id = NEW.inviter_id 
    AND cw.type = 'personal'
    ON CONFLICT DO NOTHING;
    
    -- Award to invitee
    INSERT INTO currency_ledger (wallet_id, delta, reason, ref_table, ref_id)
    SELECT 
      cw.id,
      coins_to_award,
      'Meeting completion reward',
      'meeting_invitations',
      NEW.id
    FROM currency_wallets cw
    WHERE cw.profile_id = NEW.invitee_id 
    AND cw.type = 'personal'
    ON CONFLICT DO NOTHING;
    
    -- Update wallet balances
    UPDATE currency_wallets 
    SET balance = balance + coins_to_award,
        updated_at = NOW()
    WHERE profile_id IN (NEW.inviter_id, NEW.invitee_id)
    AND type = 'personal';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger to award coins when meeting is completed
DROP TRIGGER IF EXISTS trigger_award_meeting_coins ON meeting_invitations;
CREATE TRIGGER trigger_award_meeting_coins
  BEFORE UPDATE ON meeting_invitations
  FOR EACH ROW
  EXECUTE FUNCTION award_meeting_coins();

-- 6. Create function to update user ratings when meeting ratings are submitted
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL(3,2);
BEGIN
  -- Calculate new average rating for the rated user
  SELECT AVG(rating)::DECIMAL(3,2)
  INTO avg_rating
  FROM meeting_ratings
  WHERE rated_user_id = NEW.rated_user_id;
  
  -- Update the user's profile with new average rating
  UPDATE profiles
  SET rating = COALESCE(avg_rating, 0.0),
      updated_at = NOW()
  WHERE id = NEW.rated_user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger to update user ratings
DROP TRIGGER IF EXISTS trigger_update_user_rating ON meeting_ratings;
CREATE TRIGGER trigger_update_user_rating
  AFTER INSERT OR UPDATE ON meeting_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_rating();

-- 8. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meeting_invitations_inviter_skill_id ON meeting_invitations(inviter_skill_id);
CREATE INDEX IF NOT EXISTS idx_meeting_invitations_invitee_skill_id ON meeting_invitations(invitee_skill_id);
CREATE INDEX IF NOT EXISTS idx_meeting_invitations_status ON meeting_invitations(status);
CREATE INDEX IF NOT EXISTS idx_meeting_invitations_coins_earned ON meeting_invitations(coins_earned);

-- 9. Update RLS policies to include new columns
-- The existing policies should work with the new columns, but let's ensure they're comprehensive

-- 10. Create view for meeting statistics
CREATE OR REPLACE VIEW meeting_stats AS
SELECT 
  p.id as user_id,
  p.full_name,
  p.username,
  COUNT(mi.id) as total_meetings,
  COUNT(CASE WHEN mi.status = 'completed' THEN 1 END) as completed_meetings,
  COALESCE(SUM(mi.coins_earned), 0) as total_coins_earned,
  COALESCE(AVG(mr.rating), 0.0) as average_rating,
  COUNT(mr.id) as total_ratings_received
FROM profiles p
LEFT JOIN meeting_invitations mi ON (p.id = mi.inviter_id OR p.id = mi.invitee_id)
LEFT JOIN meeting_ratings mr ON p.id = mr.rated_user_id
GROUP BY p.id, p.full_name, p.username;

-- 11. Create view for recent meeting feedback
CREATE OR REPLACE VIEW recent_meeting_feedback AS
SELECT 
  mr.id,
  mr.meeting_id,
  mr.rater_id,
  mr.rated_user_id,
  mr.rating,
  mr.comment,
  mr.created_at,
  rater.full_name as rater_name,
  rater.username as rater_username,
  rater.avatar_url as rater_avatar,
  rated.full_name as rated_name,
  rated.username as rated_username,
  mi.inviter_skill_id,
  mi.invitee_skill_id,
  inviter_skill.name as inviter_skill_name,
  invitee_skill.name as invitee_skill_name
FROM meeting_ratings mr
JOIN meeting_invitations mi ON mr.meeting_id = mi.id
JOIN profiles rater ON mr.rater_id = rater.id
JOIN profiles rated ON mr.rated_user_id = rated.id
LEFT JOIN skills inviter_skill ON mi.inviter_skill_id = inviter_skill.id
LEFT JOIN skills invitee_skill ON mi.invitee_skill_id = invitee_skill.id
WHERE mr.created_at >= NOW() - INTERVAL '30 days'
ORDER BY mr.created_at DESC;
