import React from 'react';
import { Download, MapPin, Calculator, Layers } from 'lucide-react';

export default function AppDownloadSection() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-[#348b8b] to-teal-600 text-white">
            <div className="container mx-auto px-4 py-10 lg:py-24 grid lg:grid-cols-2 gap-12 items-center relative z-10">
                {/* Content Section */}
                <div className="space-y-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 inline-block">
                        <h1 className="text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                            Ready To Get Started?
                        </h1>
                    </div>

                    <p className="text-xl text-white/90 max-w-xl">
                        Realvista Is A Comprehensive Real Estate Management App That Helps You Track Income And Expenses With Precision.
                    </p>

                    {/* Feature Highlights */}
                    <div className="grid grid-cols-2 gap-4 max-w-md">
                        {[
                            { icon: MapPin, text: 'Property Tracking' },
                            { icon: Calculator, text: 'Income Management' },
                            { icon: Layers, text: 'Comprehensive Insights' },
                            { icon: Download, text: 'Easy Download' }
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="flex items-center space-x-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm"
                            >
                                <feature.icon className="text-white/80" size={24} />
                                <span className="text-sm text-white/90">{feature.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Download Button */}
                    <div className="flex items-center space-x-6">
                        <a target='_blank' href="https://play.google.com/store/apps/details?id=com.brillianzhub.realvista" className="flex items-center space-x-3 bg-orange-400 hover:bg-orange-500 transition-colors text-white font-semibold px-6 py-3 rounded-full shadow-lg">
                            <Download size={20} />
                            <span>Download App</span>
                        </a>

                        {/* QR Code Placeholder */}
                        <div className="bg-white p-2 rounded-xl">
                            <div className="w-24 h-24 bg-gray-200 flex items-center justify-center rounded-lg">
                                <span className="text-gray-500">QR Code</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Phone Mockup Section */}
                <div className="relative flex justify-center items-center">
                    <div className="relative">
                        {/* Multiple phone mockups with slight overlap and perspective */}
                        <div className="flex justify-center relative">
                            <div className="relative">
                                <div className="w-120 h-[500px] z-20 relative">
                                    <img
                                        src="/design4.jpg"
                                        alt="Realvista App Screens"
                                        className="absolute top-0 left-0 w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Decorative Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl"></div>
                <svg
                    className="absolute top-0 left-0 w-full h-full text-white/10"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <pattern
                            id="pattern"
                            patternUnits="userSpaceOnUse"
                            width="100"
                            height="100"
                        >
                            <path
                                d="M0 0 L50 50 L100 0"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1"
                            />
                        </pattern>
                    </defs>
                    <rect
                        x="0"
                        y="0"
                        width="100%"
                        height="100%"
                        fill="url(#pattern)"
                    />
                </svg>
            </div>
        </section>
    );
}