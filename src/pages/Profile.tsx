
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
import ContactInformation from "@/components/profile/ContactInformation";
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
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Update profile with location data when available - with fix for the update loop
  useEffect(() => {
    if (
      !locationData.loading && 
      !locationData.error && 
      locationData.country && 
      locationData.city && 
      profile && 
      user && 
      (profile.country === "Unknown" || !profile.country || profile.city === "Unknown" || !profile.city)
    ) {
      // Create a new profile object to avoid direct mutation
      const updatedProfile = {
        ...profile,
        country: locationData.country,
        city: locationData.city
      };
      
      // Only update if the values are actually different to prevent loops
      if (updatedProfile.country !== profile.country || updatedProfile.city !== profile.city) {
        console.log("Updating profile with geolocation data:", updatedProfile);
        updateProfile(updatedProfile);
      }
    }
  }, [locationData.loading, locationData.country, locationData.city, profile?.country, profile?.city, user]);
  
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

        {/* Contact Info */}
        {profile && <ContactInformation profile={profile} />}

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
