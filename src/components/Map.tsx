// src/components/Map.tsx
import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

interface MapProps {
  center: {
    lat: number;
    lng: number;
  };
}

const Map: React.FC<MapProps> = ({ center }) => {
  const mapStyles = {
    height: "100%",
    width: "100%"
  };

  // Check if we have valid coordinates
  const hasValidCoordinates = center?.lat && center?.lng;
  
  // Default to Dover's coordinates if none provided
  const defaultCenter = hasValidCoordinates ? center : {
    lat: 51.1279,
    lng: 1.3134
  };

  // Check if we have an API key
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-gray-500">Map configuration required</p>
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap
        mapContainerStyle={mapStyles}
        zoom={14}
        center={defaultCenter}
      >
        <Marker 
          position={defaultCenter}
          title="Walk Location"
        />
      </GoogleMap>
    </LoadScript>
  );
};

export default Map;
