
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Insert a new transaction into the database
 */
export const insertTransaction = async (transactionData: any) => {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .insert(transactionData)
      .select();
    
    if (error) {
      console.error("Error inserting transaction:", error);
      toast.error("Failed to insert transaction");
      return null;
    }
    
    toast.success("Transaction inserted successfully");
    return data[0];
  } catch (err) {
    console.error("Unexpected error inserting transaction:", err);
    toast.error("An unexpected error occurred");
    return null;
  }
};

/**
 * Transfer money between wallets
 */
export const transferBetweenWallets = async (
  fromWalletId: string,
  toWalletId: string,
  amount: number,
  coinSymbol: string = "USDT"
) => {
  try {
    if (fromWalletId === toWalletId) {
      toast.error("Source and destination wallets cannot be the same");
      return false;
    }

    if (amount <= 0) {
      toast.error("Transfer amount must be greater than zero");
      return false;
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to transfer funds");
      return false;
    }

    // Start a transaction
    const { data: fromWallet, error: fromWalletError } = await supabase
      .from("wallets")
      .select("balance, name")
      .eq("id", fromWalletId)
      .eq("user_id", user.id)
      .single();

    if (fromWalletError || !fromWallet) {
      console.error("Error fetching source wallet:", fromWalletError);
      toast.error("Source wallet not found");
      return false;
    }

    if (fromWallet.balance < amount) {
      toast.error("Insufficient funds in source wallet");
      return false;
    }

    const { data: toWallet, error: toWalletError } = await supabase
      .from("wallets")
      .select("name")
      .eq("id", toWalletId)
      .eq("user_id", user.id)
      .single();

    if (toWalletError || !toWallet) {
      console.error("Error fetching destination wallet:", toWalletError);
      toast.error("Destination wallet not found");
      return false;
    }

    // Reduce balance in source wallet
    const { error: updateFromError } = await supabase
      .from("wallets")
      .update({ balance: fromWallet.balance - amount })
      .eq("id", fromWalletId);

    if (updateFromError) {
      console.error("Error updating source wallet:", updateFromError);
      toast.error("Failed to update source wallet");
      return false;
    }

    // Increase balance in destination wallet
    const { error: updateToError } = await supabase
      .from("wallets")
      .update({ 
        balance: supabase.rpc('increment', { 
          row_id: toWalletId,
          amount: amount
        })
      })
      .eq("id", toWalletId);

    if (updateToError) {
      console.error("Error updating destination wallet:", updateToError);
      toast.error("Failed to update destination wallet");
      // Should roll back the first update here in a real application
      return false;
    }

    // Create "sent" transaction for source wallet
    const sentTransaction = {
      user_id: user.id,
      wallet_id: fromWalletId,
      type: "sent",
      amount: amount,
      value_usd: amount, // Assuming 1:1 for simplicity
      coin_symbol: coinSymbol,
      from_address: fromWallet.name,
      to_address: toWallet.name,
      status: "completed"
    };

    // Create "received" transaction for destination wallet
    const receivedTransaction = {
      user_id: user.id,
      wallet_id: toWalletId,
      type: "received",
      amount: amount,
      value_usd: amount, // Assuming 1:1 for simplicity
      coin_symbol: coinSymbol,
      from_address: fromWallet.name,
      to_address: toWallet.name,
      status: "completed"
    };

    // Insert both transactions
    const { error: txError } = await supabase
      .from("transactions")
      .insert([sentTransaction, receivedTransaction]);

    if (txError) {
      console.error("Error recording transactions:", txError);
      toast.error("Failed to record transactions");
      return false;
    }

    toast.success(`Successfully transferred ${amount} ${coinSymbol} between wallets`);
    return true;
  } catch (err) {
    console.error("Unexpected error during transfer:", err);
    toast.error("An unexpected error occurred during transfer");
    return false;
  }
};
