import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Clock, Star, ChevronRight } from 'lucide-react';
import { fetchWalkBySlug } from '../api/strapi';
import Map from '../components/Map';
import SEOMetaTags from '../components/SEOMetaTags';
import Breadcrumbs from '../components/Breadcrumbs';

interface BlogPostData {
 id: number;
 attributes: {
   title: string;
   overview: string;
   image: {
     data: {
       attributes: {
         url: string;
       };
     };
   };
   address: string;
   duration: string;
   difficulty: string;
   coordinates: {
     lat: number;
     lng: number;
   };
   seo: {
     metaTitle: string;
     metaDescription: string;
   };
   slug: string;
   rating: number;
   website?: string;
   createdAt: string;
   updatedAt: string;
 };
}

const BlogPost: React.FC = () => {
 const { slug } = useParams<{ slug: string }>();
 const [post, setPost] = useState<BlogPostData | null>(null);

 useEffect(() => {
   const fetchPost = async () => {
     try {
       const fetchedPost = await fetchWalkBySlug(slug as string);
       setPost(fetchedPost);
     } catch (error) {
       console.error('Error fetching blog post:', error);
     }
   };
   if (slug) {
     fetchPost();
   }
 }, [slug]);

 if (!post) {
   return <div>Loading...</div>;
 }

 const breadcrumbItems = [
   { label: 'Dog Walks', path: '/dog-walks' },
   { label: 'Kent', path: '/dog-walks/kent' },
   { label: 'Dover', path: '/dog-walks/kent/dover' },
   { label: post.attributes.title, path: `/dog-walks/${post.attributes.slug}` }
 ];

 const canonicalUrl = `${window.location.origin}/dog-walks/${post.attributes.slug}`;
 const ogImageUrl = `${import.meta.env.VITE_STRAPI_URL}${post.attributes.image.data.attributes.url}`;

 return (
   <article className="max-w-3xl mx-auto">
     <Breadcrumbs items={breadcrumbItems} />
     
     <script type="application/ld+json">
       {JSON.stringify({
         "@context": "https://schema.org",
         "@type": "Article",
         "headline": post.attributes.title,
         "description": post.attributes.seo.metaDescription,
         "image": ogImageUrl,
         "author": {
           "@type": "Organization",
           "name": "DogWalksNearMe"
         },
         "publisher": {
           "@type": "Organization",
           "name": "DogWalksNearMe",
           "logo": {
             "@type": "ImageObject",
             "url": `${window.location.origin}/logo.png`
           }
         },
         "datePublished": post.attributes.createdAt,
         "dateModified": post.attributes.updatedAt,
         "mainEntityOfPage": {
           "@type": "WebPage",
           "@id": canonicalUrl
         },
         "articleSection": "Dog Walks",
         "keywords": "dog walks, Dover, Kent, hiking with dogs"
       })}
     </script>

     <SEOMetaTags
       title={post.attributes.seo.metaTitle}
       description={post.attributes.seo.metaDescription}
       canonicalUrl={canonicalUrl}
       ogImage={ogImageUrl}
     />

     <img 
       src={ogImageUrl} 
       alt={post.attributes.title} 
       className="w-full h-64 object-cover rounded-lg mb-6" 
     />
     
     <h1 className="text-4xl font-bold text-gray-800 mb-4">
       {post.attributes.title}
     </h1>

     <div className="flex items-center text-gray-600 mb-6">
       <MapPin className="h-5 w-5 mr-2" />
       <span className="mr-4">{post.attributes.address}</span>
       <Star className="h-5 w-5 mr-2" />
       <span>Rating: {post.attributes.rating.toFixed(1)}</span>
     </div>

     <div className="flex flex-wrap gap-4 mb-6">
       <div className="flex items-center text-gray-600">
         <Clock className="h-5 w-5 mr-2" />
         <span>{post.attributes.duration}</span>
       </div>
       <div className="flex items-center text-gray-600">
         <Star className="h-5 w-5 mr-2" />
         <span>{post.attributes.difficulty}</span>
       </div>
     </div>

     <div className="mb-8 h-96">
       <Map center={post.attributes.coordinates} />
     </div>

     <div 
       className="prose prose-lg mb-8"
       dangerouslySetInnerHTML={{ __html: post.attributes.overview }}
     ></div>

     {post.attributes.website && (
       <div className="mb-8">
         <h2 className="text-2xl font-bold text-gray-800 mb-2">Website</h2>
         <a 
           href={post.attributes.website} 
           target="_blank" 
           rel="noopener noreferrer" 
           className="text-primary hover:underline"
         >
           {post.attributes.website}
         </a>
       </div>
     )}
   </article>
 );
};

export default BlogPost;
