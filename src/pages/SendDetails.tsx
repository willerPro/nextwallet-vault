
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Users } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { ContactSelectionSheet } from "@/components/send/ContactSelectionSheet";

// Interface for asset data
interface Asset {
  id: string;
  asset_name: string;
  asset_symbol: string;
  balance: number;
  fiat_value: number;
}

// Contact interface for address book contacts
interface Contact {
  id: string;
  name: string;
  label: string;
  wallet_address: string;
  network: string;
  user_id: string;
}

const SendDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isContactSheetOpen, setIsContactSheetOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);

  // Fetch asset data
  const { data: asset, isLoading } = useQuery<Asset | null>({
    queryKey: ["asset", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("asset_wallets")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) {
        console.error("Error fetching asset:", error);
        return null;
      }
      
      // Add balance and fiat_value for assets that don't have these fields
      return {
        id: data.id,
        asset_name: data.asset_name,
        asset_symbol: data.asset_symbol,
        balance: parseFloat(data.balance || "0"),
        fiat_value: parseFloat(data.fiat_value || "0"),
      };
    },
    enabled: !!id,
  });

  // Fetch contacts
  useEffect(() => {
    const fetchContacts = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("asset_wallets")
        .select("*")
        .eq("user_id", user.id)
        .eq("asset_id", "address_book");
      
      if (error) {
        console.error("Error fetching contacts:", error);
        return;
      }
      
      if (data) {
        // Transform to match our local Contact interface
        const contactsList: Contact[] = data.map((item) => ({
          id: item.id,
          name: item.asset_name || "",
          label: item.asset_symbol || "",
          wallet_address: item.wallet_address || "",
          network: item.network || "",
          user_id: item.user_id
        }));
        setContacts(contactsList);
      }
    };
    
    fetchContacts();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!asset || !selectedContact || !amount || parseFloat(amount) <= 0) {
      toast.error("Please fill in all fields with valid values");
      return;
    }
    
    try {
      // Create transaction record
      const { error } = await supabase.from("transactions").insert({
        user_id: user?.id,
        amount: parseFloat(amount),
        type: "send",
        status: "completed",
        coin_symbol: asset.asset_symbol,
        value_usd: parseFloat(amount) * (asset.fiat_value / asset.balance),
        from_address: user?.id,
        to_address: selectedContact.wallet_address,
        wallet_id: asset.id,
      });
      
      if (error) throw error;
      
      toast.success(`Successfully sent ${amount} ${asset.asset_symbol} to ${selectedContact.name}`);
      navigate("/transactions");
    } catch (error) {
      console.error("Error sending transaction:", error);
      toast.error("Failed to process transaction");
    }
  };

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsContactSheetOpen(false);
  };

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!asset) {
    return <div className="p-4">Asset not found</div>;
  }

  return (
    <div className="min-h-screen w-full flex flex-col pb-24">
      <motion.header 
        className="p-4 flex items-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <button 
          onClick={() => navigate(-1)}
          className="mr-4 rounded-full p-1 hover:bg-card/50"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">Send {asset.asset_symbol}</h1>
      </motion.header>

      <div className="flex-1 px-4 space-y-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <GlassCard variant="dark" className="p-4">
            <div className="text-center mb-4">
              <h2 className="text-lg font-medium text-foreground">{asset.asset_name}</h2>
              <p className="text-2xl font-bold text-gold">{asset.balance} {asset.asset_symbol}</p>
              <p className="text-sm text-muted-foreground">${asset.fiat_value?.toFixed(2) || "0.00"} USD</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="recipient" className="block text-sm font-medium mb-1">Recipient</label>
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full justify-start border-gold/30 bg-muted/5"
                  onClick={() => setIsContactSheetOpen(true)}
                >
                  {selectedContact ? (
                    <div className="flex items-center">
                      <div className="ml-2">
                        <div className="font-medium">{selectedContact.name}</div>
                        <div className="text-xs text-muted-foreground truncate w-60">
                          {selectedContact.wallet_address}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Users className="h-4 w-4 mr-2" />
                      <span>Select Contact</span>
                    </>
                  )}
                </Button>
              </div>
              
              <div>
                <label htmlFor="amount" className="block text-sm font-medium mb-1">Amount</label>
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pr-16 bg-muted/10 border-muted/20"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {asset.asset_symbol}
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="note" className="block text-sm font-medium mb-1">Note (Optional)</label>
                <Input
                  id="note"
                  placeholder="Add a note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="bg-muted/10 border-muted/20"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gold hover:bg-gold/90 text-black"
                disabled={!selectedContact || !amount || parseFloat(amount) <= 0}
              >
                Send {amount && parseFloat(amount) > 0 ? `${amount} ${asset.asset_symbol}` : ""}
              </Button>
            </form>
          </GlassCard>
        </motion.div>
      </div>

      <ContactSelectionSheet
        open={isContactSheetOpen}
        onOpenChange={setIsContactSheetOpen}
        onSelectContact={handleSelectContact}
        contacts={contacts}
      />
    </div>
  );
};

export default SendDetails;
