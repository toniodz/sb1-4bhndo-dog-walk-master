import axios from 'axios';

interface County {
  id: number;
  attributes: {
    name: string;
    slug: string;
    type: string;
    country: string;
  };
}

interface Town {
  id: number;
  attributes: {
    name: string;
    slug: string;
    postcode_area: string;
    type: string;
  };
}

interface Walk {
  id: number;
  attributes: {
    Title: string;
    slug: string;
    rating: number;
    address: string;
    duration: string;
    difficulty: string;
    overview?: string;
    county: {
      data: County;
    };
    town: {
      data: Town;
    };
    image?: {
      data?: {
        attributes?: {
          url?: string;
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

// Fetch all counties
export const fetchCounties = async () => {
  try {
    const response = await strapiAPI.get<StrapiResponse<County>>('/counties');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching counties:', error);
    return [];
  }
};

// Fetch towns for a county
export const fetchTowns = async (countySlug?: string) => {
  try {
    let url = '/towns';
    if (countySlug) {
      url += `?filters[county][slug][$eq]=${countySlug}`;
    }
    const response = await strapiAPI.get<StrapiResponse<Town>>(url);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching towns:', error);
    return [];
  }
};

// Fetch walks with filters
export const fetchWalks = async (filters?: {
  county?: string;
  town?: string;
}) => {
  try {
    console.group('Fetching Walks');
    console.log('Filters:', filters);

    // Start with base query and populate
    let queryString = '/walks?populate=*';
    
    if (filters?.county) {
      // Filter by county name
      queryString += `&filters[county][name][$eq]=${filters.county}`;
      
      if (filters?.town) {
        // Filter by town name
        queryString += `&filters[town][name][$eq]=${filters.town}`;
      }
    }

    console.log('Final query string:', queryString);
    
    const response = await strapiAPI.get(queryString);
    console.log('API Response:', response.data);
    
    if (response.data?.data) {
      const walks = response.data.data;
      console.log(`Found ${walks.length} walks with filters:`, filters);
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


export const fetchWalkBySlug = async (slug: string) => {
  try {
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

export default strapiAPI;