
import { User } from "lucide-react";
import { motion } from "framer-motion";

const ProfileHeader = () => {
  return (
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
  );
};

export default ProfileHeader;
