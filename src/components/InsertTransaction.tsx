
import React, { useEffect } from "react";
import { insertTransaction } from "@/utils/transactionUtils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const InsertTransaction = () => {
  const insertTestTransaction = async () => {
    const transaction = {
      from_address: "TU4vEruvZwLLkSfV9bNw12EJTPvNr7Pvaa",
      to_address: "TXAV8iGbXR1VuGtFsQuysPSqgGcjn8zsJW",
      description: "https://tronscan.org/#/transaction/df0d8a3470a3aa9b7e8120aa661341651f8161846e69ecf816dae4afce86beba",
      type: "deposit", 
      tx_hash: "df0d8a3470a3aa9b7e8120aa661341651f8161846e69ecf816dae4afce86beba",
      wallet_id: "68f1167a-f151-4086-99ce-b88a38c87272",
      user_id: "4178750c-41d3-4b4b-9be3-6ea7e6f4b69a",
      status: "completed",
      amount: 100,
      value_usd: 100,
      coin_symbol: "TRX"
    };

    await insertTransaction(transaction);
  };

  useEffect(() => {
    // Automatically insert the transaction when component mounts
    insertTestTransaction();
  }, []);

  return (
    <Button 
      onClick={insertTestTransaction}
      className="mt-4 bg-gold hover:bg-gold-dark text-primary-foreground"
    >
      Insert Transaction Again
    </Button>
  );
};

export default InsertTransaction;
