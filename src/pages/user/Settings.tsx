
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save, CreditCard } from "lucide-react";
import { usePaymentSettings } from "@/hooks/usePaymentSettings";

const UserSettings: React.FC = () => {
  const { currentUser, userRole } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const { toast } = useToast();
  const { settings, loading: paymentLoading, updateSettings } = usePaymentSettings();
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
        merchant_id: settings.merchant_id,
        merchant_key: settings.merchant_key,
        passphrase: settings.passphrase,
        is_test_mode: settings.is_test_mode
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
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
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
      
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
      
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setPaymentFormData({
      ...paymentFormData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const updatePaymentSettings = async () => {
    setLoading(true);
    const success = await updateSettings(paymentFormData);
    setLoading(false);
  };

  const showPaymentSettings = userRole === "admin";

  return (
    <Layout requireAuth={true}>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            {showPaymentSettings && <TabsTrigger value="payment">Payment Gateway</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="profile">
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
          </TabsContent>
          
          <TabsContent value="security">
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
          </TabsContent>

          {showPaymentSettings && (
            <TabsContent value="payment">
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
                      <div className="space-y-2">
                        <Label htmlFor="merchant_id">Merchant ID</Label>
                        <Input
                          id="merchant_id"
                          name="merchant_id"
                          value={paymentFormData.merchant_id}
                          onChange={handlePaymentSettingsChange}
                          placeholder="Enter PayFast merchant ID"
                          className="bg-betting-light-gray border-betting-light-gray focus:border-betting-green"
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
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2 pt-4">
                        <input
                          type="checkbox"
                          id="is_test_mode"
                          name="is_test_mode"
                          checked={paymentFormData.is_test_mode}
                          onChange={handlePaymentSettingsChange}
                          className="h-4 w-4"
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
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

export default UserSettings;
