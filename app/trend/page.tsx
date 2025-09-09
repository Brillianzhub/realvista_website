"use client"
import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  MapPin,
  Home,
  DollarSign,
  BarChart2,
  Globe,
  Calendar,
  Eye,
  Newspaper,
  ChevronRight,
  LoaderCircle
} from 'lucide-react';
import api from '@/config/apiClient';
import Link from 'next/link';

// TypeScript interfaces
interface MarketTrend {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
}

interface MarketDataPoint {
  name: string;
  Median: number;
  Average: number;
}

interface Report {
  id: number;
  category: string;
  title: string;
  body: string;
  source: string;
  url: string;
  date_created: string;
  date_updated: string;
  attachment: string | null;
  views: number;
}

// Simulated Trend Data
const marketTrends: MarketTrend[] = [
  {
    id: 1,
    title: "Urban Migration Shift",
    description: "Increasing interest in suburban and rural properties post-pandemic, with remote work driving location flexibility.",
    icon: <Globe className="w-8 h-8 text-teal-500" />,
    category: "Location"
  },
  {
    id: 2,
    title: "Smart Home Integration",
    description: "Rising demand for properties with advanced technology, energy efficiency, and home automation systems.",
    icon: <Home className="w-8 h-8 text-teal-500" />,
    category: "Technology"
  },
  {
    id: 3,
    title: "Investment Hotspots",
    description: "Emerging neighborhoods with high potential for appreciation and rental income.",
    icon: <DollarSign className="w-8 h-8 text-teal-500" />,
    category: "Investment"
  }
];

const marketData: MarketDataPoint[] = [
  { name: '2022', Median: 350000, Average: 385000 },
  { name: '2023', Median: 375000, Average: 412000 },
  { name: '2024', Median: 402000, Average: 445000 }
];

const TrendsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const categories: string[] = [
    'All',
    ...new Set(marketTrends.map(trend => trend.category))
  ];

  const filteredTrends: MarketTrend[] = selectedCategory === 'All'
    ? marketTrends
    : marketTrends.filter(trend => trend.category === selectedCategory);

  useEffect(() => {
    const fetchReports = async (): Promise<void> => {
      try {
        setLoading(true);
        const response = await api.get("/trends/reports");
        setReports(response.data.results);
        setLoading(false);
      } catch (err) {
        setError("Failed to load market reports");
        setLoading(false);
        console.error("Error fetching reports:", err);
      }
    };

    fetchReports();
  }, []);

  // Format date function
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Truncate text function
  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength).trim() + '...';
  };

  return (
    <div className="bg-gradient-to-b from-teal-50 to-white min-h-screen">
      {/* Header with Decorative Elements */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-teal-900 opacity-5 z-0">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%233f8b8b\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
            backgroundSize: '30px 30px'
          }}></div>
        </div>

        {/* Hero Section */}
        <div className="relative z-10 container mx-auto px-4 pt-24 pb-16 text-center">
          <div className="inline-flex items-center bg-white rounded-full px-6 py-3 mb-8 shadow-md border border-teal-100">
            <TrendingUp className="mr-2 text-teal-600" />
            <span className="text-gray-700 font-medium">Real Estate Market Insights</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
            Market Trends <span className="text-teal-600">&</span> Insights
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg mb-10">
            Stay informed with the latest real estate market trends, investment opportunities,
            and emerging patterns shaping the property landscape.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search for market trends, reports, or insights..."
                className="w-full py-4 pl-5 pr-12 rounded-full shadow-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <button className="absolute right-3 bg-teal-600 text-white p-2 rounded-full hover:bg-teal-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20">
        {/* Category Filter */}
        <div className="flex justify-center mb-8 md:mb-12 px-4">
          <div className="bg-white rounded-2xl shadow-md p-1.5 border border-gray-100 w-full max-w-md overflow-x-auto">
            <div className="flex flex-nowrap min-w-max">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`
            px-4 sm:px-6 py-2 sm:py-3 rounded-xl whitespace-nowrap transition-all font-medium text-xs sm:text-sm mx-0.5
            ${selectedCategory === category
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-teal-600'}
          `}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>


        {/* Trends Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {filteredTrends.map(trend => (
            <div
              key={trend.id}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-teal-100 group"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-50 rounded-2xl mb-6 group-hover:bg-teal-100 transition-colors">
                {React.cloneElement(trend.icon as React.ReactElement)}
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-teal-600 transition-colors">{trend.title}</h3>
              <p className="text-gray-600">{trend.description}</p>
              {/* <button className="mt-6 flex items-center text-teal-600 font-medium hover:text-teal-700 transition-colors">
                Learn more <ArrowRight className="ml-2 w-4 h-4" />
              </button> */}
            </div>
          ))}
        </div>

        {/* Market Reports Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="text-teal-600 font-medium mb-2 flex items-center">
                <Newspaper className="w-5 h-5 mr-2" />
                Latest Publications
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Market Reports & Analysis</h2>
            </div>
            <button className="hidden md:flex items-center text-teal-600 font-medium hover:text-teal-700 transition-colors">
              View all reports <ChevronRight className="ml-1 w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <LoaderCircle className="w-10 h-10 text-teal-600 animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg text-center">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {reports.map(report => (
                <div
                  key={report.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-gray-100"
                >
                  <div className="h-48 bg-gray-200 relative">
                    {report.attachment && (
                      <img
                        src={report.attachment}
                        alt={report.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700 shadow-sm">
                      {report.category}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3 text-gray-800 line-clamp-2 hover:text-teal-600 transition-colors">
                      {report.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {truncateText(report.body, 150)}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(report.date_created)}
                      </div>
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {report.views} views
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      {/* <span className="text-sm text-gray-500">Source: {report.source}</span> */}
                      <div />
                      <Link
                        href={`/trend/${report.id}`}
                        rel="noopener noreferrer"
                        className="flex items-center text-teal-600 font-medium hover:text-teal-700 transition-colors"
                      >
                        Read More
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <button className="flex items-center justify-center mx-auto text-teal-600 font-medium hover:text-teal-700 transition-colors">
              View all reports <ChevronRight className="ml-1 w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Market Overview */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center mb-8">
            <div className="bg-teal-50 p-3 rounded-xl mr-4">
              <BarChart2 className="w-6 h-6 text-teal-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Market Performance</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-teal-600" />
                Property Value Trends
              </h3>
              <div className="space-y-4">
                {marketData.map((data, index) => (
                  <div
                    key={data.name}
                    className={`bg-gradient-to-r ${index === marketData.length - 1
                        ? 'from-teal-50 to-teal-100 border-l-4 border-teal-500'
                        : 'from-gray-50 to-gray-100'
                      } rounded-lg p-4`}
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="font-medium text-gray-700 mb-2 sm:mb-0">{data.name}</span>
                      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                        <div className="flex items-center">
                          <span className="text-gray-600 mr-2">Median:</span>
                          <span className="font-semibold">${data.Median.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-600 mr-2">Average:</span>
                          <span className="font-semibold">${data.Average.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Growth indicators for non-first years */}
                    {index > 0 && (
                      <div className="flex justify-end mt-2 text-sm flex-wrap">
                        <div className="flex items-center mr-4 mt-1">
                          <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
                          <span className="text-green-600">
                            +{(((data.Median - marketData[index - 1].Median) / marketData[index - 1].Median) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center mt-1">
                          <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
                          <span className="text-green-600">
                            +{(((data.Average - marketData[index - 1].Average) / marketData[index - 1].Average) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-teal-600" />
                Key Market Insights
              </h3>
              <ul className="space-y-4">
                <li className="flex flex-col sm:flex-row items-start bg-gradient-to-r from-teal-50 to-teal-100 p-4 sm:p-5 rounded-lg border-l-4 border-teal-500">
                  <div className="bg-white p-2 rounded-lg shadow-sm mb-3 sm:mb-0 sm:mr-4 flex-shrink-0">
                    <MapPin className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Growing Markets</p>
                    <p className="text-gray-600">
                      Suburban areas showing 15% price appreciation, with particularly strong growth in family-friendly communities with good schools and amenities.
                    </p>
                  </div>
                </li>
                <li className="flex flex-col sm:flex-row items-start bg-gradient-to-r from-gray-50 to-gray-100 p-4 sm:p-5 rounded-lg">
                  <div className="bg-white p-2 rounded-lg shadow-sm mb-3 sm:mb-0 sm:mr-4 flex-shrink-0">
                    <Home className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Inventory Trends</p>
                    <p className="text-gray-600">
                      Low inventory driving competitive market conditions with average time on market reduced by 30% compared to previous year. Multiple offer situations common in high-demand areas.
                    </p>
                  </div>
                </li>
                <li className="flex flex-col sm:flex-row items-start bg-gradient-to-r from-gray-50 to-gray-100 p-4 sm:p-5 rounded-lg">
                  <div className="bg-white p-2 rounded-lg shadow-sm mb-3 sm:mb-0 sm:mr-4 flex-shrink-0">
                    <Globe className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">International Investment</p>
                    <p className="text-gray-600">
                      Foreign investment increasing in premium locations, with a 22% rise in international buyers seeking stable real estate markets for capital preservation.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Call to Action */}
          {/* <div className="mt-10 text-center">
            <button className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-8 rounded-full transition-colors shadow-md hover:shadow-lg flex items-center mx-auto">
              Get Full Market Analysis <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default TrendsPage;