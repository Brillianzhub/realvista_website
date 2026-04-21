import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'FAQ | Realvista Properties',
    description:
        'Get answers to common questions about buying, selling, renting, portfolio management, mutual investment, and account support on Realvista Properties.',
    keywords: [
        'Realvista FAQ',
        'real estate questions Nigeria',
        'how to buy property Nigeria',
        'property investment questions',
        'Realvista portfolio management',
        'mutual investment real estate',
        'real estate app support',
    ],
    alternates: {
        canonical: 'https://realvistaproperties.com/faq',
    },
    openGraph: {
        title: 'Frequently Asked Questions | Realvista Properties',
        description:
            'Find answers about property listings, investment platforms, portfolio management, and more on Realvista.',
        url: 'https://realvistaproperties.com/faq',
        siteName: 'Realvista Properties',
        type: 'website',
        images: [
            {
                url: '/og/faq.jpg',
                width: 1200,
                height: 630,
                alt: 'Realvista Properties FAQ',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'FAQ | Realvista Properties',
        description:
            'Answers to common questions about real estate buying, selling, investing, and account management on Realvista.',
        images: ['/og/faq.jpg'],
    },
    robots: {
        index: true,
        follow: true,
    },
}

export default function FAQLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}