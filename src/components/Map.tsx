import React from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

interface MapProps {
  center: {
    lat: number;
    lng: number;
  };
  zoom?: number;
}

const Map: React.FC<MapProps> = ({ center, zoom = 14 }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  const containerStyle = {
    width: '100%',
    height: '400px'
  };

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
    >
      <Marker position={center} />
    </GoogleMap>
  ) : <div>Loading...</div>;
};

export default Map;