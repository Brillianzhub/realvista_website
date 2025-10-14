import type { Metadata } from 'next'
import React from 'react'
import RealvistaFeatures from './_components/Features'
import RealvistaAdvantages from './_components/Advantages'
import RealvistaAllInOneSection from './_components/AllInOneSection'
import TestimonialsSection from './_components/Testimonials'
import FAQSection from './_components/FAQSection'
import AppDownloadSection from './_components/Download'
import FeaturedProperties from './_components/FeaturedProperties'
import FeaturedAgents from './_components/FeaturedAgents'
import MainHero from './_components/MainHero'

export const metadata: Metadata = {
  title: 'Realvista Properties | Buy & Sell Property, Track Profits',
  description:
    'Realvista Properties is your one-stop real estate app—buy and sell property, discover top agents, and track profits in real time. Turn your property goals into reality.',
  keywords: [
    'Realvista Properties real estate app',
    'property listings',
    'buy and sell property',
    'real-time profit tracking',
    'real estate marketplace',
    'featured properties',
    'top agents',
    'property analytics',
  ],
  alternates: {
    canonical: 'https://realvistaproperties.com/',
  },
  openGraph: {
    title: 'Realvista Properties — One-Stop Real Estate App',
    description:
      'From buying and selling to real-time profit tracking, Realvista is your one-stop real estate solution.',
    url: 'https://realvistaproperties.com/',
    siteName: 'Realvista Properties',
    type: 'website',
    images: [
      {
        url: 'https://realvistaproperties.com/',
        width: 1200,
        height: 630,
        alt: 'Realvista app showcasing property listings and analytics dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Realvista — Buy & Sell Property, Track Profits',
    description:
      'Your one-stop real estate solution with listings, agents, and real-time profit tracking.',
    images: ['https://yourdomain.com/og/realvista-hero.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

const Page = () => {
  return (
    <>
      <MainHero />
      <RealvistaFeatures />
      <FeaturedProperties />
      <RealvistaAdvantages />
      <RealvistaAllInOneSection />
      <FeaturedAgents />
      <TestimonialsSection />
      <FAQSection />
      <AppDownloadSection />
    </>
  )
}

export default Page
