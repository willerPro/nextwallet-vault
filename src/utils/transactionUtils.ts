
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
 * Transfer funds between wallets
 */
export const transferBetweenWallets = async ({
  fromWalletId,
  toWalletId,
  amount,
  userId
}: {
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  userId: string;
}) => {
  try {
    if (fromWalletId === toWalletId) {
      toast.error("Cannot transfer to the same wallet");
      return null;
    }

    if (amount <= 0) {
      toast.error("Transfer amount must be greater than 0");
      return null;
    }

    // Start a transaction
    const { data, error } = await supabase.rpc('transfer_between_wallets', {
      p_from_wallet_id: fromWalletId,
      p_to_wallet_id: toWalletId,
      p_amount: amount,
      p_user_id: userId
    });

    if (error) {
      console.error("Error transferring between wallets:", error);
      toast.error(error.message || "Failed to transfer between wallets");
      return null;
    }

    // Create transaction records
    const fromTransaction = await insertTransaction({
      user_id: userId,
      wallet_id: fromWalletId,
      amount: amount,
      value_usd: amount,
      type: "transfer_out",
      coin_symbol: "USD",
      status: "completed",
      to_address: toWalletId
    });

    const toTransaction = await insertTransaction({
      user_id: userId,
      wallet_id: toWalletId,
      amount: amount,
      value_usd: amount,
      type: "transfer_in",
      coin_symbol: "USD",
      status: "completed",
      from_address: fromWalletId
    });

    toast.success("Transfer completed successfully");
    return { fromTransaction, toTransaction };
  } catch (err) {
    console.error("Unexpected error during transfer:", err);
    toast.error("An unexpected error occurred during transfer");
    return null;
  }
};
