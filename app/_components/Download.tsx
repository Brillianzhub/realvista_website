import React from 'react';
import { Download, MapPin, Calculator, Layers } from 'lucide-react';

export default function AppDownloadSection() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-[#348b8b] to-teal-600 text-white">
            <div className="container mx-auto px-4 py-10 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
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

                    <div className="flex flex-col sm:flex-row justify-start gap-4 w-full">
                        <a
                            href="https://play.google.com/store/apps/details?id=com.brillianzhub.realvista"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center cursor-pointer justify-center gap-3 bg-[#FB902D] text-white font-medium py-2 px-10 rounded-full transition-colors shadow-md"
                        >
                            <svg className="w-6 h-6" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M325.3 234.3L104.1 28.4C95.3 20.2 84.3 16 72.4 16a40 40 0 0 0-15.4 3C44.4 24.1 32 40.3 32 58.5v395c0 18.2 12.4 34.4 25 39.5a40 40 0 0 0 15.4 3c11.9 0 22.9-4.2 31.7-12.4l221.2-205.9-10-9.9z" fill="white" />
                                <path d="M361.7 271.5 325.3 256 104.1 483.6a39.3 39.3 0 0 0 22.3 9.6c5.2 0 10.4-1 15.4-3l220-103.1c15.6-7.3 25.2-22.7 25.2-39.5 0-16.6-9.1-31.8-25.3-39.1z" fill="white" />
                                <path d="M447.6 228.5 361.7 188.3l-36.4 35.9 36.4 36.1 85.9-40.3c10.4-4.8 10.4-17.7 0-22.5z" fill="white" />
                                <path d="M361.7 240.2 72.4 16A39.9 39.9 0 0 0 66 15.2a37.3 37.3 0 0 0-13 2.8l254 247.9-254 248a39.3 39.3 0 0 0 13 2.8c2.2 0 4.3-.3 6.4-.8l289.3-224.2c10.4-8.1 10.4-24.1 0-32.3z" fill="white" />
                            </svg>

                            <div className="flex flex-col items-start">
                                <span className="text-xs">Download on</span>
                                <span className="text-sm font-semibold">Google Play</span>
                            </div>
                        </a>

                        <button className="flex items-center justify-center gap-3 bg-black hover:bg-gray-800 text-white font-medium py-2 px-10 rounded-full cursor-pointer transition-colors shadow-md">
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19.0781 24H4.92188C2.20795 24 0 21.7881 0 19.0781V4.92188C0 2.20795 2.20795 0 4.92188 0H19.0781C21.7881 0 24 2.20795 24 4.92188V19.0781C24 21.7881 21.7881 24 19.0781 24Z" fill="black" />
                                <path d="M19.0781 0.5625H4.92188C2.52147 0.5625 0.5625 2.52147 0.5625 4.92188V19.0781C0.5625 21.4785 2.52147 23.4375 4.92188 23.4375H19.0781C21.4785 23.4375 23.4375 21.4785 23.4375 19.0781V4.92188C23.4375 2.52147 21.4785 0.5625 19.0781 0.5625Z" stroke="white" strokeOpacity="0.2" />
                                <path d="M16.6589 12.0003C16.6528 10.2469 17.8522 9.23895 17.9046 9.19542C17.0449 7.94372 15.6235 7.77211 15.145 7.75987C13.9637 7.63901 12.8275 8.50081 12.2232 8.50081C11.6068 8.50081 10.6848 7.77456 9.69182 7.79397C8.42245 7.81227 7.23908 8.54812 6.59836 9.70051C5.27519 12.051 6.25565 15.4969 7.52699 17.2137C8.16059 18.0508 8.90457 18.9981 9.85841 18.9643C10.7834 18.9267 11.1429 18.356 12.2856 18.356C13.416 18.356 13.7512 18.9643 14.725 18.9415C15.7272 18.9227 16.3612 18.0876 16.9716 17.2411C17.6929 16.2628 17.9872 15.3093 18 15.2569C17.9727 15.2485 16.6653 14.7168 16.6589 12.0003Z" fill="white" />
                                <path d="M14.8018 6.13951C15.3235 5.47472 15.668 4.56696 15.5753 3.64575C14.8048 3.67945 13.8454 4.17682 13.3009 4.82836C12.8177 5.40082 12.3989 6.34502 12.5039 7.22987C13.3694 7.29629 14.2623 6.79473 14.8018 6.13951Z" fill="white" />
                            </svg>
                            <div className="flex flex-col items-start">
                                <span className="text-xs">Download on</span>
                                <span className="text-sm font-semibold">App Store</span>
                            </div>
                        </button>
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