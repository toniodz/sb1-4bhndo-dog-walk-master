// src/pages/CategoryPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchWalks } from '../api/strapi';
import { MapPin, Clock, Star } from 'lucide-react';

const CategoryPage: React.FC = () => {
  const { region, town } = useParams<{ region?: string; town?: string }>();
  const [walks, setWalks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWalks = async () => {
      try {
        setLoading(true);
        console.log('Loading walks for:', { region, town }); // Debug log

        const filters: { region?: string; town?: string } = {};
        
        if (town) {
          filters.town = town;
        } else if (region) {
          filters.region = region;
        }

        console.log('Applying filters:', filters); // Debug log
        const fetchedWalks = await fetchWalks(filters);
        console.log('Fetched walks:', fetchedWalks); // Debug log
        setWalks(fetchedWalks);
      } catch (error) {
        console.error('Error loading walks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWalks();
  }, [region, town]);

  const getPageTitle = () => {
    if (town) return `Dog Walks in ${town}`;
    if (region) return `Dog Walks in ${region}`;
    return 'All Dog Walks';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">{getPageTitle()}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {walks.map((walk) => (
          // In CategoryPage.tsx, update the Link component
<Link 
  key={walk.id}
  to={`/walks/${walk.slug}`} // Changed from /dog-walks/
  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
>
            {walk.image?.[0]?.formats?.medium?.url && (
              <img 
                src={walk.image[0].formats.medium.url}
                alt={walk.Title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{walk.Title}</h2>
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm">{walk.Town}</span>
              </div>
              <div className="flex items-center text-gray-600 mb-2">
                <Clock className="h-4 w-4 mr-1" />
                <span className="text-sm">{walk.duration}</span>
              </div>
              {walk.rating && (
                <div className="flex items-center text-gray-600">
                  <Star className="h-4 w-4 mr-1" />
                  <span className="text-sm">{walk.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {walks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No walks found in this area.</p>
        </div>
      )}

      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">Debug Info:</h3>
          <pre className="text-sm">
            Region: {region || 'none'}<br />
            Town: {town || 'none'}<br />
            Walks found: {walks.length}
          </pre>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
