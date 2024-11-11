import axios from 'axios';

// Define the base types
interface StrapiAttribute {
  data?: {
    id?: number;
    attributes?: {
      name?: string;
      slug?: string;
    };
  } | null;
}

interface StrapiImage {
  data?: {
    attributes?: {
      url?: string;
      formats?: {
        medium?: {
          url?: string;
        };
      };
    };
  } | null;
}

// Define interfaces to match Strapi response
interface Walk {
  id: number;
  attributes?: {
    Title?: string;
    slug?: string;
    rating?: number | null;
    address?: string;
    duration?: string;
    difficulty?: string;
    overview?: string;
    county?: StrapiAttribute;
    town?: StrapiAttribute;
    image?: StrapiImage;
    createdAt?: string;
    updatedAt?: string;
  };
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

// Define the base URL based on environment
const baseURL = import.meta.env.PROD 
  ? 'https://api.dogwalksnearme.uk/api'
  : `${import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337'}/api`;

// Create axios instance with default config
const strapiAPI = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_STRAPI_API_TOKEN}`
  },
  timeout: 10000 
});

// Add request interceptor for debugging
strapiAPI.interceptors.request.use(
  (config) => {
    console.group('API Request');
    console.log('URL:', `${config.baseURL}${config.url}`);
    console.log('Method:', config.method?.toUpperCase());
    console.log('Has Auth:', !!config.headers.Authorization);
    console.groupEnd();
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
strapiAPI.interceptors.response.use(
  (response) => {
    console.group('API Response');
    console.log('Status:', response.status);
    console.log('Data Count:', response.data?.data?.length);
    console.groupEnd();
    return response;
  },
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      message: error.response?.data?.error?.message,
      url: error.config?.url
    });
    return Promise.reject(error);
  }
);

// Main fetch function for walks
export const fetchWalks = async (filters?: {
  county?: string;
  town?: string;
}) => {
  try {
    console.group('Fetching Walks');
    console.log('Filters:', filters);

    // Build populate query
    const populate = [
      'image',
      'county',
      'town'
    ];

    // Build query string
    let queryString = `/walks?populate=${populate.join(',')}`;
    
    // Add filters if provided
    if (filters?.county) {
      queryString += `&filters[county][data][attributes][slug][$eq]=${filters.county}`;
      
      if (filters?.town) {
        queryString += `&filters[town][data][attributes][slug][$eq]=${filters.town}`;
      }
    }

    console.log('Query:', queryString);
    
    const response = await strapiAPI.get<StrapiResponse>(queryString);
    
    if (response.data?.data) {
      const walks = response.data.data;
      
      // Log sample data if available
      if (walks.length > 0) {
        console.log('Sample Walk:', {
          id: walks[0].id,
          title: walks[0].attributes?.Title,
          county: walks[0].attributes?.county?.data?.attributes?.name,
          town: walks[0].attributes?.town?.data?.attributes?.name
        });
      }

      console.log(`Found ${walks.length} walks`);
      console.groupEnd();
      return walks;
    }

    console.log('No walks found');
    console.groupEnd();
    return [];
  } catch (error) {
    console.error('Error fetching walks:', error);
    console.groupEnd();
    return [];
  }
};

// Fetch single walk by slug
export const fetchWalkBySlug = async (slug: string) => {
  try {
    console.group('Fetching Walk by Slug');
    console.log('Slug:', slug);

    const response = await strapiAPI.get<StrapiResponse>(
      `/walks?filters[slug][$eq]=${slug}&populate=*`
    );

    if (!response.data?.data?.[0]) {
      throw new Error('Walk not found');
    }

    console.log('Found walk:', response.data.data[0].attributes?.Title);
    console.groupEnd();
    return response.data.data[0];
  } catch (error) {
    console.error('Error fetching walk:', error);
    console.groupEnd();
    throw error;
  }
};

// Fetch related walks
export const getRelatedWalks = async (currentWalk: Walk) => {
  try {
    const townSlug = currentWalk.attributes?.town?.data?.attributes?.slug;
    if (!townSlug) return [];

    const queryString = `/walks?populate=*&filters[town][data][attributes][slug][$eq]=${townSlug}&filters[id][$ne]=${currentWalk.id}&pagination[limit]=3`;
    
    const response = await strapiAPI.get<StrapiResponse>(queryString);
    
    if (response.data?.data) {
      return response.data.data.slice(0, 3);
    }
    return [];
  } catch (error) {
    console.error('Error fetching related walks:', error);
    return [];
  }
};