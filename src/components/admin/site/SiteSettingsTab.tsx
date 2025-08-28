import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Globe, Image, Code, CircleOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SiteSettings {
  site_name: string;
  favicon_url: string | null;
  logo_url: string | null;
  maintenance_mode: boolean;
  google_ads_code: string | null;
  updated_at?: string;
  id?: string;
}

const defaultSettings: SiteSettings = {
  site_name: "CODE",
  favicon_url: "/lovable-uploads/cc72a31c-e286-4a9e-b900-b6f4839c3296.png",
  logo_url: "/lovable-uploads/cc72a31c-e286-4a9e-b900-b6f4839c3296.png", 
  maintenance_mode: false,
  google_ads_code: "",
};

export const SiteSettingsTab: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);

  useEffect(() => {
    fetchSiteSettings();
  }, []);

  const fetchSiteSettings = async () => {
    setIsLoading(true);
    try {
      // Using as { data: any } to bypass TypeScript errors until types are regenerated
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .maybeSingle() as { data: any, error: any };

      if (error) throw error;

      if (data) {
        setSettings(data as SiteSettings);
      }
    } catch (error: any) {
      console.error("Error fetching site settings:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = (checked: boolean) => {
    setSettings(prev => ({ ...prev, maintenance_mode: checked }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'logo' | 'favicon') => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "File size should be less than 2MB",
          variant: "destructive",
        });
        return;
      }

      if (fileType === 'logo') {
        setLogoFile(file);
      } else {
        setFaviconFile(file);
      }
    }
  };

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('site_assets')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: urlData } = supabase.storage
      .from('site_assets')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const saveSiteSettings = async () => {
    setLoading(true);
    
    try {
      let updatedSettings = { ...settings };
      
      // Handle file uploads if any
      if (logoFile) {
        const logoUrl = await uploadFile(logoFile, 'logos');
        updatedSettings.logo_url = logoUrl;
      }
      
      if (faviconFile) {
        const faviconUrl = await uploadFile(faviconFile, 'favicons');
        updatedSettings.favicon_url = faviconUrl;
      }
      
      // Update site settings in database
      // Using as { error: any } to bypass TypeScript errors until types are regenerated
      const { error } = await supabase
        .from('site_settings')
        .upsert({ 
          ...updatedSettings,
          updated_at: new Date().toISOString()
        }) as { error: any };
        
      if (error) throw error;
      
      // Update favicon in document
      if (faviconFile) {
        const favicon = document.querySelector('link[rel="icon"]');
        if (favicon) {
          favicon.setAttribute('href', updatedSettings.favicon_url || '');
        }
      }
      
      setSettings(updatedSettings);
      setLogoFile(null);
      setFaviconFile(null);
      
      toast({
        title: "Settings saved",
        description: "Site settings have been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error saving settings",
        description: error.message || "Failed to save site settings",
        variant: "destructive",
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
          <Globe className="h-5 w-5 text-betting-green" />
          <CardTitle>Site Settings</CardTitle>
        </div>
        <CardDescription>
          Customize your site's appearance and settings
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {settings.maintenance_mode && (
          <Alert className="bg-yellow-900/20 text-yellow-300 border border-yellow-900">
            <CircleOff className="h-4 w-4" />
            <AlertTitle>Maintenance Mode Active</AlertTitle>
            <AlertDescription>
              Your site is currently in maintenance mode. Only admins can access the site.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="site_name">Site Name</Label>
          <Input
            id="site_name"
            name="site_name"
            value={settings.site_name}
            onChange={handleInputChange}
            placeholder="Enter site name"
            className="bg-betting-light-gray border-betting-light-gray focus:border-betting-green"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="logo">Site Logo</Label>
          <div className="flex items-center space-x-4">
            {settings.logo_url && (
              <div className="h-12 w-auto overflow-hidden rounded-md bg-betting-light-gray p-1">
                <img 
                  src={settings.logo_url} 
                  alt="Site Logo"
                  className="h-full w-auto object-contain"
                />
              </div>
            )}
            <div className="flex-1">
              <Input
                id="logo"
                type="file"
                onChange={(e) => handleFileChange(e, 'logo')}
                accept="image/*"
                className="bg-betting-light-gray border-betting-light-gray"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Recommended size: 200px × 50px (PNG or SVG)
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="favicon">Site Favicon</Label>
          <div className="flex items-center space-x-4">
            {settings.favicon_url && (
              <div className="h-10 w-10 overflow-hidden rounded-md bg-betting-light-gray p-1">
                <img 
                  src={settings.favicon_url} 
                  alt="Site Favicon"
                  className="h-full w-full object-contain"
                />
              </div>
            )}
            <div className="flex-1">
              <Input
                id="favicon"
                type="file"
                onChange={(e) => handleFileChange(e, 'favicon')}
                accept="image/*"
                className="bg-betting-light-gray border-betting-light-gray"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Recommended size: 32px × 32px (PNG format)
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 pt-4">
          <Switch
            id="maintenance_mode"
            checked={settings.maintenance_mode}
            onCheckedChange={handleToggleChange}
          />
          <Label htmlFor="maintenance_mode">Enable Maintenance Mode</Label>
        </div>
        
        <div className="space-y-2 pt-4">
          <Label htmlFor="google_ads_code" className="flex items-center gap-1">
            <Code className="h-4 w-4" />
            Google Ads Code
          </Label>
          <Textarea
            id="google_ads_code"
            name="google_ads_code"
            value={settings.google_ads_code}
            onChange={handleInputChange}
            placeholder="Paste your Google Ads code here"
            className="bg-betting-light-gray border-betting-light-gray focus:border-betting-green min-h-[120px] font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            This code will be added to all pages of your site
          </p>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={saveSiteSettings}
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
              Save Settings
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SiteSettingsTab;
