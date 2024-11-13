import axios from 'axios';

// Type Definitions
interface County {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  type: string;
  country: string;
  description?: any;
}

interface Town {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  type: string;
}

interface Walk {
  id: number;
  documentId: string;
  Title: string;
  slug: string;
  rating: number | null;
  address: string;
  overview: string | null;
  website: string | null;
  featured: boolean;
  duration: string;
  difficulty: string;
  coordinates: any;
  postcode: string;
  county: County;
  town: Town;
  Terrain2?: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string | null;
  image?: {
    data?: {
      attributes?: {
        url?: string;
        formats?: {
          medium?: {
            url?: string;
          };
        };
      };
    };
  };
}

interface StrapiResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Base URL Configuration
const baseURL = import.meta.env.PROD 
  ? 'https://api.dogwalksnearme.uk/api'
  : `${import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337'}/api`;

// Create Axios Instance
const strapiAPI = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_STRAPI_API_TOKEN}`
  },
  timeout: 10000 
});

// Request Interceptor
strapiAPI.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      url: `${config.baseURL}${config.url}`,
      method: config.method?.toUpperCase()
    });
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor
strapiAPI.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      dataCount: response.data?.data?.length
    });
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

// Fetch walks with optional filters
export const fetchWalks = async (filters?: {
  county?: string;
  town?: string;
  featured?: boolean;
}) => {
  try {
    let queryString = '/walks?populate=deep';
    
    if (filters) {
      if (filters.featured) {
        queryString += '&filters[featured][$eq]=true';
      }
      
      if (filters.county) {
        queryString += `&filters[county][name][$eq]=${filters.county}`;
        
        if (filters.town) {
          queryString += `&filters[town][name][$eq]=${filters.town}`;
        }
      }
    }

    console.log('Fetching walks:', queryString);
    
    const response = await strapiAPI.get<StrapiResponse<Walk>>(queryString);
    return response.data?.data || [];
  } catch (error) {
    console.error('Error fetching walks:', error);
    return [];
  }
};

// Fetch all counties
export const fetchCounties = async () => {
  try {
    const response = await strapiAPI.get<StrapiResponse<County>>('/counties');
    return response.data?.data || [];
  } catch (error) {
    console.error('Error fetching counties:', error);
    return [];
  }
};

// Fetch towns, optionally filtered by county
export const fetchTowns = async (countyName?: string) => {
  try {
    let queryString = '/towns';
    if (countyName) {
      queryString += `?filters[county][name][$eq]=${countyName}`;
    }
    const response = await strapiAPI.get<StrapiResponse<Town>>(queryString);
    return response.data?.data || [];
  } catch (error) {
    console.error('Error fetching towns:', error);
    return [];
  }
};

// Fetch a single walk by slug
export const fetchWalkBySlug = async (slug: string) => {
  try {
    const response = await strapiAPI.get<StrapiResponse<Walk>>(
      `/walks?filters[slug][$eq]=${slug}&populate=deep`
    );

    if (!response.data?.data?.[0]) {
      throw new Error('Walk not found');
    }

    return response.data.data[0];
  } catch (error) {
    console.error('Error fetching walk:', error);
    return null;
  }
};

// Fetch featured walks
export const fetchFeaturedWalks = async () => {
  return fetchWalks({ featured: true });
};

// Export API instance
export default strapiAPI;