import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth';

interface CreatePostDialogProps {
  onCreatePost: (content: string) => Promise<boolean>;
}

const CreatePostDialog: React.FC<CreatePostDialogProps> = ({ onCreatePost }) => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser, userRole } = useAuth();

  const handleSubmit = async () => {
    if (!content.trim() || loading) return;

    setLoading(true);
    const success = await onCreatePost(content);
    if (success) {
      setContent('');
      setOpen(false);
    }
    setLoading(false);
  };

  if (!currentUser || userRole !== 'seller') {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full mb-6">
          <PlusCircle className="h-4 w-4 mr-2" />
          Share Update
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share an Update</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px]"
            maxLength={500}
          />
          <div className="text-sm text-muted-foreground text-right">
            {content.length}/500
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!content.trim() || loading}
            >
              {loading ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostDialog;