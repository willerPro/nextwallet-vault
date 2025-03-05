
import React from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sun, Moon } from "lucide-react";

interface ThemeSelectSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ThemeSelectSheet({ open, onOpenChange }: ThemeSelectSheetProps) {
  const [isDarkMode, setIsDarkMode] = React.useState(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // In a real implementation, this would toggle the theme using a theme provider
    // For now, we'll just toggle a class on the document element
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="mb-5">
          <SheetTitle>Appearance</SheetTitle>
          <SheetDescription>
            Customize the appearance of the application
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {isDarkMode ? (
                <Moon className="h-5 w-5 text-gold" />
              ) : (
                <Sun className="h-5 w-5 text-gold" />
              )}
              <Label htmlFor="theme-mode">Dark Mode</Label>
            </div>
            <Switch
              id="theme-mode"
              checked={isDarkMode}
              onCheckedChange={toggleTheme}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
