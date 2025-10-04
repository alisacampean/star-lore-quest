-- Create publications table for space biology research
CREATE TABLE IF NOT EXISTS public.publications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  link TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_publications_title ON public.publications USING gin(to_tsvector('english', title));

-- Enable RLS
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read publications (public data)
CREATE POLICY "Anyone can view publications"
  ON public.publications
  FOR SELECT
  USING (true);

-- Only authenticated users can insert publications
CREATE POLICY "Authenticated users can insert publications"
  ON public.publications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);