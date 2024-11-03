import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, Star, Building, Facebook, Twitter, Link as LinkIcon, Compass, List } from 'lucide-react';
import { fetchWalkBySlug, getRelatedWalks } from '../api/strapi';
import Map from '../components/Map';
import Breadcrumbs from '../components/Breadcrumbs';
import { Helmet } from 'react-helmet-async';

interface WalkData {
  id: number;
  attributes: {
    Title: string;
    slug: string;
    rating: number | null;
    Town: string;
    address: string | null;
    overview: string;
    website: string | null;
    duration: string;
    difficulty: string;
    terrain2: string | null;
    features2: string | null;
    createdAt: string;
    updatedAt: string;
    featuredImage: {
      data: {
        attributes: {
          url: string;
          formats: {
            large: { url: string; };
            medium: { url: string; };
            small: { url: string; };
          };
        };
      };
    };
    gallery: {
      data: Array<{
        id: number;
        attributes: {
          url: string;
          formats: {
            large: { url: string; };
            medium: { url: string; };
            small: { url: string; };
          };
        };
      }>;
    };
  };
}

const SocialShare: React.FC<{ url: string; title: string; description: string }> = ({ url, title, description }) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium text-gray-600">Share:</span>
      
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-700 transition-colors"
        aria-label="Share on Facebook"
      >
        <Facebook className="h-5 w-5" />
      </a>

      <a
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
        label: `Dog Walks in ${post.attributes.Town}`, 
        path: `/dog-walks-in-${post.attributes.Town.toLowerCase()}` 
      },
      { 
        label: post.attributes.Title, 
        path: `/walks/${post.attributes.slug}` 
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

  const { attributes } = post;
  const mainImage = attributes.featuredImage?.data?.attributes?.formats?.large?.url;
  const galleryImages = attributes.gallery?.data || [];
  const pageUrl = `https://dogwalksnearme.uk/walks/${attributes.slug}`;

  return (
    <>
      <Helmet>
        <title>{`${attributes.Title} - Dog Walks Near Me`}</title>
        <meta name="description" content={`Explore ${attributes.Title} - A ${attributes.difficulty} dog walk in ${attributes.Town}, Kent. ${attributes.duration} walking route perfect for you and your dog.`} />
        <meta property="og:title" content={`${attributes.Title} - Dog Walks Near Me`} />
        <meta property="og:description" content={`Explore ${attributes.Title} - A ${attributes.difficulty} dog walk in ${attributes.Town}, Kent. ${attributes.duration} walking route perfect for you and your dog.`} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={pageUrl} />
        {mainImage && <meta property="og:image" content={mainImage} />}
      </Helmet>

      <article className="max-w-3xl mx-auto px-4">
        <Breadcrumbs items={getBreadcrumbItems(post)} />

        {mainImage && (
          <img 
            src={mainImage}
            alt={`${attributes.Title} dog walking route`}
            className="w-full h-64 md:h-96 object-cover rounded-lg mb-6"
          />
        )}

        <h1 className="text-4xl font-bold text-gray-800 mb-4">{attributes.Title}</h1>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center text-gray-600">
            <Building className="h-5 w-5 mr-2" />
            <span>{attributes.Town}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Clock className="h-5 w-5 mr-2" />
            <span>{attributes.duration}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <MapPin className="h-5 w-5 mr-2" />
            <span>{attributes.difficulty}</span>
          </div>

          {attributes.rating && (
            <div className="flex items-center text-gray-600">
              <Star className="h-5 w-5 mr-2" />
              <span>{attributes.rating.toFixed(1)}</span>
            </div>
          )}

          {attributes.terrain2 && (
            <div className="flex items-center text-gray-600">
              <Compass className="h-5 w-5 mr-2" />
              <span>{attributes.terrain2}</span>
            </div>
          )}

          {attributes.features2 && (
            <div className="flex items-center text-gray-600">
              <List className="h-5 w-5 mr-2" />
              <span>{attributes.features2}</span>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-6 mb-8">
          <SocialShare 
            url={pageUrl}
            title={attributes.Title}
            description={`Explore ${attributes.Title} - A ${attributes.difficulty} dog walk in ${attributes.Town}, Kent`}
          />
        </div>

        {attributes.address && (
          <div className="mb-8 h-96">
            <Map address={attributes.address} />
          </div>
        )}

        <div 
          className="prose prose-lg max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: attributes.overview }}
        />

        {galleryImages.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Gallery ({galleryImages.length} Images)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {galleryImages.map((image, index) => (
                <div key={image.id} className="relative">
                  <img
                    src={image.attributes.formats.medium.url}
                    alt={`${attributes.Title} - Image ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg hover:opacity-90 transition-opacity duration-300"
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                  <div className="absolute bottom-0 right-0 bg-black bg-opacity-50 text-white px-2 py-1 text-sm rounded-tl">
                    {index + 1}/{galleryImages.length}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {attributes.website && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">More Information</h2>
            <a 
              href={attributes.website}
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary hover:underline"
            >
              Visit Website
            </a>
          </div>
        )}

        {relatedWalks.length > 0 && (
          <div className="border-t border-gray-200 pt-8 mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">More Walks in {attributes.Town}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedWalks.map((walk) => (
                <Link
                  key={walk.id}
                  to={`/walks/${walk.attributes.slug}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-duration-300"
                >
                  {walk.attributes.featuredImage?.data?.attributes?.formats?.medium?.url && (
                    <img
                      src={walk.attributes.featuredImage.data.attributes.formats.medium.url}
                      alt={walk.attributes.Title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{walk.attributes.Title}</h3>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="text-sm">{walk.attributes.duration}</span>
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
