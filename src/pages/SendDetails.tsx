
// Import necessary libraries and components
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ContactSelectionSheet } from "@/components/send/ContactSelectionSheet";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/GlassCard";
import { toast } from "sonner";

// Define a simplified Contact interface
interface Contact {
  id: string;
  name: string;
  label: string;
  wallet_address: string;
  network: string;
  user_id: string;
  asset_id: string;
  asset_name: string;
  asset_symbol: string;
  created_at: string;
  updated_at: string;
}

// Create the SendDetails component
const SendDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contactSheetOpen, setContactSheetOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Fetch contacts using useQuery with explicit type annotation
  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ['contacts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('asset_wallets')
        .select('*')
        .eq('user_id', user.id)
        .eq('asset_id', 'address_book');
        
      if (error) {
        console.error("Error fetching contacts:", error);
        return [];
      }
      
      return data as unknown as Contact[];
    },
    enabled: !!user,
  });

  // Handle contact selection
  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    setContactSheetOpen(false);
  };

  const handleSend = async () => {
    if (!selectedContact) {
      toast.error("Please select a contact.");
      return;
    }

    if (!amount) {
      toast.error("Please enter an amount to send.");
      return;
    }

    setIsSending(true);
    try {
      const amountToSend = parseFloat(amount);

      // Create a new transaction record
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert([
          {
            type: 'send',
            amount: amountToSend,
            coin_symbol: selectedContact.asset_symbol,
            from_address: 'your_wallet_address', // Replace with actual sender wallet address
            to_address: selectedContact.wallet_address,
            user_id: user?.id,
            value_usd: amountToSend, // Assuming 1:1 ratio for simplicity
            wallet_id: selectedContact.id, // Using contact id as wallet id for now
          }
        ])
        .select();

      if (transactionError) {
        console.error("Error creating transaction:", transactionError);
        toast.error("Failed to create transaction.");
        return;
      }

      // Optimistically update the UI
      toast.success(`Successfully sent ${amount} ${selectedContact.asset_symbol} to ${selectedContact.name}!`);
      navigate('/dashboard');
    } catch (error) {
      console.error("Error sending transaction:", error);
      toast.error("Failed to send transaction.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 py-2 border-b border-b-gold/20">
        <Button variant="ghost" onClick={() => navigate(-1)}>Back</Button>
      </header>

      <div className="flex-1 p-4 space-y-4">
        <h1 className="text-2xl font-bold">Send {id}</h1>

        {/* Contact Selection */}
        <GlassCard variant="dark" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Recipient</h2>
              <p className="text-sm text-muted-foreground">
                {selectedContact ? selectedContact.name : "No contact selected"}
              </p>
            </div>
            <Button variant="outline" onClick={() => setContactSheetOpen(true)}>
              {selectedContact ? "Change Contact" : "Select Contact"}
            </Button>
          </div>
          {selectedContact && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Wallet Address:</p>
              <p className="text-sm break-all">{selectedContact.wallet_address}</p>
            </div>
          )}
        </GlassCard>

        {/* Amount Input */}
        <GlassCard variant="dark" className="p-4">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </GlassCard>

        {/* Send Button */}
        <Button 
          className="w-full" 
          onClick={handleSend} 
          disabled={isSending || !selectedContact || !amount}
        >
          {isSending ? "Sending..." : "Send"}
        </Button>
      </div>
      
      {/* Contact selection sheet */}
      <ContactSelectionSheet
        open={contactSheetOpen}
        onOpenChange={setContactSheetOpen}
        contacts={contacts}
        onSelectContact={handleSelectContact}
      />
    </div>
  );
};

export default SendDetails;
