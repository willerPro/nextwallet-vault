
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { UserProfile } from "@/types/profile";

interface ContactInformationProps {
  profile: UserProfile;
}

const ContactInformation = ({ profile }: ContactInformationProps) => {
  return (
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
  );
};

export default ContactInformation;
