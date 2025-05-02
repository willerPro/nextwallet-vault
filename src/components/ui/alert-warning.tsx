
import React, { useState } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface AlertWarningProps {
  message: string;
}

export function AlertWarning({ message }: AlertWarningProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <Alert className="bg-amber-500/20 border border-amber-500 text-amber-50 mb-4 relative">
      <AlertCircle className="h-4 w-4 text-amber-500" />
      <AlertDescription className="text-amber-50">
        {message}
      </AlertDescription>
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-1 right-1 text-amber-50 hover:text-amber-200 hover:bg-transparent"
        onClick={() => setIsVisible(false)}
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  );
}
