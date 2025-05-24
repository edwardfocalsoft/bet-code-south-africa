
import React from "react";
import Layout from "@/components/layout/Layout";
import WithdrawalSettingsCard from "@/components/admin/settings/WithdrawalSettingsCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { usePaymentSettings } from "@/hooks/usePaymentSettings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Save, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { toast } from "sonner";

const PaymentSettings: React.FC = () => {
  const {
    settings,
    loading,
    updateSettings,
  } = usePaymentSettings();
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    merchant_id: "",
    merchant_key: "",
    passphrase: "",
    is_test_mode: true
  });

  // Load settings into form data when available
  React.useEffect(() => {
    if (settings && !loading) {
      setFormData({
        merchant_id: settings.merchant_id || "",
        merchant_key: settings.merchant_key || "",
        passphrase: settings.passphrase || "",
        is_test_mode: settings.is_test_mode !== undefined ? settings.is_test_mode : true
      });
    }
  }, [settings, loading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggle = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      is_test_mode: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    
    try {
      const success = await updateSettings(formData);
      if (success) {
        toast.success("Payment settings updated successfully");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout requireAuth={true} allowedRoles={["admin"]}>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Payment Settings</h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>PayFast Integration</CardTitle>
                <CardDescription>
                  Configure PayFast merchant settings for payment processing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="merchantId">Merchant ID</Label>
                    <Input
                      id="merchantId"
                      name="merchant_id"
                      placeholder="e.g., 10000000"
                      value={formData.merchant_id}
                      onChange={handleChange}
                      className="bg-betting-black border-betting-light-gray"
                      disabled={loading || isSaving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="merchantKey">Merchant Key</Label>
                    <Input
                      id="merchantKey"
                      name="merchant_key"
                      placeholder="e.g., abcdef1234567890"
                      value={formData.merchant_key}
                      onChange={handleChange}
                      className="bg-betting-black border-betting-light-gray"
                      disabled={loading || isSaving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passphrase">Passphrase</Label>
                    <Input
                      id="passphrase"
                      name="passphrase"
                      placeholder="Your secure passphrase"
                      type="password"
                      value={formData.passphrase}
                      onChange={handleChange}
                      className="bg-betting-black border-betting-light-gray"
                      disabled={loading || isSaving}
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-4">
                    <Switch
                      id="test-mode"
                      checked={formData.is_test_mode}
                      onCheckedChange={handleToggle}
                      disabled={loading || isSaving}
                    />
                    <Label htmlFor="test-mode">Test Mode</Label>
                  </div>

                  <Button
                    type="submit"
                    className="bg-betting-green hover:bg-betting-green-dark mt-4"
                    disabled={loading || isSaving}
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
                </form>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <WithdrawalSettingsCard />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentSettings;
