import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchWalks, fetchCounties, fetchTowns } from '../api/strapi';
import Breadcrumbs from '../components/Breadcrumbs';
import { Helmet } from 'react-helmet-async';
import { MapPin, Clock } from 'lucide-react';

interface Location {
  county?: string;
  town?: string;
}

const CategoryPage: React.FC = () => {
  const { county, town } = useParams<Location>();
  const [currentLocation, setCurrentLocation] = useState<{
    county?: any;
    town?: any;
  }>({});
  const [walks, setWalks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        if (!county) {
          // Load counties page
          const counties = await fetchCounties();
          setCurrentLocation({ counties });
        } else {
          // Load county/town page
          const filters = { county, ...(town && { town }) };
          const [walksData, counties] = await Promise.all([
            fetchWalks(filters),
            fetchCounties()
          ]);

          const currentCounty = counties.find(c => c.slug === county);
          
          if (town) {
            const towns = await fetchTowns(county);
            const currentTown = towns.find(t => t.slug === town);
            setCurrentLocation({ county: currentCounty, town: currentTown });
          } else {
            setCurrentLocation({ county: currentCounty });
          }

          setWalks(walksData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [county, town]);

  const breadcrumbItems = [
    { label: 'Dog Walks', path: '/dog-walks' },
    ...(county ? [{ 
      label: `Dog Walks in ${currentLocation.county?.name || county}`, 
      path: `/dog-walks/${county}` 
    }] : []),
    ...(town ? [{ 
      label: `Dog Walks in ${currentLocation.town?.name || town}`, 
      path: `/dog-walks/${county}/${town}` 
    }] : [])
  ];

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  // Counties listing page
  if (!county) {
    return (
      <div className="max-w-7xl mx-auto">
        <Helmet>
          <title>Dog Walks by Location | Dog Walks Near Me</title>
          <meta name="description" content="Find dog-friendly walks across the UK by location." />
        </Helmet>

        <Breadcrumbs items={breadcrumbItems} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentLocation.counties?.map((county: any) => (
            <Link 
              key={county.id} 
              to={`/dog-walks/${county.slug}`}
              className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
            >
              {county.featured_image?.data?.attributes?.url && (
                <div className="aspect-w-16 aspect-h-9">
                  <img 
                    src={county.featured_image.data.attributes.url}
                    alt={county.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 p-6 flex flex-col justify-end">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {county.name}
                </h2>
                <p className="text-white/90 line-clamp-2">
                  {county.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // County or Town page
  return (
    <div className="max-w-7xl mx-auto">
      <Helmet>
        <title>
          {currentLocation.town?.seo?.metaTitle || currentLocation.county?.seo?.metaTitle}
        </title>
        <meta 
          name="description" 
          content={currentLocation.town?.seo?.metaDescription || currentLocation.county?.seo?.metaDescription} 
        />
      </Helmet>

      <Breadcrumbs items={breadcrumbItems} />

      {/* Hero Section */}
      <div className="relative h-[400px] rounded-xl overflow-hidden mb-8">
        <img
          src={currentLocation.town?.featured_image?.data?.attributes?.url || 
               currentLocation.county?.featured_image?.data?.attributes?.url}
          alt={currentLocation.town?.name || currentLocation.county?.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-center">
          <div className="max-w-3xl px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {currentLocation.town?.name || currentLocation.county?.name}
            </h1>
            <p className="text-lg text-white/90">
              {currentLocation.town?.description || currentLocation.county?.description}
            </p>
          </div>
        </div>
      </div>

      {/* Walks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {walks.map(walk => (
          <Link
            key={walk.id}
            to={`/walks/${walk.slug}`}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
          >
            {walk.featured_image?.data?.attributes?.url && (
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={walk.featured_image.data.attributes.url}
                  alt={walk.Title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{walk.Title}</h2>
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="text-sm">{walk.address}</span>
              </div>
              {walk.duration && (
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="text-sm">{walk.duration}</span>
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
  );
};

export default CategoryPage;