'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'

// Extend Window interface for gtag
declare global {
    interface Window {
        gtag: (...args: any[]) => void
        dataLayer: any[]
    }
}

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

// Track page views
const pageview = (url: string) => {
    if (typeof window !== 'undefined' && window.gtag && GA_ID) {
        window.gtag('config', GA_ID, {
            page_path: url,
        })
    }
}

// Separate component for tracking that uses useSearchParams
const PageViewTracker = () => {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        if (pathname) {
            const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
            pageview(url)
        }
    }, [pathname, searchParams])

    return null // This component doesn't render anything
}

// Google Analytics component
export const GoogleAnalytics = () => {
    if (!GA_ID) return null

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
            </Script>
            <Suspense fallback={null}>
                <PageViewTracker />
            </Suspense>
        </>
    )
}