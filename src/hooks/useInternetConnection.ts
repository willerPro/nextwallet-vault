
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export const useInternetConnection = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Function to update the online status
    const updateOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      
      // Show toast notification when connection status changes
      if (!online) {
        toast.error('No internet connection', {
          description: 'Please check your connection and try again',
          duration: 5000,
        });
      } else {
        toast.success('Back online', {
          description: 'Your internet connection has been restored',
          duration: 3000,
        });
      }
    };

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Clean up event listeners
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return isOnline;
};
