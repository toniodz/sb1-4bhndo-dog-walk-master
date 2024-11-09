import React from 'react';
import { MapPin, Clock, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeaturedWalks = ({ walks }) => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Featured Walks</h2>
        
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
  );
};

export default FeaturedWalks;