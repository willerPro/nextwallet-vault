
import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { transferBetweenWallets } from "@/utils/transactionUtils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

const transferSchema = z.object({
  fromWalletId: z.string().min(1, "Source wallet is required"),
  toWalletId: z.string().min(1, "Destination wallet is required"),
  amount: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    { message: "Amount must be a positive number" }
  ),
});

type TransferFormValues = z.infer<typeof transferSchema>;
type Wallet = { id: string; name: string; balance: number };

interface TransferWalletProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const TransferWallet: React.FC<TransferWalletProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchingWallets, setFetchingWallets] = useState(true);

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      fromWalletId: "",
      toWalletId: "",
      amount: "",
    },
  });

  const fromWalletId = form.watch("fromWalletId");
  const selectedFromWallet = wallets.find(w => w.id === fromWalletId);

  // Fetch user's wallets
  useEffect(() => {
    const fetchWallets = async () => {
      if (!user) return;
      
      try {
        setFetchingWallets(true);
        const { data, error } = await supabase
          .from("wallets")
          .select("id, name, balance")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        
        if (error) {
          console.error("Error fetching wallets:", error);
          toast.error("Failed to load wallets");
          return;
        }
        
        setWallets(data || []);
      } catch (err) {
        console.error("Unexpected error:", err);
        toast.error("An unexpected error occurred");
      } finally {
        setFetchingWallets(false);
      }
    };

    fetchWallets();
  }, [user]);

  const onSubmit = async (values: TransferFormValues) => {
    if (values.fromWalletId === values.toWalletId) {
      form.setError("toWalletId", {
        message: "Source and destination wallets cannot be the same",
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = await transferBetweenWallets(
        values.fromWalletId,
        values.toWalletId,
        parseFloat(values.amount)
      );

      if (success) {
        onOpenChange(false);
        form.reset();
        if (onSuccess) onSuccess();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border border-border max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Transfer Between Wallets</DialogTitle>
        </DialogHeader>

        {fetchingWallets ? (
          <div className="py-4 text-center">
            <p className="text-muted-foreground">Loading wallets...</p>
          </div>
        ) : wallets.length < 2 ? (
          <div className="py-4 text-center">
            <p className="text-muted-foreground">You need at least two wallets to transfer funds.</p>
            <Button 
              className="mt-4"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fromWalletId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From Wallet</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source wallet" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {wallets.map((wallet) => (
                          <SelectItem key={wallet.id} value={wallet.id}>
                            {wallet.name} (${wallet.balance.toFixed(2)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-center">
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
              </div>

              <FormField
                control={form.control}
                name="toWalletId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To Wallet</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select destination wallet" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {wallets
                          .filter(wallet => wallet.id !== fromWalletId)
                          .map((wallet) => (
                            <SelectItem key={wallet.id} value={wallet.id}>
                              {wallet.name} (${wallet.balance.toFixed(2)})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        step="any" 
                        min="0.01"
                        placeholder="0.00" 
                        disabled={isLoading}
                      />
                    </FormControl>
                    {selectedFromWallet && (
                      <p className="text-xs text-muted-foreground">
                        Available: ${selectedFromWallet.balance.toFixed(2)}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="flex gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || !fromWalletId}
                  className="bg-gold hover:bg-gold/90 text-black"
                >
                  {isLoading ? "Processing..." : "Transfer"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};
