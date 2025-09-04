-- Allow users to delete their own posts
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;

CREATE POLICY "Users can delete their own posts" 
ON public.posts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Enable realtime for post_reactions table
ALTER TABLE public.post_reactions REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.post_reactions;