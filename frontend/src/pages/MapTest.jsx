// Quick test page to diagnose Google Maps issues
import { useJsApiLoader } from '@react-google-maps/api';

const MapTest = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: ['places', 'visualization']
  });

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Google Maps API Test
        </h1>

        {/* API Key Check */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-4 border-l-4 border-blue-500">
          <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
            1. API Key Configuration
          </h2>
          {apiKey ? (
            <div className="space-y-2">
              <p className="text-green-600 dark:text-green-400">✅ API Key Found</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-mono break-all">
                {apiKey}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-red-600 dark:text-red-400">❌ API Key Missing</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add VITE_GOOGLE_MAPS_API_KEY to your .env file
              </p>
            </div>
          )}
        </div>

        {/* Load Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-4 border-l-4 border-purple-500">
          <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
            2. Maps API Load Status
          </h2>
          {loadError ? (
            <div className="space-y-2">
              <p className="text-red-600 dark:text-red-400">❌ Load Error</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {loadError.message || 'Failed to load Google Maps'}
              </p>
            </div>
          ) : isLoaded ? (
            <div className="space-y-2">
              <p className="text-green-600 dark:text-green-400">✅ Maps API Loaded Successfully</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Google Maps is ready to use
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-yellow-600 dark:text-yellow-400">⏳ Loading...</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Waiting for Google Maps API to load
              </p>
            </div>
          )}
        </div>

        {/* Browser Console Check */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-4 border-l-4 border-orange-500">
          <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
            3. Check Browser Console
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Open your browser console (F12) and look for error messages like:
          </p>
          <ul className="space-y-2 text-sm">
            <li className="text-red-600 dark:text-red-400 font-mono">
              ❌ BillingNotEnabledMapError → Enable billing in Google Cloud
            </li>
            <li className="text-red-600 dark:text-red-400 font-mono">
              ❌ RefererNotAllowedMapError → Fix API key restrictions
            </li>
            <li className="text-red-600 dark:text-red-400 font-mono">
              ❌ ApiNotActivatedMapError → Enable Maps JavaScript API
            </li>
            <li className="text-red-600 dark:text-red-400 font-mono">
              ❌ InvalidKeyMapError → Check your API key
            </li>
          </ul>
        </div>

        {/* Action Items */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-l-4 border-green-500">
          <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
            4. Action Items
          </h2>
          <ol className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              <div>
                <strong>Enable Billing:</strong> Go to{' '}
                <a 
                  href="https://console.cloud.google.com/billing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 underline"
                >
                  Google Cloud Billing
                </a>
              </div>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              <div>
                <strong>Enable APIs:</strong> Go to{' '}
                <a 
                  href="https://console.cloud.google.com/apis/library" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 underline"
                >
                  API Library
                </a>
                {' '}and enable:
                <ul className="ml-4 mt-1 list-disc">
                  <li>Maps JavaScript API</li>
                  <li>Places API</li>
                  <li>Geocoding API</li>
                </ul>
              </div>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">3.</span>
              <div>
                <strong>Check Restrictions:</strong> Go to{' '}
                <a 
                  href="https://console.cloud.google.com/apis/credentials" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 underline"
                >
                  API Credentials
                </a>
                {' '}and allow localhost
              </div>
            </li>
          </ol>
        </div>

        {/* Environment Info */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded text-xs text-gray-500 dark:text-gray-600">
          <p>Environment: {import.meta.env.MODE}</p>
          <p>Base URL: {import.meta.env.VITE_API_BASE_URL || 'Not set'}</p>
        </div>
      </div>
    </div>
  );
};

export default MapTest;
