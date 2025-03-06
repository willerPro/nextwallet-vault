
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff } from "lucide-react";

const OfflineFallback = () => {
  // Function to attempt reconnection
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="text-center space-y-4 max-w-md">
        <div className="bg-black/50 p-6 rounded-full mx-auto w-20 h-20 flex items-center justify-center mb-4">
          <WifiOff className="h-10 w-10 text-gold" />
        </div>
        
        <h1 className="text-2xl font-bold">No Internet Connection</h1>
        
        <p className="text-muted-foreground">
          It seems you're offline right now. Please check your connection and try again.
        </p>
        
        <div className="pt-4">
          <Button 
            onClick={handleRetry}
            className="bg-gold hover:bg-gold/90 text-black"
          >
            <Wifi className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OfflineFallback;
