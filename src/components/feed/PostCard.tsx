import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, ThumbsUp, ThumbsDown, Flag, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { Post, ReactionType } from '@/types';
import { useAuth } from '@/contexts/auth';
import { cn } from '@/lib/utils';
import ReportPostDialog from './ReportPostDialog';

interface PostCardProps {
  post: Post;
  onToggleReaction: (postId: string, reactionType: ReactionType) => void;
  onReportPost: (postId: string, reason: string) => Promise<boolean>;
}

const PostCard: React.FC<PostCardProps> = ({ post, onToggleReaction, onReportPost }) => {
  const { currentUser } = useAuth();
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  const getReactionIcon = (type: ReactionType) => {
    switch (type) {
      case 'heart': return Heart;
      case 'thumbs_up': return ThumbsUp;
      case 'thumbs_down': return ThumbsDown;
    }
  };

  const getReactionColor = (type: ReactionType, isActive: boolean) => {
    if (!isActive) return 'text-muted-foreground';
    
    switch (type) {
      case 'heart': return 'text-red-500';
      case 'thumbs_up': return 'text-green-500';
      case 'thumbs_down': return 'text-red-500';
    }
  };

  const reactions: ReactionType[] = ['heart', 'thumbs_up', 'thumbs_down'];

  return (
    <>
      <Card className="p-4 mb-4">
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.profiles?.avatar_url} />
            <AvatarFallback>
              {post.profiles?.username?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm truncate">
                {post.profiles?.username || 'Unknown User'}
              </span>
              <Badge variant="secondary" className="text-xs">
                Tipster
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
            
            {post.image_url && (
              <div className="mt-3 rounded-lg overflow-hidden border">
                <img 
                  src={post.image_url} 
                  alt="Post image" 
                  className="w-full h-auto max-h-96 object-cover"
                />
              </div>
            )}
          </div>
          
          {currentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setReportDialogOpen(true)}>
                  <Flag className="h-4 w-4 mr-2" />
                  Report Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {currentUser && (
          <div className="flex items-center gap-1 pt-2 border-t">
            {reactions.map((reactionType) => {
              const Icon = getReactionIcon(reactionType);
              const count = post.reaction_counts?.[reactionType] || 0;
              const isActive = post.user_reaction === reactionType;

              return (
                <Button
                  key={reactionType}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex items-center gap-1 h-8 px-2",
                    isActive && "bg-accent"
                  )}
                  onClick={() => onToggleReaction(post.id, reactionType)}
                >
                  <Icon 
                    className={cn(
                      "h-4 w-4",
                      getReactionColor(reactionType, isActive)
                    )}
                    fill={isActive ? "currentColor" : "none"}
                  />
                  {count > 0 && (
                    <span className="text-xs font-medium">{count}</span>
                  )}
                </Button>
              );
            })}
          </div>
        )}
      </Card>

      <ReportPostDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        onReport={onReportPost}
        postId={post.id}
      />
    </>
  );
};

export default PostCard;