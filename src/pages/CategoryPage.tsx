// CategoryPage.tsx
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
        console.log('Loading walks for:', { region, town });

        const filters = {};
        if (town) {
          filters.town = town;
        } else if (region) {
          filters.region = region;
        }

        const fetchedWalks = await fetchWalks(filters);
        setWalks(fetchedWalks);
      } catch (error) {
        console.error('Error loading walks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWalks();
  }, [region, town]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">
        {town ? `Dog Walks in ${town}` : 
         region ? `Dog Walks in ${region}` : 
         'All Dog Walks'}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {walks.map((walk) => (
          <Link 
            key={walk.id}
            to={`/dog-walks/${walk.slug}`}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            {walk.image?.[0]?.formats?.medium?.url && (
              <img 
                src={walk.image[0].formats.medium.url}
                alt={walk.Title || 'Walk image'}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{walk.Title}</h2>
              {walk.Town && (
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{walk.Town}</span>
                </div>
              )}
              {walk.duration && (
                <div className="flex items-center text-gray-600 mb-2">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="text-sm">{walk.duration}</span>
                </div>
              )}
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
    </div>
  );
};

export default CategoryPage;
