
import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, SearchCheck, Save } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

interface SEOSettings {
  id?: string;
  site_title: string;
  site_description: string;
  site_keywords: string;
  default_og_image: string;
  created_at?: string;
  updated_at?: string;
}

export const useSEOSettings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<SEOSettings>({
    site_title: 'BetCode South Africa',
    site_description: 'The best betting tips and predictions in South Africa.',
    site_keywords: 'betting, predictions, tips, bet codes, sports betting',
    default_og_image: '/logo.png',
  });
  const { currentUser } = useAuth();

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("seo_settings")
        .select("*")
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setSettings(data as SEOSettings);
      }
    } catch (error: any) {
      console.error("Error fetching SEO settings:", error);
      toast.error(`Failed to load SEO settings: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const saveSettings = async (newSettings: Partial<SEOSettings>) => {
    if (!currentUser || currentUser.role !== "admin") {
      toast.error("Only admins can update SEO settings");
      return;
    }

    setIsSaving(true);
    try {
      const updatedSettings = {
        ...newSettings,
        updated_at: new Date().toISOString(),
      };

      // Check if settings exist, if yes update, if not insert
      const { data: existingSettings } = await supabase
        .from("seo_settings")
        .select("id")
        .maybeSingle();

      let result;
      
      if (existingSettings?.id) {
        // Update existing record
        result = await supabase
          .from("seo_settings")
          .update(updatedSettings)
          .eq("id", existingSettings.id);
      } else {
        // Create new record
        result = await supabase
          .from("seo_settings")
          .insert(updatedSettings);
      }

      if (result.error) throw result.error;
      
      toast.success("SEO settings updated successfully");
      
      // Refresh the settings
      fetchSettings();
    } catch (error: any) {
      console.error("Error saving SEO settings:", error);
      toast.error(`Failed to save settings: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    settings,
    isLoading,
    isSaving,
    saveSettings
  };
};

const SEOSettingsCard: React.FC = () => {
  const { settings, isLoading, isSaving, saveSettings } = useSEOSettings();
  const [formState, setFormState] = useState({
    site_title: '',
    site_description: '',
    site_keywords: '',
    default_og_image: '',
  });

  useEffect(() => {
    if (!isLoading && settings) {
      setFormState({
        site_title: settings.site_title || '',
        site_description: settings.site_description || '',
        site_keywords: settings.site_keywords || '',
        default_og_image: settings.default_og_image || '',
      });
    }
  }, [settings, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettings(formState);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({
      ...formState,
      [e.target.id]: e.target.value
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-betting-green" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <SearchCheck className="h-5 w-5 text-betting-green" />
          <CardTitle>SEO Settings</CardTitle>
        </div>
        <CardDescription>
          Configure SEO settings for better search engine visibility
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site_title">Site Title</Label>
            <Input
              id="site_title"
              value={formState.site_title}
              onChange={handleChange}
              placeholder="Site Title"
              className="bg-betting-black border-betting-light-gray"
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">
              The title shown in search results and browser tabs
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="site_description">Site Description</Label>
            <Textarea
              id="site_description"
              value={formState.site_description}
              onChange={handleChange}
              placeholder="Site Description"
              className="bg-betting-black border-betting-light-gray min-h-[100px]"
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">
              A brief description of your site (150-160 characters for best results)
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="site_keywords">Keywords</Label>
            <Input
              id="site_keywords"
              value={formState.site_keywords}
              onChange={handleChange}
              placeholder="Keywords (comma separated)"
              className="bg-betting-black border-betting-light-gray"
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated list of keywords related to your site
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="default_og_image">Default Social Media Image</Label>
            <Input
              id="default_og_image"
              value={formState.default_og_image}
              onChange={handleChange}
              placeholder="/path/to/image.jpg"
              className="bg-betting-black border-betting-light-gray"
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">
              URL path to the image that appears when sharing on social media
            </p>
          </div>
        </CardContent>
        
        <CardFooter>
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
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SEOSettingsCard;
