
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, BadgeCheck, Mail } from "lucide-react";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { ProfileData } from "@/types";

interface ProfileSidebarProps {
  currentUser: any;
  profileData: {
    username: string;
    avatarUrl: string;
  };
  filePreview: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
  isSaving: boolean;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  currentUser,
  profileData,
  filePreview,
  handleFileChange,
  isUploading,
  isSaving
}) => {
  // We'll use useSubscriptions hook to get the subscribers count directly
  const { subscribersCount, fetchSubscribersCount } = useSubscriptions();
  
  // Make sure to fetch the data when the component mounts or currentUser changes
  React.useEffect(() => {
    if (currentUser?.id) {
      fetchSubscribersCount();
    }
  }, [currentUser, fetchSubscribersCount]);

  return (
    <Card className="betting-card h-full">
      <CardContent className="pt-6 flex flex-col items-center">
        <div className="relative mb-4 group">
          <Avatar className="h-32 w-32">
            <AvatarImage 
              src={filePreview || profileData.avatarUrl || undefined} 
              alt={profileData.username || "User"} 
            />
            <AvatarFallback className="text-3xl bg-betting-light-gray/30">
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
            disabled={isSaving || isUploading}
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
              <p className="text-2xl font-bold text-betting-green">{20}%</p>
              <p className="text-xs text-muted-foreground">Win Rate</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-betting-green">{5}</p>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-betting-green">{5}</p>
              <p className="text-xs text-muted-foreground">Tickets Sold</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-betting-green">{subscribersCount}</p>
              <p className="text-xs text-muted-foreground">Subscribers</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSidebar;
