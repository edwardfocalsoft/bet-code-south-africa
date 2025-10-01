import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { PlusCircle, ImageIcon, X } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

interface CreatePostDialogProps {
  onCreatePost: (content: string, imageUrl?: string) => Promise<boolean>;
}

const CreatePostDialog: React.FC<CreatePostDialogProps> = ({ onCreatePost }) => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { currentUser, userRole } = useAuth();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const validateContent = (text: string) => {
    // Check for links (http, https, www)
    const linkPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/i;
    if (linkPattern.test(text)) {
      return 'Links are not allowed in posts';
    }

    // Check if content is mostly numbers (more than 50% numbers)
    const numbersOnly = text.replace(/[^0-9]/g, '');
    const totalChars = text.replace(/\s/g, '').length;
    if (totalChars > 0 && (numbersOnly.length / totalChars) > 0.5) {
      return 'Posts should be text-based, not primarily numbers';
    }

    return null;
  };

  const handleSubmit = async () => {
    if (!content.trim() || loading) return;

    // Validate content
    const validationError = validateContent(content);
    if (validationError) {
      console.error('Content validation failed:', validationError);
      return;
    }

    setLoading(true);
    let imageUrl = '';

    try {
      // Upload image if selected
      if (selectedImage && currentUser) {
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${currentUser.id}/post_${Date.now()}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('post-images')
          .upload(fileName, selectedImage);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      const success = await onCreatePost(content, imageUrl);
      if (success) {
        setContent('');
        setSelectedImage(null);
        setImagePreview(null);
        setOpen(false);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
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
          <div className="space-y-2">
            <Textarea
              placeholder="What's on your mind? Share your thoughts, tips, or predictions! 😊"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px]"
              maxLength={500}
            />
            {content && validateContent(content) && (
              <p className="text-sm text-red-500">{validateContent(content)}</p>
            )}
          </div>
          
          {imagePreview && (
            <div className="relative">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full h-48 object-cover rounded-lg border"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload">
                <Button variant="outline" size="sm" type="button" asChild>
                  <div className="cursor-pointer">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Add Image
                  </div>
                </Button>
              </label>
            </div>
            <div className="text-sm text-muted-foreground">
              {content.length}/500
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!content.trim() || loading || !!validateContent(content)}
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