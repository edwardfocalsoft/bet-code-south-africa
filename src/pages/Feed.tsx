import React, { useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import Layout from '@/components/layout/Layout';
import { Skeleton } from '@/components/ui/skeleton';
import { useFeed } from '@/hooks/useFeed';
import CreatePostDialog from '@/components/feed/CreatePostDialog';
import PostCard from '@/components/feed/PostCard';

const Feed: React.FC = () => {
  const { posts, loading, hasMore, loadMore, createPost, toggleReaction, reportPost } = useFeed();
  
  const { ref } = useInView({
    threshold: 0,
    onChange: (inView) => {
      if (inView && hasMore && !loading) {
        loadMore();
      }
    },
  });

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-card rounded-lg border p-4">
          <div className="flex items-start gap-3 mb-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
          <div className="flex gap-2 pt-2 border-t">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Feed</h1>
          <p className="text-muted-foreground">
            Stay updated with the latest from your favorite tipsters
          </p>
        </div>

        <CreatePostDialog onCreatePost={createPost} />

        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onToggleReaction={toggleReaction}
              onReportPost={reportPost}
            />
          ))}

          {loading && <LoadingSkeleton />}

          {!loading && posts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No posts yet. Follow some tipsters to see their updates here!
              </p>
            </div>
          )}

          {hasMore && !loading && <div ref={ref} className="h-4" />}

          {!hasMore && posts.length > 0 && (
            <div className="text-center py-6">
              <p className="text-muted-foreground text-sm">
                You've reached the end of the feed
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Feed;