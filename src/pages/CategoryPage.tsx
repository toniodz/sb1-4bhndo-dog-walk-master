// src/pages/CategoryPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, Star } from 'lucide-react';
import { fetchWalks } from '../api/strapi';
import Breadcrumbs from '../components/Breadcrumbs';
import { Helmet } from 'react-helmet-async';

interface Walk {
 id: number;
 Title: string;
 slug: string;
 rating: number;
 Town: string;
 duration: string;
 difficulty: string;
 overview: string;
 image: Array<{
   formats: {
     medium: {
       url: string;
     };
   };
 }>;
}

const CategoryPage: React.FC = () => {
 const { location } = useParams<{ location?: string }>();
 const [walks, setWalks] = useState<Walk[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
   const loadWalks = async () => {
     try {
       setLoading(true);
       let filters = {};

       if (location && location.toLowerCase() !== 'kent') {
         filters = { town: location.toLowerCase() };
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
 }, [location]);

 const getPageTitle = () => {
   if (!location) return 'Dog Walks in Kent';
   return `Dog Walks in ${location.charAt(0).toUpperCase() + location.slice(1)}`;
 };

 const getBreadcrumbItems = () => {
   if (!location || location.toLowerCase() === 'kent') {
     return [
       { label: 'Dog Walks in Kent', path: '/dog-walks-in-kent' }
     ];
   }

   return [
     { label: 'Dog Walks in Kent', path: '/dog-walks-in-kent' },
     { 
       label: `Dog Walks in ${location.charAt(0).toUpperCase() + location.slice(1)}`, 
       path: `/dog-walks-in-${location.toLowerCase()}` 
     }
   ];
 };

 const getMetaDescription = () => {
   if (!location || location.toLowerCase() === 'kent') {
     return 'Discover the best dog walks in Kent. Find dog-friendly walking routes, parks, and trails perfect for your furry friend.';
   }
   return `Explore dog-friendly walks in ${location}. Find the best walking routes, parks, and trails for you and your dog.`;
 };

 // Schema markup for local business
 const getSchemaMarkup = () => {
   return {
     "@context": "https://schema.org",
     "@type": "CollectionPage",
     "name": getPageTitle(),
     "description": getMetaDescription(),
     "breadcrumb": {
       "@type": "BreadcrumbList",
       "itemListElement": getBreadcrumbItems().map((item, index) => ({
         "@type": "ListItem",
         "position": index + 1,
         "item": {
           "@id": `https://dogwalksnearme.uk${item.path}`,
           "name": item.label
         }
       }))
     },
     "mainEntity": {
       "@type": "ItemList",
       "itemListElement": walks.map((walk, index) => ({
         "@type": "ListItem",
         "position": index + 1,
         "item": {
           "@type": "Place",
           "name": walk.Title,
           "description": walk.overview,
           "image": walk.image?.[0]?.formats?.medium?.url,
           "address": {
             "@type": "PostalAddress",
             "addressLocality": walk.Town,
             "addressRegion": "Kent",
             "addressCountry": "UK"
           }
         }
       }))
     }
   };
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
       <meta property="og:title" content={getPageTitle()} />
       <meta property="og:description" content={getMetaDescription()} />
       <meta property="og:type" content="website" />
       <meta property="og:url" content={`https://dogwalksnearme.uk${location ? `/dog-walks-in-${location.toLowerCase()}` : '/dog-walks-in-kent'}`} />
       {walks[0]?.image?.[0]?.formats?.medium?.url && (
         <meta property="og:image" content={walks[0].image[0].formats.medium.url} />
       )}
       <script type="application/ld+json">
         {JSON.stringify(getSchemaMarkup())}
       </script>
     </Helmet>

     <div className="max-w-7xl mx-auto">
       <Breadcrumbs items={getBreadcrumbItems()} />

       <h1 className="text-4xl font-bold text-gray-800 mb-8">{getPageTitle()}</h1>
       
{/* Walks Section */}
<section className="py-16 bg-gray-50">
  <div className="container mx-auto px-4">
    <h2 className="text-3xl font-bold text-center mb-12">Featured Walks</h2>
    
    {error && (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    )}
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {walks.map((walk) => (
        <Link 
          key={walk.id}
          to={`/walks/${walk.slug}`}
          className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
        >
          {walk.image?.[0]?.formats?.medium?.url && (
            <img 
              src={walk.image[0].formats.medium.url}
              alt={`${walk.Title} dog walking route`}
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          )}
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-2">{walk.Title}</h2>
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="text-sm truncate">{walk.Town}</span>
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
  </div>
</section>

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
