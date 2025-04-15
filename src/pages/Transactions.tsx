
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TransactionList, Transaction } from "@/components/TransactionList";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Filter, Download, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

const Transactions = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>("all");
  const { user } = useAuth();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions", filter, user?.id],
    queryFn: async () => {
      if (!user) {
        return [];
      }
      
      let query = supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      // Apply filter if not "all"
      if (filter !== "all") {
        query = query.eq("type", filter);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching transactions:", error);
        toast({
          title: "Error fetching transactions",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      // Convert any numeric fields to string as required by the Transaction interface
      return data.map(tx => ({
        ...tx,
        amount: String(tx.amount),
        value_usd: String(tx.value_usd),
      })) as Transaction[];
    },
    enabled: !!user,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen w-full flex flex-col pb-24">
      {/* Header */}
      <motion.header 
        className="p-4 flex justify-between items-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={handleGoBack} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Transactions</h1>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={filter === "all" ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilter("all")}
            className={filter === "all" ? "bg-gold hover:bg-gold-dark text-primary-foreground" : ""}
          >
            All
          </Button>
          <Button 
            variant={filter === "received" ? "default" : "outline"} 
            size="icon"
            onClick={() => setFilter("received")}
            className={filter === "received" ? "bg-gold hover:bg-gold-dark text-primary-foreground" : ""}
            title="Received"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button 
            variant={filter === "sent" ? "default" : "outline"} 
            size="icon"
            onClick={() => setFilter("sent")}
            className={filter === "sent" ? "bg-gold hover:bg-gold-dark text-primary-foreground" : ""}
            title="Sent"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </motion.header>

      {/* Main content */}
      <div className="flex-1 px-4 space-y-4">
        {!user ? (
          <GlassCard variant="dark" className="flex flex-col items-center justify-center py-10">
            <div className="text-center">
              <Filter className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium">Please log in to view transactions</h3>
              <p className="text-sm text-muted-foreground">
                You need to be logged in to view your transactions
              </p>
            </div>
          </GlassCard>
        ) : isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((_, index) => (
              <GlassCard key={index} variant="dark" className="h-16 animate-pulse">
                <div></div>
              </GlassCard>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <GlassCard variant="dark" className="flex flex-col items-center justify-center py-10">
            <div className="text-center">
              <Filter className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium">No transactions found</h3>
              <p className="text-sm text-muted-foreground">
                {filter !== "all" 
                  ? `You don't have any ${filter} transactions yet` 
                  : "You don't have any transactions yet"}
              </p>
            </div>
          </GlassCard>
        ) : (
          <TransactionList transactions={transactions} />
        )}
      </div>
    </div>
  );
};

export default Transactions;
