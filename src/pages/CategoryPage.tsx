import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, Star } from 'lucide-react';
import { fetchWalks, fetchCounties, fetchTowns } from '../api/strapi';
import Breadcrumbs from '../components/Breadcrumbs';
import { Helmet } from 'react-helmet-async';

// Types from your Strapi structure
interface County {
  id: number;
  attributes: {
    name: string;
    slug: string;
    type: string;
    country: string;
    description?: any;
  };
}

interface Town {
  id: number;
  attributes: {
    name: string;
    slug: string;
    postcode_area: string;
    type: string;
    description?: any;
  };
}

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
    featured: boolean;
    county?: {
      data?: {
        id: number;
        attributes: County;
      };
    };
    town?: {
      data?: {
        id: number;
        attributes: Town;
      };
    };
    image?: {
      data?: {
        attributes?: {
          url?: string;
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
  const [counties, setCounties] = useState<County[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!county) {
          // On main page, load counties
          const countiesData = await fetchCounties();
          setCounties(countiesData);
        } else {
          // Load walks filtered by county/town
          const filters = {
            county: county,
            ...(town && { town: town })
          };
          const walksData = await fetchWalks(filters);
          setWalks(walksData);
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
    return 'Dog Walks by Location';
  };

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
          <title>Dog Walks by Location | Dog Walks Near Me</title>
          <meta 
            name="description" 
            content="Discover dog-friendly walks across different locations. Find the perfect walking route for you and your furry friend." 
          />
        </Helmet>

        <Breadcrumbs items={getBreadcrumbItems()} />
        
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Dog Walks by Location</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {counties.map((county) => (
            <Link
              key={county.id}
              to={`/dog-walks/${county.attributes.slug}`}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold">
                Dog Walks in {county.attributes.name}
              </h2>
              <p className="mt-2 text-gray-600">
                Find dog-friendly walks in {county.attributes.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Show walks for county/town
  return (
    <div className="max-w-7xl mx-auto">
      <Helmet>
        <title>{getPageTitle()} | Dog Walks Near Me</title>
        <meta 
          name="description" 
          content={`Discover dog-friendly walks in ${county}${town ? ` and ${town}` : ''}. Find the perfect walking route for you and your furry friend.`} 
        />
      </Helmet>

      <Breadcrumbs items={getBreadcrumbItems()} />

      <h1 className="text-4xl font-bold text-gray-800 mb-8">{getPageTitle()}</h1>
        
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {walks.map((walk) => (
          <Link 
            key={walk.id}
            to={`/walks/${walk.attributes.slug}`}
            className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
          >
            {walk.attributes.image?.data?.attributes?.url && (
              <img 
                src={walk.attributes.image.data.attributes.url}
                alt={`${walk.attributes.Title} dog walking route`}
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">
                {walk.attributes.Title}
              </h2>
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="text-sm truncate">{walk.attributes.address}</span>
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

      {walks.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-gray-600">No walks found in this area yet.</p>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;