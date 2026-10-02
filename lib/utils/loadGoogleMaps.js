/**
 * Dynamically load Google Maps JavaScript API
 * @param {string} apiKey - Google Maps API Key
 * @returns {Promise} - Resolves when the API is loaded
 */
export const loadGoogleMapsAPI = (apiKey) => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.google && window.google.maps) {
      resolve(window.google.maps);
      return;
    }

    // Check if script is already being loaded
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      // Wait for it to load
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkInterval);
          resolve(window.google.maps);
        }
      }, 100);
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google && window.google.maps) {
        resolve(window.google.maps);
      } else {
        reject(new Error('Google Maps failed to load'));
      }
    };

    script.onerror = () => {
      reject(new Error('Failed to load Google Maps script'));
    };

    document.head.appendChild(script);
  });
};

/**
 * Hook to load Google Maps API
 * Usage: const isLoaded = useGoogleMaps();
 */
export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.warn('Google Maps API key not found. Set VITE_GOOGLE_MAPS_API_KEY in your .env file');
      return;
    }

    loadGoogleMapsAPI(apiKey)
      .then(() => setIsLoaded(true))
      .catch((err) => {
        console.error('Error loading Google Maps:', err);
        setError(err);
      });
  }, []);

  return { isLoaded, error };
};
