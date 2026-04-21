import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Property Details | Realvista Properties',
    description:
        'View full details, photos, and agent contact for this property listing on Realvista Properties.',
    alternates: {
        canonical: 'https://realvistaproperties.com/listings',
    },
    robots: {
        index: true,
        follow: true,
    },
}

export default function ListingDetailsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}