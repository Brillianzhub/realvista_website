"use client"
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import Link from 'next/link';
import api from '@/config/apiClient';

interface Statistics {
    properties: number;
    cities: number;
    happy_clients: number;
    agents: number;
  }

export default function MainHero() {
    // State for background image rotation
    const [activeIndex, setActiveIndex] = useState(0);
    const [nextIndex, setNextIndex] = useState(1);
    const [transitioning, setTransitioning] = useState(false);
    const backgroundImages = ['/property.jpg', '/heroone.webp', '/herotwo.webp'];
    const [loading, setLoading] = useState(false)
    const [statistics, setStatistics] = useState<Statistics>({
        properties: 1500,
        cities: 40,
        happy_clients: 2000,
        agents: 100
      })

    // Preload images for smoother transitions
    useEffect(() => {
        backgroundImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }, []);

    useEffect(() => {
        const fetchPropertyStats = async () => {
            setLoading(true);
            try {
                const response = await api.get('/homepage-stats/');
                setStatistics(response.data);
            } catch (error) {
                console.error("Error fetching properties:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPropertyStats();
    }, []);

    // Handle image rotation
    useEffect(() => {
        const interval = setInterval(() => {
            // Start transition
            setTransitioning(true);

            // Wait for transition to complete, then update active image
            setTimeout(() => {
                setActiveIndex(nextIndex);
                setNextIndex((nextIndex + 1) % backgroundImages.length);
                setTransitioning(false);
            }, 1000);
        }, 6000);

        return () => clearInterval(interval);
    }, [nextIndex]);

    return (
        <div className="relative w-full h-screen min-h-[600px] max-h-[800px] overflow-hidden">
            {/* Background Images with Overlay */}
            {/* Current Image (always visible) */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-r from-[#348b8b]/80 to-blue-800/50 z-10" />
                <img
                    src={backgroundImages[activeIndex]}
                    alt="Luxury Real Estate"
                    className="w-full h-full object-cover object-center"
                />
            </div>

            {/* Next Image (fades in during transition) */}
            <div
                className={`absolute inset-0 z-0 transition-opacity duration-1000 ${transitioning ? 'opacity-100' : 'opacity-0'
                    }`}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-[#348b8b]/80 to-blue-800/50 z-10" />
                <img
                    src={backgroundImages[nextIndex]}
                    alt="Luxury Real Estate"
                    className="w-full h-full object-cover object-center"
                />
            </div>

            {/* Hero Content */}
            <div className="relative z-20 h-full flex flex-col justify-center items-center px-4 md:px-8">
                <div className="max-w-5xl mx-auto text-center space-y-6 mb-12">
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight animate-fade-in">
                        Make smarter decisions
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto animate-fade-in-delay">
                        From buying and selling to real-time profit tracking, Realvista is your one-stop real estate solution.
                    </p>
                </div>

                {/* Call to Action */}
                <div className="w-full max-w-xl mx-auto animate-rise-up">
                    <div className="flex flex-col items-center space-y-6">
                        {/* Refined CTA Button */}
                        <Link
                            href="/listings"
                            className="bg-white text-[#348b8b] hover:bg-[#348b8b] hover:text-white font-semibold py-4 px-8 md:px-10 rounded-lg transition-all duration-300 flex items-center justify-center space-x-3 group shadow-lg transform hover:scale-105"
                        >
                            <Search className="w-5 h-5 transition-transform group-hover:rotate-12" />
                            <span className="text-lg">Browse Exclusive Listings</span>
                        </Link>

                        {/* Separator Line */}
                        <div className="w-24 h-px bg-white/30 my-2"></div>

                        {/* Secondary Actions */}
                        {/* <div className="flex flex-wrap justify-center gap-4">
                            <Link href="/pricing" className="text-white hover:text-[#348b8b] bg-white/10 hover:bg-white backdrop-blur-sm px-6 py-3 rounded-lg transition-all duration-300">
                                See pricing
                            </Link>
                            <Link href="/trend" className="text-white hover:text-[#348b8b] bg-white/10 hover:bg-white backdrop-blur-sm px-6 py-3 rounded-lg transition-all duration-300">
                                Our trend
                            </Link>
                        </div> */}
                    </div>
                </div>

                {/* Property Stats */}
                <div className="mt-16 animate-fade-in-delay bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-8">
                    <div className="grid mt-[-10px] md:mt-0 grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 lg:gap-12">
                        {[
                            { label: "Properties", value: `${statistics?.properties?.toLocaleString() || '1,500'}+` },
                            { label: "Cities", value: `${statistics?.cities || '40'}+` },
                            { label: "Happy Clients", value: `${statistics?.happy_clients?.toLocaleString() || '2,000'}+` },
                            { label: "Agents", value: `${statistics?.agents || '100'}+` }
                        ].map((stat, index) => (
                            <div key={index} className="text-center p-2">
                                <p className="text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
                                <p className="text-white/80 text-sm md:text-base">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Subtle Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                <div className="w-8 h-12 border-2 border-white/50 rounded-full flex justify-center pt-2">
                    <div className="w-1 h-3 bg-white rounded-full animate-scroll" />
                </div>
            </div>

            {/* Navigation Dots for Background Images */}
            <div className="absolute bottom-8 right-8 z-30 flex space-x-2">
                {backgroundImages.map((_, index) => (
                    <button
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${index === activeIndex ? 'bg-white w-4' : 'bg-white/50'
                            }`}
                        onClick={() => {
                            setNextIndex(index);
                            setTransitioning(true);
                            setTimeout(() => {
                                setActiveIndex(index);
                                setNextIndex((index + 1) % backgroundImages.length);
                                setTransitioning(false);
                            }, 1000);
                        }}
                    />
                ))}
            </div>

            {/* CSS Animations */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes fadeInDelay {
                    0% { opacity: 0; }
                    50% { opacity: 0; }
                    100% { opacity: 1; }
                }
                
                @keyframes riseUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes scroll {
                    0% { transform: translateY(0); opacity: 1; }
                    30% { opacity: 1; }
                    60% { opacity: 0; }
                    100% { transform: translateY(6px); opacity: 0; }
                }
                
                .animate-fade-in {
                    animation: fadeIn 1s ease-out forwards;
                }
                
                .animate-fade-in-delay {
                    animation: fadeInDelay 2s ease-out forwards;
                }
                
                .animate-rise-up {
                    animation: riseUp 1s ease-out forwards;
                }
                
                .animate-scroll {
                    animation: scroll 2s infinite;
                }
            `}</style>
        </div>
    );
}