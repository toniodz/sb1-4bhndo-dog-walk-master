import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { MapPin, Clock, Star } from 'lucide-react';
import { fetchWalks, fetchCounties, fetchTowns } from '../api/strapi';
import Breadcrumbs from '../components/Breadcrumbs';
import { Helmet } from 'react-helmet-async';

// Define the different SEO types
interface SEOObject {
  id: number;
  metaTitle: string;
  metaDescription: string;
}

interface SEOArray extends Array<SEOObject> {}

interface LocationData {
  county?: County | null;
  town?: Town | null;
  walks: Walk[];
  counties?: County[];
}

// Helper function for rich text
const getRichText = (content: any): string => {
  if (typeof content === 'string') return content;
  if (Array.isArray(content) && content.length > 0 && content[0]?.children?.[0]?.text) {
    return content[0].children[0].text;
  }
  return '';
};

// Helper function to get SEO data
const getSEOData = (seo: SEOArray | SEOObject | undefined) => {
  if (!seo) return null;
  if (Array.isArray(seo)) {
    return seo[0] || null;
  }
  return seo;
};

const CategoryPage: React.FC = () => {
  const { county, town } = useParams<{ county?: string; town?: string }>();
  const location = useLocation();
  const [locationData, setLocationData] = useState<LocationData>({
    walks: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!county) {
          const counties = await fetchCounties();
          setLocationData({ walks: [], counties });
        } else {
          const [counties, walks] = await Promise.all([
            fetchCounties(),
            fetchWalks({ county, town })
          ]);

          const currentCounty = counties.find(c => c.slug === county);

          if (!currentCounty) {
            setError('County not found');
            return;
          }

          if (town) {
            const towns = await fetchTowns(county);
            const currentTown = towns.find(t => t.slug === town);
            
            if (!currentTown) {
              setError('Town not found');
              return;
            }

            setLocationData({
              county: currentCounty,
              town: currentTown,
              walks
            });
          } else {
            setLocationData({
              county: currentCounty,
              walks
            });
          }
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Error loading content');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [county, town]);

  const getBreadcrumbItems = () => {
    const items = [];

    items.push({
      label: 'Dog Walks',
      path: '/dog-walks'
    });

    if (county && locationData.county) {
      items.push({
        label: `Dog Walks in ${locationData.county.name}`,
        path: `/dog-walks/${county}`
      });

      if (town && locationData.town) {
        items.push({
          label: `Dog Walks in ${locationData.town.name}`,
          path: `/dog-walks/${county}/${town}`
        });
      }
    }

    return items;
  };

  const getSEOContent = () => {
    let seoData;
    let locationInfo;

    if (town && locationData.town) {
      seoData = getSEOData(locationData.town.seo);
      locationInfo = locationData.town;
    } else if (county && locationData.county) {
      seoData = getSEOData(locationData.county.seo);
      locationInfo = locationData.county;
    }

    const defaultTitle = 'Dog Walks Near Me';
    const defaultDescription = 'Find dog walks near you';
    const canonicalUrl = `https://dogwalksnearme.uk${location.pathname}`;
    const imageUrl = locationInfo?.featured_image?.url || '';

    return {
      title: seoData?.metaTitle || defaultTitle,
      description: seoData?.metaDescription || defaultDescription,
      canonical: canonicalUrl,
      image: imageUrl
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Location Not Found</h1>
        <p className="text-lg text-gray-600 mb-8">
          We couldn't find this location. It may be coming soon!
        </p>
        <Link
          to="/dog-walks"
          className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Browse All Locations
        </Link>
      </div>
    );
  }

  const seo = getSEOContent();

  // Counties listing page
  if (!county) {
    return (
      <>
        <Helmet>
          <title>Dog Walks by Location | Dog Walks Near Me</title>
          <meta 
            name="description" 
            content="Find dog walks across the UK. Browse by county to discover the perfect walking route for you and your dog."
          />
          <link rel="canonical" href="https://dogwalksnearme.uk/dog-walks" />
          <meta property="og:title" content="Dog Walks by Location | Dog Walks Near Me" />
          <meta property="og:description" content="Find dog walks across the UK. Browse by county to discover the perfect walking route for you and your dog." />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://dogwalksnearme.uk/dog-walks" />
          <meta name="twitter:card" content="summary_large_image" />
        </Helmet>

        <div className="max-w-7xl mx-auto">
          <Breadcrumbs items={getBreadcrumbItems()} />

          <h1 className="text-4xl font-bold text-gray-900 mb-8">Dog Walks by Location</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locationData.counties?.map((county) => (
              <Link
                key={county.id}
                to={`/dog-walks/${county.slug}`}
                className="group relative h-64 overflow-hidden rounded-lg shadow-md"
              >
                {county.image?.[0]?.url && (
                  <img
                    src={county.image[0].url}
                    alt={county.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-black/40 p-6 flex flex-col justify-end">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {county.name}
                  </h2>
                  <p className="text-white/90 line-clamp-2">
                    {getRichText(county.description)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </>
    );
  }

  // County or Town page
  const locationInfo = locationData.town || locationData.county;
  const heroImage = locationInfo?.featured_image?.url;

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <link rel="canonical" href={seo.canonical} />
        
        {/* OpenGraph tags */}
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={seo.canonical} />
        {seo.image && <meta property="og:image" content={seo.image} />}
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seo.title} />
        <meta name="twitter:description" content={seo.description} />
        {seo.image && <meta name="twitter:image" content={seo.image} />}
      </Helmet>

      <div className="max-w-7xl mx-auto">
        <Breadcrumbs items={getBreadcrumbItems()} />

        {/* Hero Section */}
        <div className="relative h-[400px] rounded-xl overflow-hidden mb-8">
          {heroImage ? (
            <img
              src={heroImage}
              alt={locationInfo?.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-center">
            <div className="max-w-3xl px-4">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Dog Walks in {locationInfo?.name}
              </h1>
              {locationInfo?.description && (
                <p className="text-lg text-white/90">
                  {getRichText(locationInfo.description)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Walks Grid or No Results */}
        {locationData.walks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locationData.walks.map((walk) => (
              <Link
                key={walk.id}
                to={`/walks/${walk.slug}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {walk.image?.[0]?.url && (
                  <img
                    src={walk.image[0].url}
                    alt={walk.Title}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                )}
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">{walk.Title}</h2>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm truncate">{walk.address}</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{walk.duration}</span>
                  </div>
                  {walk.rating && (
                    <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <Star className="h-4 w-4 mr-1" />
                      {walk.rating.toFixed(1)}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              No Walks Available Yet
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              We haven't added any walks in this area yet, but they're coming soon! 
              Would you like to help us expand our collection?
            </p>
            <Link
              to="/submit-walk"
              className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Submit a Walk
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default CategoryPage;