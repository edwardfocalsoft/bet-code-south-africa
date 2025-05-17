
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PersonalDetailsFormProps {
  profileData: {
    username: string;
    displayWhatsapp: boolean;
    whatsappNumber: string;
  };
  setProfileData: React.Dispatch<React.SetStateAction<{
    username: string;
    avatarUrl: string;
    displayWhatsapp: boolean;
    whatsappNumber: string;
  }>>;
  isSaving: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  currentUserEmail: string;
}

const PersonalDetailsForm: React.FC<PersonalDetailsFormProps> = ({
  profileData,
  setProfileData,
  isSaving,
  onSubmit,
  currentUserEmail
}) => {
  return (
    <Card className="betting-card">
      <CardHeader>
        <CardTitle>Profile Details</CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
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
              value={currentUserEmail}
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
              checked={profileData.displayWhatsapp}
              onCheckedChange={(checked) => setProfileData({...profileData, displayWhatsapp: checked})}
            />
          </div>
          
          {profileData.displayWhatsapp && (
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <Input
                id="whatsapp"
                value={profileData.whatsappNumber}
                onChange={(e) => setProfileData({...profileData, whatsappNumber: e.target.value})}
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
  );
};

export default PersonalDetailsForm;
