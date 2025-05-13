
import { supabase } from '@/integrations/supabase/client';

/**
 * Helper function to safely work with the challenges table
 * even when the table might not be recognized in TypeScript types
 */
export const challengesTable = {
  select: async (userId: string) => {
    // Use the raw SQL query capabilities of Supabase to bypass type checking
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('user_id', userId)
      .returns<any[]>();
    
    return { data, error };
  },
  
  insert: async (challenge: any) => {
    const { data, error } = await supabase
      .from('challenges')
      .insert(challenge)
      .select()
      .returns<any[]>();
    
    return { data, error };
  }
};
