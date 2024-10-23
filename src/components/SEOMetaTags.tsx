import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOMetaTagsProps {
  title: string;
  description: string;
  canonicalUrl: string;
  ogImage?: string;
}

const SEOMetaTags: React.FC<SEOMetaTagsProps> = ({ title, description, canonicalUrl, ogImage }) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </Helmet>
  );
};

export default SEOMetaTags;