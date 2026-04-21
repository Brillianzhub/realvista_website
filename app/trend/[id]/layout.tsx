import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Market Report | Realvista Properties',
    description:
        'Read the latest real estate market reports, trends, and investment analysis from Realvista Properties.',
    alternates: {
        canonical: 'https://realvistaproperties.com/trend',
    },
    openGraph: {
        title: 'Market Report | Realvista Properties',
        description:
            'Stay informed with the latest real estate market reports and investment insights from Realvista.',
        url: 'https://realvistaproperties.com/trend',
        siteName: 'Realvista Properties',
        type: 'article',
        images: [
            {
                url: '/og/trend.jpg',
                width: 1200,
                height: 630,
                alt: 'Realvista market report',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Market Report | Realvista Properties',
        description:
            'Latest real estate market reports and investment analysis from Realvista Properties.',
        images: ['/og/trend.jpg'],
    },
    robots: {
        index: true,
        follow: true,
    },
}

export default function TrendDetailLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}