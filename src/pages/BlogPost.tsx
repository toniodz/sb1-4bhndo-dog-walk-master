// src/pages/BlogPost.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Clock, Star, Building } from 'lucide-react';
import { fetchWalkBySlug } from '../api/strapi';
import Map from '../components/Map';
import Breadcrumbs from '../components/Breadcrumbs';
import { Helmet } from 'react-helmet-async';

interface WalkData {
 id: number;
 Title: string;
 slug: string;
 rating: number | null;
 Town: string;
 address: string | null;
 overview: string;
 website: string | null;
 duration: string;
 difficulty: string;
 image: Array<{
   formats: {
     large: { url: string; };
     medium: { url: string; };
     small: { url: string; };
   };
 }>;
}

const BlogPost: React.FC = () => {
 const { slug } = useParams<{ slug: string }>();
 const [post, setPost] = useState<WalkData | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
   const fetchPost = async () => {
     try {
       setLoading(true);
       const fetchedPost = await fetchWalkBySlug(slug as string);
       setPost(fetchedPost);
     } catch (error) {
       console.error('Error fetching post:', error);
       setError(error instanceof Error ? error.message : 'Failed to load walk');
     } finally {
       setLoading(false);
     }
   };

   if (slug) {
     fetchPost();
   }
 }, [slug]);

 const getBreadcrumbItems = (post: WalkData) => {
   return [
     { label: 'Dog Walks in Kent', path: '/dog-walks-in-kent' },
     { 
       label: `Dog Walks in ${post.Town}`, 
       path: `/dog-walks-in-${post.Town.toLowerCase()}` 
     },
     { 
       label: post.Title, 
       path: `/walks/${post.slug}` 
     }
   ];
 };

 // Schema markup for the walk
 const getSchemaMarkup = (post: WalkData) => {
   return {
     "@context": "https://schema.org",
     "@type": "Place",
     "name": post.Title,
     "description": post.overview,
     "address": {
       "@type": "PostalAddress",
       "addressLocality": post.Town,
       "addressRegion": "Kent",
       "addressCountry": "UK",
       "streetAddress": post.address || undefined
     },
     "image": post.image?.[0]?.formats?.large?.url,
     "review": post.rating ? {
       "@type": "Review",
       "reviewRating": {
         "@type": "Rating",
         "ratingValue": post.rating,
         "bestRating": "5"
       }
     } : undefined,
     "amenityFeature": [
       {
         "@type": "LocationFeatureSpecification",
         "name": "Dog Friendly",
         "value": true
       },
       {
         "@type": "LocationFeatureSpecification",
         "name": "Duration",
         "value": post.duration
       },
       {
         "@type": "LocationFeatureSpecification",
         "name": "Difficulty",
         "value": post.difficulty
       }
     ]
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
     <div className="max-w-3xl mx-auto px-4 py-8 text-center">
       <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Walk</h1>
       <p className="text-gray-600">{error}</p>
     </div>
   );
 }

 if (!post) {
   return (
     <div className="max-w-3xl mx-auto px-4 py-8 text-center">
       <h1 className="text-2xl font-bold text-gray-800 mb-4">Walk Not Found</h1>
       <p className="text-gray-600">The walk you're looking for doesn't exist or has been removed.</p>
     </div>
   );
 }

 const mainImage = post.image?.[0]?.formats?.large?.url;

 return (
   <>
     <Helmet>
       <title>{`${post.Title} - Dog Walks Near Me`}</title>
       <meta name="description" content={`Explore ${post.Title} - A ${post.difficulty} dog walk in ${post.Town}, Kent. ${post.duration} walking route perfect for you and your dog.`} />
       <meta property="og:title" content={`${post.Title} - Dog Walks Near Me`} />
       <meta property="og:description" content={`Explore ${post.Title} - A ${post.difficulty} dog walk in ${post.Town}, Kent. ${post.duration} walking route perfect for you and your dog.`} />
       <meta property="og:type" content="article" />
       <meta property="og:url" content={`https://dogwalksnearme.uk/walks/${post.slug}`} />
       {mainImage && <meta property="og:image" content={mainImage} />}
       <script type="application/ld+json">
         {JSON.stringify(getSchemaMarkup(post))}
       </script>
     </Helmet>

     <article className="max-w-3xl mx-auto">
       <Breadcrumbs items={getBreadcrumbItems(post)} />

       {mainImage && (
         <img 
           src={mainImage}
           alt={`${post.Title} dog walking route`}
           className="w-full h-64 md:h-96 object-cover rounded-lg mb-6"
         />
       )}

       <h1 className="text-4xl font-bold text-gray-800 mb-4">{post.Title}</h1>

       <div className="flex flex-wrap gap-4 mb-6">
         <div className="flex items-center text-gray-600">
           <Building className="h-5 w-5 mr-2" />
           <span>{post.Town}</span>
         </div>
         
         <div className="flex items-center text-gray-600">
           <Clock className="h-5 w-5 mr-2" />
           <span>{post.duration}</span>
         </div>
         
         <div className="flex items-center text-gray-600">
           <MapPin className="h-5 w-5 mr-2" />
           <span>{post.difficulty}</span>
         </div>

         {post.rating && (
           <div className="flex items-center text-gray-600">
             <Star className="h-5 w-5 mr-2" />
             <span>{post.rating.toFixed(1)}</span>
           </div>
         )}
       </div>

       {post.address && (
         <div className="mb-8">
           <Map address={post.address} />
         </div>
       )}

       <div 
         className="prose prose-lg max-w-none mb-8"
         dangerouslySetInnerHTML={{ __html: post.overview }}
       />

       {post.website && (
         <div className="mb-8">
           <h2 className="text-2xl font-bold text-gray-800 mb-2">More Information</h2>
           <a 
             href={post.website}
             target="_blank" 
             rel="noopener noreferrer" 
             className="text-primary hover:underline"
           >
             Visit Website
           </a>
         </div>
       )}

       {post.image && post.image.length > 1 && (
         <div className="mb-8">
           <h2 className="text-2xl font-bold text-gray-800 mb-4">Gallery</h2>
           <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
             {post.image.slice(1).map((image, index) => (
               <img
                 key={index}
                 src={image.formats.medium.url}
                 alt={`${post.Title} - Image ${index + 2}`}
                 className="w-full h-48 object-cover rounded-lg"
               />
             ))}
           </div>
         </div>
       )}
     </article>
   </>
 );
};

export default BlogPost;
