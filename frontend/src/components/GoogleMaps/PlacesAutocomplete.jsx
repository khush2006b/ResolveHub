import { useState, useRef, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';

/**
 * PlacesAutocomplete - Alternative implementation using Geocoding API
 * This works around the deprecated places.Autocomplete API for new Google Cloud projects
 */
const PlacesAutocomplete = ({ onPlaceSelect, placeholder = "Search for a location..." }) => {
  const inputRef = useRef();
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef(null);

  // Debounced search function using Geocoding API
  const handleSearch = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    
    try {
      const geocoder = new window.google.maps.Geocoder();
      
      geocoder.geocode({ address: query }, (results, status) => {
        setLoading(false);
        
        if (status === 'OK' && results) {
          const suggestions = results.slice(0, 5).map(result => ({
            formatted_address: result.formatted_address,
            place_id: result.place_id,
            geometry: result.geometry,
            name: result.address_components[0]?.long_name || result.formatted_address
          }));
          
          setSuggestions(suggestions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
        }
      });
    } catch (error) {
      console.error('Geocoding error:', error);
      setLoading(false);
      setSuggestions([]);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Debounce search by 500ms
    timeoutRef.current = setTimeout(() => {
      handleSearch(value);
    }, 500);
  };

  const handleSelectPlace = (place) => {
    if (place?.geometry?.location) {
      const location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        address: place.formatted_address,
        placeId: place.place_id,
        name: place.name
      };
      
      onPlaceSelect(location);
      
      if (inputRef.current) {
        inputRef.current.value = place.formatted_address;
      }
      
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
        <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
      </div>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        onChange={handleInputChange}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        className="
          w-full border rounded-lg px-4 py-2 pl-10
          text-gray-900 dark:text-white
          bg-white dark:bg-municipal-700
          border-gray-300 dark:border-municipal-600
          focus:ring-2 focus:ring-primary-500 focus:border-primary-500
          transition-colors duration-200
        "
      />
      
      {/* Loading indicator */}
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
        </div>
      )}
      
      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((place, index) => (
            <button
              key={place.place_id || index}
              onClick={() => handleSelectPlace(place)}
              className="
                w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700
                border-b border-gray-200 dark:border-gray-700 last:border-b-0
                transition-colors duration-150
                flex items-start space-x-2
              "
            >
              <MapPin className="w-4 h-4 mt-1 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {place.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {place.formatted_address}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlacesAutocomplete;
