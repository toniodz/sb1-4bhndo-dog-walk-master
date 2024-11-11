import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, Star } from 'lucide-react';
import { fetchWalks } from '../api/strapi';
import Breadcrumbs from '../components/Breadcrumbs';
import { Helmet } from 'react-helmet-async';

interface Walk {
  id: number;
  attributes: {
    Title: string;
    slug: string;
    rating: number | null;
    address: string;
    duration: string;
    difficulty: string;
    overview?: string;
    county: {
      data: {
        attributes: {
          name: string;
          slug: string;
        }
      } | null;
    } | null;
    town: {
      data: {
        attributes: {
          name: string;
          slug: string;
        }
      } | null;
    } | null;
    image: {
      data?: {
        attributes?: {
          url?: string;
        };
      } | null;
    };
  };
}

const CategoryPage: React.FC = () => {
  const { county, town } = useParams<{ county?: string; town?: string }>();
  const [walks, setWalks] = useState<Walk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWalks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const filters = {
          county: county?.toLowerCase(),
          town: town?.toLowerCase()
        };
        
        const fetchedWalks = await fetchWalks(filters);
        setWalks(Array.isArray(fetchedWalks) ? fetchedWalks : []);
      } catch (err) {
        console.error('Error loading walks:', err);
        setError('Failed to load walks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadWalks();
  }, [county, town]);

  const getBreadcrumbItems = () => {
    const items = [
      { label: 'Dog Walks', path: '/dog-walks' }
    ];

    if (county) {
      items.push({
        label: `Dog Walks in ${county.charAt(0).toUpperCase() + county.slice(1)}`,
        path: `/dog-walks/${county.toLowerCase()}`
      });

      if (town) {
        items.push({
          label: `Dog Walks in ${town.charAt(0).toUpperCase() + town.slice(1)}`,
          path: `/dog-walks/${county.toLowerCase()}/${town.toLowerCase()}`
        });
      }
    }

    return items;
  };

  const getPageTitle = () => {
    if (town && county) {
      return `Dog Walks in ${town.charAt(0).toUpperCase() + town.slice(1)}, ${county.charAt(0).toUpperCase() + county.slice(1)}`;
    }
    if (county) {
      return `Dog Walks in ${county.charAt(0).toUpperCase() + county.slice(1)}`;
    }
    return 'Dog Walks';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{getPageTitle()} | Dog Walks Near Me</title>
        <meta 
          name="description" 
          content={`Discover dog-friendly walks in ${county}${town ? ` and ${town}` : ''}. Find the perfect walking route for you and your furry friend.`} 
        />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        <Breadcrumbs items={getBreadcrumbItems()} />

        <h1 className="text-4xl font-bold text-gray-800 mb-8">{getPageTitle()}</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {walks.map((walk) => {
            // Safely access nested properties
            const townName = walk?.attributes?.town?.data?.attributes?.name;
            const countyName = walk?.attributes?.county?.data?.attributes?.name;
            const imageUrl = walk?.attributes?.image?.data?.attributes?.url;

            return (
              <Link 
                key={walk.id}
                to={`/walks/${walk.attributes.slug}`}
                className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {imageUrl && (
                  <img 
                    src={imageUrl}
                    alt={`${walk.attributes.Title} dog walking route`}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                )}
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">{walk.attributes.Title}</h2>
                  {(townName || countyName) && (
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="text-sm truncate">
                        {[townName, countyName].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-600 mb-2">
                    <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{walk.attributes.duration}</span>
                  </div>
                  {walk.attributes.rating && (
                    <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <Star className="h-4 w-4 mr-1" />
                      {walk.attributes.rating.toFixed(1)}
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
    </>
  );
};

export default CategoryPage;