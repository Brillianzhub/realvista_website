// pages/about-us.js
import Head from 'next/head';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, HomeIcon, Users, BookOpen, PieChart, BadgeCheck } from "lucide-react";
import Link from 'next/link';

export default function AboutUs() {
    return (
        <div className="min-h-screen bg-white">
            <Head>
                <title>About Us | Realvista Properties</title>
                <meta name="description" content="Learn about RealVista Properties and our mission to turn your real estate dreams into reality" />
            </Head>

            {/* Hero Section */}
            <div className="w-full bg-[#348b8b] text-white">
                <div className="container mx-auto px-4 py-20 md:py-32">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">About Realvista Properties</h1>
                    <p className="text-xl md:text-2xl max-w-3xl opacity-90">
                        Here, we turn your real estate dreams into reality, one property at a time.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-16">
                <div className="grid md:grid-cols-2 gap-16 items-center mb-16">
                    <div>
                        <h2 className="text-3xl font-bold mb-6 text-[#348b8b]">Our Story</h2>
                        <p className="mb-4 text-gray-700">
                            Driven by a deep passion for real estate and a commitment to outstanding service, we are a dedicated team of professionals here to help you manage your real estate portfolio and discover the perfect home or investment property.
                        </p>
                        <p className="text-gray-700">
                            We're with you every step of the way, ensuring your experience is seamless and rewarding. Our mission is to simplify the real estate process, offering tailored services backed by a deep understanding of the market.
                        </p>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-8 h-full">
                        <Building2 className="text-[#348b8b] w-16 h-16 mb-6" />
                        <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                        <p className="text-gray-700">
                            We recognize that buying, selling, and investing in property isn't just a transaction, it's a life-changing experience. That's why we are committed to providing personalized solutions, expert guidance, and unmatched support throughout the process.
                        </p>
                    </div>
                </div>

                {/* Services Section */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold mb-12 text-center text-[#348b8b]">Our Services</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: <HomeIcon />,
                                title: "Property Buying & Selling",
                                description: "Expert guidance through every step of buying or selling your property."
                            },
                            {
                                icon: <PieChart />,
                                title: "Portfolio Management",
                                description: "Effective management of your real estate assets for maximum returns."
                            },
                            {
                                icon: <BookOpen />,
                                title: "Mutual Investment",
                                description: "Professional advice on high-yield property investments."
                            },
                            {
                                icon: <Users />,
                                title: "Client-First Approach",
                                description: "Personalized solutions tailored to your unique needs and goals."
                            }
                        ].map((service, index) => (
                            <Card key={index} className="border-gray-200 transition-all hover:shadow-md">
                                <CardContent className="pt-6">
                                    <div className="text-[#348b8b] mb-4">
                                        {service.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                                    <p className="text-gray-600">{service.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Values Section */}
                <div className="bg-gray-50 rounded-xl p-8 md:p-12 mb-16">
                    <h2 className="text-3xl font-bold mb-8 text-center text-[#348b8b]">Our Core Values</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Integrity",
                                description: "We conduct our business with the highest ethical standards and transparency."
                            },
                            {
                                title: "Trust",
                                description: "Building lasting trust through consistent reliability and honest communication."
                            },
                            {
                                title: "Client Satisfaction",
                                description: "Your success and satisfaction are the ultimate measures of our success."
                            }
                        ].map((value, index) => (
                            <div key={index} className="flex flex-col items-center text-center">
                                <BadgeCheck className="text-[#348b8b] w-12 h-12 mb-4" />
                                <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                                <p className="text-gray-600">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Call to Action */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-6">Join Us Today</h2>
                    <p className="text-gray-700 max-w-3xl mx-auto mb-8">
                        Whether you're a first-time homebuyer, an experienced investor, or looking to sell your property, we provide innovative real estate solutions and exceptional customer care. With RealVista, you're sure to find the perfect property or investment that aligns with your goals and lifestyle.
                    </p>
                    <Link href="/contact" className="bg-[#348b8b] text-white hover:bg-[#297878] px-8 py-3 rounded-md text-lg">
                        Contact Us
                    </Link>
                </div>

                {/* Closing */}
                <div className="border-t border-gray-200 pt-12">
                    <p className="text-xl text-center text-gray-700 max-w-3xl mx-auto">
                        At <span className="font-bold">Realvista Properties</span>, integrity, trust, and client satisfaction are the pillars of our business. Our dedication to building lasting relationships with our clients and our passion for real estate fuel our daily efforts to ensure your success. Join us and experience a higher standard of excellence in real estate.
                    </p>
                </div>
            </div>
        </div>
    );
}