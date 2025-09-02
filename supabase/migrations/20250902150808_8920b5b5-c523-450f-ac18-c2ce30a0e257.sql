-- Create enum for reaction types
CREATE TYPE public.reaction_type AS ENUM ('heart', 'thumbs_up', 'thumbs_down');

-- Create enum for report status
CREATE TYPE public.report_status AS ENUM ('pending', 'reviewed', 'dismissed');

-- Create posts table
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_hidden BOOLEAN NOT NULL DEFAULT false
);

-- Create post_reactions table
CREATE TABLE public.post_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  user_id UUID NOT NULL,
  reaction_type reaction_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id, reaction_type)
);

-- Create post_reports table
CREATE TABLE public.post_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  user_id UUID NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status report_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for posts
CREATE POLICY "Anyone can view non-hidden posts" 
ON public.posts 
FOR SELECT 
USING (NOT is_hidden);

CREATE POLICY "Sellers can create posts" 
ON public.posts 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'seller')
);

CREATE POLICY "Users can update their own posts" 
ON public.posts 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can hide posts" 
ON public.posts 
FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for post_reactions
CREATE POLICY "Anyone can view reactions" 
ON public.post_reactions 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create reactions" 
ON public.post_reactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" 
ON public.post_reactions 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for post_reports
CREATE POLICY "Users can create reports" 
ON public.post_reports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own reports" 
ON public.post_reports 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all reports" 
ON public.post_reports 
FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can update reports" 
ON public.post_reports 
FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for posts updated_at
CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();