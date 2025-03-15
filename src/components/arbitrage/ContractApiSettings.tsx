
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Bot, Link, Power } from 'lucide-react';

interface ContractApiSettingsProps {
  wallets: any[];
}

const ContractApiSettings = ({ wallets }: ContractApiSettingsProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  // Fetch existing API settings if available
  useEffect(() => {
    if (user) {
      const fetchApiSettings = async () => {
        try {
          const { data, error } = await supabase
            .from('contract_api_settings')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
          if (error && error.code !== 'PGRST116') {
            console.error('Error fetching API settings:', error);
            return;
          }
          
          if (data) {
            setApiKey(data.api_key || '');
            setApiSecret(data.api_secret || '');
            setSelectedWallet(data.wallet_id || null);
            setIsActive(data.is_active || false);
          }
        } catch (error) {
          console.error('Error in fetch API settings:', error);
        }
      };
      
      fetchApiSettings();
    }
  }, [user]);

  // Handle API settings save
  const saveApiSettings = async () => {
    if (!user) {
      toast.error("You must be logged in to save settings");
      return;
    }
    
    if (!apiKey.trim()) {
      toast.error("API Key is required");
      return;
    }
    
    if (!apiSecret.trim()) {
      toast.error("API Secret is required");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('contract_api_settings')
        .upsert({
          user_id: user.id,
          api_key: apiKey,
          api_secret: apiSecret,
          wallet_id: selectedWallet,
          is_active: isActive,
          updated_at: new Date().toISOString()
        });
        
      if (error) {
        console.error('Error saving API settings:', error);
        toast.error("Failed to save API settings");
        return;
      }
      
      toast.success("API settings saved successfully");
      setShowDialog(false);
    } catch (error) {
      console.error('Error in save API settings:', error);
      toast.error("An error occurred while saving settings");
    }
  };

  // Toggle contract bot activation
  const toggleActivation = async () => {
    if (!selectedWallet) {
      toast.error("Please link a wallet before activating");
      return;
    }
    
    const newActiveState = !isActive;
    
    try {
      const { error } = await supabase
        .from('contract_api_settings')
        .upsert({
          user_id: user?.id,
          api_key: apiKey,
          api_secret: apiSecret,
          wallet_id: selectedWallet,
          is_active: newActiveState,
          updated_at: new Date().toISOString()
        });
        
      if (error) {
        console.error('Error updating bot activation:', error);
        toast.error("Failed to update bot status");
        return;
      }
      
      setIsActive(newActiveState);
      toast.success(newActiveState ? "Contract bot activated" : "Contract bot deactivated");
    } catch (error) {
      console.error('Error in toggle activation:', error);
      toast.error("An error occurred while updating bot status");
    }
  };

  return (
    <div className="bg-secondary/20 rounded-lg p-4 mt-6">
      <div className="flex items-center mb-4">
        <Bot className="mr-2 h-5 w-5" />
        <h2 className="text-xl font-semibold">Contract API Settings</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="api-key">API Key</Label>
          <Input 
            id="api-key" 
            type="text" 
            value={apiKey} 
            onChange={(e) => setApiKey(e.target.value)} 
            placeholder="Enter your API Key" 
          />
        </div>
        
        <div>
          <Label htmlFor="api-secret">API Secret</Label>
          <Input 
            id="api-secret" 
            type="password" 
            value={apiSecret} 
            onChange={(e) => setApiSecret(e.target.value)} 
            placeholder="Enter your API Secret" 
          />
        </div>
        
        <div>
          <div className="flex items-center mb-2">
            <Label>Linked Wallet</Label>
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="ml-2">
                  <Link className="h-4 w-4 mr-1" />
                  {selectedWallet ? "Change Wallet" : "Link Wallet"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Select Wallet for Contract Income</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Select a wallet to receive income from the contract API bot:
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {wallets.map(wallet => (
                      <Button
                        key={wallet.id}
                        variant={selectedWallet === wallet.id ? "default" : "outline"}
                        onClick={() => setSelectedWallet(wallet.id)}
                        className="justify-between"
                      >
                        <span>{wallet.name}</span>
                      </Button>
                    ))}
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button onClick={saveApiSettings}>Save</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {selectedWallet ? (
            <div className="bg-secondary/30 p-3 rounded-md">
              <p className="text-sm">
                Income will be deposited to: {wallets.find(w => w.id === selectedWallet)?.name || 'Selected wallet'}
              </p>
            </div>
          ) : (
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm text-muted-foreground">No wallet linked yet.</p>
            </div>
          )}
        </div>
        
        <Button 
          className="w-full mt-4" 
          onClick={toggleActivation}
          disabled={!selectedWallet || !apiKey || !apiSecret}
          variant={isActive ? "destructive" : "default"}
        >
          <Power className="mr-2 h-5 w-5" />
          {isActive ? 'Deactivate Contract Bot' : 'Activate Contract Bot'}
        </Button>
        
        <p className="text-xs text-muted-foreground mt-2">
          Once activated, the contract bot will run continuously until stopped. The bot will automatically process API-based contracts and deposit income to your selected wallet.
        </p>
      </div>
    </div>
  );
};

export default ContractApiSettings;
