-- Migration: Add edit/delete support to messages
-- This migration adds new columns without deleting data
-- Run this in Supabase SQL Editor

-- Add new columns to messages table
ALTER TABLE IF EXISTS messages 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE;

-- ========================================
-- Helper Function (SECURITY DEFINER to bypass RLS)
-- ========================================

-- Function to check if user is in a conversation (bypasses RLS infinite recursion)
CREATE OR REPLACE FUNCTION user_is_in_conversation(conv_id UUID, check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = conv_id
      AND user_id = check_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION user_is_in_conversation TO authenticated;

-- ========================================
-- Update RLS Policies (Fix Infinite Recursion)
-- ========================================

-- Fix conversations policy
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  USING (user_is_in_conversation(id, auth.uid()));

-- Fix conversation_participants policy (THIS WAS CAUSING INFINITE RECURSION)
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
CREATE POLICY "Users can view conversation participants"
  ON conversation_participants FOR SELECT
  USING (user_is_in_conversation(conversation_id, auth.uid()));

-- Fix messages view policy
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (user_is_in_conversation(conversation_id, auth.uid()));

-- Fix messages send policy
DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND user_is_in_conversation(conversation_id, auth.uid())
  );

-- Update RLS policy for message updates
DROP POLICY IF EXISTS "Users can update messages" ON messages;
CREATE POLICY "Users can update messages" ON messages
  FOR UPDATE
  USING (
    sender_id = auth.uid() OR user_is_in_conversation(conversation_id, auth.uid())
  )
  WITH CHECK (
    sender_id = auth.uid() OR user_is_in_conversation(conversation_id, auth.uid())
  );

-- Add policy for deleting own messages
CREATE POLICY "Users can delete their messages" ON messages
  FOR DELETE
  USING (sender_id = auth.uid());

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_is_deleted ON messages(is_deleted);
CREATE INDEX IF NOT EXISTS idx_messages_is_edited ON messages(is_edited);

-- Verify changes
COMMENT ON COLUMN messages.is_deleted IS 'Soft delete flag - message content becomes "تم حذف هذه الرسالة"';
COMMENT ON COLUMN messages.is_edited IS 'Flag indicating message has been edited';

-- Success message
SELECT 'Migration completed successfully! ✅' as status;
