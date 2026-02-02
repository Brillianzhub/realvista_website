/* eslint-disable */
import React from 'react';
import Image from 'next/image';
import {
    Briefcase,
    TrendingUp,
    CreditCard,
    Users,
    Calculator,
    CheckCircle,
    ChevronRight
} from 'lucide-react';

interface FeatureItemProps {
    icon: React.ReactElement;
    title: string;
    description: string;
    accentColor?: "orange" | "teal";
}

const FeatureItem = ({ icon, title, description, accentColor = "orange" }: FeatureItemProps) => {
    const bgColorClass = accentColor === "teal" ? "bg-teal-100" : "bg-orange-100";
    const iconColorClass = accentColor === "teal" ? "text-teal-600" : "text-orange-500";

    return (
        <div className="group p-4 rounded-xl transition-all duration-300 hover:bg-white hover:shadow-lg">
            <div className="flex items-start gap-4">
                <div className={`${bgColorClass} p-2 rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                    {React.cloneElement(icon)}
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{description}</p>

                    <div className="mt-1 flex items-center text-xs font-medium text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span>Learn more</span>
                        <ChevronRight size={12} className="ml-1" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const RealvistaFeatures = () => {
    return (
        <div id="features" className="py-16 bg-gradient-to-b from-[#dbe8e8]/30 to-white overflow-hidden">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="max-w-xl mx-auto text-center mb-12">
                    <div className="inline-flex items-center px-4 py-1 rounded-full bg-orange-100 mb-3">
                        <span className="text-sm font-medium text-orange-600">Premium Features</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Everything you need to manage your real estate</h2>
                    <p className="text-gray-600">Powerful tools designed to simplify property investment and management</p>
                </div>

                {/* Features Content */}
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* App Showcase */}
                    <div className="relative flex justify-center order-2 lg:order-1">
                        {/* Background decorative elements */}
                        <div className="absolute -z-10 w-96 h-96 rounded-full bg-teal-100/50 blur-3xl -bottom-20 -left-20"></div>
                        <div className="absolute -z-10 w-64 h-64 rounded-full bg-orange-100/50 blur-3xl top-0 right-0"></div>

                        <div className="relative">
                            {/* Feature tags floating around image */}
                            <div className="absolute top-10 bg-white px-3 py-1 rounded-lg shadow-md z-10 hidden md:flex items-center space-x-2">
                                <CheckCircle size={14} className="text-teal-500" />
                                <span className="text-xs font-medium">Real-time tracking</span>
                            </div>

                            {/* <div className="absolute bottom-16 -right-6 bg-white px-3 py-1 rounded-lg shadow-md z-10 hidden md:flex items-center space-x-2">
                                <CheckCircle size={14} className="text-orange-500" />
                                <span className="text-xs font-medium">Smart analytics</span>
                            </div> */}

                            <img
                                src="/design.jpg"
                                // width={600}
                                // height={800}
                                alt="Realvista App Features"
                                className=" mb-16 rounded-md"
                            />
                            <div className="flex flex-col sm:flex-row justify-center gap-4 w-full">
                                <a
                                    href="https://play.google.com/store/apps/details?id=com.brillianzhub.realvista"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center cursor-pointer justify-center gap-3 bg-[#FB902D] text-white font-medium py-2 px-10 rounded-full transition-colors shadow-md"
                                >
                                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3.609 1.814L13.792 12L3.609 22.186C3.538 22.099 3.5 21.987 3.5 21.864V2.136C3.5 2.013 3.538 1.901 3.609 1.814Z" fill="white" />
                                        <path d="M20.683 10.747L16.208 8.168L13.792 12L16.208 15.832L20.683 13.253C21.439 12.815 21.439 11.185 20.683 10.747Z" fill="white" />
                                        <path d="M13.792 12L16.208 8.168L3.609 1.814C4.196 1.452 4.965 1.515 5.524 1.814L13.792 12Z" fill="white" />
                                        <path d="M13.792 12L5.524 22.186C4.965 22.485 4.196 22.548 3.609 22.186L16.208 15.832L13.792 12Z" fill="white" />
                                    </svg>

                                    <div className="flex flex-col items-start">
                                        <span className="text-xs">Download on</span>
                                        <span className="text-sm font-semibold">Google Play</span>
                                    </div>
                                </a>

                                <a
                                  href="https://apps.apple.com/app/6745751743"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                className="flex items-center justify-center gap-3 bg-black hover:bg-gray-800 text-white font-medium py-2 px-6 rounded-full cursor-pointer transition-colors shadow-md flex-1">
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
                                </a>
                            </div>
                        </div>

                    </div>

                    {/* Features List */}
                    <div className="space-y-2 order-1 lg:order-2">
                        <FeatureItem
                            icon={<Briefcase />}
                            title="Manage Portfolio"
                            description="Manage properties, invest strategically, and boost your returns with real-time insights and analytics."
                        />

                        <FeatureItem
                            icon={<TrendingUp />}
                            title="Monitor Property Values"
                            description="Track market trends and property valuations with precision to identify the perfect time to buy or sell."
                            accentColor="teal"
                        />

                        <FeatureItem
                            icon={<CreditCard />}
                            title="Track Income & Expenses"
                            description="Comprehensive financial tracking with categorized expenses, income streams, and customizable reports."
                        />

                        <FeatureItem
                            icon={<Users />}
                            title="Mutual Investment"
                            description="Pool resources with other investors through our secure platform to access premium real estate opportunities."
                            accentColor="teal"
                        />

                        <FeatureItem
                            icon={<Calculator />}
                            title="Savings Target Calculator"
                            description="Set financial goals and track your progress with our intuitive calculator and personalized recommendations."
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default RealvistaFeatures;