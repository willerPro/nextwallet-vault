
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface GeolocationData {
  country: string;
  city: string;
  loading: boolean;
  error: string | null;
}

export const useGeolocation = (): GeolocationData => {
  const [locationData, setLocationData] = useState<GeolocationData>({
    country: "",
    city: "",
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        // First check if we have permission to access geolocation
        if (!navigator.geolocation) {
          setLocationData(prev => ({
            ...prev,
            loading: false,
            error: "Geolocation is not supported by your browser"
          }));
          return;
        }

        // Get coordinates
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              
              // Check if we already have location data in localStorage to avoid unnecessary API calls
              const cachedLocation = localStorage.getItem('userLocation');
              if (cachedLocation) {
                const parsedLocation = JSON.parse(cachedLocation);
                const cacheTime = parsedLocation.timestamp;
                
                // Use cached location if it's less than 24 hours old
                if (cacheTime && Date.now() - cacheTime < 24 * 60 * 60 * 1000) {
                  setLocationData({
                    country: parsedLocation.country || "Unknown",
                    city: parsedLocation.city || "Unknown",
                    loading: false,
                    error: null
                  });
                  return;
                }
              }
              
              // Use a reverse geocoding service to get location details
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
              );
              
              if (!response.ok) throw new Error("Failed to fetch location data");
              
              const data = await response.json();
              
              const locationInfo = {
                country: data.address.country || "Unknown",
                city: data.address.city || data.address.town || data.address.village || "Unknown",
                timestamp: Date.now()
              };
              
              // Cache the location data
              localStorage.setItem('userLocation', JSON.stringify(locationInfo));
              
              setLocationData({
                country: locationInfo.country,
                city: locationInfo.city,
                loading: false,
                error: null
              });
            } catch (error) {
              console.error("Error fetching location data:", error);
              setLocationData(prev => ({
                ...prev,
                loading: false,
                error: "Failed to determine location"
              }));
            }
          },
          (error) => {
            console.error("Geolocation error:", error);
            setLocationData(prev => ({
              ...prev,
              loading: false,
              error: error.message
            }));
          },
          { 
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 0
          }
        );
      } catch (error) {
        console.error("Geolocation general error:", error);
        setLocationData(prev => ({
          ...prev,
          loading: false,
          error: "Failed to detect location"
        }));
      }
    };

    fetchLocation();
  }, []);

  return locationData;
};
