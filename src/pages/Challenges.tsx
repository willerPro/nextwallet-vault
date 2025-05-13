
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Award, Plus, Key, FileText } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Challenge {
  id: string;
  name: string;
  api_key: string;
  secret_key: string;
  balance: string;
  status: string;
  created_at: string;
  user_id: string;
}

const Challenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [newChallenge, setNewChallenge] = useState({
    name: "",
    api_key: "",
    secret_key: ""
  });
  const { user } = useAuth();
  
  // Load challenges from database
  const loadChallenges = async () => {
    if (!user) return;
    
    try {
      // Using generic query to avoid type issues
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('user_id', user.id) as any;
        
      if (error) throw error;
      
      setChallenges(data as Challenge[] || []);
    } catch (error: any) {
      // Only show toast for errors after initial load attempt
      if (!isInitialLoad) {
        console.error("Error loading challenges:", error);
        toast.error("Failed to load challenges");
      } else {
        console.error("Initial load error:", error);
        
        // If table doesn't exist yet, handle gracefully
        if (error.code === "42P01") {
          console.log("Challenges table doesn't exist yet. Will be created on first insert.");
        }
      }
    } finally {
      setIsInitialLoad(false);
    }
  };
  
  // Load challenges when component mounts
  useEffect(() => {
    loadChallenges();
  }, [user]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewChallenge(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to add challenges");
      return;
    }
    
    if (!newChallenge.name || !newChallenge.api_key || !newChallenge.secret_key) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, we would validate the API key and fetch the initial balance
      // For demo purposes, we'll use a random balance
      const mockBalance = (Math.random() * 10000).toFixed(2);
      
      // Using generic query to avoid type issues
      const { data, error } = await supabase
        .from('challenges')
        .insert({
          user_id: user.id,
          name: newChallenge.name,
          api_key: newChallenge.api_key,
          secret_key: newChallenge.secret_key,
          balance: `$${mockBalance}`,
          status: "Active",
          created_at: new Date().toISOString()
        })
        .select() as any;
        
      if (error) throw error;
      
      toast.success("Challenge account added successfully!");
      setIsDialogOpen(false);
      setNewChallenge({ name: "", api_key: "", secret_key: "" });
      
      // Reload challenges to show the new one
      loadChallenges();
      
    } catch (error: any) {
      console.error("Error adding challenge:", error);
      
      // Handle case where the table might not exist yet
      if (error.code === "42P01") {
        toast.error("Database setup in progress. Please try again in a few minutes.");
      } else {
        toast.error("Failed to add challenge account");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col pb-24">
      {/* Header */}
      <motion.header 
        className="p-4 flex items-center justify-between"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center">
          <Award className="h-5 w-5 mr-2 text-gold" />
          <h1 className="text-xl font-bold">Challenges</h1>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-1">
              <Plus className="h-4 w-4" /> Add Challenge
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Challenge Account</DialogTitle>
              <DialogDescription>
                Connect your funded account by entering the API details below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddChallenge} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-1">
                  <FileText className="h-4 w-4" /> Challenge Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={newChallenge.name}
                  onChange={handleInputChange}
                  placeholder="Enter challenge name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="api_key" className="flex items-center gap-1">
                  <Key className="h-4 w-4" /> API Key
                </Label>
                <Input
                  id="api_key"
                  name="api_key"
                  value={newChallenge.api_key}
                  onChange={handleInputChange}
                  placeholder="Enter API key"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="secret_key" className="flex items-center gap-1">
                  <Key className="h-4 w-4" /> Secret Key
                </Label>
                <Input
                  id="secret_key"
                  name="secret_key"
                  type="password"
                  value={newChallenge.secret_key}
                  onChange={handleInputChange}
                  placeholder="Enter secret key"
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Challenge Account"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.header>

      {/* Main content */}
      <div className="flex-1 px-4 space-y-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Challenge Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              {challenges.length === 0 ? (
                <div className="text-center p-6 text-muted-foreground">
                  <Award className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No challenge accounts found.</p>
                  <p className="text-sm">Add your first challenge account to get started.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {challenges.map((challenge) => (
                      <TableRow key={challenge.id}>
                        <TableCell className="font-medium">{challenge.name}</TableCell>
                        <TableCell>{challenge.balance}</TableCell>
                        <TableCell>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            challenge.status === "Active" ? "bg-green-500/20 text-green-500" : 
                            challenge.status === "Failed" ? "bg-red-500/20 text-red-500" : 
                            "bg-yellow-500/20 text-yellow-500"
                          }`}>
                            {challenge.status}
                          </span>
                        </TableCell>
                        <TableCell>{new Date(challenge.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Challenges;
