
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AlertTriangle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import QRCode from "react-qr-code";
import { useToast } from "@/hooks/use-toast";

interface ExportKeySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  keyType: "public" | "private";
  keyValue: string;
}

export function ExportKeySheet({ open, onOpenChange, keyType, keyValue }: ExportKeySheetProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  // Generate a fake key if none provided
  const displayKey = keyValue || "10b3a1eaca0fd8eefbd7396856e21b672111862a95422c01129482b6de93d264";
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayKey);
      setCopied(true);
      toast({
        title: "Success",
        description: `${keyType.charAt(0).toUpperCase() + keyType.slice(1)} key copied to clipboard`,
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-background border-l border-border overflow-auto">
        <SheetHeader className="text-center">
          <SheetTitle>Export {keyType.charAt(0).toUpperCase() + keyType.slice(1)} Key</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Warning box */}
          <div className="bg-amber-950/40 border border-amber-500/30 rounded-lg p-4 flex items-start">
            <AlertTriangle className="text-amber-500 h-5 w-5 mt-0.5 flex-shrink-0 mr-2" />
            <p className="text-amber-500 text-sm">
              Never disclose this key. Anyone with your {keyType} keys can steal any assets held in your account.
            </p>
          </div>
          
          {/* QR Code */}
          <div className="flex justify-center my-6">
            <div className="bg-white p-2 rounded-lg">
              <QRCode value={displayKey} size={220} />
            </div>
          </div>
          
          {/* Key display */}
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <p className="text-center font-mono text-sm break-all">
              {displayKey}
            </p>
          </div>
          
          {/* Copy button */}
          <Button 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy {keyType} key
              </>
            )}
          </Button>
          
          {/* Security tips */}
          <div className="space-y-4 text-sm text-muted-foreground mt-8">
            <p>
              1. Do not take screenshots of the {keyType} key to avoid being intercepted by malware.
            </p>
            <p>
              2. Before copying the {keyType} key, ensure the security of the clipboard permission to avoid leakage caused by the clipboard being read by other software.
            </p>
            <p>
              3. Please write down and save the {keyType} key correctly, and do not share it over the internet.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
