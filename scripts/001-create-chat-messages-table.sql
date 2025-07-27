CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own messages
CREATE POLICY "Users can view their own messages." ON chat_messages
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to insert their own messages
CREATE POLICY "Users can insert their own messages." ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);
