import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, User, Mail, AlertCircle, BadgeCheck, BadgeDollarSign } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { BankDetails } from "@/types";

const SellerProfile: React.FC = () => {
  const { currentUser } = useAuth();
  const { toast: uiToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [profileData, setProfileData] = useState({
    username: "",
    avatarUrl: "",
  });
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    accountHolder: "",
    bankName: "",
    accountNumber: "",
    branchCode: "",
    accountType: "checking",
  });
  const [hasBankDetails, setHasBankDetails] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [displayWhatsapp, setDisplayWhatsapp] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");

  useEffect(() => {
    if (currentUser) {
      loadProfile();
      loadBankDetails();
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
      
      if (data) {
        setProfileData({
          username: data.username || "",
          avatarUrl: data.avatar_url || "",
        });
      }
    } catch (error: any) {
      toast.error(`Error loading profile: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBankDetails = async () => {
    if (!currentUser?.id) return;
    
    try {
      const { data, error } = await supabase
        .from("bank_details")
        .select("*")
        .eq("user_id", currentUser.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setBankDetails({
          accountHolder: data.account_holder,
          bankName: data.bank_name,
          accountNumber: data.account_number,
          branchCode: data.branch_code,
          accountType: data.account_type,
        });
        setHasBankDetails(true);
      }
    } catch (error: any) {
      console.error("Error loading bank details:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        uiToast({
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
    if (!selectedFile || !currentUser?.id) return null;
    
    const fileExt = selectedFile.name.split('.').pop();
    const filePath = `avatars/${currentUser.id}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from("profiles")
      .upload(filePath, selectedFile);
      
    if (uploadError) {
      throw uploadError;
    }
    
    const { data } = supabase.storage.from("profiles").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) return;
    
    setIsSaving(true);
    try {
      let avatarUrl = profileData.avatarUrl;
      
      if (selectedFile) {
        avatarUrl = await uploadAvatar() || avatarUrl;
      }
      
      const { error } = await supabase
        .from("profiles")
        .update({ 
          username: profileData.username,
          avatar_url: avatarUrl,
        })
        .eq("id", currentUser.id);
      
      if (error) throw error;
      
      setProfileData(prev => ({
        ...prev,
        avatarUrl
      }));
      
      toast.success("Profile updated successfully");
      setSelectedFile(null);
      setFilePreview(null);
    } catch (error: any) {
      toast.error(`Error updating profile: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) return;
    
    // Basic validation
    if (!bankDetails.accountHolder || !bankDetails.bankName || 
        !bankDetails.accountNumber || !bankDetails.branchCode) {
      toast.error("Please fill in all bank details");
      return;
    }
    
    setIsSavingBank(true);
    try {
      if (hasBankDetails) {
        // Update existing bank details
        const { error } = await supabase
          .from("bank_details")
          .update({ 
            account_holder: bankDetails.accountHolder,
            bank_name: bankDetails.bankName,
            account_number: bankDetails.accountNumber,
            branch_code: bankDetails.branchCode,
            account_type: bankDetails.accountType,
          })
          .eq("user_id", currentUser.id);
        
        if (error) throw error;
      } else {
        // Create new bank details
        const { error } = await supabase
          .from("bank_details")
          .insert({ 
            user_id: currentUser.id,
            account_holder: bankDetails.accountHolder,
            bank_name: bankDetails.bankName,
            account_number: bankDetails.accountNumber,
            branch_code: bankDetails.branchCode,
            account_type: bankDetails.accountType,
          });
        
        if (error) throw error;
        setHasBankDetails(true);
      }
      
      toast.success("Bank details saved successfully");
    } catch (error: any) {
      toast.error(`Error saving bank details: ${error.message}`);
    } finally {
      setIsSavingBank(false);
    }
  };

  if (isLoading) {
    return (
      <Layout requireAuth={true} allowedRoles={["seller", "admin"]}>
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-betting-green" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout requireAuth={true} allowedRoles={["seller", "admin"]}>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Seller Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card className="betting-card h-full">
              <CardContent className="pt-6 flex flex-col items-center">
                <div className="relative mb-4 group">
                  <Avatar className="h-32 w-32">
                    <AvatarImage 
                      src={filePreview || profileData.avatarUrl || undefined} 
                      alt={profileData.username || "User"} 
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
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileChange}
                    disabled={isSaving}
                  />
                </div>
                
                <div className="flex items-center gap-1">
                  <h2 className="text-xl font-medium">{profileData.username || "Set your username"}</h2>
                  <BadgeCheck className="h-4 w-4 text-betting-green" />
                </div>
                <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
                
                <div className="mt-6 w-full">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                    <User className="h-4 w-4" />
                    <span className="text-betting-green font-medium">Betting Expert</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{currentUser?.email}</span>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-betting-light-gray w-full">
                  <h3 className="text-sm font-medium mb-2">Seller Statistics</h3>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-betting-green">87%</p>
                      <p className="text-xs text-muted-foreground">Win Rate</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-betting-green">4.8</p>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
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
                      onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                      placeholder="Choose a username"
                      className="bg-betting-black border-betting-light-gray"
                      disabled={isSaving}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={currentUser?.email}
                      disabled
                      className="bg-betting-black/50 border-betting-light-gray text-muted-foreground"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="display-whatsapp" className="cursor-pointer">
                        Display WhatsApp
                      </Label>
                      <span className="text-xs text-muted-foreground">Allow buyers to contact you via WhatsApp</span>
                    </div>
                    <Switch
                      id="display-whatsapp"
                      checked={displayWhatsapp}
                      onCheckedChange={setDisplayWhatsapp}
                    />
                  </div>
                  
                  {displayWhatsapp && (
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">WhatsApp Number</Label>
                      <Input
                        id="whatsapp"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        placeholder="+27 XX XXX XXXX"
                        className="bg-betting-black border-betting-light-gray"
                      />
                    </div>
                  )}
                  
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
            
            <Card className="betting-card mt-6">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BadgeDollarSign className="h-5 w-5 text-betting-green" />
                  <CardTitle className="text-lg">Bank Account Details</CardTitle>
                </div>
                <CardDescription>
                  Add your banking information to receive payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveBankDetails} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="accountHolder">Account Holder Name</Label>
                      <Input
                        id="accountHolder"
                        value={bankDetails.accountHolder}
                        onChange={(e) => setBankDetails({...bankDetails, accountHolder: e.target.value})}
                        placeholder="Full name as per bank account"
                        className="bg-betting-black border-betting-light-gray"
                        disabled={isSavingBank}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input
                        id="bankName"
                        value={bankDetails.bankName}
                        onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                        placeholder="e.g. Standard Bank"
                        className="bg-betting-black border-betting-light-gray"
                        disabled={isSavingBank}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input
                        id="accountNumber"
                        value={bankDetails.accountNumber}
                        onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                        placeholder="Your bank account number"
                        className="bg-betting-black border-betting-light-gray"
                        disabled={isSavingBank}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="branchCode">Branch Code</Label>
                      <Input
                        id="branchCode"
                        value={bankDetails.branchCode}
                        onChange={(e) => setBankDetails({...bankDetails, branchCode: e.target.value})}
                        placeholder="Branch code or sort code"
                        className="bg-betting-black border-betting-light-gray"
                        disabled={isSavingBank}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="accountType">Account Type</Label>
                    <Select
                      value={bankDetails.accountType}
                      onValueChange={(value) => setBankDetails({...bankDetails, accountType: value})}
                      disabled={isSavingBank}
                    >
                      <SelectTrigger className="bg-betting-black border-betting-light-gray">
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking">Checking / Current</SelectItem>
                        <SelectItem value="savings">Savings</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      className="bg-betting-green hover:bg-betting-green-dark"
                      disabled={isSavingBank}
                    >
                      {isSavingBank ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        hasBankDetails ? "Update Bank Details" : "Save Bank Details"
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
                  Complete your account verification to unlock higher withdrawal limits and additional features.
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

export default SellerProfile;
