
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AddThirdPartyModal from '@/components/bots/AddThirdPartyModal';
import ContractApiSettings from '@/components/arbitrage/ContractApiSettings';
import ArbitrageComponent from '@/components/bots/ArbitrageComponent';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

const Bots = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  
  // Fetch wallets for passing to components
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
  
  // Fetch third-party applications
  const { data: applications = [] } = useQuery({
    queryKey: ['applications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('third_party_applications')
        .select('*')
        .eq('user_id', user?.id);
        
      if (error) {
        console.error('Error fetching applications:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user,
  });

  return (
    <div className="container max-w-md mx-auto px-4 py-6 pb-20">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Bots & Integrations</h1>
          <p className="text-muted-foreground">Manage your connected trading bots and services</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} variant="secondary" size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Connect
        </Button>
      </header>

      <div className="space-y-6">
        {/* Default components */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Contract API</CardTitle>
            <CardDescription>Connect to the Contract API trading system</CardDescription>
          </CardHeader>
          <CardContent>
            <ContractApiSettings wallets={wallets} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Arbitrage System</CardTitle>
            <CardDescription>Connect to the Arbitrage trading system</CardDescription>
          </CardHeader>
          <CardContent>
            <ArbitrageComponent wallets={wallets} />
          </CardContent>
        </Card>

        {/* Dynamic third-party applications */}
        {applications.map((app) => (
          <Card key={app.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{app.name}</CardTitle>
              <CardDescription>{app.description || 'Third-party integration'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-secondary/20 p-4 rounded-lg">
                <div className="flex justify-between mb-3">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <span className={`text-sm font-medium ${app.is_active ? 'text-green-500' : 'text-yellow-500'}`}>
                    {app.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="text-sm text-muted-foreground">Connected wallet:</span>
                  <span className="text-sm font-medium">
                    {wallets.find(w => w.id === app.wallet_id)?.name || 'None'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">API:</span>
                  <span className="text-sm font-medium">{app.api_path || 'Custom'}</span>
                </div>
                <Button 
                  className="w-full mt-4" 
                  variant={app.is_active ? "destructive" : "default"}
                  size="sm"
                >
                  {app.is_active ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AddThirdPartyModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
        wallets={wallets}
      />
    </div>
  );
};

export default Bots;
