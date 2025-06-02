import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, User, Mail, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

const BuyerProfile: React.FC = () => {
  const { currentUser } = useAuth();
  const { toast: uiToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    username: "",
    avatarUrl: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      loadProfile();
    }
  }, [currentUser]);

  const loadProfile = async () => {
    if (!currentUser?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (error) throw error;

      setProfileData({
        username: data?.username || "",
        avatarUrl: data?.avatar_url || "",
      });
    } catch (error: any) {
      toast.error(`Error loading profile: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
        uiToast({
          title: "Invalid file type",
          description: "Please upload a JPEG, PNG, or GIF image",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        uiToast({
          title: "File too large",
          description: "Image must be less than 2MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!selectedFile || !currentUser?.id) return null;

    try {
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `avatars/${currentUser.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      const { data } = supabase.storage.from("profiles").getPublicUrl(filePath);

      if (!data?.publicUrl) {
        throw new Error("Failed to get public URL");
      }

      return data.publicUrl;
    } catch (error: any) {
      uiToast({
        title: "Upload Error",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) return;

    setIsSaving(true);
    try {
      let avatarUrl = profileData.avatarUrl;

      if (selectedFile) {
        const uploadedUrl = await uploadAvatar();
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        } else {
          throw new Error("Failed to upload avatar");
        }
      }

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: currentUser.id,
          username: profileData.username,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setProfileData((prev) => ({
        ...prev,
        avatarUrl,
      }));

      uiToast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setSelectedFile(null);
      setFilePreview(null);
    } catch (error: any) {
      uiToast({
        title: "Error",
        description: `Error updating profile: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Layout requireAuth={true} allowedRoles={["buyer", "admin"]}>
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-betting-green" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout requireAuth={true} allowedRoles={["buyer", "admin"]}>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card className="betting-card h-full">
              <CardContent className="pt-6 flex flex-col items-center">
                <div className="relative mb-4 group">
                  <Avatar className="h-32 w-32">
                    <AvatarImage
                      src={filePreview || profileData.avatarUrl}
                      alt={profileData.username || "User"}
                      onError={() => setProfileData((prev) => ({ ...prev, avatarUrl: "" }))}
                    />
                    <AvatarFallback className="text-3xl">
                      {profileData.username ? profileData.username[0]?.toUpperCase() : <User className="h-10 w-10" />}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 rounded-full flex items-center justify-center bg-betting-black/50 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                  >
                    <span className="text-white text-xs">Change</span>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isSaving}
                  />
                </div>

                <h2 className="text-xl font-medium mt-2">{profileData.username || "Set your username"}</h2>
                <p className="text-sm text-muted-foreground">{currentUser?.email}</p>

                <div className="mt-6 w-full">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                    <User className="h-4 w-4" />
                    <span>Buyer Account</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{currentUser?.email}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="betting-card">
              <CardHeader>
                <CardTitle>Profile Details</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={profileData.username}
                      onChange={(e) => setProfileData({ ...prev, username: e.target.value })}
                      placeholder="Choose a username"
                      className="bg-betting-black border-betting-light-gray"
                      disabled={isSaving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={currentUser?.email || ""}
                      disabled
                      className="bg-betting-black/50 border-betting-light-gray text-muted-foreground"
                    />
                    <p className="text-xs text-muted-foreground">Contact support to change your email</p>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="bg-betting-green hover:bg-betting-green-dark"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="betting-card mt-6 border-yellow-500/20">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  <CardTitle className="text-lg">Account Verification</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Verify your account to unlock additional features like withdrawals and higher betting limits.
                </p>
                <Button variant="outline">Verify Account</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BuyerProfile;