
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export type CurrencyInfo = {
  code: string;
  symbol: string;
}

export const useCurrency = () => {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['user-currency'],
    queryFn: async () => {
      // Default currency if no user or error
      const defaultCurrency: CurrencyInfo = { 
        code: "USD", 
        symbol: "$" 
      };

      if (!user) return defaultCurrency;

      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('currency_code, currency_symbol')
          .eq('user_id', user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // Record not found, use default
            return defaultCurrency;
          }
          console.error("Error fetching currency:", error);
          throw error;
        }

        return { 
          code: data?.currency_code || defaultCurrency.code, 
          symbol: data?.currency_symbol || defaultCurrency.symbol 
        };
      } catch (err) {
        console.error("Error in currency hook:", err);
        return defaultCurrency;
      }
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Format a number according to the selected currency
  const formatCurrency = (amount: number) => {
    if (isLoading || error) {
      return `$${amount.toLocaleString()}`;
    }
    
    const currencySymbol = data?.symbol || "$";
    return `${currencySymbol}${amount.toLocaleString()}`;
  };

  return {
    currency: data || { code: "USD", symbol: "$" },
    isLoading,
    error,
    formatCurrency
  };
};
