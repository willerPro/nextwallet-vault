
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Award } from "lucide-react";

// Custom hooks
import { useProfile } from "@/hooks/useProfile";
import { useGeolocation } from "@/hooks/useGeolocation";

// Components
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileCard from "@/components/profile/ProfileCard";
import ProfileSettings from "@/components/profile/ProfileSettings";
import AccountSection from "@/components/profile/AccountSection";
import LogoutButton from "@/components/profile/LogoutButton";
import EditProfileForm from "@/components/profile/EditProfileForm";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const { profile, setProfile, loading, updateProfile } = useProfile(user);
  const locationData = useGeolocation();
  
  // Flag to ensure we don't attempt to update geo data more than once per session
  const [geoUpdateAttempted, setGeoUpdateAttempted] = useState(false);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Modified geo data update logic to prevent infinite loops
  useEffect(() => {
    // If we've already attempted an update or there's no profile data, exit early
    if (geoUpdateAttempted || !profile || !user || loading) return;
    
    // Only update if location data is fully loaded and error-free
    if (locationData.loading || locationData.error) return;
    
    // Only update if we have actual location data to use
    if (!locationData.country || !locationData.city) return;
    
    // Only update if profile data is missing or different from geo data
    const needsUpdate = 
      profile.country === "Unknown" || 
      !profile.country || 
      profile.city === "Unknown" || 
      !profile.city ||
      (profile.country !== locationData.country && locationData.country) ||
      (profile.city !== locationData.city && locationData.city);
    
    if (needsUpdate) {
      // Mark that we've attempted an update to prevent further attempts
      setGeoUpdateAttempted(true);
      
      console.log("One-time geo update - updating profile with location data");
      
      const updatedProfile = {
        ...profile,
        country: locationData.country || profile.country,
        city: locationData.city || profile.city
      };
      
      // Pass false to not show toast for this automatic update
      updateProfile(updatedProfile, false);
    } else {
      // Even if we don't need an update, mark as attempted to prevent checking again
      setGeoUpdateAttempted(true);
    }
  }, [locationData, profile, user, geoUpdateAttempted, loading]);
  
  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  // Get initials for avatar
  const getInitials = () => {
    if (!profile?.full_name) return 'U';
    return profile.full_name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const navigateToPage = (page: string) => {
    navigate(`/${page}`);
  };

  return (
    <div className="min-h-screen w-full flex flex-col pb-24">
      {/* Header */}
      <ProfileHeader />

      {/* Main content */}
      <div className="flex-1 px-4 space-y-6">
        {/* Profile info */}
        <ProfileCard 
          profile={profile} 
          loading={loading} 
          setOpen={setOpen} 
          open={open} 
          getInitials={getInitials} 
        />

        {/* New Menu Options */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="space-y-4"
        >
          <Card onClick={() => navigateToPage('investors')} className="cursor-pointer hover:bg-secondary/10 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between p-4">
              <CardTitle className="text-base flex items-center">
                <Users className="h-5 w-5 mr-2 text-gold" />
                Investors
              </CardTitle>
            </CardHeader>
          </Card>
          
          <Card onClick={() => navigateToPage('challenges')} className="cursor-pointer hover:bg-secondary/10 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between p-4">
              <CardTitle className="text-base flex items-center">
                <Award className="h-5 w-5 mr-2 text-gold" />
                Challenges
              </CardTitle>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Settings */}
        <ProfileSettings />

        {/* Account */}
        <AccountSection />

        {/* Logout */}
        <LogoutButton onLogout={handleLogout} />
        
        {/* Edit Profile Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <EditProfileForm 
              profile={profile} 
              setProfile={setProfile} 
              setOpen={setOpen} 
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Profile;
