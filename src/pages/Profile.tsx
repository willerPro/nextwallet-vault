
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Custom hooks
import { useProfile } from "@/hooks/useProfile";

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
  const { profile, setProfile, loading } = useProfile(user);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
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
