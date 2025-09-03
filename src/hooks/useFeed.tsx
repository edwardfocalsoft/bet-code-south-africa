import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Post, ReactionType, UserRole } from '@/types';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';

export const useFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const fetchPosts = useCallback(async (pageNum: number = 0, reset: boolean = false) => {
    try {
      setLoading(true);
      const offset = pageNum * 20;

      // Get followed seller IDs for algorithmic feed
      let followedSellerIds: string[] = [];
      if (currentUser) {
        const { data: subscriptions } = await supabase
          .from('subscriptions')
          .select('seller_id')
          .eq('buyer_id', currentUser.id);
        
        followedSellerIds = subscriptions?.map(s => s.seller_id) || [];
      }

      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            avatar_url,
            role
          )
        `)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false })
        .range(offset, offset + 19);

      const { data: postsData, error } = await query;

      if (error) throw error;

      if (!postsData || postsData.length === 0) {
        setHasMore(false);
        if (reset) setPosts([]);
        return;
      }

      // Get reaction counts and user reactions for each post
      const postsWithReactions = await Promise.all(
        postsData.map(async (post): Promise<Post> => {
          // Get reaction counts
          const { data: reactionCounts } = await supabase
            .from('post_reactions')
            .select('reaction_type')
            .eq('post_id', post.id);

          const counts = {
            heart: reactionCounts?.filter(r => r.reaction_type === 'heart').length || 0,
            thumbs_up: reactionCounts?.filter(r => r.reaction_type === 'thumbs_up').length || 0,
            thumbs_down: reactionCounts?.filter(r => r.reaction_type === 'thumbs_down').length || 0,
          };

          // Get user's reaction if logged in
          let userReaction = null;
          if (currentUser) {
            const { data: userReactionData } = await supabase
              .from('post_reactions')
              .select('reaction_type')
              .eq('post_id', post.id)
              .eq('user_id', currentUser.id)
              .single();
            
            userReaction = userReactionData?.reaction_type || null;
          }

          // Type the profiles safely
          const profiles = (post as any).profiles as { id: string; username: string; avatar_url?: string; role: UserRole; } | undefined;

          return {
            id: post.id,
            user_id: post.user_id,
            content: post.content,
            created_at: post.created_at,
            updated_at: post.updated_at,
            is_hidden: post.is_hidden,
            profiles,
            reaction_counts: counts,
            user_reaction: userReaction,
          } as Post;
        })
      );

      // Apply feed algorithm - prioritize followed sellers
      const sortedPosts = postsWithReactions.sort((a, b) => {
        const aIsFollowed = followedSellerIds.includes(a.user_id);
        const bIsFollowed = followedSellerIds.includes(b.user_id);
        
        if (aIsFollowed && !bIsFollowed) return -1;
        if (!aIsFollowed && bIsFollowed) return 1;
        
        // For non-followed, prioritize posts with more reactions
        if (!aIsFollowed && !bIsFollowed) {
          const aTotal = Object.values(a.reaction_counts || {}).reduce((sum, count) => sum + count, 0);
          const bTotal = Object.values(b.reaction_counts || {}).reduce((sum, count) => sum + count, 0);
          return bTotal - aTotal;
        }
        
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      if (reset) {
        setPosts(sortedPosts);
      } else {
        setPosts(prev => [...prev, ...sortedPosts]);
      }

      setHasMore(postsData.length === 20);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage, false);
    }
  }, [loading, hasMore, page, fetchPosts]);

  const createPost = useCallback(async (content: string) => {
    if (!currentUser) return false;

    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: currentUser.id,
          content: content.trim(),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post created successfully",
      });

      // Refresh feed
      setPage(0);
      fetchPosts(0, true);
      return true;
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
      return false;
    }
  }, [currentUser, toast, fetchPosts]);

  const toggleReaction = useCallback(async (postId: string, reactionType: ReactionType) => {
    if (!currentUser) {
      toast({ title: "Login required", description: "Please log in to react to posts.", variant: "destructive" });
      return;
    }

    try {
      // Check if user already has this reaction
      const { data: existingReaction } = await supabase
        .from('post_reactions')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', currentUser.id)
        .eq('reaction_type', reactionType)
        .single();

      if (existingReaction) {
        // Remove reaction
        await supabase
          .from('post_reactions')
          .delete()
          .eq('id', existingReaction.id);
      } else {
        // Remove any other reaction type for this post first
        await supabase
          .from('post_reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUser.id);

        // Add new reaction
        await supabase
          .from('post_reactions')
          .insert({
            post_id: postId,
            user_id: currentUser.id,
            reaction_type: reactionType,
          });
      }

      // Update local state
      setPosts(prev => prev.map(post => {
        if (post.id !== postId) return post;

        const newCounts = { ...post.reaction_counts };
        const wasUserReaction = post.user_reaction === reactionType;

        // Update counts
        if (wasUserReaction) {
          newCounts[reactionType]--;
        } else {
          if (post.user_reaction) {
            newCounts[post.user_reaction]--;
          }
          newCounts[reactionType]++;
        }

        return {
          ...post,
          reaction_counts: newCounts,
          user_reaction: wasUserReaction ? null : reactionType,
        };
      }));

    } catch (error) {
      console.error('Error toggling reaction:', error);
      toast({
        title: "Error",
        description: "Failed to update reaction",
        variant: "destructive",
      });
    }
  }, [currentUser, toast]);

  const reportPost = useCallback(async (postId: string, reason: string) => {
    if (!currentUser) return false;

    try {
      const { error } = await supabase
        .from('post_reports')
        .insert({
          post_id: postId,
          user_id: currentUser.id,
          reason: reason.trim(),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post reported successfully",
      });

      return true;
    } catch (error) {
      console.error('Error reporting post:', error);
      toast({
        title: "Error",
        description: "Failed to report post",
        variant: "destructive",
      });
      return false;
    }
  }, [currentUser, toast]);

  useEffect(() => {
    fetchPosts(0, true);
  }, [currentUser?.id]);

  return {
    posts,
    loading,
    hasMore,
    loadMore,
    createPost,
    toggleReaction,
    reportPost,
    refetch: () => {
      setPage(0);
      fetchPosts(0, true);
    },
  };
};