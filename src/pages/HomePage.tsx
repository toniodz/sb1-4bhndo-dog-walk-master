import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchWalks } from '../api/strapi';
import { MapPin, Clock, Star, Send } from 'lucide-react';

interface Walk {
  id: number;
  Title: string;
  slug: string;
  address: string;
  duration: string;
  difficulty: string;
  rating: number;
  image: {
    url: string;
  } | null;
}

const HomePage: React.FC = () => {
 const [walks, setWalks] = useState<Walk[]>([]);
 const [error, setError] = useState<string | null>(null);
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
   const loadWalks = async () => {
     try {
       setIsLoading(true);
       const fetchedWalks = await fetchWalks();
       console.log('Fetched walks:', fetchedWalks);

       if (Array.isArray(fetchedWalks)) {
         const processedWalks = fetchedWalks.map(walk => ({
           id: walk.id,
           Title: walk.Title,
           slug: walk.slug,
           rating: walk.rating,
           address: walk.address,
           duration: walk.duration,
           difficulty: walk.difficulty,
           image: walk.image
         }));
         console.log('Processed walks:', processedWalks);
         setWalks(processedWalks);
       } else {
         throw new Error('Invalid data structure received from API');
       }
     } catch (err) {
       console.error('Error fetching walks:', err instanceof Error ? err.message : String(err));
       setError('Failed to fetch walks. Please try again later.');
     } finally {
       setIsLoading(false);
     }
   };
   loadWalks();
 }, []);

 if (isLoading) {
   return (
     <div className="flex justify-center items-center min-h-screen">
       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
     </div>
   );
 }

 return (
   <div>
     {/* Hero Section */}
     <section className="relative bg-gray-900 text-white py-24">
       <div className="absolute inset-0 overflow-hidden">
         <img
           src="https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2068&q=80"
           alt="Dog walking in nature"
           className="w-full h-full object-cover opacity-30"
         />
       </div>
       <div className="relative container mx-auto px-4 text-center">
         <h1 className="text-4xl md:text-5xl font-bold mb-6">
           Discover Dog-Friendly Walks in Dover, Kent
         </h1>
         <p className="text-xl mb-8">
           Explore the best routes for you and your furry friend
         </p>
         <Link to="/search" className="btn-primary text-lg px-8 py-3">
           Find a Walk
         </Link>
       </div>
     </section>

{/* Walks Section */}
<section className="py-16 bg-gray-50">
  <div className="container mx-auto px-4">
    <h2 className="text-3xl font-bold text-center mb-12">Featured Walks</h2>
    
    {error && (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
        <p className="font-medium">{error}</p>
      </div>
    )}
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {walks.map((walk) => (
        <Link 
          key={walk.id} 
          to={`/walks/${walk.slug}`}
          className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
        >
          <div className="relative aspect-video">
            {walk.image?.url ? (
              <img 
                src={`${import.meta.env.VITE_STRAPI_URL}${walk.image.url}`}
                alt={walk.Title || 'Dog walking route'}
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const placeholder = document.createElement('div');
                  placeholder.className = "w-full h-48 bg-gray-200 flex items-center justify-center";
                  placeholder.innerHTML = '<svg class="w-8 h-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>';
                  e.currentTarget.parentElement.appendChild(placeholder);
                }}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                <Image className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="p-4">
            <h3 className="text-xl font-semibold mb-2 text-gray-900">
              {walk.Title || 'Unnamed Walk'}
            </h3>
            
            <div className="space-y-2">
              {walk.address && (
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="text-sm truncate">{walk.address}</span>
                </div>
              )}
              
              {walk.duration && (
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="text-sm">{walk.duration}</span>
                </div>
              )}
              
              {walk.difficulty && (
                <div className="flex items-center text-gray-600">
                  <Star className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="text-sm">{walk.difficulty}</span>
                </div>
              )}
            </div>
            
            {walk.rating && (
              <div className="mt-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Rating: {walk.rating.toFixed(1)}
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  </div>
</section>

     {/* CTA Section */}
     <section className="bg-primary text-white py-16">
       <div className="container mx-auto px-4 text-center">
         <h2 className="text-3xl font-bold mb-4">Share Your Favorite Walk</h2>
         <p className="text-xl mb-8">
           Help other dog owners discover great walks in Dover
         </p>
         <a 
           href="mailto:contact@dogwalksnearme.uk" 
           className="inline-flex items-center bg-white text-primary font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition duration-300"
         >
           <Send className="h-5 w-5 mr-2" />
           Submit a Walk
         </a>
       </div>
     </section>
   </div>
 );
};

export default HomePage;
