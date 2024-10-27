// Define interfaces
interface StrapiResponse<T> {
 data: Array<{
   id: number;
   attributes: T;
 }>;
 meta: {
   pagination: {
     page: number;
     pageSize: number;
     pageCount: number;
     total: number;
   };
 };
}

interface Walk {
 Title: string;
 slug: string;
 address: string;
 duration: string;
 difficulty: string;
 rating: number;
 image: {
   data: {
     attributes: {
       url: string;
     };
   } | null;
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
   const response = await strapiAPI.get<StrapiResponse<Walk>>('/walks?populate=*');
   console.log('Raw API response:', response.data);
   
   if (response.data?.data) {
     // Transform the data to match the component's expectations
     const processedWalks = response.data.data.map(item => ({
       id: item.id,
       ...item.attributes,  // This spreads Title, slug, etc.
       image: item.attributes.image?.data?.attributes ?? null
     }));
     
     console.log('Processed walks:', processedWalks);
     return processedWalks;
   }
   return [];
 } catch (error) {
   console.error('Error in fetchWalks:', error instanceof Error ? error.message : String(error));
   return [];
 }
};

export const fetchWalkBySlug = async (slug: string) => {
 try {
   const response = await strapiAPI.get(`/walks?filters[slug][$eq]=${slug}&populate=*`);
   console.log('Strapi API Response for single walk:', response.data);
   if (response.data && response.data.data && response.data.data.length > 0) {
     return response.data.data[0];
   } else {
     console.error('Walk not found');
     return null;
   }
 } catch (error) {
   console.error('Error fetching walk by slug from Strapi:', error instanceof Error ? error.message : String(error));
   throw error;
 }
};
