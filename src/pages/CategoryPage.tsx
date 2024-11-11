import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, Star } from 'lucide-react';
import { fetchWalks } from '../api/strapi';
import Breadcrumbs from '../components/Breadcrumbs';
import { Helmet } from 'react-helmet-async';

interface Walk {
  id: number;
  attributes: {
    title: string;
    slug: string;
    rating: number;
    town: {
      data?: {
        attributes?: {
          name: string;
          county?: {
            data?: {
              attributes?: {
                name: string;
              };
            };
          };
        };
      };
    };
    duration: string;
    difficulty: string;
    overview: string;
    image: {
      data?: {
        attributes?: {
          formats?: {
            medium?: {
              url?: string;
            };
          };
        };
      };
    };
  };
}

const CategoryPage: React.FC = () => {
  const { county, town } = useParams<{ county?: string; town?: string }>();
  const [walks, setWalks] = useState<Walk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWalks = async () => {
      try {
        setLoading(true);
        let filters = {};

        // Only add filters if county/town are provided
        if (county) {
          if (town) {
            filters = { town: town.toLowerCase() };
          } else {
            filters = { location: county.toLowerCase() };
          }
        }

        const fetchedWalks = await fetchWalks(filters);
        setWalks(Array.isArray(fetchedWalks) ? fetchedWalks : []);
      } catch (error) {
        console.error('Error loading walks:', error);
        setWalks([]);
      } finally {
        setLoading(false);
      }
    };

    loadWalks();
  }, [county, town]);

  const getBreadcrumbItems = () => {
    const items = [];

    if (county) {
      const capitalizedCounty = county.charAt(0).toUpperCase() + county.slice(1).toLowerCase();
      items.push({
        label: `Dog Walks in ${capitalizedCounty}`,
        path: `/dog-walks/${county.toLowerCase()}`
      });

      if (town) {
        const capitalizedTown = town.charAt(0).toUpperCase() + town.slice(1).toLowerCase();
        items.push({
          label: `Dog Walks in ${capitalizedTown}`,
          path: `/dog-walks/${county.toLowerCase()}/${town.toLowerCase()}`
        });
      }
    } else {
      items.push({
        label: 'Dog Walks',
        path: '/dog-walks'
      });
    }

    return items;
  };

  const getPageTitle = () => {
    if (town && county) {
      const capitalizedTown = town.charAt(0).toUpperCase() + town.slice(1).toLowerCase();
      const capitalizedCounty = county.charAt(0).toUpperCase() + county.slice(1).toLowerCase();
      return `Dog Walks in ${capitalizedTown}, ${capitalizedCounty}`;
    }
    if (county) {
      const capitalizedCounty = county.charAt(0).toUpperCase() + county.slice(1).toLowerCase();
      return `Dog Walks in ${capitalizedCounty}`;
    }
    return 'Dog Walks';
  };

  const getMetaDescription = () => {
    if (town && county) {
      return `Discover the best dog walks in ${town}, ${county}. Find dog-friendly walking routes, parks, and trails perfect for your furry friend.`;
    }
    if (county) {
      return `Discover the best dog walks in ${county}. Find dog-friendly walking routes, parks, and trails perfect for your furry friend.`;
    }
    return 'Discover dog-friendly walks near you. Find the best walking routes, parks, and trails for you and your dog.';
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
        <meta name="description" content={getMetaDescription()} />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        <Breadcrumbs items={getBreadcrumbItems()} />

        <h1 className="text-4xl font-bold text-gray-800 mb-8">{getPageTitle()}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {walks.map((walk) => (
            <Link 
              key={walk.id}
              to={`/walks/${walk.attributes.slug}`}
              className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {walk.attributes.image?.data?.attributes?.formats?.medium?.url && (
                <img 
                  src={walk.attributes.image.data.attributes.formats.medium.url}
                  alt={`${walk.attributes.title} dog walking route`}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              )}
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{walk.attributes.title}</h2>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="text-sm truncate">
                    {walk.attributes.town?.data?.attributes?.name ?? 'Location unavailable'}
                  </span>
                </div>
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
          ))}
        </div>

        {walks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No walks found in this area yet.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default CategoryPage;