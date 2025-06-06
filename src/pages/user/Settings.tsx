
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save, CreditCard, Search, ChevronDown, Speaker } from "lucide-react";
import { usePaymentSettings } from "@/hooks/usePaymentSettings";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import SiteSettingsTab from "@/components/admin/site/SiteSettingsTab";
import SEOSettingsTab from "@/components/admin/seo/SEOSettingsTab";
import SystemAdsTab from "@/components/admin/ads/SystemAdsTab";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";

const UserSettings: React.FC = () => {
  const { currentUser, userRole } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const { settings, loading: paymentLoading, updateSettings } = usePaymentSettings();
  const isMobile = useIsMobile();
  const [paymentFormData, setPaymentFormData] = useState({
    merchant_id: "",
    merchant_key: "",
    passphrase: "",
    is_test_mode: true
  });

  useEffect(() => {
    if (currentUser) {
      setEmail(currentUser.email || "");
      setUsername(currentUser.username || "");
    }
  }, [currentUser]);

  useEffect(() => {
    if (settings && userRole === "admin") {
      setPaymentFormData({
        merchant_id: settings.merchant_id || "",
        merchant_key: settings.merchant_key || "",
        passphrase: settings.passphrase || "",
        is_test_mode: settings.is_test_mode !== undefined ? settings.is_test_mode : true
      });
    }
  }, [settings, userRole]);

  const updateProfile = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', currentUser.id);
      
      if (error) throw error;
      
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(`Error updating profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    
    setPasswordError("");
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) throw error;
      
      toast.success("Password updated successfully!");
      
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(`Error updating password: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentFormData({
      ...paymentFormData,
      [name]: value
    });
  };

  const handleToggleTestMode = (checked: boolean) => {
    setPaymentFormData({
      ...paymentFormData,
      is_test_mode: checked
    });
  };

  const updatePaymentSettings = async () => {
    setLoading(true);
    
    if (!paymentFormData.merchant_id || !paymentFormData.merchant_key || !paymentFormData.passphrase) {
      toast.error("Please fill in all required fields");
      setLoading(false);
      return;
    }
    
    const success = await updateSettings(paymentFormData);
    
    if (success) {
      toast.success("Payment settings saved successfully!");
    }
    
    setLoading(false);
  };

  const showPaymentSettings = userRole === "admin";
  const showSiteSettings = userRole === "admin";
  const showSEOSettings = userRole === "admin";
  const showSystemAds = userRole === "admin";

  const getTabOptions = () => {
    const options = [
      { value: "profile", label: "Profile Information" },
      { value: "security", label: "Security" }
    ];
    
    if (showPaymentSettings) options.push({ value: "payment", label: "Payment Gateway" });
    if (showSiteSettings) options.push({ value: "site", label: "Site Settings" });
    if (showSEOSettings) options.push({ value: "seo", label: "SEO Settings" });
    if (showSystemAds) options.push({ value: "ads", label: "System Ads" });
    
    return options;
  };

  const tabOptions = getTabOptions();
  const currentTabLabel = tabOptions.find(tab => tab.value === activeTab)?.label || "Profile Information";

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your profile information visible to other users.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={email}
                  disabled
                  className="bg-betting-light-gray border-betting-light-gray"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a unique username"
                  className="bg-betting-light-gray border-betting-light-gray focus:border-betting-green"
                />
              </div>
              
              {userRole && (
                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <Input
                    value={userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                    disabled
                    className="bg-betting-light-gray border-betting-light-gray"
                  />
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={updateProfile} 
                disabled={loading}
                className="bg-betting-green hover:bg-betting-green-dark"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        );

      case "security":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="bg-betting-light-gray border-betting-light-gray focus:border-betting-green"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="bg-betting-light-gray border-betting-light-gray focus:border-betting-green"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="bg-betting-light-gray border-betting-light-gray focus:border-betting-green"
                />
                {passwordError && (
                  <p className="text-sm text-destructive mt-1">{passwordError}</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={updatePassword}
                disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                className="bg-betting-green hover:bg-betting-green-dark"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Password
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        );

      case "payment":
        return showPaymentSettings ? (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-betting-green" />
                <CardTitle>Payment Gateway Settings</CardTitle>
              </div>
              <CardDescription>
                Configure the PayFast payment gateway settings for the platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-betting-green" />
                </div>
              ) : (
                <>
                  {paymentFormData.is_test_mode && (
                    <Alert className="bg-yellow-900/20 text-yellow-300 border border-yellow-900">
                      <AlertTitle>Test Mode Active</AlertTitle>
                      <AlertDescription>
                        Payment gateway is in test mode. No real transactions will be processed.
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="merchant_id">Merchant ID</Label>
                    <Input
                      id="merchant_id"
                      name="merchant_id"
                      value={paymentFormData.merchant_id}
                      onChange={handlePaymentSettingsChange}
                      placeholder="Enter PayFast merchant ID"
                      className="bg-betting-light-gray border-betting-light-gray focus:border-betting-green"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="merchant_key">Merchant Key</Label>
                    <Input
                      id="merchant_key"
                      name="merchant_key"
                      value={paymentFormData.merchant_key}
                      onChange={handlePaymentSettingsChange}
                      placeholder="Enter PayFast merchant key"
                      className="bg-betting-light-gray border-betting-light-gray focus:border-betting-green"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="passphrase">Passphrase</Label>
                    <Input
                      id="passphrase"
                      name="passphrase"
                      type="password"
                      value={paymentFormData.passphrase}
                      onChange={handlePaymentSettingsChange}
                      placeholder="Enter PayFast passphrase"
                      className="bg-betting-light-gray border-betting-light-gray focus:border-betting-green"
                      required
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-4">
                    <Switch
                      id="is_test_mode"
                      checked={paymentFormData.is_test_mode}
                      onCheckedChange={handleToggleTestMode}
                    />
                    <Label htmlFor="is_test_mode">Enable Test Mode</Label>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={updatePaymentSettings}
                disabled={loading || paymentLoading}
                className="bg-betting-green hover:bg-betting-green-dark"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Gateway Settings
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ) : null;

      case "site":
        return showSiteSettings ? <SiteSettingsTab /> : null;

      case "seo":
        return showSEOSettings ? <SEOSettingsTab /> : null;

      case "ads":
        return showSystemAds ? <SystemAdsTab /> : null;

      default:
        return null;
    }
  };

  return (
    <Layout requireAuth={true}>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
        
        {isMobile ? (
          <div className="space-y-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-between bg-betting-dark-gray border-betting-light-gray text-white hover:bg-betting-light-gray"
                >
                  {currentTabLabel}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-full bg-betting-dark-gray border-betting-light-gray"
                align="start"
              >
                {tabOptions.map((tab) => (
                  <DropdownMenuItem
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className="text-gray-300 hover:text-white hover:bg-betting-light-gray cursor-pointer"
                  >
                    {tab.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div>
              {renderTabContent()}
            </div>
          </div>
        ) : (
          <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              {showPaymentSettings && <TabsTrigger value="payment">Payment</TabsTrigger>}
              {showSiteSettings && <TabsTrigger value="site">Site</TabsTrigger>}
              {showSEOSettings && <TabsTrigger value="seo">SEO</TabsTrigger>}
              {showSystemAds && <TabsTrigger value="ads">Ads</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="profile">
              {renderTabContent()}
            </TabsContent>
            
            <TabsContent value="security">
              {renderTabContent()}
            </TabsContent>

            {showPaymentSettings && (
              <TabsContent value="payment">
                {renderTabContent()}
              </TabsContent>
            )}

            {showSiteSettings && (
              <TabsContent value="site">
                <SiteSettingsTab />
              </TabsContent>
            )}

            {showSEOSettings && (
              <TabsContent value="seo">
                <SEOSettingsTab />
              </TabsContent>
            )}

            {showSystemAds && (
              <TabsContent value="ads">
                <SystemAdsTab />
              </TabsContent>
            )}
          </Tabs>
        )}
      </div>
    </Layout>
  );
};

export default UserSettings;
