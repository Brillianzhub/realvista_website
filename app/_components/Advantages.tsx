import Image from 'next/image';
import { Trophy, Monitor, BarChart, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function RealvistaAdvantages() {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            {/* Abstract Background Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#348b8b]/5 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FB902D]/5 rounded-full transform -translate-x-1/3 translate-y-1/3"></div>

            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16">
                    <div>
                        <div className="flex items-center mb-3">
                            <div className="h-1 w-10 bg-[#348b8b] mr-3"></div>
                            <span className="text-[#348b8b] font-medium uppercase text-sm tracking-wider">Advantages</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                            Why Choose Realvista?
                        </h2>
                    </div>
                    <div className="mt-6 md:mt-0">
                        <Trophy className="text-[#FB902D]" size={40} />
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">
                    {/* Left Content */}
                    <div className="space-y-8">
                        {/* First Card */}
                        <div className="bg-white shadow-lg rounded-2xl p-8 border-t-4 border-[#348b8b] hover:shadow-xl transition-shadow duration-300">
                            <div className="inline-flex items-center justify-center p-3 bg-[#348b8b]/10 rounded-xl mb-6">
                                <Monitor className="text-[#348b8b]" size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4">
                                ALL-IN-ONE APP
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Manage properties, track profits, and invest smarter. Realvista is your mobile companion for managing your real estate investments with ease, efficiency, and profitability.
                            </p>
                        </div>

                        {/* Second Card */}
                        <div className="bg-white shadow-lg rounded-2xl p-8 border-t-4 border-[#FB902D] hover:shadow-xl transition-shadow duration-300">
                            <div className="inline-flex items-center justify-center p-3 bg-[#FB902D]/10 rounded-xl mb-6">
                                <BarChart className="text-[#FB902D]" size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4">
                                Key Features
                            </h3>
                            <ul className="space-y-4 text-gray-600">
                                <li className="flex items-center">
                                    <CheckCircle className="mr-3 text-[#348b8b]" size={20} />
                                    <span>Track income & expenses in real-time</span>
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="mr-3 text-[#348b8b]" size={20} />
                                    <span>Monitor property values with market insights</span>
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="mr-3 text-[#348b8b]" size={20} />
                                    <span>Generate detailed financial reports</span>
                                </li>
                            </ul>
                        </div>

                        {/* CTA Button */}
                        <Link href="/register" className="inline-block">
                            <button className="group flex items-center gap-2 bg-[#348b8b] text-white px-8 py-4 rounded-xl hover:bg-[#2c7676] transition-all duration-300 font-medium">
                                Get Started
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                            </button>
                        </Link>
                    </div>

                    {/* Right Phone Mockup */}
                    <div className="relative">
                        {/* Background Effects */}
                        <div className="absolute w-full h-full max-w-md max-h-md">
                            <div className="absolute top-1/4 -right-4 w-32 h-32 bg-[#FB902D]/20 rounded-full blur-2xl"></div>
                            <div className="absolute bottom-1/4 -left-4 w-32 h-32 bg-[#348b8b]/20 rounded-full blur-2xl"></div>
                        </div>

                        {/* Phone Frame */}
                        <div className="relative z-10 p-4">
                            <div className="overflow-hidden rounded-2xl">
                                <img
                                    src="/design2.jpg"
                                    alt="Realvista App Interface"
                                    className="h-full object-cover"
                                />
                            </div>
                            {/* Decorative Elements */}
                            <div className="absolute -right-6 top-1/3 w-12 h-12 rounded-full bg-[#FB902D] opacity-75"></div>
                            <div className="absolute -left-4 bottom-1/4 w-8 h-8 rounded-full bg-[#348b8b] opacity-75"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}