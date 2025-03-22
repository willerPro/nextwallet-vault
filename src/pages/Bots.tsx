
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AddThirdPartyModal from '@/components/bots/AddThirdPartyModal';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { ThirdPartyApplication } from '@/types/wallet';

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

  // Add default system bots
  const allBots = [
    {
      id: 'contract-api',
      name: 'Contract API',
      type: 'system',
      is_active: false,
      income: 0,
    },
    {
      id: 'arbitrage',
      name: 'Arbitrage System',
      type: 'system',
      is_active: false,
      income: 0,
    },
    ...applications.map((app: ThirdPartyApplication) => ({
      id: app.id,
      name: app.name,
      type: 'third-party',
      is_active: app.is_active || false,
      income: 0, // This would be fetched from a separate table in a real implementation
    })),
  ];

  const handleBotClick = (botId: string) => {
    navigate(`/bots/${botId}`);
  };

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

      <div className="space-y-3">
        {allBots.map((bot) => (
          <Card 
            key={bot.id} 
            className="p-4 hover:bg-secondary/10 transition-colors cursor-pointer"
            onClick={() => handleBotClick(bot.id)}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{bot.name}</h3>
                <span className={`text-xs ${bot.is_active ? 'text-green-500' : 'text-yellow-500'}`}>
                  {bot.is_active ? 'Running' : 'Stopped'}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-muted-foreground">Income</span>
                <span className="font-medium">${bot.income.toFixed(2)}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 text-xs h-7 px-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle disconnect logic here
                  }}
                >
                  Disconnect
                </Button>
              </div>
            </div>
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
