-- Add Meeting Invitations Table
-- Run this in your Supabase SQL editor

-- Create meeting invitations table
CREATE TABLE IF NOT EXISTS meeting_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  inviter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  invitee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  meeting_location TEXT NOT NULL,
  meeting_date TIMESTAMP WITH TIME ZONE NOT NULL,
  meeting_duration INTEGER DEFAULT 60, -- in minutes
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'denied', 'started', 'completed', 'cancelled')),
  inviter_message TEXT, -- Optional message from inviter
  invitee_response TEXT, -- Optional response from invitee
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_meeting_invitations_conversation_id ON meeting_invitations(conversation_id);
CREATE INDEX IF NOT EXISTS idx_meeting_invitations_inviter_id ON meeting_invitations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_meeting_invitations_invitee_id ON meeting_invitations(invitee_id);
CREATE INDEX IF NOT EXISTS idx_meeting_invitations_status ON meeting_invitations(status);

-- Add RLS policies
ALTER TABLE meeting_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view meeting invitations they are part of
CREATE POLICY "Users can view their meeting invitations" ON meeting_invitations
  FOR SELECT USING (
    auth.uid()::text = inviter_id::text OR 
    auth.uid()::text = invitee_id::text
  );

-- Policy: Users can create meeting invitations
CREATE POLICY "Users can create meeting invitations" ON meeting_invitations
  FOR INSERT WITH CHECK (auth.uid()::text = inviter_id::text);

-- Policy: Users can update meeting invitations they are part of
CREATE POLICY "Users can update their meeting invitations" ON meeting_invitations
  FOR UPDATE USING (
    auth.uid()::text = inviter_id::text OR 
    auth.uid()::text = invitee_id::text
  );

-- Policy: Users can delete meeting invitations they created
CREATE POLICY "Users can delete their meeting invitations" ON meeting_invitations
  FOR DELETE USING (auth.uid()::text = inviter_id::text);







