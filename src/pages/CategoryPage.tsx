import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Star } from 'lucide-react';
import { fetchWalks, fetchLocations } from '../api/strapi';
import Breadcrumbs from '../components/Breadcrumbs';
import { Helmet } from 'react-helmet-async';

interface Walk {
  id: number;
  attributes?: {
    Title?: string;
    slug?: string;
    rating?: number | null;
    address?: string;
    duration?: string;
    difficulty?: string;
    overview?: string;
    Town?: string;
    Region?: string;
    image?: {
      data?: {
        attributes?: {
          url?: string;
        };
      };
    };
  };
}

interface Locations {
  counties: string[];
  towns: string[];
}

const CategoryPage: React.FC = () => {
  const { county, town } = useParams<{ county?: string; town?: string }>();
  const navigate = useNavigate();
  const [walks, setWalks] = useState<Walk[]>([]);
  const [locations, setLocations] = useState<Locations>({ counties: [], towns: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load locations and validate current route
  useEffect(() => {
    const validateRoute = async () => {
      try {
        setLoading(true);
        const locationData = await fetchLocations();
        setLocations(locationData);

        // Validate if current county/town exists in our data
        if (county && !locationData.counties.map(c => c.toLowerCase()).includes(county.toLowerCase())) {
          navigate('/dog-walks', { replace: true });
          return;
        }

        if (town && !locationData.towns.map(t => t.toLowerCase()).includes(town.toLowerCase())) {
          navigate(`/dog-walks/${county}`, { replace: true });
          return;
        }

        // Load walks after location validation
        const filters = {
          ...(county ? { county: county.toLowerCase() } : {}),
          ...(town ? { town: town.toLowerCase() } : {})
        };

        const fetchedWalks = await fetchWalks(filters);
        setWalks(fetchedWalks);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    validateRoute();
  }, [county, town, navigate]);

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

  // Show available locations on the main dog walks page
  if (!county && !town) {
    return (
      <div className="max-w-7xl mx-auto">
        <Helmet>
          <title>Dog Walks Near Me | Find Local Dog Walking Routes</title>
          <meta 
            name="description" 
            content="Discover dog-friendly walks across the UK. Find the perfect walking route for you and your furry friend in your local area." 
          />
        </Helmet>

        <Breadcrumbs items={getBreadcrumbItems()} />

        <h1 className="text-4xl font-bold text-gray-800 mb-8">Dog Walks by Location</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.counties.map((countyName) => (
            <Link
              key={countyName}
              to={`/dog-walks/${countyName.toLowerCase()}`}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold">Dog Walks in {countyName}</h2>
              <p className="text-gray-600 mt-2">
                Discover dog-friendly walks in {countyName}
              </p>
            </Link>
          ))}
        </div>
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
            if (!walk?.attributes?.slug || !walk?.attributes?.Title) {
              return null;
            }

            return (
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
                  <h2 className="text-xl font-semibold mb-2">{walk.attributes.Title}</h2>
                  {walk.attributes.Town && (
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="text-sm truncate">
                        {walk.attributes.Town}
                        {walk.attributes.Region && `, ${walk.attributes.Region}`}
                      </span>
                    </div>
                  )}
                  {walk.attributes.duration && (
                    <div className="flex items-center text-gray-600 mb-2">
                      <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{walk.attributes.duration}</span>
                    </div>
                  )}
                  {walk.attributes.rating && (
                    <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <Star className="h-4 w-4 mr-1" />
                      {walk.attributes.rating.toFixed(1)}
                    </div>
                  )}
                </div>
              </Link>
            );
          }).filter(Boolean)}
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