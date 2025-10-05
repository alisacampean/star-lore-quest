-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'content_creator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Drop old unrestricted insert policy
DROP POLICY IF EXISTS "Authenticated users can insert publications" ON public.publications;

-- Create new restricted insert policy (only admins and content creators)
CREATE POLICY "Only admins and content creators can insert publications"
  ON public.publications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'content_creator')
  );

-- Add update policy
CREATE POLICY "Only admins and content creators can update publications"
  ON public.publications
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'content_creator')
  );

-- Add delete policy
CREATE POLICY "Only admins can delete publications"
  ON public.publications
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));