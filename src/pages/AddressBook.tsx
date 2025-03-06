
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Search, Trash2, Edit, Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { ContactForm } from "@/components/address-book/ContactForm";
import { useAuth } from "@/context/AuthContext";

interface Contact {
  id: string;
  user_id: string;
  name: string;
  label: string;
  wallet_address: string;
  network: string;
  created_at: string;
  updated_at: string;
  asset_id: string;
  asset_name: string;
  asset_symbol: string;
}

const AddressBook = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: contacts = [], isLoading } = useQuery<Contact[]>({
    queryKey: ["contacts"],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("asset_wallets")
        .select("*")
        .eq("user_id", user.id)
        .eq("asset_id", "address_book");
      
      if (error) {
        console.error("Error fetching contacts:", error);
        toast.error("Failed to load contacts");
        return [];
      }
      
      return data as unknown as Contact[];
    },
    enabled: !!user
  });

  const deleteMutation = useMutation({
    mutationFn: async (contactId: string) => {
      const { error } = await supabase
        .from("asset_wallets")
        .delete()
        .eq("id", contactId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Contact deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
    onError: (error) => {
      console.error("Error deleting contact:", error);
      toast.error("Failed to delete contact");
    }
  });

  const handleDeleteContact = (contactId: string) => {
    deleteMutation.mutate(contactId);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setIsAddContactOpen(true);
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success("Address copied to clipboard");
  };

  const filteredContacts = contacts.filter(
    contact =>
      contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.wallet_address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Address Book</h1>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full bg-gold/10 text-gold hover:bg-gold/20"
          onClick={() => {
            setEditingContact(null);
            setIsAddContactOpen(true);
          }}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </motion.header>

      {/* Search bar */}
      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            className="pl-10 bg-muted/10 border-muted/20"
            placeholder="Search contacts"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Contacts list */}
      <div className="flex-1 px-4 space-y-2">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((_, index) => (
              <GlassCard key={index} variant="dark" className="h-20 animate-pulse">
                <div></div>
              </GlassCard>
            ))}
          </div>
        ) : filteredContacts.length === 0 ? (
          <GlassCard variant="dark" className="py-8 text-center">
            <p className="text-muted-foreground mb-4">No saved addresses found</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setEditingContact(null);
                setIsAddContactOpen(true);
              }}
              className="border-gold/20 text-gold hover:bg-gold/10"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Address
            </Button>
          </GlassCard>
        ) : (
          filteredContacts.map((contact) => (
            <GlassCard
              key={contact.id}
              variant="dark"
              className="flex flex-col"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{contact.name}</h3>
                  <span className="text-xs text-muted-foreground">{contact.label}</span>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => handleCopyAddress(contact.wallet_address)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => handleEditContact(contact)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteContact(contact.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="text-sm text-muted-foreground break-all">{contact.wallet_address}</div>
                <div className="text-xs text-muted-foreground mt-1">{contact.network}</div>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      {/* Contact Form */}
      {isAddContactOpen && (
        <ContactForm 
          open={isAddContactOpen} 
          onOpenChange={setIsAddContactOpen} 
          contact={editingContact}
        />
      )}
    </div>
  );
};

export default AddressBook;
