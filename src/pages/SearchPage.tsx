import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Clock, Star } from 'lucide-react';
import { fetchWalks } from '../api/strapi';
import SEOMetaTags from '../components/SEOMetaTags';

interface Walk {
  id: number;
  attributes: {
    title: string;
    overview: string;
    image: {
      data: {
        attributes: {
          url: string;
        };
      };
    };
    address: string;
    duration: string;
    difficulty: string;
    slug: string;
    rating: number;
  };
}

const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [walks, setWalks] = useState<Walk[]>([]);
  const [filteredWalks, setFilteredWalks] = useState<Walk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWalks = async () => {
      try {
        setIsLoading(true);
        const fetchedWalks = await fetchWalks();
        if (Array.isArray(fetchedWalks)) {
          setWalks(fetchedWalks);
          setFilteredWalks(fetchedWalks);
        } else {
          throw new Error('Invalid data received from server');
        }
      } catch (err) {
        console.error('Error loading walks:', err);
        setError('Failed to fetch walks. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadWalks();
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const filtered = walks.filter(walk => 
      walk?.attributes?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      walk?.attributes?.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredWalks(filtered);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SEOMetaTags
        title="Search Dog Walks in Dover - Find the Perfect Walk for You and Your Dog"
        description="Search for dog-friendly walks in Dover and surrounding areas. Filter by location, duration, and difficulty to find the perfect walk for you and your furry friend."
        canonicalUrl={`${window.location.origin}/search`}
      />

      <h1 className="text-3xl font-bold text-gray-800 mb-6">Find Dog Walks in Dover</h1>
      
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex">
          <input
            type="text"
            placeholder="Search for walks..."
            className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn-primary rounded-l-none flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Search
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredWalks.length > 0 ? (
          filteredWalks.map((walk) => (
            walk?.attributes && (
              <Link
                key={walk.id}
                to={`/blog/${walk.attributes.slug}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                {walk.attributes.image?.data?.attributes?.url && (
                  <img
                    src={walk.attributes.image.data.attributes.url}
                    alt={walk.attributes.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {walk.attributes.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {walk.attributes.overview}
                  </p>
                  <div className="flex items-center text-gray-500 mb-2">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{walk.attributes.address}</span>
                  </div>
                  <div className="flex items-center text-gray-500 mb-2">
                    <Clock className="h-5 w-5 mr-2" />
                    <span>{walk.attributes.duration}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Star className="h-5 w-5 mr-2" />
                    <span>{walk.attributes.difficulty}</span>
                  </div>
                  <div className="mt-2 text-primary font-semibold">
                    Rating: {walk.attributes.rating.toFixed(1)}
                  </div>
                </div>
              </Link>
            )
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-600">
              {searchTerm ? 'No walks found matching your search.' : 'No walks available at the moment.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;