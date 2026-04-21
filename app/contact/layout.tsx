import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Contact Us | Realvista Properties',
    description:
        'Get in touch with the Realvista Properties team. Reach us by phone, email, or visit our office in Owerri, Imo State for expert real estate guidance.',
    keywords: [
        'contact Realvista Properties',
        'real estate company Owerri',
        'property inquiry Nigeria',
        'Realvista office contact',
        'real estate support Nigeria',
    ],
    alternates: {
        canonical: 'https://realvistaproperties.com/contact',
    },
    openGraph: {
        title: 'Contact Realvista Properties',
        description:
            'Reach out to our team for expert guidance on buying, selling, and investing in real estate across Nigeria.',
        url: 'https://realvistaproperties.com/contact',
        siteName: 'Realvista Properties',
        type: 'website',
        images: [
            {
                url: '/og/contact.jpg',
                width: 1200,
                height: 630,
                alt: 'Contact Realvista Properties',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Contact Us | Realvista Properties',
        description:
            'Have questions? Contact Realvista Properties for expert real estate guidance in Nigeria.',
        images: ['/og/contact.jpg'],
    },
    robots: {
        index: true,
        follow: true,
    },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}