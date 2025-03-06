
import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Define Contact interface that matches SendDetails
interface Contact {
  id: string;
  name: string;
  label: string;
  wallet_address: string;
  network: string;
  user_id: string;
}

interface ContactSelectionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
}

export function ContactSelectionSheet({ 
  open, 
  onOpenChange, 
  contacts, 
  onSelectContact 
}: ContactSelectionSheetProps) {
  const navigate = useNavigate();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Select Contact</SheetTitle>
        </SheetHeader>
        
        <div className="py-6">
          {contacts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No saved contacts</p>
              <Button 
                variant="outline" 
                className="border-gold/20 text-gold hover:bg-gold/10"
                onClick={() => {
                  onOpenChange(false);
                  navigate("/address-book");
                }}
              >
                Add New Contact
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {contacts.map((contact) => (
                <GlassCard
                  key={contact.id}
                  variant="dark"
                  className="cursor-pointer hover:bg-muted/10"
                  onClick={() => onSelectContact(contact)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{contact.name}</h3>
                      <span className="text-xs text-muted-foreground">{contact.label}</span>
                      <div className="text-sm text-muted-foreground mt-1 break-all">{contact.wallet_address}</div>
                      <div className="text-xs text-muted-foreground mt-1">{contact.network}</div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
