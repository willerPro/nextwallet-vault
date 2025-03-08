
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Clock, ArrowUp, ArrowDown, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";

export interface TransactionDetailsProps {
  id: string;
  type: "send" | "receive" | "swap" | "buy" | "sell";
  amount: number | string;
  coin_symbol: string;
  value_usd?: number | string;
  from_address?: string;
  to_address?: string;
  status: "pending" | "completed" | "failed";
  created_at: string;
  tx_hash?: string;
}

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionDetailsProps | null;
}

export const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  if (!transaction) return null;
  
  const copyToClipboard = (text: string | undefined, label: string) => {
    if (!text) return;
    
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const formatAddress = (address?: string) => {
    if (!address) return "";
    if (address.length <= 16) return address;
    return `${address.substring(0, 8)}...${address.substring(address.length - 8)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-black border border-gold/20 text-white p-0 max-w-md mx-auto">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center justify-center mb-2">
            <div
              className={`w-12 h-12 rounded-full ${
                transaction.type === "receive" || transaction.type === "buy"
                  ? "bg-green-400/20 text-green-400"
                  : "bg-red-400/20 text-red-400"
              } flex items-center justify-center`}
            >
              {transaction.type === "receive" || transaction.type === "buy" ? (
                <ArrowDown className="h-6 w-6" />
              ) : (
                <ArrowUp className="h-6 w-6" />
              )}
            </div>
          </div>
          <DialogTitle className="text-xl text-center font-semibold">
            {transaction.type === "receive"
              ? "Received"
              : transaction.type === "send"
              ? "Sent"
              : transaction.type === "buy"
              ? "Bought"
              : transaction.type === "sell"
              ? "Sold"
              : "Swapped"}{" "}
            {transaction.coin_symbol}
          </DialogTitle>
          <div className="text-2xl font-bold text-center mt-2">
            {transaction.type === "receive" || transaction.type === "buy" ? "+" : "-"}
            {transaction.amount} {transaction.coin_symbol}
          </div>
          {transaction.value_usd && (
            <p className="text-muted-foreground text-center text-sm">
              ≈ ${typeof transaction.value_usd === 'number' 
                ? transaction.value_usd.toLocaleString() 
                : Number(transaction.value_usd).toLocaleString()}
            </p>
          )}
        </DialogHeader>
        
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className={`
                ${transaction.status === "completed" ? "text-green-500" : ""}
                ${transaction.status === "pending" ? "text-yellow-500" : ""}
                ${transaction.status === "failed" ? "text-red-500" : ""}
                capitalize font-medium
              `}>
                {transaction.status}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date & Time</span>
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>{format(new Date(transaction.created_at), "MMM d, yyyy • h:mm a")}</span>
              </div>
            </div>
            
            {transaction.from_address && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">From</span>
                <div className="flex items-center">
                  <span className="mr-1">{formatAddress(transaction.from_address)}</span>
                  <button 
                    onClick={() => copyToClipboard(transaction.from_address, "Sender address")}
                    className="text-gold hover:text-gold/80"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
            
            {transaction.to_address && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">To</span>
                <div className="flex items-center">
                  <span className="mr-1">{formatAddress(transaction.to_address)}</span>
                  <button 
                    onClick={() => copyToClipboard(transaction.to_address, "Recipient address")}
                    className="text-gold hover:text-gold/80"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
            
            {transaction.tx_hash && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction Hash</span>
                <div className="flex items-center">
                  <span className="mr-1">{formatAddress(transaction.tx_hash)}</span>
                  <button 
                    onClick={() => copyToClipboard(transaction.tx_hash, "Transaction hash")}
                    className="text-gold hover:text-gold/80 mr-1"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                  <a 
                    href={`https://etherscan.io/tx/${transaction.tx_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold hover:text-gold/80"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="bg-black/60 p-4">
          <Button 
            onClick={onClose} 
            className="w-full border border-gold/30 bg-transparent text-gold hover:bg-gold/10"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
