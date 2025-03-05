
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/profile";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";

export const useProfile = (user: User | null) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // First try to get from user_profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileData) {
        setProfile({
          full_name: profileData.full_name || 'User',
          email: user.email || '',
          phone_number: profileData.phone_number || '',
          country: profileData.country || '',
          city: profileData.city || '',
          gender: profileData.gender || 'male',
          date_of_birth: profileData.date_of_birth || '2000-01-01'
        });
      } else {
        // If no profile, just use the auth user data
        setProfile({
          full_name: user.user_metadata?.full_name || 'User',
          email: user.email || '',
          phone_number: '',
          country: '',
          city: '',
          gender: 'male',
          date_of_birth: '2000-01-01'
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return { profile, setProfile, loading, fetchProfile };
};
