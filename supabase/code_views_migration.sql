-- Migration: Create code_views table for unique view tracking
-- This prevents counting multiple views from the same user

CREATE TABLE IF NOT EXISTS code_views (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  snippet_id UUID REFERENCES code_snippets(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, snippet_id)
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_code_views_user_snippet ON code_views(user_id, snippet_id);
CREATE INDEX IF NOT EXISTS idx_code_views_snippet ON code_views(snippet_id);

-- Enable RLS
ALTER TABLE code_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all views" ON code_views
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own views" ON code_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own views" ON code_views
  FOR DELETE USING (auth.uid() = user_id);
