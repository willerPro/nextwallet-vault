
import React from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Download, Send, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export interface Transaction {
  id: string;
  type: "sent" | "received" | "swap" | "buy" | "sell";
  amount: string;
  value_usd: string;
  coin_symbol: string;
  from_address?: string;
  to_address?: string;
  status: "pending" | "completed" | "failed";
  created_at: string;
}

interface TransactionListProps {
  transactions: Transaction[];
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  if (transactions.length === 0) {
    return (
      <GlassCard variant="dark" className="flex flex-col items-center justify-center py-10">
        <div className="text-center">
          <Clock className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium">No transactions yet</h3>
          <p className="text-sm text-muted-foreground">Your transactions will appear here</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx, index) => (
        <motion.div
          key={tx.id}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
        >
          <GlassCard variant="dark" className="flex justify-between items-center">
            <div className="flex items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center mr-3",
                  tx.type === "received" || tx.type === "buy"
                    ? "bg-green-400/20 text-green-400"
                    : "bg-red-400/20 text-red-400"
                )}
              >
                {tx.type === "received" || tx.type === "buy" ? (
                  <Download className="h-5 w-5" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </div>
              <div>
                <div className="font-medium">
                  {tx.type === "received"
                    ? "Received"
                    : tx.type === "sent"
                    ? "Sent"
                    : tx.type === "buy"
                    ? "Bought"
                    : tx.type === "sell"
                    ? "Sold"
                    : "Swapped"}
                </div>
                <div className="text-sm text-muted-foreground flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {format(new Date(tx.created_at), "MMM d, yyyy • h:mm a")}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">
                {tx.type === "received" || tx.type === "buy" ? "+" : "-"}
                {tx.amount} {tx.coin_symbol}
              </div>
              <div className="text-sm text-muted-foreground">${Number(tx.value_usd).toLocaleString()}</div>
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
};
