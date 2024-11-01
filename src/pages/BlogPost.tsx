import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Clock, Star, Building, Mountain, X, ChevronLeft, ChevronRight } from 'lucide-react';
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

const ImageModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  images: any[];
  currentIndex: number;
  onNext: () => void;
  onPrevious: () => void;
}> = ({ isOpen, onClose, images, currentIndex, onNext, onPrevious }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300"
        aria-label="Close gallery"
      >
        <X size={24} />
      </button>

      <button
        onClick={onPrevious}
        className="absolute left-4 text-white hover:text-gray-300"
        aria-label="Previous image"
      >
        <ChevronLeft size={36} />
      </button>

      <img
        src={images[currentIndex]?.formats?.large?.url}
        alt={`Gallery image ${currentIndex + 1}`}
        className="max-h-[85vh] max-w-[90vw] object-contain"
      />

      <button
        onClick={onNext}
        className="absolute right-4 text-white hover:text-gray-300"
        aria-label="Next image"
      >
        <ChevronRight size={36} />
      </button>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
};

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
  const allImages = [...(post.image || []), ...(post.gallery || [])];

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

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
        <div 
          className="relative cursor-pointer" 
          onClick={() => {
            setCurrentImageIndex(0);
            setIsGalleryOpen(true);
          }}
        >
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

      {post.address && (
        <div className="mb-8 h-96">
          <Map address={post.address} />
        </div>
      )}

      <div 
        className="prose prose-lg mb-8"
        dangerouslySetInnerHTML={{ __html: post.overview }}
      ></div>

      {/* Gallery Thumbnails */}
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

      {/* Image Modal */}
      <ImageModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        images={allImages}
        currentIndex={currentImageIndex}
        onNext={handleNextImage}
        onPrevious={handlePreviousImage}
      />
    </article>
  );
};

export default BlogPost;
