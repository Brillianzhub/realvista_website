import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Real Estate Market Trends & Insights | Realvista Properties',
  description:
    'Stay ahead with the latest Nigerian real estate market trends, investment hotspots, property value reports, and market analysis from Realvista Properties.',
  keywords: [
    'Nigeria real estate market trends',
    'property market analysis Nigeria',
    'real estate investment insights',
    'property value trends Nigeria',
    'real estate reports Nigeria',
    'Realvista market insights',
    'property market Nigeria 2025',
  ],
  alternates: {
    canonical: 'https://realvistaproperties.com/trend',
  },
  openGraph: {
    title: 'Real Estate Market Trends & Insights | Realvista',
    description:
      'Discover investment hotspots, property value trends, and market reports shaping the Nigerian real estate landscape.',
    url: 'https://realvistaproperties.com/trend',
    siteName: 'Realvista Properties',
    type: 'website',
    images: [
      {
        url: '/og/trend.jpg',
        width: 1200,
        height: 630,
        alt: 'Realvista real estate market trends and insights',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Real Estate Market Trends | Realvista Properties',
    description:
      'Latest property market reports, investment hotspots, and real estate insights for Nigeria.',
    images: ['/og/trend.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function TrendLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}