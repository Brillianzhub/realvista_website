import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Property Listings | Buy, Rent & Lease in Nigeria | Realvista',
    description:
        'Browse thousands of properties for sale, rent, and lease across Nigeria. Filter by location, price, bedrooms, and property type on Realvista Properties.',
    keywords: [
        'properties for sale Nigeria',
        'houses for rent Nigeria',
        'land for sale Nigeria',
        'apartments for lease',
        'commercial property Nigeria',
        'real estate listings Nigeria',
        'buy property Nigeria',
        'Realvista listings',
    ],
    alternates: {
        canonical: 'https://realvistaproperties.com/listings',
    },
    openGraph: {
        title: 'Property Listings — Buy, Rent & Lease | Realvista',
        description:
            'Find your dream home or investment property. Browse houses, apartments, land, and commercial properties across Nigeria.',
        url: 'https://realvistaproperties.com/listings',
        siteName: 'Realvista Properties',
        type: 'website',
        images: [
            {
                url: '/og/listings.jpg',
                width: 1200,
                height: 630,
                alt: 'Realvista property listings page',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Browse Property Listings | Realvista Properties',
        description:
            'Houses, apartments, land and commercial properties for sale, rent and lease across Nigeria.',
        images: ['/og/listings.jpg'],
    },
    robots: {
        index: true,
        follow: true,
    },
}

export default function ListingsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}