import Image from 'next/image';
import { Trophy, Monitor, BarChart, ArrowRight, CheckCircle, Shield, Users } from 'lucide-react';
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
                <div className="grid md:grid-cols-3 gap-8 lg:gap-12 items-start">
                    {/* First Column */}
                    <div className="space-y-8">
                        {/* First Card */}
                        <div className="bg-white shadow-lg rounded-2xl py-10 p-8 border-t-4 border-[#348b8b] hover:shadow-xl transition-shadow duration-300">
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
                    </div>

                    {/* Second Column */}
                    <div className="space-y-8">
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
                    </div>

                    {/* Third Column - New Content */}
                    <div className="space-y-8">
                        {/* Third Card */}
                        <div className="bg-white shadow-lg rounded-2xl p-8 border-t-4 border-[#348b8b] hover:shadow-xl transition-shadow duration-300">
                            <div className="inline-flex items-center justify-center p-3 bg-[#348b8b]/10 rounded-xl mb-6">
                                <Users className="text-[#348b8b]" size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4">
                                EXPERT SUPPORT
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Connect with experienced real estate agents and advisors who can guide you through every step of your property investment journey. Our team of professionals is ready to assist.
                            </p>
                        </div>
                    </div>
                </div>
                <div className='flex justify-center mt-10'>
                    {/* CTA Button */}
                    <Link href="/register" className="inline-block">
                        <button className="group flex items-center gap-2 bg-[#348b8b] text-white px-10 cursor-pointer py-4 rounded-xl hover:bg-[#2c7676] transition-all duration-300 font-medium">
                            Get Started
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    );
}