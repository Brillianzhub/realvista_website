"use client"

import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Search, Home, Mail, Phone, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// TypeScript interface for FAQ item
interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

const FAQPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [openItems, setOpenItems] = useState<number[]>([]);

    // FAQ categories
    const categories = ['General', 'Portfolio Management', 'Investment Platform', 'Market', 'Mutual Investment', 'Technical Support and Account Management', 'Privacy and Security'];

    // FAQ data
    const faqItems: FAQItem[] = [
        {
            question: "What services does Realvista offer?",
            answer: "Realvista provides a wide range of real estate services, which are categorised into four: (i) Portfolio Management: We provide a robust platform that allows users to update and manage their diverse real estate portfolios in real time. (ii) Investment Platform: Our investment services allow beginners and established real estate investors to seamlessly access affordable properties and generate cash flow by acquiring property slots depending on their financial capabilities. (iii) Market: Realvista is the meeting place for real estate buyers and sellers. Registered users, real estate agents, and companies can freely upload properties for rent or sale. These grants access to a pool of quality properties for the buyers. (iv) Mutual Investment: This unique feature allows for group mutual funding of properties. A group of investors can create an independent group. Each group can add member, upload, and manage their properties independently.",
            category: "General"
        },
        {
            question: "How do I create an account on your website/app?",
            answer: "To create an account, click on the \"Sign Up\" button on our website or app. You will be required to choose the type of account you wish to create (customer account or agent/company account). Fill out the registration form according to the type of account, providing your complete details, including full name, email address, and password. After completing the registration, you'll receive a confirmation email with an activation token. Input the code on the app or website to activate your account.",
            category: "General"
        },
        {
            question: "Can I access your website/app for free?",
            answer: "Yes, our website and app can be accessed freely. You can browse property listings, schedule viewings, and access other features at no cost. However, some of our premium services, like Portfolio management and Investment platforms, require a subscription.",
            category: "General"
        },
        {
            question: "Are there Limits to the number of properties I can add to my portfolio?",
            answer: "There are no limits to the number of properties you can add or manage. However, there are different subscription fees based on the number of properties you wish to add.",
            category: "Portfolio Management"
        },
        {
            question: "How do I know the exact coordinates of my property?",
            answer: "To ensure you enter the accurate and exact coordinates of your property, we have provided a tutorial on the learn page to guide you on that. Please visit our learn page on the app.",
            category: "Portfolio Management"
        },
        {
            question: "How do I update a property in my portfolio?",
            answer: "To update any property in your portfolio, select the portfolio button. Once on your portfolio, click the addition icon and then select 'update property.' You can also update your property from the 'Manager' button on the app.",
            category: "Portfolio Management"
        },
        {
            question: "Who can invest with Realvista?",
            answer: "The RealVista investment platform is regulated under real estate investment regulations. Our investment platform is mostly suitable for institutional investors or individuals with the experience, knowledge, and expertise necessary to make independent investment decisions and understand the risks posed by investment in real estate properties.",
            category: "Investment Platform"
        },
        {
            question: "How can I learn more about investment opportunities with Realvista?",
            answer: "We have a simplified system for you to discover more about investment opportunities with us. You can begin by exploring our website, where you will find detailed information about our investment products, strategies, and current portfolios. Additionally, consider registering on our mobile app or website to benefit from notifications of our latest product launches and newsletters.",
            category: "Investment Platform"
        },
        {
            question: "Are there limits to the number of slots one can purchase?",
            answer: "There are no limits to the number of slots you can purchase. However, the number of slots allocated to properties differs and is limited. The available slots are always listed with the property and updated in real time. You can only purchase the maximum number of available slots at the time of your payment.",
            category: "Investment Platform"
        },
        {
            question: "How do I join a mutual fund group?",
            answer: "Every mutual fund group is an independent and closed group. They are not listed/created by Realvista, and therefore, we cannot add you to a group. You can only be added to a group through a private invitation by the admin of the group.",
            category: "Mutual Investment"
        },
        {
            question: "What are the rules of the groups?",
            answer: "Each group has its private terms and conditions. We encourage you to pay close attention and review the terms and conditions before joining any group. The groups are not managed by Realvista; therefore, we will not be held responsible for any mismanagement of funds or wrong investment decisions.",
            category: "Mutual Investment"
        },
        {
            question: "How do I search for properties on your platform?",
            answer: "To search for properties, use the search bar on the homepage. You can also select filters such as location, price range, property type, and features to personalise your search. Also, you can browse through curated categories or explore the map view to find listings near your preferred location.",
            category: "Market"
        },
        {
            question: "How do I make an offer on a property?",
            answer: "Once you find a property you're interested in, you can contact the listing agent through the website or app to make an offer. The agents' contact details are listed with the properties.",
            category: "Market"
        },
        {
            question: "How do I schedule a property viewing?",
            answer: "To schedule a viewing, simply click on the \"Schedule a Viewing\" button on the property listing page. Select a date and time that works for you, and the listing agent/company will confirm the appointment. You will receive a reminder via email or SMS before the viewing.",
            category: "Market"
        },
        {
            question: "How can I list my property for sale on your platform?",
            answer: "You can list properties through our mobile app or website. To list your property, you will need to create an agent/company account. On the app, select the 'manager' option, and then select 'list to the market'. Provide details about the property, upload high-quality photos, and set a price. On the website, open your profile and click on My listings. Then click on 'Add New Property' to list a new property.",
            category: "Market"
        },
        {
            question: "Do you offer professional photography services?",
            answer: "Yes, we offer professional photography and videography services to showcase your property in the best possible light, depending on the city. Contact us through the app or website to arrange a photoshoot.",
            category: "Market"
        },
        {
            question: "How do I track the progress of my listing?",
            answer: "You can monitor the performance of your listing by logging into your account, on the app homepage, selecting the 'manager' option, and then selecting 'list to the market.' Here, you'll find analytics on views, inquiries, and offers. On the website, visit your profile for more detailed analytics on your listings. You may also get notifications on any major developments.",
            category: "Market"
        },
        {
            question: "I'm having trouble logging into my account. What should I do?",
            answer: "If you're unable to log in, first ensure your internet access is enabled and try logging in again. Secondly, try resetting your password by clicking on the \"Forgot Password\" link on the login page. If the problem persists, please contact our support team through the \"Contact\" section of the website or app for further assistance.",
            category: "Technical Support and Account Management"
        },
        {
            question: "How do I update my account information?",
            answer: "To update your account information, log into your account and visit the \"Profile Settings\" section. From here, you can update your email, phone number, password, and other details.",
            category: "Technical Support and Account Management"
        },
        {
            question: "How do I delete my account?",
            answer: "If you wish to delete your account, log in to your account and visit the \"Profile Settings\" section. Scroll down to the bottom of the page. You will see the 'delete account' button; click on it and follow the prompts to delete your account permanently.",
            category: "Technical Support and Account Management"
        },
        {
            question: "Is my personal information safe on your platform?",
            answer: "Yes, we prioritise your privacy and security. We use industry-standard encryption to protect your personal and financial information. For more details, please refer to our Privacy Policy.",
            category: "Privacy and Security"
        },
        {
            question: "Do you share my information with third parties?",
            answer: "We do not share your personal information with third parties unless required for specific services, such as processing payments or for legal purposes. You can review our Privacy Policy for a full explanation of how your data is used.",
            category: "Privacy and Security"
        }
    ];

    // Toggle FAQ item accordion
    const toggleItem = (index: number) => {
        if (openItems.includes(index)) {
            setOpenItems(openItems.filter(item => item !== index));
        } else {
            setOpenItems([...openItems, index]);
        }
    };

    // Filter FAQs based on search query and selected category
    const filterFAQs = (items: FAQItem[], category: string, query: string) => {
        return items.filter(item => {
            const matchesCategory = category === 'All' || item.category === category;
            const matchesQuery =
                item.question.toLowerCase().includes(query.toLowerCase()) ||
                item.answer.toLowerCase().includes(query.toLowerCase());
            return matchesCategory && matchesQuery;
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Banner */}
            <div className="bg-[#348b8b] text-white py-16 md:py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#348b8b] to-[#205b5b] opacity-90"></div>
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: "url('/api/placeholder/1200/800')",
                        backgroundSize: "cover",
                        backgroundPosition: "center"
                    }}
                ></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Frequently Asked Questions</h1>
                        <p className="text-xl md:text-2xl opacity-90">
                            Find answers to common questions about our real estate services and processes.
                        </p>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white py-6 shadow-md">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto relative">
                        <Input
                            type="text"
                            placeholder="Search for answers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 py-6 text-lg rounded-lg border-gray-300 focus:border-[#348b8b] focus:ring-[#348b8b]"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
            </div>

            {/* FAQ Content */}
            <div className="container mx-auto px-4 py-12">
                <Tabs defaultValue="All" className="max-w-4xl mx-auto">
                    <div className="mb-8 w-full overflow-x-auto">
                        <div className="flex justify-center min-w-max">
                            <TabsList className="bg-gray-100 p-1 rounded-full flex-wrap sm:flex-nowrap gap-1">
                                <TabsTrigger
                                    value="All"
                                    className="rounded-full data-[state=active]:bg-[#348b8b] data-[state=active]:text-white px-6 py-2"
                                >
                                    All
                                </TabsTrigger>
                                {categories.map((category) => (
                                    <TabsTrigger
                                        key={category}
                                        value={category}
                                        className="rounded-full data-[state=active]:bg-[#348b8b] data-[state=active]:text-white px-6 py-2"
                                    >
                                        {category}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>
                    </div>

                    <TabsContent value="All" className="mt-6">
                        {filterFAQs(faqItems, 'All', searchQuery).length > 0 ? (
                            <div className="space-y-4">
                                {filterFAQs(faqItems, 'All', searchQuery).map((item, index) => (
                                    <div
                                        key={index}
                                        className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300"
                                    >
                                        <button
                                            onClick={() => toggleItem(index)}
                                            className="flex justify-between items-center w-full p-6 text-left font-medium text-gray-900 hover:bg-gray-50"
                                        >
                                            <span className="pr-4">{item.question}</span>
                                            {openItems.includes(index) ? (
                                                <ChevronUp className="flex-shrink-0 w-5 h-5 text-[#348b8b]" />
                                            ) : (
                                                <ChevronDown className="flex-shrink-0 w-5 h-5 text-gray-400" />
                                            )}
                                        </button>
                                        <div
                                            className={`overflow-hidden transition-all duration-300 ease-in-out ${openItems.includes(index) ? 'max-h-96' : 'max-h-0'
                                                }`}
                                        >
                                            <div className="p-6 pt-0 border-t border-gray-100">
                                                <p className="text-gray-700">{item.answer}</p>
                                                <div className="mt-4 flex items-center">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#348b8b]/10 text-[#348b8b]">
                                                        {item.category}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <Search className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-1">No results found</h3>
                                <p className="text-gray-500">
                                    Try adjusting your search or filter to find what you&apos;re looking for.
                                </p>
                            </div>
                        )}
                    </TabsContent>

                    {categories.map((category) => (
                        <TabsContent key={category} value={category} className="mt-6">
                            {filterFAQs(faqItems, category, searchQuery).length > 0 ? (
                                <div className="space-y-4">
                                    {filterFAQs(faqItems, category, searchQuery).map((item, index) => (
                                        <div
                                            key={index}
                                            className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300"
                                        >
                                            <button
                                                onClick={() => toggleItem(index)}
                                                className="flex justify-between items-center w-full p-6 text-left font-medium text-gray-900 hover:bg-gray-50"
                                            >
                                                <span className="pr-4">{item.question}</span>
                                                {openItems.includes(index) ? (
                                                    <ChevronUp className="flex-shrink-0 w-5 h-5 text-[#348b8b]" />
                                                ) : (
                                                    <ChevronDown className="flex-shrink-0 w-5 h-5 text-gray-400" />
                                                )}
                                            </button>
                                            <div
                                                className={`overflow-hidden transition-all duration-300 ease-in-out ${openItems.includes(index) ? 'max-h-96' : 'max-h-0'
                                                    }`}
                                            >
                                                <div className="p-6 pt-0 border-t border-gray-100">
                                                    <p className="text-gray-700">{item.answer}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <Search className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-1">No results found</h3>
                                    <p className="text-gray-500">
                                        Try adjusting your search or filter to find what you&apos;re looking for.
                                    </p>
                                </div>
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </div>
    );
};

export default FAQPage;