"use client"
import { useState, useEffect } from 'react';
import { Home, Search, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
    const [mounted, setMounted] = useState(false);
    const router = useRouter()

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
            <div className={`max-w-2xl w-full text-center transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                {/* 404 Number */}
                <div className="relative mb-8">
                    <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#348b8b] to-[#2a6f6f]">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-32 h-32 bg-[#348b8b] opacity-10 rounded-full blur-3xl"></div>
                    </div>
                </div>

                {/* Message */}
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                    Page Not Found
                </h2>
                <p className="text-lg text-gray-600 mb-12 max-w-md mx-auto">
                    Oops! The page you're looking for seems to have wandered off into the digital wilderness.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link
                        href="/"
                        className="group flex items-center gap-2 px-6 py-3 bg-[#348b8b] text-white rounded-lg font-medium hover:bg-[#2a6f6f] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                        <Home className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </Link>

                    <button
                        onClick={() => router.back()}
                        className="group flex items-center gap-2 px-6 py-3 bg-white text-[#348b8b] border-2 border-[#348b8b] rounded-lg font-medium hover:bg-[#348b8b] hover:text-white transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Go Back
                    </button>
                </div>

                {/* Decorative Elements */}
                <div className="mt-16 flex justify-center gap-2">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="w-2 h-2 rounded-full bg-[#348b8b] opacity-50 animate-pulse"
                            style={{
                                animationDelay: `${i * 0.2}s`,
                                animationDuration: '2s'
                            }}
                        ></div>
                    ))}
                </div>

                {/* Helper Text */}
                <p className="mt-8 text-sm text-gray-500">
                    Error Code: 404 | Page Not Found
                </p>
            </div>
        </div>
    );
}