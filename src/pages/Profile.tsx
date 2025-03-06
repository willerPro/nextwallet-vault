
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
  
  // Only attempt to update with geo data once, and only if needed
  useEffect(() => {
    // Check if we've already attempted a geo update this session
    if (geoUpdateAttempted) return;
    
    // Only attempt update if geo data is available and profile exists
    if (
      !locationData.loading && 
      !locationData.error && 
      locationData.country && 
      locationData.city && 
      profile && 
      user &&
      (profile.country === "Unknown" || !profile.country || profile.city === "Unknown" || !profile.city)
    ) {
      // Mark that we've attempted an update
      setGeoUpdateAttempted(true);
      
      // Only update if the values are actually different
      if (profile.country !== locationData.country || profile.city !== locationData.city) {
        const updatedProfile = {
          ...profile,
          country: locationData.country,
          city: locationData.city
        };
        
        console.log("Attempting one-time profile update with geo data");
        // Pass false to not show toast
        updateProfile(updatedProfile, false);
      }
    }
  }, [locationData, profile, user, geoUpdateAttempted]);
  
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
