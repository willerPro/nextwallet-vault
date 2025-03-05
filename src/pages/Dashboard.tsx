import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CryptoAsset {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  balance: number;
  price: number;
  priceChange: number;
}

const Dashboard = () => {
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [balanceChange, setBalanceChange] = useState<number>(0);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const { data: userBalance, isLoading: isLoadingBalance } = useQuery({
    queryKey: ["userBalance"],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return 123456.78;
    },
  });

  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return [
        {
          id: "1",
          type: "deposit",
          amount: 1000,
          date: "2024-03-15T10:30:00.000Z",
          status: "completed",
        },
        {
          id: "2",
          type: "withdrawal",
          amount: 500,
          date: "2024-03-14T15:45:00.000Z",
          status: "pending",
        },
        {
          id: "3",
          type: "transfer",
          amount: 250,
          date: "2024-03-13T08:00:00.000Z",
          status: "completed",
        },
      ];
    },
  });

  const { data: assets = [], isLoading: isLoadingAssets } = useQuery({
    queryKey: ["assets"],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return [
        {
          id: "1",
          name: "Bitcoin",
          symbol: "BTC",
          icon: "/lovable-uploads/1d6cfac3-1b91-43f8-8d2d-ec1870d97843.png",
          balance: 0.05,
          price: 40000,
          priceChange: 2.5,
        },
        {
          id: "2",
          name: "Ethereum",
          symbol: "ETH",
          icon: "/placeholder.svg",
          balance: 1.2,
          price: 2200,
          priceChange: -0.8,
        },
        {
          id: "3",
          name: "Solana",
          symbol: "SOL",
          icon: "/placeholder.svg",
          balance: 12,
          price: 115,
          priceChange: 5.2,
        }
      ] as CryptoAsset[];
    },
  });

  useEffect(() => {
    if (userBalance !== undefined && userBalance !== null) {
      setTotalBalance(userBalance);
    }
  }, [userBalance]);

  useEffect(() => {
    if (assets && assets.length > 0) {
      const totalValue = assets.reduce((sum, asset) => sum + (asset.balance * asset.price), 0);
      const weightedChange = assets.reduce(
        (sum, asset) => sum + (asset.balance * asset.price * asset.priceChange) / totalValue, 
        0
      );
      setBalanceChange(weightedChange);
    }
  }, [assets]);

  return (
    <div className="min-h-screen bg-background antialiased overflow-x-hidden">
      <aside className="w-64 bg-sidebar-background border-r border-sidebar-border h-full fixed top-0 left-0 z-20">
        <div className="flex items-center justify-center h-16 border-b border-sidebar-border">
          <span className="text-lg font-semibold text-sidebar-foreground">NextWallet</span>
        </div>
        <nav className="py-4">
          <ul>
            <li className="px-6 py-2">
              <a href="#" className="flex items-center text-sm font-medium text-sidebar-foreground hover:text-sidebar-primary">
                <Sparkles className="w-4 h-4 mr-2" />
                Dashboard
              </a>
            </li>
            {/* Add more navigation items here */}
          </ul>
        </nav>
      </aside>

      <div className="ml-64 py-6 px-8">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.email}!</p>
          </div>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <button onClick={signOut} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
              Sign Out
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Balance</CardTitle>
              <CardDescription>Your total assets value</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingBalance ? (
                <Skeleton className="h-10 w-40" />
              ) : (
                <div className="text-2xl font-bold">
                  ${totalBalance?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              )}
              <div className="flex items-center text-sm text-muted-foreground mt-2">
                {balanceChange > 0 ? (
                  <ArrowUp className="w-4 h-4 mr-1 text-green-500" />
                ) : (
                  <ArrowDown className="w-4 h-4 mr-1 text-red-500" />
                )}
                {balanceChange?.toFixed(2)}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
              <CardDescription>Your account activity this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">Active</div>
              <Progress value={75} className="mt-4" />
              <div className="text-sm text-muted-foreground mt-2">75% of your profile is completed</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Level</CardTitle>
              <CardDescription>How secure is your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">Medium</div>
              <div className="text-sm text-muted-foreground mt-2">Enable 2FA for higher security</div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest transactions</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingTransactions ? (
                    <>
                      <TableRow>
                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                      </TableRow>
                    </>
                  ) : (
                    transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.type}</TableCell>
                        <TableCell>${transaction.amount.toLocaleString()}</TableCell>
                        <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{transaction.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Your Assets</CardTitle>
              <CardDescription>Overview of your cryptocurrency assets</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingAssets ? (
                    <>
                      <TableRow>
                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                      </TableRow>
                    </>
                  ) : (
                    assets.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            <img src={asset.icon} alt={asset.name} className="w-6 h-6 rounded-full" />
                            <span>{asset.name} ({asset.symbol})</span>
                          </div>
                        </TableCell>
                        <TableCell>{asset.balance}</TableCell>
                        <TableCell>${asset.price.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={cn(asset.priceChange > 0 ? "bg-green-100 text-green-500" : "bg-red-100 text-red-500")}>
                            {asset.priceChange > 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                            {asset.priceChange.toFixed(2)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">${(asset.balance * asset.price).toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
