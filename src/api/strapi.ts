import axios from 'axios';

// Type Definitions
interface SEO {
  metaTitle: string;
  metaDescription: string;
}

interface County {
  id: number;
  name: string;
  slug: string;
  type: string;
  country: string;
  description: string;
  featured_image: {
    data?: {
      attributes?: {
        url: string;
        formats?: {
          medium?: {
            url: string;
          };
        };
      };
    };
  };
  seo: SEO;
}

interface Town {
  id: number;
  name: string;
  slug: string;
  postcode_area: string;
  type: string;
  description: string;
  featured_image: {
    data?: {
      attributes?: {
        url: string;
        formats?: {
          medium?: {
            url: string;
          };
        };
      };
    };
  };
  seo: SEO;
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
  seo: SEO;
  featured_image: {
    data?: {
      attributes?: {
        url: string;
        formats?: {
          medium?: {
            url: string;
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
    console.log('API Request:', `${config.baseURL}${config.url}`);
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

// API Functions
export const fetchWalks = async (filters?: {
  county?: string;
  town?: string;
  featured?: boolean;
}) => {
  try {
    let queryString = '/walks?populate[0]=featured_image&populate[1]=seo&populate[2]=county&populate[3]=town';
    
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
    const response = await strapiAPI.get<StrapiResponse<County>>('/counties?populate[0]=featured_image&populate[1]=seo');
    return response.data?.data || [];
  } catch (error) {
    console.error('Error fetching counties:', error);
    return [];
  }
};

export const fetchTowns = async (countySlug?: string) => {
  try {
    let queryString = '/towns?populate[0]=featured_image&populate[1]=seo';
    if (countySlug) {
      queryString += `&filters[county][slug][$eq]=${countySlug}`;
    }
    const response = await strapiAPI.get<StrapiResponse<Town>>(queryString);
    return response.data?.data || [];
  } catch (error) {
    console.error('Error fetching towns:', error);
    return [];
  }
};

export const fetchWalkBySlug = async (slug: string) => {
  try {
    const response = await strapiAPI.get<StrapiResponse<Walk>>(
      `/walks?filters[slug][$eq]=${slug}&populate[0]=featured_image&populate[1]=seo&populate[2]=county&populate[3]=town`
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

export const fetchFeaturedWalks = async () => {
  return fetchWalks({ featured: true });
};

export default strapiAPI;