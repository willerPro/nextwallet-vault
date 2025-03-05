
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { User, Settings, Bell, Shield, LogOut, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";

// Type for user profile
type UserProfile = {
  full_name: string;
  email: string;
  phone_number: string;
  country: string;
  city: string;
  gender: string;
  date_of_birth: string;
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProfile();
  }, []);
  
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

  // Edit Profile Form
  const EditProfileForm = () => {
    const form = useForm({
      defaultValues: {
        full_name: profile?.full_name || '',
        phone_number: profile?.phone_number || '',
        country: profile?.country || '',
        city: profile?.city || '',
        gender: profile?.gender || 'male',
        date_of_birth: profile?.date_of_birth || '2000-01-01'
      }
    });

    const onSubmit = async (values: any) => {
      if (!user) return;
      
      try {
        const { error } = await supabase
          .from('user_profiles')
          .upsert({ 
            id: user.id,
            full_name: values.full_name,
            phone_number: values.phone_number,
            country: values.country,
            city: values.city,
            gender: values.gender,
            date_of_birth: values.date_of_birth
          });
        
        if (error) throw error;
        
        // Update local state
        setProfile(prev => ({
          ...prev!,
          full_name: values.full_name,
          phone_number: values.phone_number,
          country: values.country,
          city: values.city,
          gender: values.gender,
          date_of_birth: values.date_of_birth
        }));
        
        toast.success("Profile updated successfully");
        setOpen(false);
      } catch (error) {
        console.error("Error updating profile:", error);
        toast.error("Failed to update profile");
      }
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Full Name" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Phone Number" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input placeholder="Country" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="City" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <FormControl>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    {...field}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="date_of_birth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    );
  };

  return (
    <div className="min-h-screen w-full flex flex-col pb-24">
      {/* Header */}
      <motion.header 
        className="p-4 flex items-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center">
          <User className="h-5 w-5 mr-2 text-gold" />
          <h1 className="text-xl font-bold">Profile</h1>
        </div>
      </motion.header>

      {/* Main content */}
      <div className="flex-1 px-4 space-y-6">
        {/* Profile info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <GlassCard variant="gold" className="flex items-center">
            <Avatar className="h-16 w-16 border-2 border-gold">
              <AvatarFallback className="bg-secondary text-foreground text-xl font-semibold">
                {loading ? '...' : getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="ml-4">
              <h2 className="text-xl font-bold">{loading ? 'Loading...' : profile?.full_name}</h2>
              <p className="text-muted-foreground">{loading ? 'Loading...' : profile?.email}</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="ml-auto border-gold/20 text-foreground hover:bg-gold/10">
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <EditProfileForm />
              </DialogContent>
            </Dialog>
          </GlassCard>
        </motion.div>

        {/* Contact Info */}
        {profile && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <h2 className="text-lg font-bold mb-3 px-1">Contact Information</h2>
            
            <GlassCard variant="dark" className="divide-y divide-border/30 space-y-2">
              <div className="py-2">
                <p className="text-sm text-muted-foreground">Phone</p>
                <p>{profile.phone_number || 'Not set'}</p>
              </div>
              
              <div className="py-2">
                <p className="text-sm text-muted-foreground">Country</p>
                <p>{profile.country || 'Not set'}</p>
              </div>
              
              <div className="py-2">
                <p className="text-sm text-muted-foreground">City</p>
                <p>{profile.city || 'Not set'}</p>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Settings */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <h2 className="text-lg font-bold mb-3 px-1">Settings</h2>
          
          <GlassCard variant="dark" className="divide-y divide-border/30">
            <div className="py-2 flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-gold mr-3" />
                <Label htmlFor="notifications">Notifications</Label>
              </div>
              <Switch id="notifications" defaultChecked />
            </div>
            
            <div className="py-2 flex items-center justify-between">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-gold mr-3" />
                <Label htmlFor="biometrics">Biometric Authentication</Label>
              </div>
              <Switch id="biometrics" />
            </div>
          </GlassCard>
        </motion.div>

        {/* Account */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <h2 className="text-lg font-bold mb-3 px-1">Account</h2>
          
          <GlassCard variant="dark" className="divide-y divide-border/30">
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-gold mr-3" />
                <div>
                  <div className="font-medium">Security</div>
                  <div className="text-sm text-muted-foreground">Manage your security settings</div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
            
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center">
                <Settings className="h-5 w-5 text-gold mr-3" />
                <div>
                  <div className="font-medium">Preferences</div>
                  <div className="text-sm text-muted-foreground">Customize your experience</div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </GlassCard>
        </motion.div>

        {/* Logout */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <Button 
            variant="outline" 
            className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
