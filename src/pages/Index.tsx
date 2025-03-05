
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";
import { AuthForm } from "@/components/AuthForm";

const Index = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[100px]" />
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col relative z-10 px-6 py-10">
        <motion.div 
          className="flex justify-center mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Logo size="lg" />
        </motion.div>
        
        <div className="flex-1 flex flex-col justify-center items-center">
          <AuthForm />
        </div>
      </div>
    </div>
  );
};

export default Index;
