import axios from 'axios';

// Define interfaces to match actual API response
interface Walk {
  id: number;
  attributes: {
    Title: string;
    slug: string;
    rating: number | null;
    address: string;
    duration: string;
    difficulty: string;
    overview?: string;
    county: {
      data: {
        attributes: {
          name: string;
          slug: string;
        }
      }
    };
    town: {
      data: {
        attributes: {
          name: string;
          slug: string;
        }
      }
    };
    image: {
      data?: {
        attributes: {
          formats?: {
            medium?: {
              url?: string;
            };
          };
          url?: string;
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

// Define the base URL based on environment
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

// Request interceptor
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

// Response interceptor
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

export const fetchWalks = async (filters?: {
  county?: string;
  town?: string;
}) => {
  try {
    console.log('Fetching walks with filters:', filters);
    
    // Start with base query that includes county and town relations
    let queryString = '/walks?populate[0]=county&populate[1]=town&populate[2]=image';
    
    if (filters?.county) {
      // Filter by county slug
      queryString += `&filters[county][slug][$eqi]=${filters.county}`;
      
      if (filters?.town) {
        // Add town filter if provided
        queryString += `&filters[town][slug][$eqi]=${filters.town}`;
      }
    }

    console.log('Final query string:', queryString);
    
    const response = await strapiAPI.get<StrapiResponse>(queryString);
    
    // Debug log the raw response
    console.log('Raw API response:', response.data);
    
    if (response.data?.data) {
      const walks = response.data.data;
      console.log('Parsed walks:', walks);
      console.log(`Found ${walks.length} walks`);
      return walks;
    }
    return [];
  } catch (error) {
    console.error('Error in fetchWalks:', error instanceof Error ? error.message : String(error));
    return [];
  }
};

export const getRelatedWalks = async (currentWalk: Walk) => {
  try {
    const townSlug = currentWalk.attributes.town?.data?.attributes?.slug;
    const queryString = `/walks?populate=*&filters[town][slug][$eq]=${townSlug}&filters[id][$ne]=${currentWalk.id}&pagination[limit]=3`;
    
    const response = await strapiAPI.get<StrapiResponse>(queryString);
    
    if (response.data?.data) {
      const walks = response.data.data;
      if (walks.length < 3) {
        const difficultyQuery = `/walks?populate=*&filters[difficulty][$eq]=${currentWalk.attributes.difficulty}&filters[id][$ne]=${currentWalk.id}&filters[town][slug][$ne]=${townSlug}&pagination[limit]=${3 - walks.length}`;
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

export const fetchWalkBySlug = async (slug: string) => {
  try {
    console.log('Fetching walk with slug:', slug);
    
    const response = await strapiAPI.get(`/walks?filters[slug][$eq]=${slug}&populate=*`);
    console.log('Raw API response:', response.data);

    if (!response.data?.data?.[0]) {
      throw new Error('Walk not found');
    }

    return response.data.data[0];
  } catch (error) {
    console.error('Error in fetchWalkBySlug:', error);
    throw error;
  }
};