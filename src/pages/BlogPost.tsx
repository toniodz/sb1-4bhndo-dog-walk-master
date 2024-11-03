// src/pages/BlogPost.tsx - PART 1
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, Star, Building, Facebook, Twitter, Link as LinkIcon } from 'lucide-react';
import { fetchWalkBySlug, getRelatedWalks } from '../api/strapi';
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
  createdAt: string;
  updatedAt: string;
  image: Array<{
    formats: {
      large: { url: string; };
      medium: { url: string; };
      small: { url: string; };
    };
  }>;
}

// Separate SocialShare component with fixed JSX
const SocialShare: React.FC<{ 
  url: string; 
  title: string; 
  description: string; 
}> = ({ url, title, description }) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium text-gray-600">Share:</span>
      
      
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-700 transition-colors"
        aria-label="Share on Facebook"
      >
        <Facebook className="h-5 w-5" />
      </a>

      
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sky-500 hover:text-sky-600 transition-colors"
        aria-label="Share on Twitter"
      >
        <Twitter className="h-5 w-5" />
      </a>

      <button
        onClick={copyToClipboard}
        className="text-gray-600 hover:text-gray-700 transition-colors"
        aria-label="Copy link"
      >
        <LinkIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

// Schema markup function
const getEnhancedSchemaMarkup = (post: WalkData, relatedWalks: WalkData[]) => {
  const baseUrl = 'https://dogwalksnearme.uk';
  
  return [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": post.Title,
      "description": post.overview,
      "image": post.image?.[0]?.formats?.large?.url,
      "author": {
        "@type": "Organization",
        "name": "Dog Walks Near Me",
        "url": baseUrl
      },
      "publisher": {
        "@type": "Organization",
        "name": "Dog Walks Near Me",
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/logo.png`
        }
      },
      "datePublished": post.createdAt,
      "dateModified": post.updatedAt,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `${baseUrl}/walks/${post.slug}`
      }
    },
    {
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
      "photo": post.image?.map(img => img.formats.large.url),
      "review": post.rating ? {
        "@type": "AggregateRating",
        "ratingValue": post.rating,
        "bestRating": "5",
        "worstRating": "1",
        "ratingCount": "1"
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
    },
    {
      "@context": "https://schema.org",
      "@type": "Trail",
      "name": post.Title,
      "description": post.overview,
      "difficulty": post.difficulty,
      "image": post.image?.[0]?.formats?.large?.url,
      "isAccessibleForFree": true,
      "petsAllowed": true,
      "location": {
        "@type": "Place",
        "name": post.Town,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": post.Town,
          "addressRegion": "Kent",
          "addressCountry": "UK"
        }
      }
    },
    ...(relatedWalks.length > 0 ? [{
      "@context": "https://schema.org",
      "@type": "Recommendation",
      "about": post.Title,
      "category": "Dog Walks",
      "recommendationStrength": "Strong",
      "itemReviewed": relatedWalks.map(walk => ({
        "@type": "Place",
        "name": walk.Title,
        "image": walk.image?.[0]?.formats?.large?.url,
        "url": `${baseUrl}/walks/${walk.slug}`
      }))
    }] : [])
  ];
};

// Part 2 - continuation of BlogPost.tsx

const BlogPost: React.FC = () => {
 const { slug } = useParams<{ slug: string }>();
 const [post, setPost] = useState<WalkData | null>(null);
 const [relatedWalks, setRelatedWalks] = useState<WalkData[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
   const fetchData = async () => {
     try {
       setLoading(true);
       const fetchedPost = await fetchWalkBySlug(slug as string);
       setPost(fetchedPost);
       
       if (fetchedPost) {
         const related = await getRelatedWalks(fetchedPost);
         setRelatedWalks(related);
       }
     } catch (error) {
       console.error('Error:', error);
       setError(error instanceof Error ? error.message : 'Failed to load walk');
     } finally {
       setLoading(false);
     }
   };

   if (slug) {
     fetchData();
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
 const pageUrl = `https://dogwalksnearme.uk/walks/${post.slug}`;

 return (
   <>
     <Helmet>
       <title>{`${post.Title} - Dog Walks Near Me`}</title>
       <meta name="description" content={`Explore ${post.Title} - A ${post.difficulty} dog walk in ${post.Town}, Kent. ${post.duration} walking route perfect for you and your dog.`} />
       <meta property="og:title" content={`${post.Title} - Dog Walks Near Me`} />
       <meta property="og:description" content={`Explore ${post.Title} - A ${post.difficulty} dog walk in ${post.Town}, Kent. ${post.duration} walking route perfect for you and your dog.`} />
       <meta property="og:type" content="article" />
       <meta property="og:url" content={pageUrl} />
       {mainImage && <meta property="og:image" content={mainImage} />}
       <script type="application/ld+json">
         {JSON.stringify(getEnhancedSchemaMarkup(post, relatedWalks))}
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
         <div className="mb-8 h-96">
           <Map address={post.address} />
         </div>
       )}

       <div 
         className="prose prose-lg max-w-none mb-8"
         dangerouslySetInnerHTML={{ __html: post.overview }}
       />

       <div className="border-t border-gray-200 pt-6 mb-8">
         <SocialShare 
           url={pageUrl}
           title={post.Title}
           description={`Explore ${post.Title} - A ${post.difficulty} dog walk in ${post.Town}, Kent`}
         />
       </div>

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

       {relatedWalks.length > 0 && (
         <div className="border-t border-gray-200 pt-8 mt-8">
           <h2 className="text-2xl font-bold text-gray-800 mb-6">More Walks in {post.Town}</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {relatedWalks.map((walk) => (
               <Link
                 key={walk.id}
                 to={`/walks/${walk.slug}`}
                 className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-duration-300"
               >
                 {walk.image?.[0]?.formats?.medium?.url && (
                   <img
                     src={walk.image[0].formats.medium.url}
                     alt={walk.Title}
                     className="w-full h-48 object-cover"
                   />
                 )}
                 <div className="p-4">
                   <h3 className="font-semibold text-lg mb-2">{walk.Title}</h3>
                   <div className="flex items-center text-gray-600">
                     <Clock className="h-4 w-4 mr-1" />
                     <span className="text-sm">{walk.duration}</span>
                   </div>
                 </div>
               </Link>
             ))}
           </div>
         </div>
       )}
     </article>
   </>
 );
};

export default BlogPost;
