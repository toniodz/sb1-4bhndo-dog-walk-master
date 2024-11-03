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
  Town: string;
  Region: string;
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

// src/api/strapi.ts

export const fetchWalks = async (filters?: {
  region?: string;
  town?: string;
}) => {
  try {
    console.log('Fetching walks with filters:', filters);
    
    let queryString = '/walks?populate=*';
    
    if (filters?.town) {
      // For both town and region pages, we filter by Town
      queryString += `&filters[Town][$eqi]=${filters.town}`;
    }

    console.log('Query string:', queryString);
    
    const response = await strapiAPI.get<StrapiResponse>(queryString);
    
    if (response.data?.data) {
      const walks = response.data.data;
      console.log(`Found ${walks.length} walks`);
      return walks;
    }
    return [];
  } catch (error) {
    console.error('Error in fetchWalks:', error instanceof Error ? error.message : String(error));
    return [];
  }
};

export const getRelatedWalks = async (currentWalk: WalkData) => {
  try {
    // Get walks from same town but exclude current walk
    const queryString = `/walks?populate=*&filters[Town][$eq]=${currentWalk.Town}&filters[id][$ne]=${currentWalk.id}&pagination[limit]=3`;
    
    const response = await strapiAPI.get<StrapiResponse>(queryString);
    
    if (response.data?.data) {
      const walks = response.data.data;
      // If we don't have enough walks from the same town, we could add more based on difficulty
      if (walks.length < 3) {
        const difficultyQuery = `/walks?populate=*&filters[difficulty][$eq]=${currentWalk.difficulty}&filters[id][$ne]=${currentWalk.id}&filters[Town][$ne]=${currentWalk.Town}&pagination[limit]=${3 - walks.length}`;
        const difficultyResponse = await strapiAPI.get<StrapiResponse>(difficultyQuery);
        if (difficultyResponse.data?.data) {
          walks.push(...difficultyResponse.data.data);
        }
      }
      return walks.slice(0, 3);
    }
    return [];
  } catch (error) {
    console.error('Error fetching related walks:', error);
    return [];
  }
};

// in strapi.ts
export const fetchWalkBySlug = async (slug: string) => {
  try {
    console.log('Fetching walk with slug:', slug);
    
    const response = await strapiAPI.get(`/walks?filters[slug][$eq]=${slug}&populate=*`);
    console.log('Raw API response:', response.data);

    if (!response.data?.data?.[0]) {
      throw new Error('Walk not found');
    }

    // Return the raw data first to see what we're getting
    return response.data.data[0];
    
  } catch (error) {
    console.error('Error in fetchWalkBySlug:', error);
    throw error;
  }
};
