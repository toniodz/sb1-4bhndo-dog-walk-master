import axios from 'axios';

// Define interfaces to match actual API response
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
    Town?: string;
    Region?: string;
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

interface Locations {
  counties: string[];
  towns: string[];
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
    console.log('Has Auth:', !!config.headers.Authorization);
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

// Fetch locations (counties and towns)
export const fetchLocations = async (): Promise<Locations> => {
  try {
    const response = await strapiAPI.get<StrapiResponse>('/walks?populate=*');
    
    if (response.data?.data) {
      const locations = response.data.data.reduce((acc: Locations, walk: Walk) => {
        const region = walk.attributes?.Region;
        const town = walk.attributes?.Town;
        
        if (region && !acc.counties.includes(region)) {
          acc.counties.push(region);
        }
        
        if (town && !acc.towns.includes(town)) {
          acc.towns.push(town);
        }
        
        return acc;
      }, { counties: [], towns: [] });
      
      console.log('Found locations:', locations);
      return locations;
    }
    return { counties: [], towns: [] };
  } catch (error) {
    console.error('Error fetching locations:', error);
    return { counties: [], towns: [] };
  }
};

// Main fetch function for walks
export const fetchWalks = async (filters?: {
  county?: string;
  town?: string;
}) => {
  try {
    console.group('Fetching Walks');
    console.log('Filters:', filters);

    // Start with base query
    let queryString = '/walks?populate=*';
    
    // Add filters based on Region and Town fields
    if (filters?.county) {
      queryString += `&filters[Region][$eqi]=${filters.county}`;
      
      if (filters?.town) {
        queryString += `&filters[Town][$eqi]=${filters.town}`;
      }
    }

    console.log('Query:', queryString);
    
    const response = await strapiAPI.get<StrapiResponse>(queryString);
    
    if (response.data?.data) {
      const walks = response.data.data;
      console.log(`Found ${walks.length} walks`);
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
export const fetchWalkBySlug = async (slug: string): Promise<Walk | null> => {
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
    return null;
  }
};

export default strapiAPI;