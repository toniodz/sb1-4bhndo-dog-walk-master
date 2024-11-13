import axios from 'axios';

// Type Definitions
interface County {
  id: number;
  name: string;
  slug: string;
  type: string;
  country: string;
}

interface Town {
  id: number;
  name: string;
  slug: string;
  postcode_area: string;
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
  coordinates?: any;
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
  county?: {
    data?: {
      id: number;
      attributes: County;
    };
  };
  town?: {
    data?: {
      id: number;
      attributes: Town;
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

// Base API Configuration
const baseURL = import.meta.env.PROD 
  ? 'https://api.dogwalksnearme.uk/api'
  : `${import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337'}/api`;

const strapiAPI = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_STRAPI_API_TOKEN}`
  },
  timeout: 10000 
});

// Debug Interceptors
strapiAPI.interceptors.request.use(
  (config) => {
    console.group('API Request');
    console.log('URL:', `${config.baseURL}${config.url}`);
    console.log('Method:', config.method?.toUpperCase());
    console.groupEnd();
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

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

// API Functions
export const fetchWalks = async (filters?: {
  county?: string;
  town?: string;
  featured?: boolean;
}) => {
  try {
    let queryString = '/walks?populate=*';
    
    // Add filters
    if (filters) {
      if (filters.featured) {
        queryString += '&filters[featured][$eq]=true';
      }
      
      if (filters.county) {
        queryString += `&filters[county][slug][$eq]=${filters.county}`;
        
        if (filters.town) {
          queryString += `&filters[town][slug][$eq]=${filters.town}`;
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

export const fetchCounties = async () => {
  try {
    console.log('Fetching counties');
    const response = await strapiAPI.get<StrapiResponse<County>>('/counties');
    return response.data?.data || [];
  } catch (error) {
    console.error('Error fetching counties:', error);
    return [];
  }
};

export const fetchTowns = async (countySlug?: string) => {
  try {
    let queryString = '/towns';
    if (countySlug) {
      queryString += `?filters[county][slug][$eq]=${countySlug}`;
    }
    console.log('Fetching towns:', queryString);
    
    const response = await strapiAPI.get<StrapiResponse<Town>>(queryString);
    return response.data?.data || [];
  } catch (error) {
    console.error('Error fetching towns:', error);
    return [];
  }
};

export const fetchWalkBySlug = async (slug: string) => {
  try {
    console.log('Fetching walk by slug:', slug);
    
    const response = await strapiAPI.get<StrapiResponse<Walk>>(
      `/walks?filters[slug][$eq]=${slug}&populate=*`
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

// Helper function for featured walks (used on home page)
export const fetchFeaturedWalks = async () => {
  return fetchWalks({ featured: true });
};

export default strapiAPI;

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

// Fetch towns for a specific county
export const fetchTowns = async (countySlug?: string) => {
  try {
    let queryString = '/towns';
    if (countySlug) {
      queryString += `?filters[county][slug][$eq]=${countySlug}`;
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
    console.group('Fetching Walk by Slug');
    console.log('Slug:', slug);

    const response = await strapiAPI.get<StrapiResponse<Walk>>(
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
    return null;
  }
};

export default strapiAPI;