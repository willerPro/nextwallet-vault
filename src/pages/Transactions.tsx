
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TransactionList, Transaction } from "@/components/TransactionList";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const Transactions = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState<string | null>(null);

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["all-transactions", filterType],
    queryFn: async () => {
      let query = supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });
      
      // Apply filter if selected
      if (filterType) {
        query = query.eq("type", filterType);
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
  });

  const handleFilter = (type: string | null) => {
    setFilterType(type === filterType ? null : type);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col pb-24">
      {/* Header */}
      <motion.header 
        className="p-4 flex items-center justify-between"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/dashboard")}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Transactions</h1>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="border-gold/20 text-foreground hover:bg-gold/10"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </motion.header>

      {/* Filter tabs */}
      <div className="px-4 mb-4">
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          <Button 
            size="sm" 
            variant={filterType === null ? "default" : "outline"}
            className={filterType === null ? "bg-gold hover:bg-gold-dark text-primary-foreground" : "border-gold/20"}
            onClick={() => handleFilter(null)}
          >
            All
          </Button>
          <Button 
            size="sm" 
            variant={filterType === "received" ? "default" : "outline"}
            className={filterType === "received" ? "bg-gold hover:bg-gold-dark text-primary-foreground" : "border-gold/20"}
            onClick={() => handleFilter("received")}
          >
            Received
          </Button>
          <Button 
            size="sm" 
            variant={filterType === "sent" ? "default" : "outline"}
            className={filterType === "sent" ? "bg-gold hover:bg-gold-dark text-primary-foreground" : "border-gold/20"}
            onClick={() => handleFilter("sent")}
          >
            Sent
          </Button>
          <Button 
            size="sm" 
            variant={filterType === "buy" ? "default" : "outline"}
            className={filterType === "buy" ? "bg-gold hover:bg-gold-dark text-primary-foreground" : "border-gold/20"}
            onClick={() => handleFilter("buy")}
          >
            Buy
          </Button>
          <Button 
            size="sm" 
            variant={filterType === "sell" ? "default" : "outline"}
            className={filterType === "sell" ? "bg-gold hover:bg-gold-dark text-primary-foreground" : "border-gold/20"}
            onClick={() => handleFilter("sell")}
          >
            Sell
          </Button>
          <Button 
            size="sm" 
            variant={filterType === "swap" ? "default" : "outline"}
            className={filterType === "swap" ? "bg-gold hover:bg-gold-dark text-primary-foreground" : "border-gold/20"}
            onClick={() => handleFilter("swap")}
          >
            Swap
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 px-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((_, index) => (
              <GlassCard key={index} variant="dark" className="h-16 animate-pulse">
                <div></div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Showing {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
                {filterType ? ` (${filterType})` : ''}
              </p>
            </div>
            
            <TransactionList transactions={transactions} />
          </>
        )}
      </div>
    </div>
  );
};

export default Transactions;
