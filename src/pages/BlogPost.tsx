import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Clock, Star, Building, Mountain, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
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
  Town?: string;
  Features2?: string[];
  Terrain2?: string[];
  image: Array<{
    url: string;
    formats: {
      large: { url: string; };
      medium: { url: string; };
      small: { url: string; };
    };
  }>;
  gallery?: Array<{
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
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  const handleNextImage = () => {
    if (!post?.gallery) return;
    setCurrentImageIndex((prev) => 
      prev === post.gallery!.length - 1 ? 0 : prev + 1
    );
  };

  const handlePreviousImage = () => {
    if (!post?.gallery) return;
    setCurrentImageIndex((prev) => 
      prev === 0 ? post.gallery!.length - 1 : prev - 1
    );
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') handleNextImage();
    if (e.key === 'ArrowLeft') handlePreviousImage();
    if (e.key === 'Escape') setIsGalleryOpen(false);
  };

  useEffect(() => {
    if (isGalleryOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isGalleryOpen, post?.gallery]);

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
  const allImages = [
    ...(post.image || []),
    ...(post.gallery || [])
  ];

  return (
    <article className="max-w-3xl mx-auto">
      <Breadcrumbs items={breadcrumbItems} />
      
      <SEOMetaTags
        title={post.seo.metaTitle}
        description={post.seo.metaDescription}
        canonicalUrl={`${window.location.origin}/dog-walks/${post.slug}`}
        ogImage={imageUrl}
      />

      {/* Main Image */}
      {imageUrl && (
        <div className="relative cursor-pointer" onClick={() => setIsGalleryOpen(true)}>
          <img 
            src={imageUrl}
            alt={post.Title} 
            className="w-full h-64 md:h-96 object-cover rounded-lg mb-6"
          />
          {allImages.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              +{allImages.length - 1} more
            </div>
          )}
        </div>
      )}

      <h1 className="text-4xl font-bold text-gray-800 mb-4">{post.Title}</h1>

      {/* Location Info */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {post.address && (
          <div className="flex items-center text-gray-600">
            <MapPin className="h-5 w-5 mr-2" />
            <span>{post.address}</span>
          </div>
        )}
        {post.Town && (
          <div className="flex items-center text-gray-600">
            <Building className="h-5 w-5 mr-2" />
            <span>{post.Town}</span>
          </div>
        )}
      </div>

      {/* Walk Details */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center text-gray-600">
          <Clock className="h-5 w-5 mr-2" />
          <span>{post.duration}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Mountain className="h-5 w-5 mr-2" />
          <span>{post.difficulty}</span>
        </div>
        {post.rating && (
          <div className="flex items-center text-gray-600">
            <Star className="h-5 w-5 mr-2" />
            <span>Rating: {post.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Features and Terrain */}
      {(post.Features2?.length > 0 || post.Terrain2?.length > 0) && (
        <div className="grid md:grid-cols-2 gap-8 mb-8 bg-gray-50 p-6 rounded-lg">
          {post.Features2?.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Features</h2>
              <ul className="space-y-2">
                {post.Features2.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-600">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {post.Terrain2?.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Terrain</h2>
              <ul className="space-y-2">
                {post.Terrain2.map((terrain, index) => (
                  <li key={index} className="flex items-center text-gray-600">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                    {terrain}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Map */}
      {post.address && (
        <div className="mb-8 h-96">
          <Map address={post.address} />
        </div>
      )}

      {/* Overview */}
      <div 
        className="prose prose-lg mb-8"
        dangerouslySetInnerHTML={{ __html: post.overview }}
      ></div>

      {/* Thumbnail Gallery */}
      {allImages.length > 1 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {allImages.map((image, index) => (
              <div
                key={index}
                className="relative cursor-pointer group"
                onClick={() => {
                  setCurrentImageIndex(index);
                  setIsGalleryOpen(true);
                }}
              >
                <img
                  src={image.formats.medium.url}
                  alt={`${post.Title} - Image ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg transition-transform duration-200 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 rounded-lg transition-opacity duration-200"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Website Link */}
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

      {/* Image Gallery Modal */}
      <Transition show={isGalleryOpen} as={React.Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => setIsGalleryOpen(false)}
        >
          <div className="min-h-screen text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-black opacity-90" />
            </Transition.Child>

            <div className="fixed inset-0 flex items-center justify-center">
              <div className="relative w-full max-w-6xl px-4">
                {/* Close button */}
                <button
                  onClick={() => setIsGalleryOpen(false)}
                  className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
                >
                  <X size={24} />
                </button>

                {/* Navigation arrows */}
                <button
                  onClick={handlePreviousImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
                >
                  <ChevronLeft size={36} />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
                >
                  <ChevronRight size={36} />
                </button>

                {/* Main image */}
                <img
                  src={allImages[currentImageIndex].formats.large.url}
                  alt={`${post.Title} - Image ${currentImageIndex + 1}`}
                  className="max-h-[85vh] mx-auto object-contain"
                />

                {/* Image counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
                  {currentImageIndex + 1} / {allImages.length}
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    </article>
  );
};

export default BlogPost;
