-- Add Profile Badges to Shop
-- This migration adds profile badges that users can purchase with coins

-- 1. Create profile_badges table
CREATE TABLE IF NOT EXISTS profile_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('frame', 'background', 'accent', 'special')),
  price INTEGER NOT NULL DEFAULT 0, -- in personal currency
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create user_badges table (inventory)
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES profile_badges(id) ON DELETE CASCADE,
  is_equipped BOOLEAN DEFAULT FALSE,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- 3. Insert default profile badges
INSERT INTO profile_badges (name, description, category, price, rarity) VALUES
-- Profile Frames
('Classic Frame', 'A clean, minimalist frame for your profile', 'frame', 50, 'common'),
('Golden Frame', 'An elegant golden border for your profile', 'frame', 150, 'rare'),
('Diamond Frame', 'A sparkling diamond-studded frame', 'frame', 300, 'epic'),
('Rainbow Frame', 'A vibrant rainbow-colored frame', 'frame', 500, 'legendary'),

-- Profile Backgrounds
('Ocean Breeze', 'A calming ocean-themed background', 'background', 100, 'common'),
('Forest Path', 'A peaceful forest trail background', 'background', 200, 'rare'),
('City Lights', 'A dynamic city skyline at night', 'background', 400, 'epic'),
('Galaxy', 'A stunning view of distant galaxies', 'background', 750, 'legendary'),

-- Profile Accents
('Learning Star', 'A star that shows your dedication to learning', 'accent', 75, 'common'),
('Teaching Badge', 'A badge that highlights your teaching skills', 'accent', 125, 'rare'),
('Mentor Crown', 'A crown for experienced mentors', 'accent', 250, 'epic'),
('OLMA Legend', 'The ultimate badge for OLMA legends', 'accent', 1000, 'legendary'),

-- Special Badges
('Early Adopter', 'For users who joined OLMA early', 'special', 0, 'legendary'),
('Meeting Master', 'For completing 10+ successful meetings', 'special', 0, 'epic'),
('Skill Collector', 'For learning 20+ different skills', 'special', 0, 'rare'),
('Community Builder', 'For helping build the OLMA community', 'special', 0, 'epic');

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profile_badges_category ON profile_badges(category);
CREATE INDEX IF NOT EXISTS idx_profile_badges_price ON profile_badges(price);
CREATE INDEX IF NOT EXISTS idx_profile_badges_rarity ON profile_badges(rarity);
CREATE INDEX IF NOT EXISTS idx_profile_badges_is_active ON profile_badges(is_active);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_is_equipped ON user_badges(is_equipped);

-- 5. Add RLS policies
ALTER TABLE profile_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Profile badges are public (readable by all)
CREATE POLICY "Profile badges are viewable by all" ON profile_badges
  FOR SELECT USING (is_active = TRUE);

-- Users can view their own badges
CREATE POLICY "Users can view their own badges" ON user_badges
  FOR SELECT USING (user_id = auth.uid());

-- Users can purchase badges (insert)
CREATE POLICY "Users can purchase badges" ON user_badges
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can equip/unequip their badges
CREATE POLICY "Users can update their own badges" ON user_badges
  FOR UPDATE USING (user_id = auth.uid());

-- 6. Create function to purchase a badge
CREATE OR REPLACE FUNCTION purchase_badge(
  p_user_id UUID,
  p_badge_id UUID
)
RETURNS JSON AS $$
DECLARE
  badge_record RECORD;
  user_wallet RECORD;
  result JSON;
BEGIN
  -- Get badge details
  SELECT * INTO badge_record
  FROM profile_badges
  WHERE id = p_badge_id AND is_active = TRUE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Badge not found or inactive');
  END IF;
  
  -- Check if user already owns this badge
  IF EXISTS (SELECT 1 FROM user_badges WHERE user_id = p_user_id AND badge_id = p_badge_id) THEN
    RETURN json_build_object('success', false, 'error', 'You already own this badge');
  END IF;
  
  -- Get user's wallet
  SELECT * INTO user_wallet
  FROM currency_wallets
  WHERE profile_id = p_user_id AND type = 'personal';
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Wallet not found');
  END IF;
  
  -- Check if user has enough coins
  IF user_wallet.balance < badge_record.price THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient funds');
  END IF;
  
  -- Start transaction
  BEGIN
    -- Deduct coins from wallet
    UPDATE currency_wallets
    SET balance = balance - badge_record.price,
        updated_at = NOW()
    WHERE id = user_wallet.id;
    
    -- Add transaction to ledger
    INSERT INTO currency_ledger (wallet_id, delta, reason, ref_table, ref_id)
    VALUES (user_wallet.id, -badge_record.price, 'Badge purchase', 'profile_badges', p_badge_id);
    
    -- Add badge to user's inventory
    INSERT INTO user_badges (user_id, badge_id, is_equipped, purchased_at)
    VALUES (p_user_id, p_badge_id, FALSE, NOW());
    
    result := json_build_object(
      'success', true,
      'message', 'Badge purchased successfully',
      'badge', json_build_object(
        'id', badge_record.id,
        'name', badge_record.name,
        'description', badge_record.description,
        'category', badge_record.category,
        'rarity', badge_record.rarity
      )
    );
    
  EXCEPTION WHEN OTHERS THEN
    result := json_build_object('success', false, 'error', 'Transaction failed');
  END;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 7. Create function to equip/unequip badges
CREATE OR REPLACE FUNCTION toggle_badge_equip(
  p_user_id UUID,
  p_badge_id UUID,
  p_equip BOOLEAN
)
RETURNS JSON AS $$
DECLARE
  badge_record RECORD;
  result JSON;
BEGIN
  -- Check if user owns this badge
  SELECT * INTO badge_record
  FROM user_badges
  WHERE user_id = p_user_id AND badge_id = p_badge_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'You do not own this badge');
  END IF;
  
  -- If equipping, unequip other badges of the same category
  IF p_equip THEN
    UPDATE user_badges
    SET is_equipped = FALSE
    WHERE user_id = p_user_id
    AND badge_id IN (
      SELECT pb.id
      FROM profile_badges pb
      WHERE pb.category = (
        SELECT category FROM profile_badges WHERE id = p_badge_id
      )
    );
  END IF;
  
  -- Update the badge equip status
  UPDATE user_badges
  SET is_equipped = p_equip
  WHERE user_id = p_user_id AND badge_id = p_badge_id;
  
  result := json_build_object(
    'success', true,
    'message', CASE WHEN p_equip THEN 'Badge equipped' ELSE 'Badge unequipped' END
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 8. Create view for user's equipped badges
CREATE OR REPLACE VIEW user_equipped_badges AS
SELECT 
  ub.user_id,
  pb.id as badge_id,
  pb.name,
  pb.description,
  pb.category,
  pb.icon_url,
  pb.rarity,
  ub.purchased_at
FROM user_badges ub
JOIN profile_badges pb ON ub.badge_id = pb.id
WHERE ub.is_equipped = TRUE
AND pb.is_active = TRUE;

-- 9. Create view for shop with user ownership status
CREATE OR REPLACE VIEW shop_badges_with_ownership AS
SELECT 
  pb.*,
  CASE WHEN ub.user_id IS NOT NULL THEN TRUE ELSE FALSE END as is_owned,
  CASE WHEN ub.is_equipped THEN TRUE ELSE FALSE END as is_equipped
FROM profile_badges pb
LEFT JOIN user_badges ub ON pb.id = ub.badge_id AND ub.user_id = auth.uid()
WHERE pb.is_active = TRUE
ORDER BY pb.category, pb.price;
