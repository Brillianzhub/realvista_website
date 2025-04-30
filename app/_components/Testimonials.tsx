"use client"
import React, { useState, useEffect } from 'react';
import { Quote, Star, ArrowUp } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import api from '@/config/apiClient';

const TestimonialSection = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [loading, setLoading] = useState(false)
    const [reviews, setReviews] = useState<any>(null)

    useEffect(() => {
        const fetchTestimonials = async () => {
            setLoading(true);
            try {
                const response = await api.get('/feedbacks/');
                setReviews(response.data);
                console.log("response------>", response)
            } catch (error) {
                console.error("Error fetching properties:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTestimonials();
    }, []);


    console.log("reviews---->", reviews)

    // Selected testimonials (just 3)
    const testimonials = [
        {
            id: 1,
            quote: "RealVista transformed how I manage my property listings. The interface is intuitive, and I've seen a 40% increase in client inquiries since switching over. The analytics dashboard gives me insights I never had before.",
            name: "Ben Okechukwu",
            position: "Senior Property Manager, Horizon Estates",
            avatar: "/roy.jpg",
            rating: 5
        },
        {
            id: 2,
            quote: "As a realtor managing multiple properties, I needed a system that could scale with my business. RealVista has been a game-changer - from streamlined listings to automatic client notifications, everything just works beautifully.",
            name: "Grace Agabi",
            position: "Independent Realtor, Prime Properties",
            avatar: "/ken.jpg",
            rating: 5
        },
        {
            id: 4,
            quote: "I was skeptical about switching platforms, but RealVista's features convinced me. The virtual tours integration and automated follow-ups have helped me close deals 30% faster. Worth every penny of the subscription.",
            name: "Praise Osondu",
            position: "Luxury Property Specialist, Prestige Homes",
            avatar: "/kath.jpg",
            rating: 5
        }
    ];

    // Handle scroll-to-top visibility
    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    return (
        <div className="w-full py-20 px-4 bg-gradient-to-b from-white to-blue-50/30 overflow-hidden">
            <div className="max-w-6xl mx-auto">
                {/* Decorative elements */}
                <div className="absolute -left-32 -top-32 w-64 h-64 bg-[#348b8b]/10 rounded-full blur-3xl"></div>
                <div className="absolute right-0 bottom-0 w-96 h-96 bg-[#348b8b]/5 rounded-full blur-3xl"></div>

                <div className="relative text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        viewport={{ once: true }}
                    >
                        <div className="inline-block p-3 bg-[#348b8b]/10 rounded-full mb-4">
                            <Quote size={30} className="text-[#348b8b]" />
                        </div>
                        <h2 className="text-4xl font-bold mb-4 text-gray-800">What Our Clients Say</h2>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">Real experiences from real estate professionals who've transformed their business with RealVista</p>
                        <div className="w-24 h-1 bg-[#348b8b] mx-auto mt-6"></div>
                    </motion.div>
                </div>

                {/* Testimonial Cards */}
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    {reviews?.map((testimonial: any, index: number) => (
                        <motion.div
                            key={testimonial.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: index * 0.2 }}
                            viewport={{ once: true }}
                            className="relative bg-white rounded-xl shadow-lg p-8 border border-[#348b8b]/10 flex flex-col hover:shadow-xl hover:border-[#348b8b]/30 transition-all duration-300"
                        >
                            {/* Decorative accent */}
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#348b8b]/80 to-[#348b8b]/40 rounded-t-xl"></div>

                            <div className="flex justify-between items-start mb-6">
                                <Quote size={36} className="text-[#348b8b] opacity-60" />
                                <div className="flex">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                                    ))}
                                </div>
                            </div>
                            <p className="text-gray-700 mb-8 italic leading-relaxed flex-grow">{testimonial.feedback}</p>
                            <div className="flex items-center mt-auto pt-6 border-t border-[#348b8b]/10">
                                {testimonial.avatar && (<div className="w-14 h-14 rounded-full mr-4 overflow-hidden border-2 border-[#348b8b]/30 shadow-md">
                                    <img
                                        src={testimonial.avatar}
                                        alt={`${testimonial.name}'s avatar`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>)}

                                <div>
                                    <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                                    <p className="text-[#348b8b] text-sm">{testimonial.position}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Call to action */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.6 }}
                    viewport={{ once: true }}
                    className="relative mt-12 text-center p-10 bg-[#348b8b]/10 rounded-2xl"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#348b8b]/5 to-[#348b8b]/20 rounded-2xl backdrop-blur-sm"></div>
                    <div className="relative">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Join hundreds of satisfied real estate professionals</h3>
                        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">Experience the platform that's revolutionizing how properties are managed and sold.</p>
                        <Link href="/listings" className="bg-[#348b8b] hover:bg-[#348b8b]/90 text-white font-medium py-4 px-10 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:translate-y-1">
                            Get Started Today
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Scroll to top button */}
            {isVisible && (
                <div className="fixed bottom-6 right-6">
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="bg-[#348b8b] hover:bg-[#348b8b]/80 text-white p-3 rounded-md shadow-lg transition-all duration-300 hover:shadow-xl"
                        aria-label="Scroll to top"
                    >
                        <ArrowUp size={20} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default TestimonialSection;