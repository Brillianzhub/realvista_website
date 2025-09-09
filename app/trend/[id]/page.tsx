"use client"
import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    Calendar,
    Eye,
    Bookmark,
    Share2,
    ArrowLeft,
    Download,
    ExternalLink,
    User,
    MessageCircle,
    ThumbsUp,
    Printer,
    MapPin,
    FileText,
    Tag,
    ChevronRight,
    LoaderCircle
} from 'lucide-react';
import api from '@/config/apiClient';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

// TypeScript interfaces
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
    author?: string;
    tags?: string[];
}


const ReportDetailPage: React.FC = () => {
    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [errorMessage, setErrorMessage] = useState('');
    const params = useParams()

    const reportId = params.id;

    useEffect(() => {
        const fetchReportDetails = async (): Promise<void> => {
            try {
                setLoading(true);
                // In a real implementation, this would be a specific endpoint with the ID
                const response = await api.get(`/trends/reports/${reportId}`);
                setReport(response.data);

                // Fetch related reports
                const relatedResponse = await api.get(`/trends/reports/related/${reportId}`);
                setLoading(false);
            } catch (err) {
                setError("Failed to load report details");
                setLoading(false);
                console.error("Error fetching report:", err);
            }
        };

        fetchReportDetails();
    }, [reportId]);

    const handleSubscribe = async () => {
        // Basic email validation
        if (!email || !email.includes('@') || !email.includes('.')) {
            setStatus('error');
            setErrorMessage('Please enter a valid email address');
            return;
        }

        setStatus('loading');
        try {
            // Send the POST request to the API endpoint using axios
            const response = await api.post('/notifications/email-notifications/subscribe/',
                { email },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );
            // Handle successful subscription
            setStatus('success');
            toast.success("Subscribed to email notifications.")
            setEmail('');
        } catch (error) {
            // Handle error
            setStatus('error');
            setErrorMessage('Something went wrong. Please try again later.');
            console.error('Subscription error:', error);
        }
    };

    const handleKeyDown = (e: any) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubscribe();
        }
    };



    // Format date function
    const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-teal-50">
                <LoaderCircle className="w-12 h-12 text-teal-600 animate-spin" />
            </div>
        );
    }

    if (!report) {
        return (
            <div className="min-h-screen bg-teal-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
                    <div className="text-red-500 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Report Not Found</h2>
                    <p className="text-gray-600 mb-6">We couldn't find the report you're looking for. It may have been removed or the link might be incorrect.</p>
                    <Link href="/trend" className="inline-flex items-center bg-teal-600 text-white px-6 py-3 rounded-full hover:bg-teal-700 transition-colors">
                        <ArrowLeft className="mr-2 h-5 w-5" /> Back to Trends
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-b from-teal-50 to-white min-h-screen">
            {/* Navigation breadcrumb */}
            <div className="bg-white border-b border-gray-100 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center text-sm text-gray-500">
                        <Link href="/" className="hover:text-teal-600 transition-colors">Home</Link>
                        <ChevronRight className="mx-2 w-4 h-4" />
                        <Link href="/trend" className="hover:text-teal-600 transition-colors">Market Trends</Link>
                        <ChevronRight className="mx-2 w-4 h-4" />
                        <span className="text-teal-600 font-medium truncate max-w-xs">{report.title}</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 md:py-12">
                {/* Back button */}
                <Link
                    href="/trend"
                    className="inline-flex items-center mb-8 text-teal-600 hover:text-teal-700 transition-colors font-medium"
                >
                    <ArrowLeft className="mr-2 h-5 w-5" /> Back to Market Trends
                </Link>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Main content - 2/3 width */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            {/* Header image */}
                            {report.attachment && (
                                <div className="h-72 bg-gray-200 relative">
                                    <img
                                        src={report.attachment}
                                        alt={report.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-4 left-4 bg-teal-600 px-4 py-1 rounded-full text-sm font-medium text-white shadow-sm">
                                        {report.category}
                                    </div>
                                </div>
                            )}

                            {/* Content */}
                            <div className="p-8">
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 leading-tight">
                                    {report.title}
                                </h1>

                                <div className="flex flex-wrap items-center text-sm text-gray-500 mb-6 gap-4">
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        {formatDate(report.date_created)}
                                    </div>
                                    {report.author && (
                                        <div className="flex items-center">
                                            <User className="w-4 h-4 mr-1" />
                                            {report.author}
                                        </div>
                                    )}
                                    <div className="flex items-center">
                                        <Eye className="w-4 h-4 mr-1" />
                                        {report.views.toLocaleString()} views
                                    </div>
                                    {/* <div className="flex items-center">
                                        <FileText className="w-4 h-4 mr-1" />
                                        Source: {report.source}
                                    </div> */}
                                </div>

                                {/* Action buttons */}
                                {/* <div className="flex flex-wrap gap-3 mb-8">
                                    <button className="inline-flex items-center bg-teal-50 hover:bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-medium transition-colors">
                                        <Bookmark className="w-4 h-4 mr-2" /> Save
                                    </button>
                                    <button className="inline-flex items-center bg-teal-50 hover:bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-medium transition-colors">
                                        <Share2 className="w-4 h-4 mr-2" /> Share
                                    </button>
                                    <button className="inline-flex items-center bg-teal-50 hover:bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-medium transition-colors">
                                        <Download className="w-4 h-4 mr-2" /> Download PDF
                                    </button>
                                    <button className="inline-flex items-center bg-teal-50 hover:bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-medium transition-colors">
                                        <Printer className="w-4 h-4 mr-2" /> Print
                                    </button>
                                </div> */}

                                {/* Tags */}
                                {report.tags && report.tags.length > 0 && (
                                    <div className="mb-8">
                                        <div className="flex items-center mb-3">
                                            <Tag className="w-4 h-4 mr-2 text-teal-600" />
                                            <span className="font-medium text-gray-700">Tags:</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {report.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-teal-100 hover:text-teal-700 transition-colors cursor-pointer"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Report content */}
                                <div className="prose prose-teal max-w-none" dangerouslySetInnerHTML={{ __html: report.body }} />

                                {/* External link */}
                                {/* <div className="mt-8 pt-6 border-t border-gray-100">
                                    <a
                                        href={report.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-teal-600 font-medium hover:text-teal-700 transition-colors"
                                    >
                                        View Original Source <ExternalLink className="ml-2 w-4 h-4" />
                                    </a>
                                </div> */}
                            </div>
                        </div>

                        {/* Comments section could go here */}
                    </div>

                    {/* Sidebar - 1/3 width */}
                    <div className="md:col-span-1 space-y-8">
                        {/* Market indicators card */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <div className="flex items-center mb-4">
                                <div className="bg-teal-50 p-2 rounded-lg mr-3">
                                    <TrendingUp className="w-5 h-5 text-teal-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Market Indicators</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-600">Price Growth (YoY)</span>
                                        <span className="font-semibold text-green-600">+7.3%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-teal-500 h-2 rounded-full" style={{ width: '73%' }}></div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-600">Inventory Change</span>
                                        <span className="font-semibold text-red-600">-12.8%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-teal-500 h-2 rounded-full" style={{ width: '28%' }}></div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-600">Avg. Days on Market</span>
                                        <span className="font-semibold text-gray-800">22 days</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-teal-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Locations highlighted */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <div className="flex items-center mb-4">
                                <div className="bg-teal-50 p-2 rounded-lg mr-3">
                                    <MapPin className="w-5 h-5 text-teal-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Featured Areas</h3>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-teal-50 transition-colors cursor-pointer">
                                    <div className="bg-teal-100 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                                        <span className="font-bold text-teal-800">1</span>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-800">Riverside District</h4>
                                        <span className="text-sm text-gray-500">15% growth</span>
                                    </div>
                                </div>

                                <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-teal-50 transition-colors cursor-pointer">
                                    <div className="bg-teal-100 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                                        <span className="font-bold text-teal-800">2</span>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-800">East Village</h4>
                                        <span className="text-sm text-gray-500">12.5% growth</span>
                                    </div>
                                </div>

                                <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-teal-50 transition-colors cursor-pointer">
                                    <div className="bg-teal-100 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                                        <span className="font-bold text-teal-800">3</span>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-800">North Hills</h4>
                                        <span className="text-sm text-gray-500">10.2% growth</span>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* Newsletter signup */}
                        <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl shadow-lg p-6 text-white">
                            <h3 className="text-lg font-bold mb-3">Stay Informed</h3>
                            <p className="text-teal-100 mb-4">Get the latest market reports and trends analysis directly to your inbox.</p>

                            {status === 'success' ? (
                                <div className="bg-white/10 rounded-lg p-4 text-center">
                                    <p className="text-white font-medium">
                                        Thanks for subscribing!
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <div className="mb-4">
                                        <input
                                            type="email"
                                            placeholder="Your email address"
                                            className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white placeholder:text-teal-100 focus:outline-none focus:ring-2 focus:ring-white"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            disabled={status === 'loading'}
                                        />
                                        {status === 'error' && (
                                            <p className="mt-2 text-red-200 text-sm">{errorMessage}</p>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleSubscribe}
                                        className={`w-full font-medium py-2 cursor-pointer rounded-lg transition-colors ${status === 'loading'
                                            ? 'bg-teal-200 text-teal-700 cursor-wait'
                                            : 'bg-white text-teal-700 hover:bg-teal-100'
                                            }`}
                                        disabled={status === 'loading'}
                                    >
                                        {status === 'loading' ? 'Subscribing...' : 'Subscribe to Updates'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportDetailPage;