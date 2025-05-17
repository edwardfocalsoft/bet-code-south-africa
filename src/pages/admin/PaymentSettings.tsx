
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { usePaymentSettings } from "@/hooks/usePaymentSettings";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, CreditCard } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

const PaymentSettings: React.FC = () => {
  const { settings, loading, updateSettings } = usePaymentSettings();
  const { userRole } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    merchant_id: "",
    merchant_key: "",
    passphrase: "",
    is_test_mode: true
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formLoaded, setFormLoaded] = useState(false);

  useEffect(() => {
    // Redirect if not admin
    if (userRole && userRole !== "admin") {
      navigate("/");
    }
  }, [userRole, navigate]);

  // Update form when settings are loaded
  useEffect(() => {
    if (settings && !formLoaded) {
      setFormData({
        merchant_id: settings.merchant_id || "",
        merchant_key: settings.merchant_key || "",
        passphrase: settings.passphrase || "",
        is_test_mode: settings.is_test_mode !== undefined ? settings.is_test_mode : true
      });
      setFormLoaded(true);
    }
  }, [settings, formLoaded]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleToggleTestMode = (checked: boolean) => {
    setFormData({
      ...formData,
      is_test_mode: checked
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Validate the form
    if (!formData.merchant_id || !formData.merchant_key || !formData.passphrase) {
      alert("Please fill in all required fields");
      setIsSaving(false);
      return;
    }
    
    await updateSettings(formData);
    
    setIsSaving(false);
  };

  return (
    <Layout requireAuth={true} allowedRoles={["admin"]}>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Payment Gateway Settings</h1>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-betting-green" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <Card className="betting-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-betting-green" />
                  <CardTitle>PayFast Configuration</CardTitle>
                </div>
                <CardDescription>
                  Configure your PayFast payment gateway settings. These credentials are used to process payments.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {formData.is_test_mode && (
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
                    value={formData.merchant_id}
                    onChange={handleChange}
                    className="bg-betting-light-gray border-betting-light-gray"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="merchant_key">Merchant Key</Label>
                  <Input
                    id="merchant_key"
                    name="merchant_key"
                    value={formData.merchant_key}
                    onChange={handleChange}
                    className="bg-betting-light-gray border-betting-light-gray"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="passphrase">Passphrase</Label>
                  <Input
                    id="passphrase"
                    name="passphrase"
                    type="password"
                    value={formData.passphrase}
                    onChange={handleChange}
                    className="bg-betting-light-gray border-betting-light-gray"
                    required
                  />
                </div>
                
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="is_test_mode"
                    checked={formData.is_test_mode}
                    onCheckedChange={handleToggleTestMode}
                  />
                  <Label htmlFor="is_test_mode">
                    Enable Test Mode
                  </Label>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Last updated: {settings?.updated_at ? new Date(settings.updated_at).toLocaleString() : "Never"}
                  </p>
                </div>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-betting-green hover:bg-betting-green-dark"
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
            </Card>
          </form>
        )}
      </div>
    </Layout>
  );
};

export default PaymentSettings;
