import { useState, useCallback, useMemo } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import PlacesAutocomplete from './PlacesAutocomplete';
import StreetViewModal from './StreetViewModal';
import { MapPin, Eye } from 'lucide-react';

// Remove 'places' library as we're using Geocoding API instead
// to avoid deprecated places.Autocomplete API for new Google Cloud projects
const libraries = [];

const MapContainer = ({ 
  onLocationSelect, 
  selectedLocation,
  height = "400px",
  showPlacesSearch = true,
  showStreetView = true,
  markers = [],
  center = { lat: 28.6139, lng: 77.2090 },
  zoom = 12
}) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries
  });

  const [map, setMap] = useState(null);
  const [streetViewOpen, setStreetViewOpen] = useState(false);

  const mapContainerStyle = useMemo(() => ({
    width: '100%',
    height
  }), [height]);

  const mapOptions = useMemo(() => ({
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    styles: [
      { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }
    ]
  }), []);

  const handleMapClick = (e) => {
    if (onLocationSelect) onLocationSelect({ lat: e.latLng.lat(), lng: e.latLng.lng() });
  };

  const handlePlaceSelect = (location) => {
    if (onLocationSelect) onLocationSelect(location);
    if (map) {
      map.panTo(location);
      map.setZoom(16);
    }
  };

  if (loadError) return <p>Error loading Google Maps</p>;
  if (!isLoaded) return <div className="h-full flex items-center justify-center">Loading Map...</div>;

  return (
    <div className="space-y-4">
      {showPlacesSearch && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search Location</label>
          <PlacesAutocomplete onPlaceSelect={handlePlaceSelect} />
          <p className="text-sm text-gray-500 dark:text-gray-400">Search for an address or click on the map to select a location</p>
        </div>
      )}

      <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 dark:border-municipal-700 shadow-xl">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={selectedLocation || center}
          zoom={zoom}
          onLoad={setMap}
          onUnmount={() => setMap(null)}
          onClick={handleMapClick}
          options={mapOptions}
        >
          {selectedLocation && (
            <Marker
              position={selectedLocation}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#3B82F6',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2,
              }}
            />
          )}
          {markers.map((m, i) => <Marker key={i} {...m} />)}
        </GoogleMap>

        {showStreetView && selectedLocation && (
          <button
            onClick={() => setStreetViewOpen(true)}
            className="absolute bottom-4 right-4 bg-white dark:bg-municipal-800 hover:bg-gray-100 dark:hover:bg-municipal-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-municipal-700 rounded-lg px-3 py-2 flex items-center space-x-2 shadow-xl"
          >
            <Eye className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <span className="text-sm font-medium">Street View</span>
          </button>
        )}
      </div>

      {selectedLocation && (
        <div className="bg-primary-50 dark:bg-primary-900/40 border border-primary-200 dark:border-primary-700 rounded-lg p-4 shadow-md">
          <div className="flex items-center space-x-2 text-primary-800 dark:text-primary-400">
            <MapPin className="w-5 h-5" />
            <span className="font-semibold">Selected Location:</span>
          </div>
          <p className="text-sm text-primary-700 dark:text-primary-300 mt-1">
            Latitude: {selectedLocation.lat.toFixed(6)}, Longitude: {selectedLocation.lng.toFixed(6)}
          </p>
        </div>
      )}

      {streetViewOpen && selectedLocation && (
        <StreetViewModal location={selectedLocation} onClose={() => setStreetViewOpen(false)} />
      )}
    </div>
  );
};

export default MapContainer;
