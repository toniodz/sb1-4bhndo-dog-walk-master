// src/pages/CategoryPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchWalks } from '../api/strapi';
import { MapPin, Clock, Star } from 'lucide-react';

interface CategoryPageProps {
  type: 'region' | 'town'; // Add more types if needed
}

const CategoryPage: React.FC<CategoryPageProps> = ({ type }) => {
  const { region, town } = useParams<{ region?: string; town?: string }>();
  const [walks, setWalks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWalks = async () => {
      try {
        setLoading(true);
        const allWalks = await fetchWalks();
        
        // Filter walks based on category type
        const filteredWalks = allWalks.filter(walk => {
          if (type === 'region' && region) {
            return walk.Town?.toLowerCase().includes(region.toLowerCase());
          }
          if (type === 'town' && town) {
            return walk.Town?.toLowerCase() === town.toLowerCase();
          }
          return true; // Show all walks on the main walks page
        });

        setWalks(filteredWalks);
      } catch (error) {
        console.error('Error loading walks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWalks();
  }, [type, region, town]);

  const getTitle = () => {
    if (type === 'town' && town) return `Dog Walks in ${town}`;
    if (type === 'region' && region) return `Dog Walks in ${region}`;
    return 'All Dog Walks';
  };

  const getBreadcrumbs = () => {
    const crumbs = [
      { label: 'Dog Walks', path: '/dog-walks' }
    ];
    
    if (region) {
      crumbs.push({ label: region, path: `/dog-walks/${region.toLowerCase()}` });
    }
    
    if (town) {
      crumbs.push({ label: town, path: `/dog-walks/${region?.toLowerCase()}/${town.toLowerCase()}` });
    }

    return crumbs;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2">
          {getBreadcrumbs().map((crumb, index) => (
            <React.Fragment key={crumb.path}>
              {index > 0 && <span className="text-gray-400">/</span>}
              <li>
                <Link to={crumb.path} className="text-primary hover:underline">
                  {crumb.label}
                </Link>
              </li>
            </React.Fragment>
          ))}
        </ol>
      </nav>

      <h1 className="text-4xl font-bold text-gray-800 mb-8">{getTitle()}</h1>

      {/* Walks Grid */}
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
    </div>
  );
};

export default CategoryPage;
