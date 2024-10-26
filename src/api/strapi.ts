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
  timeout: 10000 // 10 second timeout
});

export const fetchWalks = async () => {
  try {
    const response = await strapiAPI.get('/walks?populate=*');
    console.log('Strapi API Response:', response.data);
    if (response.data && response.data.data) {
      return response.data.data;
    } else {
      console.error('Unexpected data structure from Strapi API');
      return [];
    }
  } catch (error) {
    console.error('Error fetching walks from Strapi:', error instanceof Error ? error.message : String(error));
    throw error;
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
