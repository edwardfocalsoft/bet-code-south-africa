import React, { useCallback, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import Layout from '@/components/layout/Layout';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { useFeed } from '@/hooks/useFeed';
import CreatePostDialog from '@/components/feed/CreatePostDialog';
import PostCard from '@/components/feed/PostCard';
import FeedSidebar from '@/components/feed/FeedSidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, ThumbsUp, ThumbsDown, MessageCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MOCK_POSTS = [
  {
    username: 'TipsterKing_SA',
    avatar: 'TK',
    time: '2 hours ago',
    content: '🔥 5/5 wins yesterday! Today\'s acca looking solid — PSL fixtures are 🔒. Trust the process! 💰⚽',
    hearts: 42,
    thumbsUp: 38,
    thumbsDown: 2,
  },
  {
    username: 'BetWise_Pro',
    avatar: 'BW',
    time: '4 hours ago',
    content: 'Premier League weekend picks are up! 🏴󠁧󠁢󠁥󠁮󠁧󠁿 Over 2.5 goals in 3 matches — check my ticket before kickoff ⏰⚽',
    hearts: 27,
    thumbsUp: 31,
    thumbsDown: 1,
  },
  {
    username: 'GoalMachine_ZA',
    avatar: 'GM',
    time: '6 hours ago',
    content: 'Another green day! 💚 That\'s 12 wins in a row on my BTTS picks. Consistency is key 🔑📈',
    hearts: 65,
    thumbsUp: 54,
    thumbsDown: 3,
  },
  {
    username: 'SoccerGuru99',
    avatar: 'SG',
    time: '8 hours ago',
    content: 'Big odds combo hitting at 25/1 🎯 Sometimes you just have to trust your research. Champions League nights are the best! 🏆',
    hearts: 89,
    thumbsUp: 71,
    thumbsDown: 5,
  },
  {
    username: 'AcePredictor',
    avatar: 'AP',
    time: '12 hours ago',
    content: 'Free ticket dropped for the weekend! 🎁 Follow me for daily free picks and premium combos. Let\'s eat! 🍽️💰',
    hearts: 112,
    thumbsUp: 98,
    thumbsDown: 4,
  },
];
const Feed: React.FC = () => {
  const { 
    posts, 
    loading, 
    hasMore, 
    loadMore, 
    createPost, 
    toggleReaction, 
    reportPost,
    deletePost,
    searchQuery,
    setSearchQuery 
  } = useFeed();
  const {
    ref
  } = useInView({
    threshold: 0,
    onChange: inView => {
      if (inView && hasMore && !loading) {
        loadMore();
      }
    }
  });
  const LoadingSkeleton = () => <div className="space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="bg-card rounded-lg border p-4">
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
        </div>)}
    </div>;
  return <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <FeedSidebar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
          
          {/* Main Feed */}
          <div className="flex-1 max-w-4xl space-y-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">Feed</h1>
              <p className="text-muted-foreground">
                Stay updated with the latest from your favorite tipsters
              </p>
            </div>

            <CreatePostDialog onCreatePost={createPost} />
            
            {searchQuery && <Card>
                <CardContent className="py-4">
                  <p className="text-sm text-muted-foreground">
                    {posts.length > 0 ? `Found ${posts.length} post${posts.length === 1 ? '' : 's'} matching "${searchQuery}"` : `No posts found matching "${searchQuery}"`}
                  </p>
                </CardContent>
              </Card>}

            <div className="space-y-4">
              {posts.map(post => <PostCard key={post.id} post={post} onToggleReaction={toggleReaction} onReportPost={reportPost} onDeletePost={deletePost} />)}

              {loading && <LoadingSkeleton />}

              {!loading && posts.length === 0 && !searchQuery && <div className="space-y-4">
                  <div className="text-center py-6 mb-2">
                    <TrendingUp className="h-10 w-10 mx-auto text-primary mb-3" />
                    <h3 className="font-semibold text-lg mb-1">See what tipsters are saying</h3>
                    <p className="text-muted-foreground text-sm">
                      Follow tipsters and join the conversation!
                    </p>
                  </div>
                  {MOCK_POSTS.map((mock, i) => (
                    <Card key={i} className="p-4 opacity-90">
                      <div className="flex items-start gap-3 mb-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                            {mock.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm truncate">{mock.username}</span>
                            <Badge variant="secondary" className="text-xs">Tipster</Badge>
                            <span className="text-xs text-muted-foreground">{mock.time}</span>
                          </div>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{mock.content}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 pt-2 border-t">
                        <Button variant="ghost" size="sm" className="flex items-center gap-1 h-8 px-2 cursor-default hover:bg-transparent">
                          <Heart className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs font-medium">{mock.hearts}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center gap-1 h-8 px-2 cursor-default hover:bg-transparent">
                          <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs font-medium">{mock.thumbsUp}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center gap-1 h-8 px-2 cursor-default hover:bg-transparent">
                          <ThumbsDown className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs font-medium">{mock.thumbsDown}</span>
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>}

              {hasMore && !loading && <div ref={ref} className="h-4" />}

              {!hasMore && posts.length > 0 && <div className="text-center py-6">
                  <p className="text-muted-foreground text-sm">
                    You've reached the end of the feed
                  </p>
                </div>}
            </div>
          </div>
        </div>
      </div>
    </Layout>;
};
export default Feed;