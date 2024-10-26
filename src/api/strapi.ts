import axios from 'axios';

// Define the base URL based on environment
const baseURL = import.meta.env.PROD 
  ? 'https://api.dogwalksnearme.uk/api'  // Production API endpoint
  : `${import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337'}/api`;  // Development API endpoint

const strapiAPI = axios.create({
 baseURL,
 headers: {
   'Content-Type': 'application/json',
   'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN}`
 },
 timeout: 10000 
});

// Debug environment variable
console.log('API Token exists:', !!process.env.STRAPI_API_TOKEN);
console.log('Base URL:', baseURL);

// Add request interceptor
strapiAPI.interceptors.request.use(
 (config) => {
   console.log('Request Config:', {
     url: config.url,
     method: config.method,
     headers: config.headers,
     baseURL: config.baseURL
   });
   return config;
 },
 (error) => {
   console.error('Request Error:', error);
   return Promise.reject(error);
 }
);

// Add response interceptor
strapiAPI.interceptors.response.use(
 (response) => {
   console.log('Response Status:', response.status);
   console.log('Response Data:', response.data);
   return response;
 },
 (error) => {
   console.error('Response Error:', {
     status: error.response?.status,
     statusText: error.response?.statusText,
     data: error.response?.data,
     url: error.config?.url
   });
   return Promise.reject(error);
 }
);

export const fetchWalks = async () => {
 try {
   console.log('Fetching walks...');
   const response = await strapiAPI.get<StrapiResponse<Walk>>('/walks?populate=*');
   console.log('Walks fetched successfully:', response.data);
   return response.data?.data?.filter(walk => walk && walk.attributes) ?? [];
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
