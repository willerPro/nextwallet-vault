import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
interface LogoutButtonProps {
  onLogout: () => void;
}
const LogoutButton = ({
  onLogout
}: LogoutButtonProps) => {
  return <motion.div initial={{
    y: 20,
    opacity: 0
  }} animate={{
    y: 0,
    opacity: 1
  }} transition={{
    delay: 0.4,
    duration: 0.4
  }}>
      <Button variant="outline" onClick={onLogout} className="w-full border-destructive/30 rounded-2xl bg-gray-600 hover:bg-gray-500 text-zinc-950">
        <LogOut className="h-5 w-5 mr-2" />
        Logout
      </Button>
    </motion.div>;
};
export default LogoutButton;