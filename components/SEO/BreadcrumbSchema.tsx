'use client';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export default function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://showstakr.tournest.io${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// Common breadcrumb patterns for entertainment pages
export const entertainmentBreadcrumbs = {
  polls: [
    { name: 'Home', url: '/' },
    { name: 'Entertainment Predictions', url: '/polls' },
  ],
  
  evictions: [
    { name: 'Home', url: '/' },
    { name: 'Entertainment Predictions', url: '/polls' },
    { name: 'Eviction Predictions', url: '/polls?category=eviction' },
  ],
  
  hoh: [
    { name: 'Home', url: '/' },
    { name: 'Entertainment Predictions', url: '/polls' },
    { name: 'Head of House', url: '/polls?category=hoh' },
  ],
  
  dashboard: [
    { name: 'Home', url: '/' },
    { name: 'My Dashboard', url: '/dashboard' },
  ],
  
  wallet: [
    { name: 'Home', url: '/' },
    { name: 'My Wallet', url: '/wallet' },
  ],
};