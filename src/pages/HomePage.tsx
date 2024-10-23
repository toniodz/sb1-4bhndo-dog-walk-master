import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchWalks } from '../api/strapi';
import { MapPin, Clock, Star, Send } from 'lucide-react';

interface Walk {
  id: number;
  attributes: {
    title: string;
    slug: string;
    address: string;
    duration: string;
    difficulty: string;
    rating: number;
    image: {
      data: {
        attributes: {
          url: string;
        };
      };
    };
  };
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
        if (Array.isArray(fetchedWalks)) {
          setWalks(fetchedWalks);
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
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {walks.map((walk) => (
              walk?.attributes && (
                <Link 
                  key={walk.id} 
                  to={`/blog/${walk.attributes.slug}`} 
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  {walk.attributes.image?.data?.attributes?.url && (
                    <img 
                      src={`${import.meta.env.VITE_STRAPI_URL}${walk.attributes.image.data.attributes.url}`} 
                      alt={walk.attributes.title} 
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2">{walk.attributes.title}</h3>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{walk.attributes.address}</span>
                    </div>
                    <div className="flex items-center text-gray-600 mb-2">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="text-sm">{walk.attributes.duration}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Star className="h-4 w-4 mr-1" />
                      <span className="text-sm">{walk.attributes.difficulty}</span>
                    </div>
                    <div className="mt-2 text-primary font-semibold">
                      Rating: {walk.attributes.rating.toFixed(1)}
                    </div>
                  </div>
                </Link>
              )
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