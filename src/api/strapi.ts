import axios from 'axios';

// Interfaces
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
  postcode_area: string;
  type: string;
  description?: any;
}

interface Walk {
  id: number;
  documentId: string;
  attributes: {
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

// Define the base URL based on environment
const baseURL = import.meta.env.PROD 
  ? 'https://api.dogwalksnearme.uk/api'
  : `${import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337'}/api`;

// Create axios instance
const strapiAPI = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_STRAPI_API_TOKEN}`
  },
  timeout: 10000 
});

// Request interceptor
strapiAPI.interceptors.request.use(
  (config) => {
    console.group('Strapi API Request');
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

// Response interceptor
strapiAPI.interceptors.response.use(
  (response) => {
    console.group('Strapi API Response');
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

// Fetch all walks with optional filters
export const fetchWalks = async (filters?: {
  county?: string;
  town?: string;
}) => {
  try {
    console.group('Fetching Walks');
    console.log('Filters:', filters);

    let queryString = '/walks?populate=*';
    
    if (filters?.county) {
      queryString += `&filters[county][name][$eq]=${filters.county}`;
      
      if (filters?.town) {
        queryString += `&filters[town][name][$eq]=${filters.town}`;
      }
    }

    console.log('Query:', queryString);
    
    const response = await strapiAPI.get<StrapiResponse<Walk>>(queryString);
    
    if (response.data?.data) {
      const walks = response.data.data;
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