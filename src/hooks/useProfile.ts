
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/profile";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";

export const useProfile = (user: User | null) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Try to get user metadata first
      const userData = {
        full_name: user.user_metadata?.full_name || 'User',
        email: user.email || '',
        phone_number: user.user_metadata?.phone_number || '',
        country: user.user_metadata?.country || '',
        city: user.user_metadata?.city || '',
        gender: user.user_metadata?.gender || 'male',
        date_of_birth: user.user_metadata?.date_of_birth || '2000-01-01'
      };

      // Then try to get from user_profiles table as a fallback
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileData) {
          setProfile({
            full_name: profileData.full_name || userData.full_name,
            email: user.email || '',
            phone_number: profileData.phone_number || userData.phone_number,
            country: profileData.country || userData.country,
            city: profileData.city || userData.city,
            gender: profileData.gender || userData.gender,
            date_of_birth: profileData.date_of_birth || userData.date_of_birth
          });
        } else {
          setProfile(userData);
        }
      } catch (error) {
        console.error("Error fetching profile from database:", error);
        // Fallback to user metadata
        setProfile(userData);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile information");
    } finally {
      setLoading(false);
    }
  };

  // Function to update profile in both user metadata and profile table
  const updateProfile = async (updatedProfile: UserProfile) => {
    if (!user || isUpdating) return;
    
    setIsUpdating(true);
    try {
      console.log("Updating profile:", updatedProfile);
      
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: updatedProfile.full_name,
          phone_number: updatedProfile.phone_number,
          country: updatedProfile.country,
          city: updatedProfile.city,
          gender: updatedProfile.gender,
          date_of_birth: updatedProfile.date_of_birth
        }
      });
      
      if (error) throw error;
      
      // Also update in profiles table
      try {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            id: user.id,
            full_name: updatedProfile.full_name,
            phone_number: updatedProfile.phone_number,
            country: updatedProfile.country,
            city: updatedProfile.city,
            gender: updatedProfile.gender,
            date_of_birth: updatedProfile.date_of_birth
          });
          
        if (profileError) {
          console.error("Error updating profile table:", profileError);
        }
      } catch (profileError) {
        console.error("Error updating profile table:", profileError);
      }
      
      // Update local state
      setProfile(updatedProfile);
      
      // Only show toast for user-initiated updates, not automatic ones
      if (updatedProfile.country !== "Unknown" && updatedProfile.city !== "Unknown") {
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return { profile, setProfile, loading, fetchProfile, updateProfile, isUpdating };
};
