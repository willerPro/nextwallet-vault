
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

// List of available fiat currencies
const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
];

const FiatCurrency = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  // Get user's current currency preference
  const { data: userCurrency, isLoading } = useQuery({
    queryKey: ['user-currency'],
    queryFn: async () => {
      if (!user) return { currency_code: "USD", currency_symbol: "$" };

      // Using type assertion to fix TypeScript error
      const { data, error } = await supabase
        .from('user_settings' as any)
        .select('currency_code, currency_symbol')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Record not found, create default
          return { currency_code: "USD", currency_symbol: "$" };
        }
        console.error("Error fetching currency:", error);
        throw error;
      }

      return data || { currency_code: "USD", currency_symbol: "$" };
    },
    enabled: !!user,
  });

  // Update user's currency preference
  const updateCurrencyMutation = useMutation({
    mutationFn: async ({ code, symbol }: { code: string, symbol: string }) => {
      if (!user) throw new Error("User not authenticated");

      // Using type assertion to fix TypeScript error
      const { data: existingSettings, error: fetchError } = await supabase
        .from('user_settings' as any)
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingSettings) {
        // Update existing record
        const { error } = await supabase
          .from('user_settings' as any)
          .update({ 
            currency_code: code, 
            currency_symbol: symbol,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('user_settings' as any)
          .insert({
            user_id: user.id,
            currency_code: code,
            currency_symbol: symbol
          });

        if (error) throw error;
      }

      return { code, symbol };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-currency'] });
      toast.success("Currency updated");
      navigate('/settings');
    },
    onError: (error) => {
      console.error("Error updating currency:", error);
      toast.error("Failed to update currency");
    }
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filter currencies based on search query
  const filteredCurrencies = currencies.filter(
    (currency) =>
      currency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      currency.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCurrencySelect = (code: string, symbol: string) => {
    updateCurrencyMutation.mutate({ code, symbol });
  };

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
        <h1 className="text-xl font-bold">Fiat Currency</h1>
      </motion.header>

      <div className="flex-1 px-4 space-y-5">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search currency..."
              className="pl-10 bg-card/50 border-gold/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <GlassCard variant="dark" className="divide-y divide-border/30">
            {isLoading ? (
              <div className="py-20 flex justify-center">
                <div className="animate-spin h-6 w-6 border-2 border-gold border-t-transparent rounded-full"></div>
              </div>
            ) : filteredCurrencies.length > 0 ? (
              filteredCurrencies.map((currency) => (
                <div
                  key={currency.code}
                  className="py-3 px-2 flex items-center justify-between cursor-pointer hover:bg-card/50"
                  onClick={() => handleCurrencySelect(currency.code, currency.symbol)}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center mr-3 border border-gold/20 text-gold">
                      {currency.symbol}
                    </div>
                    <div>
                      <div className="font-medium">{currency.name}</div>
                      <div className="text-sm text-muted-foreground">{currency.code}</div>
                    </div>
                  </div>
                  {userCurrency?.currency_code === currency.code && (
                    <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center">
                      <Check className="h-4 w-4 text-gold" />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-muted-foreground">
                No currencies found
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default FiatCurrency;
