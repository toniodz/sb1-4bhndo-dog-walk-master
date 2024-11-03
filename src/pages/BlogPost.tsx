// src/pages/BlogPost.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Clock, Star, Camera, Mountain, Building, Footprints } from 'lucide-react';
import { fetchWalkBySlug } from '../api/strapi';
import Map from '../components/Map';
import SEOMetaTags from '../components/SEOMetaTags';

interface BlogPostData {
  id: number;
  attributes: {
    Title: string;
    slug: string;
    address: string;
    duration: string;
    difficulty: string;
    rating: number;
    overview: string;
    website?: string;
    Town?: string;
    Features2?: string[];
    Terrain2?: string[];
    image: {
      data: {
        attributes: {
          url: string;
        };
      };
    };
    gallery?: Array<{
      id: number;
      attributes: {
        url: string;
        formats: {
          medium: {
            url: string;
          };
        };
      };
    }>;
    seo: {
      metaTitle: string;
      metaDescription: string;
    };
  };
}

const BlogPost: React.FC = () => {
  // ... existing state and effects

  return (
    <article className="max-w-4xl mx-auto px-4">
      {/* Hero Section */}
      <img 
        src={`${import.meta.env.VITE_STRAPI_URL}${post.attributes.image?.data?.attributes?.url}`}
        alt={post.attributes.Title}
        className="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
      />

      {/* Title and Basic Info */}
      <h1 className="text-4xl font-bold text-gray-800 mb-4">{post.attributes.Title}</h1>

      {/* Location Info */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center text-gray-600">
          <MapPin className="h-5 w-5 mr-2" />
          <span>{post.attributes.address}</span>
        </div>
        {post.attributes.Town && (
          <div className="flex items-center text-gray-600">
            <Building className="h-5 w-5 mr-2" />
            <span>{post.attributes.Town}</span>
          </div>
        )}
      </div>

      {/* Walk Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="flex items-center text-gray-600">
          <Clock className="h-5 w-5 mr-2" />
          <span>{post.attributes.duration}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Mountain className="h-5 w-5 mr-2" />
          <span>{post.attributes.difficulty}</span>
        </div>
        {post.attributes.rating && (
          <div className="flex items-center text-gray-600">
            <Star className="h-5 w-5 mr-2" />
            <span>Rating: {post.attributes.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Features and Terrain */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {post.attributes.Features2 && post.attributes.Features2.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Features</h2>
            <ul className="space-y-2">
              {post.attributes.Features2.map((feature, index) => (
                <li key={index} className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {post.attributes.Terrain2 && post.attributes.Terrain2.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Terrain Types</h2>
            <ul className="space-y-2">
              {post.attributes.Terrain2.map((terrain, index) => (
                <li key={index} className="flex items-center text-gray-600">
                  <Footprints className="h-4 w-4 mr-2" />
                  {terrain}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="mb-8 h-96">
        <Map address={post.attributes.address} />
      </div>

      {/* Overview */}
      <div className="prose prose-lg max-w-none mb-8">
        <h2 className="text-2xl font-semibold mb-4">Overview</h2>
        <div dangerouslySetInnerHTML={{ __html: post.attributes.overview }}></div>
      </div>

      {/* Gallery */}
      {post.attributes.gallery && post.attributes.gallery.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {post.attributes.gallery.map((image) => (
              <img
                key={image.id}
                src={`${import.meta.env.VITE_STRAPI_URL}${image.attributes.formats.medium.url}`}
                alt={post.attributes.Title}
                className="w-full h-48 object-cover rounded-lg"
              />
            ))}
          </div>
        </div>
      )}

      {/* Website Link */}
      {post.attributes.website && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">More Information</h2>
          
            href={post.attributes.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Visit Website
          </a>
        </div>
      )}
    </article>
  );
};

export default BlogPost;
