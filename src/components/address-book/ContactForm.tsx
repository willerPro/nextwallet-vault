
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet";
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
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  label: z.string().min(1, "Label is required"),
  wallet_address: z.string().min(1, "Wallet address is required"),
  network: z.string().min(1, "Network is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface ContactFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: {
    id: string;
    name: string;
    label: string;
    wallet_address: string;
    network: string;
  } | null;
}

export function ContactForm({ open, onOpenChange, contact }: ContactFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: contact?.name || "",
      label: contact?.label || "",
      wallet_address: contact?.wallet_address || "",
      network: contact?.network || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!user) throw new Error("User not authenticated");
      
      if (contact) {
        // Update existing contact
        const { error } = await supabase
          .from("asset_wallets")
          .update({
            name: values.name,
            label: values.label,
            wallet_address: values.wallet_address,
            network: values.network,
            updated_at: new Date().toISOString(),
          })
          .eq("id", contact.id);
        
        if (error) throw error;
      } else {
        // Create new contact
        const { error } = await supabase
          .from("asset_wallets")
          .insert({
            wallet_address: values.wallet_address,
            network: values.network,
            asset_id: "address_book",  // Using as a marker for address book entries
            asset_name: "Contact",
            asset_symbol: "CONTACT",
            user_id: user.id,
            name: values.name,
            label: values.label,
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(contact ? "Contact updated successfully" : "Contact added successfully");
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Error saving contact:", error);
      toast.error("Failed to save contact");
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    mutation.mutate(values);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{contact ? "Edit Contact" : "Add New Contact"}</SheetTitle>
        </SheetHeader>
        
        <div className="py-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} className="bg-muted/10 border-muted/20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label</FormLabel>
                    <FormControl>
                      <Input placeholder="Friend, Work, Family..." {...field} className="bg-muted/10 border-muted/20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="wallet_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wallet Address</FormLabel>
                    <FormControl>
                      <Input placeholder="0x..." {...field} className="bg-muted/10 border-muted/20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="network"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Network</FormLabel>
                    <FormControl>
                      <Input placeholder="Ethereum, BSC, Polygon..." {...field} className="bg-muted/10 border-muted/20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-gold hover:bg-gold/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : contact ? "Update" : "Save"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
