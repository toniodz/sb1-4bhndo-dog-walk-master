// Define interfaces to match actual API response
interface Walk {
  id: number;
  documentId: string;
  Title: string;
  slug: string;
  rating: number | null;
  address: string;
  duration: string;
  difficulty: string;
  overview?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  website?: string;
  image?: {
    url: string;
  } | null;
}

interface StrapiResponse {
  data: Walk[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

import axios from 'axios';

// Define the base URL based on environment
const baseURL = import.meta.env.PROD 
  ? 'https://api.dogwalksnearme.uk/api'  // Production API endpoint
  : `${import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337'}/api`;  // Development API endpoint

const strapiAPI = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_STRAPI_API_TOKEN}`
  },
  timeout: 10000 
});

// Single debug log for token
console.log('Strapi Configuration:', {
  hasViteToken: !!import.meta.env.VITE_STRAPI_API_TOKEN,
  tokenPreview: import.meta.env.VITE_STRAPI_API_TOKEN ? 
    `Bearer ${import.meta.env.VITE_STRAPI_API_TOKEN.substring(0, 5)}...` : 
    'No token found',
  baseURL: baseURL
});

// Single request interceptor
strapiAPI.interceptors.request.use(
  (config) => {
    console.log('Outgoing Request:', {
      fullUrl: `${config.baseURL}${config.url}`,
      method: config.method?.toUpperCase(),
      authHeaderPresent: !!config.headers.Authorization,
      authHeaderPreview: config.headers.Authorization?.substring(0, 20) + '...'
    });
    return config;
  },
  (error) => Promise.reject(error)
);

// Single response interceptor
strapiAPI.interceptors.response.use(
  (response) => {
    console.log('Successful Response:', {
      status: response.status,
      statusText: response.statusText,
      hasData: !!response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      message: error.response?.data?.error?.message,
      url: error.config?.url,
      authHeader: error.config?.headers?.Authorization?.substring(0, 20) + '...'
    });
    return Promise.reject(error);
  }
);

export const fetchWalks = async () => {
  try {
    console.log('Fetching walks...');
    const response = await strapiAPI.get<StrapiResponse>('/walks?populate=*');
    console.log('Raw API response:', response.data);
    
    if (response.data?.data) {
      // Return the data directly since it already matches our interface
      const walks = response.data.data;
      console.log('Processed walks:', walks);
      return walks;
    }
    return [];
  } catch (error) {
    console.error('Error in fetchWalks:', error instanceof Error ? error.message : String(error));
    return [];
  }
};

export const fetchWalkBySlug = async (slug: string) => {
  try {
    const response = await strapiAPI.get<StrapiResponse>(`/walks?filters[slug][$eq]=${slug}&populate=*`);
    console.log('Initial API Response:', response); // Log full response
    
    if (response.data?.data && response.data.data.length > 0) {
      const walkData = response.data.data[0];
      console.log('Walk Data:', walkData); // Log the walk data
      
      // Make sure we're accessing the correct structure
      if (!walkData.attributes) {
        throw new Error('Walk data structure is invalid');
      }

      return {
        id: walkData.id,
        attributes: {
          title: walkData.attributes.Title || '',
          overview: walkData.attributes.overview || '',
          image: {
            data: {
              attributes: {
                url: walkData.attributes.image?.data?.attributes?.url || ''
              }
            }
          },
          address: walkData.attributes.address || '',
          duration: walkData.attributes.duration || '',
          difficulty: walkData.attributes.difficulty || '',
          coordinates: walkData.attributes.coordinates || { lat: 51.1279, lng: 1.3134 },
          seo: {
            metaTitle: walkData.attributes.Title || '',
            metaDescription: walkData.attributes.overview || ''
          },
          slug: walkData.attributes.slug || '',
          rating: walkData.attributes.rating || 0,
          website: walkData.attributes.website || '',
          createdAt: walkData.attributes.createdAt || '',
          updatedAt: walkData.attributes.updatedAt || ''
        }
      };
    } else {
      console.error('Walk not found');
      return null;
    }
  } catch (error) {
    console.error('Full error:', error);
    console.error('Error fetching walk by slug from Strapi:', error instanceof Error ? error.message : String(error));
    throw error;
  }
};
