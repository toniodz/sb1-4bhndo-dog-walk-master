import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, Star } from 'lucide-react';
import { fetchWalks, fetchCounties, fetchTowns } from '../api/strapi';
import Breadcrumbs from '../components/Breadcrumbs';
import { Helmet } from 'react-helmet-async';

interface County {
  id: number;
  attributes?: {
    name?: string;
    slug?: string;
  };
}

interface Town {
  id: number;
  attributes?: {
    name?: string;
    slug?: string;
  };
}

interface Walk {
  id: number;
  attributes?: {
    Title?: string;
    slug?: string;
    address?: string;
    duration?: string;
    image?: {
      data?: {
        attributes?: {
          url?: string;
        };
      };
    };
  };
}

const CategoryPage: React.FC = () => {
  const { county, town } = useParams<{ county?: string; town?: string }>();
  const [walks, setWalks] = useState<Walk[]>([]);
  const [counties, setCounties] = useState<County[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!county) {
          // On main page, just load counties
          const countiesData = await fetchCounties();
          setCounties(countiesData || []);
        } else {
          // Load walks filtered by county/town
          const filters = {
            county: county?.toLowerCase(),
            ...(town && { town: town.toLowerCase() })
          };
          
          const walksData = await fetchWalks(filters);
          setWalks(walksData || []);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [county, town]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show counties list on main page
  if (!county) {
    return (
      <div className="max-w-7xl mx-auto">
        <Helmet>
          <title>Dog Walks by County | Dog Walks Near Me</title>
          <meta 
            name="description" 
            content="Discover dog-friendly walks across different counties. Find the perfect walking route for you and your furry friend." 
          />
        </Helmet>

        <h1 className="text-4xl font-bold text-gray-800 mb-8">Dog Walks by County</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {counties.map((county) => {
            // Only render if we have the required data
            if (!county?.attributes?.slug || !county?.attributes?.name) {
              return null;
            }

            return (
              <Link
                key={county.id}
                to={`/dog-walks/${county.attributes.slug}`}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <h2 className="text-xl font-semibold">
                  Dog Walks in {county.attributes.name}
                </h2>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  // Show walks for county/town
  return (
    <div className="max-w-7xl mx-auto">
      <Helmet>
        <title>
          Dog Walks in {town || county} | Dog Walks Near Me
        </title>
      </Helmet>

      <h1 className="text-4xl font-bold text-gray-800 mb-8">
        Dog Walks in {town ? `${town}, ${county}` : county}
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {walks.map((walk) => {
          // Only render if we have the required data
          if (!walk?.attributes?.slug || !walk?.attributes?.Title) {
            return null;
          }

          return (
            <Link 
              key={walk.id}
              to={`/walks/${walk.attributes.slug}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all"
            >
              {walk.attributes.image?.data?.attributes?.url && (
                <img 
                  src={walk.attributes.image.data.attributes.url}
                  alt={walk.attributes.Title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">
                  {walk.attributes.Title}
                </h2>
                {walk.attributes.address && (
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{walk.attributes.address}</span>
                  </div>
                )}
                {walk.attributes.duration && (
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{walk.attributes.duration}</span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {walks.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-gray-600">No walks found in this area yet.</p>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;