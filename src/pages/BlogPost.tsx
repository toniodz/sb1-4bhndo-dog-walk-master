// src/pages/BlogPost.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchWalkBySlug } from '../api/strapi';

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        console.log('Starting to fetch post with slug:', slug);
        setLoading(true);
        const fetchedPost = await fetchWalkBySlug(slug as string);
        console.log('Fetched post:', fetchedPost);
        setPost(fetchedPost);
      } catch (error) {
        console.error('Error in component:', error);
        setError(error instanceof Error ? error.message : 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!post) {
    return <div>No post found</div>;
  }

  // Just display basic info first to verify data
  return (
    <div>
      <h1>Post Data:</h1>
      <pre>{JSON.stringify(post, null, 2)}</pre>
    </div>
  );
};

export default BlogPost;
