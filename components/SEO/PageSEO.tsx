'use client';

import Head from 'next/head';

interface PageSEOProps {
  title?: string;
  description?: string;
  ogImage?: string;
  keywords?: string[];
  canonicalUrl?: string;
  noindex?: boolean;
}

export default function PageSEO({
  title = 'ShowStakr - Predict Entertainment Shows & Win Real Money',
  description = 'Join ShowStakr to predict entertainment show outcomes, stake on your favorites, and win big!',
  ogImage = 'https://res.cloudinary.com/dnvsfxlan/image/upload/v1754824146/Screenshot_2025-08-10_at_8.50.36_AM_pqxy9i.png',
  keywords = [],
  canonicalUrl,
  noindex = false,
}: PageSEOProps) {
  const fullTitle = title.includes('ShowStakr') ? title : `${title} | ShowStakr`;
  
  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content="website" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
    </Head>
  );
}