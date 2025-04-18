
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/profile";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";

export const useProfile = (user: User | null) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Add state to prevent rate limit errors
  const [lastUpdateTime, setLastUpdateTime] = useState<number | null>(null);
  const MIN_UPDATE_INTERVAL = 10000; // 10 seconds to avoid rate limiting

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
  const updateProfile = async (updatedProfile: UserProfile, showToast: boolean = true) => {
    if (!user || isUpdating) return;
    
    // Enhanced rate limiting to prevent rapid updates
    const now = Date.now();
    if (lastUpdateTime && now - lastUpdateTime < MIN_UPDATE_INTERVAL) {
      console.log(`Skipping profile update - too soon (${(now - lastUpdateTime) / 1000}s elapsed, need ${MIN_UPDATE_INTERVAL / 1000}s)`);
      if (showToast) {
        toast.warning("Please wait a moment before updating again");
      }
      return;
    }
    
    // Skip update if nothing has changed to prevent unnecessary API calls
    if (profile && JSON.stringify(profile) === JSON.stringify(updatedProfile)) {
      console.log("Skipping update - no changes detected");
      return;
    }
    
    setIsUpdating(true);
    setLastUpdateTime(now);
    
    try {
      // Only log when not an automatic update
      if (showToast) {
        console.log("Updating profile:", updatedProfile);
      }
      
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
      
      // Also update in profiles table - wrapped in try/catch to prevent blocking on RLS errors
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
          // Continue execution - we've already updated the user metadata
        }
      } catch (profileError) {
        console.error("Error updating profile table:", profileError);
        // Continue execution - don't throw here as we've already updated metadata
      }
      
      // Update local state
      setProfile(updatedProfile);
      
      // Only show toast for user-initiated updates
      if (showToast) {
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      if (showToast) {
        toast.error("Failed to update profile");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  return { 
    profile, 
    setProfile, 
    loading, 
    fetchProfile, 
    updateProfile, 
    isUpdating
  };
};
