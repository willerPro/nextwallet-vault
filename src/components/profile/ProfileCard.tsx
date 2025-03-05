
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { UserProfile } from "@/types/profile";

interface ProfileCardProps {
  profile: UserProfile | null;
  loading: boolean;
  setOpen: (open: boolean) => void;
  open: boolean;
  getInitials: () => string;
}

const ProfileCard = ({ profile, loading, setOpen, open, getInitials }: ProfileCardProps) => {
  return (
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
        </Dialog>
      </GlassCard>
    </motion.div>
  );
};

export default ProfileCard;
