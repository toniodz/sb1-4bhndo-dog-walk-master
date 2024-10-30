import React from 'react';

interface MapProps {
 address: string | null;
}

const Map: React.FC<MapProps> = ({ address }) => {
 if (!address) {
   return (
     <div className="w-full h-96 flex items-center justify-center bg-gray-100 rounded-lg">
       <p className="text-gray-500">No address available</p>
     </div>
   );
 }

 const encodedAddress = encodeURIComponent(`${address}, Dover, Kent, UK`);
 
 return (
   <div className="w-full h-96 rounded-lg overflow-hidden">
     <iframe
       width="100%"
       height="100%"
       frameBorder="0"
       src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${encodedAddress}&zoom=14`}
       allowFullScreen
       title="Location Map"
       className="w-full h-full"
       loading="lazy"
     ></iframe>
   </div>
 );
};

export default Map;
