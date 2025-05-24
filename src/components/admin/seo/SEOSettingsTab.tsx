
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Save, Search, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SEOSettings {
  site_title: string;
  site_description: string;
  site_keywords: string;
  default_og_image: string;
  updated_at?: string;
  id?: string;
}

const defaultSettings: SEOSettings = {
  site_title: "BetCode South Africa",
  site_description: "The best betting tips and predictions in South Africa.",
  site_keywords: "betting, predictions, tips, bet codes, sports betting",
  default_og_image: "/logo.png",
};

export const SEOSettingsTab: React.FC = () => {
  const [settings, setSettings] = useState<SEOSettings>(defaultSettings);
  const [loading, setLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchSEOSettings();
  }, []);

  const fetchSEOSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('seo_settings')
        .select('*')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data as SEOSettings);
      }
    } catch (error: any) {
      console.error("Error fetching SEO settings:", error.message);
      toast.error("Failed to load SEO settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const saveSEOSettings = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('seo_settings')
        .upsert({ 
          ...settings,
          updated_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      toast.success("SEO settings saved successfully!", {
        description: "Your SEO configuration has been updated.",
      });
    } catch (error: any) {
      toast.error("Error saving SEO settings", {
        description: error.message || "Failed to save SEO settings",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-betting-green" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-betting-green" />
          <CardTitle>SEO Settings</CardTitle>
        </div>
        <CardDescription>
          Configure search engine optimization settings for your site
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="site_title">Site Title</Label>
          <Input
            id="site_title"
            name="site_title"
            value={settings.site_title}
            onChange={handleInputChange}
            placeholder="Your site title"
            className="bg-betting-light-gray border-betting-light-gray focus:border-betting-green"
          />
          <p className="text-xs text-muted-foreground">
            This will appear in search results and browser tabs
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="site_description">Site Description</Label>
          <Textarea
            id="site_description"
            name="site_description"
            value={settings.site_description}
            onChange={handleInputChange}
            placeholder="Describe your website"
            className="bg-betting-light-gray border-betting-light-gray focus:border-betting-green min-h-[100px]"
          />
          <p className="text-xs text-muted-foreground">
            This description appears in search engine results (160 characters recommended)
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="site_keywords">Keywords</Label>
          <Input
            id="site_keywords"
            name="site_keywords"
            value={settings.site_keywords}
            onChange={handleInputChange}
            placeholder="keyword1, keyword2, keyword3"
            className="bg-betting-light-gray border-betting-light-gray focus:border-betting-green"
          />
          <p className="text-xs text-muted-foreground">
            Separate keywords with commas
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="default_og_image">Default Social Share Image</Label>
          <Input
            id="default_og_image"
            name="default_og_image"
            value={settings.default_og_image}
            onChange={handleInputChange}
            placeholder="/path/to/image.jpg"
            className="bg-betting-light-gray border-betting-light-gray focus:border-betting-green"
          />
          <p className="text-xs text-muted-foreground">
            Image that appears when your site is shared on social media (1200x630px recommended)
          </p>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={saveSEOSettings}
          disabled={loading}
          className="bg-betting-green hover:bg-betting-green-dark"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save SEO Settings
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SEOSettingsTab;
