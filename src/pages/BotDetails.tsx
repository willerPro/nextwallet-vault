
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const BotDetails = () => {
  const { botId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [isActive, setIsActive] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('');
  const [transactionsPerSecond, setTransactionsPerSecond] = useState(1);
  
  // Fetch wallets
  const { data: wallets = [] } = useQuery({
    queryKey: ['wallets', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user?.id);
        
      if (error) {
        console.error('Error fetching wallets:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch bot details based on botId
  const { data: botDetails, isLoading } = useQuery({
    queryKey: ['bot', botId, user?.id],
    queryFn: async () => {
      // For system bots
      if (botId === 'contract-api') {
        const { data, error } = await supabase
          .from('contract_api_settings')
          .select('*')
          .eq('user_id', user?.id)
          .single();
          
        if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows returned"
          console.error('Error fetching contract API settings:', error);
          return null;
        }
        
        return {
          id: 'contract-api',
          name: 'Contract API',
          type: 'system',
          is_active: data?.is_active || false,
          api_key: data?.api_key || '',
          api_secret: data?.api_secret || '',
          wallet_id: data?.wallet_id || '',
        };
      } 
      else if (botId === 'arbitrage') {
        const { data, error } = await supabase
          .from('arbitrage_operations')
          .select('*')
          .eq('user_id', user?.id)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching arbitrage settings:', error);
          return null;
        }
        
        return {
          id: 'arbitrage',
          name: 'Arbitrage System',
          type: 'system',
          is_active: data?.is_active || false,
          api_key: '',  // Arbitrage might not have these
          api_secret: '',
          wallet_id: data?.wallet_id || '',
          transactions_per_second: data?.transactions_per_second || 1,
        };
      } 
      else {
        // For third-party applications
        const { data, error } = await supabase
          .from('third_party_applications')
          .select('*')
          .eq('id', botId)
          .eq('user_id', user?.id)
          .single();
          
        if (error) {
          console.error('Error fetching application details:', error);
          return null;
        }
        
        return {
          id: data.id,
          name: data.name,
          type: 'third-party',
          is_active: data.is_active || false,
          api_key: data.api_key,
          api_secret: data.api_secret,
          wallet_id: data.wallet_id,
          description: data.description,
          api_path: data.api_path,
        };
      }
    },
    enabled: !!botId && !!user,
  });

  // Update the state when the bot details are loaded
  React.useEffect(() => {
    if (botDetails) {
      setIsActive(botDetails.is_active);
      setApiKey(botDetails.api_key || '');
      setApiSecret(botDetails.api_secret || '');
      setSelectedWallet(botDetails.wallet_id || '');
      if (botDetails.transactions_per_second) {
        setTransactionsPerSecond(botDetails.transactions_per_second);
      }
    }
  }, [botDetails]);

  // Mutation for updating bot settings
  const updateBotMutation = useMutation({
    mutationFn: async (updateData: any) => {
      if (botId === 'contract-api') {
        const { error } = await supabase
          .from('contract_api_settings')
          .upsert({
            user_id: user?.id,
            api_key: updateData.api_key,
            api_secret: updateData.api_secret,
            wallet_id: updateData.wallet_id,
            is_active: updateData.is_active,
          });
          
        if (error) throw error;
      } 
      else if (botId === 'arbitrage') {
        const { error } = await supabase
          .from('arbitrage_operations')
          .upsert({
            user_id: user?.id,
            wallet_id: updateData.wallet_id,
            is_active: updateData.is_active,
            transactions_per_second: updateData.transactions_per_second || 1,
          });
          
        if (error) throw error;
      } 
      else {
        // For third-party applications
        const { error } = await supabase
          .from('third_party_applications')
          .update({
            api_key: updateData.api_key,
            api_secret: updateData.api_secret,
            wallet_id: updateData.wallet_id,
            is_active: updateData.is_active,
          })
          .eq('id', botId)
          .eq('user_id', user?.id);
          
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot', botId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['applications', user?.id] });
      toast.success('Bot settings updated successfully');
    },
    onError: (error) => {
      console.error('Error updating bot settings:', error);
      toast.error('Failed to update bot settings');
    },
  });

  const handleSave = () => {
    updateBotMutation.mutate({
      api_key: apiKey,
      api_secret: apiSecret,
      wallet_id: selectedWallet,
      is_active: isActive,
      transactions_per_second: transactionsPerSecond,
    });
  };

  if (isLoading) {
    return (
      <div className="container max-w-md mx-auto px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-secondary/50 rounded w-3/4"></div>
          <div className="h-40 bg-secondary/30 rounded"></div>
        </div>
      </div>
    );
  }

  if (!botDetails) {
    return (
      <div className="container max-w-md mx-auto px-4 py-6">
        <Button onClick={() => navigate('/bots')} variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Bots
        </Button>
        <Card>
          <CardContent className="p-6">
            <p>Bot details not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto px-4 py-6 pb-20">
      <Button onClick={() => navigate('/bots')} variant="ghost" size="sm" className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Bots
      </Button>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>{botDetails.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="status">Bot Status</Label>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {isActive ? 'Running' : 'Stopped'}
              </span>
              <Switch 
                id="status" 
                checked={isActive} 
                onCheckedChange={setIsActive} 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="wallet">Connected Wallet</Label>
            <Select 
              value={selectedWallet} 
              onValueChange={setSelectedWallet}
            >
              <SelectTrigger id="wallet">
                <SelectValue placeholder="Select a wallet" />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((wallet: any) => (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    {wallet.name} (${wallet.balance})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {botId === 'arbitrage' && (
            <div className="space-y-2">
              <Label htmlFor="transactionsPerSecond">Transactions Per Second</Label>
              <Input 
                id="transactionsPerSecond" 
                type="number" 
                min={1}
                max={10}
                value={transactionsPerSecond}
                onChange={(e) => setTransactionsPerSecond(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Higher values may increase profits but also increase risks
              </p>
            </div>
          )}
          
          {botId !== 'arbitrage' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input 
                  id="apiKey" 
                  placeholder="Enter API key" 
                  value={apiKey} 
                  onChange={(e) => setApiKey(e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apiSecret">API Secret</Label>
                <Input 
                  id="apiSecret" 
                  type="password" 
                  placeholder="Enter API secret" 
                  value={apiSecret} 
                  onChange={(e) => setApiSecret(e.target.value)} 
                />
              </div>
            </>
          )}
          
          <Button 
            className="w-full mt-4" 
            onClick={handleSave}
            disabled={updateBotMutation.isPending}
          >
            {updateBotMutation.isPending ? 'Saving...' : 'Save Settings'}
            {!updateBotMutation.isPending && <Save className="ml-2 h-4 w-4" />}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BotDetails;
