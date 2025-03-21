
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
