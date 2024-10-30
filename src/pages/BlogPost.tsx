import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Clock, Star } from 'lucide-react';
import { fetchWalkBySlug } from '../api/strapi';
import Map from '../components/Map';
import SEOMetaTags from '../components/SEOMetaTags';
import Breadcrumbs from '../components/Breadcrumbs';

interface WalkData {
  id: number;
  Title: string;
  slug: string;
  rating: number;
  address: string | null;
  overview: string;
  website: string | null;
  duration: string;
  difficulty: string;
  coordinates: { lat: number; lng: number; } | null;
  image: Array<{
    url: string;
    formats: {
      large: { url: string; };
      medium: { url: string; };
      small: { url: string; };
    };
  }>;
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
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
        setError(error instanceof Error ? error.message : 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!post) return <div>No post found</div>;

  const breadcrumbItems = [
    { label: 'Dog Walks', path: '/dog-walks' },
    { label: 'Kent', path: '/dog-walks/kent' },
    { label: 'Dover', path: '/dog-walks/kent/dover' },
    { label: post.Title, path: `/dog-walks/${post.slug}` }
  ];

  const imageUrl = post.image?.[0]?.formats?.large?.url || post.image?.[0]?.url;

  return (
    <article className="max-w-3xl mx-auto">
      <Breadcrumbs items={breadcrumbItems} />

      <SEOMetaTags
        title={post.seo.metaTitle}
        description={post.seo.metaDescription}
        canonicalUrl={`${window.location.origin}/dog-walks/${post.slug}`}
        ogImage={imageUrl}
      />

      {imageUrl && (
        <img 
          src={imageUrl}
          alt={post.Title} 
          className="w-full h-64 object-cover rounded-lg mb-6"
        />
      )}

      <h1 className="text-4xl font-bold text-gray-800 mb-4">{post.Title}</h1>

      {post.address && (
        <div className="flex items-center text-gray-600 mb-6">
          <MapPin className="h-5 w-5 mr-2" />
          <span className="mr-4">{post.address}</span>
          {post.rating && (
            <>
              <Star className="h-5 w-5 mr-2" />
              <span>Rating: {post.rating.toFixed(1)}</span>
            </>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center text-gray-600">
          <Clock className="h-5 w-5 mr-2" />
          <span>{post.duration}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Star className="h-5 w-5 mr-2" />
          <span>{post.difficulty}</span>
        </div>
      </div>

{post.address && (
  <div className="mb-8 h-96">
    <Map address={post.address} />
  </div>
)}

      <div 
        className="prose prose-lg mb-8"
        dangerouslySetInnerHTML={{ __html: post.overview }}
      ></div>

      {post.website && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Website</h2>
          <a 
            href={post.website}
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-primary hover:underline"
          >
            {post.website}
          </a>
        </div>
      )}
    </article>
  );
};

export default BlogPost;
