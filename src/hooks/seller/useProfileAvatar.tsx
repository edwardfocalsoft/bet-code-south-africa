
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useProfileAvatar = (userId: string | undefined) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check for valid image MIME types
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      
      if (!validImageTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a valid image file (JPEG, PNG, GIF, or WebP)",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image must be less than 2MB",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!selectedFile || !userId) return null;
    
    setUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `avatars/${userId}/${Date.now()}.${fileExt}`;
      
      console.log(`[avatar-upload] Uploading to path: ${filePath}`);
      console.log(`[avatar-upload] User ID: ${userId}`);
      
      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(filePath, selectedFile, {
          contentType: selectedFile.type,
          upsert: true
        });
        
      if (uploadError) {
        console.error("[avatar-upload] Upload error:", uploadError);
        throw uploadError;
      }
      
      const { data } = supabase.storage.from("profiles").getPublicUrl(filePath);
      console.log(`[avatar-upload] Upload successful, public URL: ${data.publicUrl}`);
      return data.publicUrl;
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const resetFileData = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  return {
    uploading,
    selectedFile,
    filePreview,
    handleFileChange,
    uploadAvatar,
    resetFileData
  };
};
