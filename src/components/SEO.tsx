import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'event';
  twitterCard?: 'summary' | 'summary_large_image';
  structuredData?: object;
  noIndex?: boolean;
}

const BASE_URL = 'https://veteranpodcastawards.com';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;
const SITE_NAME = 'Veteran Podcast Awards';

export const SEO = ({
  title,
  description = 'Celebrating the impactful voices of veteran podcasters. Join us October 5th, 2026 for the annual Veteran Podcast Awards on National Military Podcast Day.',
  keywords = 'veteran podcast, military podcast, podcast awards, veteran podcasters, national military podcast day, military veterans, podcasting',
  canonicalUrl,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  structuredData,
  noIndex = false,
}: SEOProps) => {
  const fullTitle = title 
    ? `${title} | ${SITE_NAME}` 
    : `${SITE_NAME} 2026 | National Military Podcast Day`;
  
  const fullCanonicalUrl = canonicalUrl 
    ? `${BASE_URL}${canonicalUrl}` 
    : BASE_URL;

  // Default organization structured data
  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: BASE_URL,
    logo: `${BASE_URL}/favicon.png`,
    description: description,
    sameAs: [
      'https://twitter.com/vetpodawards',
      'https://facebook.com/veteranpodcastawards',
      'https://instagram.com/veteranpodcastawards'
    ]
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={SITE_NAME} />
      <link rel="canonical" href={fullCanonicalUrl} />
      
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:url" content={fullCanonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@vetpodawards" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData || defaultStructuredData)}
      </script>
    </Helmet>
  );
};

// Pre-configured SEO components for specific page types
export const EventSEO = ({ 
  eventName,
  eventDate,
  eventDescription,
  eventLocation = 'Online Livestream',
}: {
  eventName: string;
  eventDate: string;
  eventDescription: string;
  eventLocation?: string;
}) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: eventName,
    startDate: eventDate,
    endDate: eventDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    location: {
      '@type': 'VirtualLocation',
      url: `${BASE_URL}/livestream`
    },
    description: eventDescription,
    organizer: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: BASE_URL
    },
    image: DEFAULT_OG_IMAGE,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: BASE_URL
    }
  };

  return (
    <SEO
      title={eventName}
      description={eventDescription}
      ogType="event"
      structuredData={structuredData}
    />
  );
};

export const ArticleSEO = ({
  title,
  description,
  publishedTime,
  modifiedTime,
  canonicalUrl,
}: {
  title: string;
  description: string;
  publishedTime?: string;
  modifiedTime?: string;
  canonicalUrl: string;
}) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    author: {
      '@type': 'Organization',
      name: SITE_NAME
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/favicon.png`
      }
    }
  };

  return (
    <SEO
      title={title}
      description={description}
      canonicalUrl={canonicalUrl}
      ogType="article"
      structuredData={structuredData}
    />
  );
};

export const BreadcrumbSEO = ({
  items
}: {
  items: { name: string; url: string }[]
}) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`
    }))
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(structuredData)}
    </script>
  );
};
