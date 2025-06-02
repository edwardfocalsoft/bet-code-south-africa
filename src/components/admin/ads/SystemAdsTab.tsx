
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, Trash2, Eye, Plus } from "lucide-react";
import { useAuth } from "@/contexts/auth";

interface SystemAd {
  id: string;
  title: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
}

const SystemAdsTab: React.FC = () => {
  const { currentUser } = useAuth();
  const [ads, setAds] = useState<SystemAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAd, setNewAd] = useState({
    title: "",
    image_url: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    try {
      const { data, error } = await supabase
        .from("system_ads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAds(data || []);
    } catch (error: any) {
      toast.error(`Error loading ads: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedFile) return null;

    setUploading(true);
    try {
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `system-ads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("profiles").getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const createAd = async () => {
    if (!newAd.title.trim()) {
      toast.error("Please enter an ad title");
      return;
    }

    if (!selectedFile) {
      toast.error("Please select an image");
      return;
    }

    setCreating(true);
    try {
      const imageUrl = await uploadImage();
      if (!imageUrl) throw new Error("Failed to upload image");

      const { error } = await supabase
        .from("system_ads")
        .insert({
          title: newAd.title,
          image_url: imageUrl,
          created_by: currentUser?.id,
        });

      if (error) throw error;

      toast.success("Ad created successfully!");
      setNewAd({ title: "", image_url: "" });
      setSelectedFile(null);
      setShowCreateForm(false);
      loadAds();
    } catch (error: any) {
      toast.error(`Error creating ad: ${error.message}`);
    } finally {
      setCreating(false);
    }
  };

  const toggleAdStatus = async (adId: string, isActive: boolean) => {
    try {
      // If activating this ad, deactivate all others first
      if (isActive) {
        await supabase
          .from("system_ads")
          .update({ is_active: false })
          .neq("id", adId);
      }

      const { error } = await supabase
        .from("system_ads")
        .update({ is_active: isActive })
        .eq("id", adId);

      if (error) throw error;

      toast.success(`Ad ${isActive ? "activated" : "deactivated"} successfully!`);
      loadAds();
    } catch (error: any) {
      toast.error(`Error updating ad: ${error.message}`);
    }
  };

  const deleteAd = async (adId: string) => {
    if (!confirm("Are you sure you want to delete this ad?")) return;

    try {
      const { error } = await supabase
        .from("system_ads")
        .delete()
        .eq("id", adId);

      if (error) throw error;

      toast.success("Ad deleted successfully!");
      loadAds();
    } catch (error: any) {
      toast.error(`Error deleting ad: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-betting-green" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>System Ads Management</CardTitle>
              <CardDescription>
                Manage pop-up ads and announcements. Only one ad can be active at a time.
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-betting-green hover:bg-betting-green-dark"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Ad
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showCreateForm && (
            <div className="mb-6 p-4 border rounded-lg bg-betting-dark-gray/20">
              <h3 className="text-lg font-medium mb-4">Create New Ad</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ad-title">Ad Title</Label>
                  <Input
                    id="ad-title"
                    value={newAd.title}
                    onChange={(e) => setNewAd({ ...newAd, title: e.target.value })}
                    placeholder="Enter ad title"
                    className="bg-betting-light-gray border-betting-light-gray"
                  />
                </div>
                
                <div>
                  <Label htmlFor="ad-image">Ad Image (1:1 aspect ratio recommended)</Label>
                  <Input
                    id="ad-image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="bg-betting-light-gray border-betting-light-gray"
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={createAd}
                    disabled={creating || uploading}
                    className="bg-betting-green hover:bg-betting-green-dark"
                  >
                    {creating || uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {uploading ? "Uploading..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Create Ad
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewAd({ title: "", image_url: "" });
                      setSelectedFile(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {ads.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No ads created yet. Create your first ad to get started.
              </p>
            ) : (
              ads.map((ad) => (
                <div
                  key={ad.id}
                  className="flex items-center gap-4 p-4 border rounded-lg bg-betting-dark-gray/10"
                >
                  <img
                    src={ad.image_url}
                    alt={ad.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                  
                  <div className="flex-1">
                    <h4 className="font-medium">{ad.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(ad.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={ad.is_active}
                      onCheckedChange={(checked) => toggleAdStatus(ad.id, checked)}
                    />
                    <span className="text-sm">
                      {ad.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(ad.image_url, "_blank")}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteAd(ad.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemAdsTab;
