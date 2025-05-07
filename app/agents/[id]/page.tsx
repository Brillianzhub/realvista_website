"use client"
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Phone,
    Mail,
    MapPin,
    Clock,
    Building,
    Star,
    Award,
    MessageCircle,
    Share2,
    Copy,
    ArrowLeft,
    Facebook,
    Twitter,
    Linkedin,
} from "lucide-react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import api from "@/config/apiClient";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

// Define types
interface AgentWithListings {
    id: string;
    agency_name: string;
    avatar: string | null;
    bio: string | null;
    phone_number: string;
    whatsapp_number: string | null;
    user: string;
    agency_address: string | null;
    created_at: string;
    verified: boolean;
    featured: boolean;
    experience_years: number;
    preferred_contact_mode: string;
    properties: any[];
}

const AgentProfilePage = () => {
    const params = useParams();
    const agentId = params.id
    const router = useRouter()
    const [agent, setAgent] = useState<AgentWithListings | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [agentListings, setAgentListings] = useState<any[]>([]);
    const primaryColor = "#348b8b"; // Default primary color
    const [isShareDialogOpen, setIsShareDialogOpen] = useState<boolean>(false);
    const [shareUrl, setShareUrl] = useState<string>("");

    useEffect(() => {
        const fetchAgentDetails = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/agents/${agentId}/`);
                setAgent(response.data);
                setAgentListings(response.data.properties || []);
            } catch (error) {
                console.error("Error fetching agent details:", error);
            } finally {
                setLoading(false);
            }
        };

        if (agentId) {
            fetchAgentDetails();
        }
    }, [agentId]);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const handleGoBack = () => {
        router.back();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
                    style={{ borderColor: `${primaryColor} transparent ${primaryColor} ${primaryColor}` }}></div>
            </div>
        );
    }

    if (!agent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Agent Not Found</h2>
                <Button onClick={handleGoBack} variant="outline" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Go Back
                </Button>
            </div>
        );
    }

    const generateShareUrl = () => {
        // Use window.location to get the current URL
        return window.location.href;
    };

    const handleOpenShareDialog = () => {
        // Set the share URL before opening the dialog
        setShareUrl(generateShareUrl());
        setIsShareDialogOpen(true);
    };

    const handleShare = (platform: string) => {
        let shareLink = '';
        const agentName = agent?.agency_name || 'Real Estate Agent';
        const shareText = `Check out ${agentName}'s real estate profile!`;

        switch (platform) {
            case 'twitter':
                shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
                break;
            case 'facebook':
                shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
                break;
            case 'linkedin':
                shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
                break;
            case 'whatsapp':
                shareLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
                break;
            default:
                return;
        }

        // First close the dialog
        setIsShareDialogOpen(false);

        // Then open the share link in a new window/tab
        setTimeout(() => {
            window.open(shareLink, '_blank', 'noopener,noreferrer');
        }, 100);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        setIsShareDialogOpen(false);
        toast("Link copied!, The agent's profile link has been copied to your clipboard.");
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header/Hero Section */}
            <div
                className="bg-gradient-to-r from-teal-700 to-teal-500 text-white"
                style={{ backgroundColor: primaryColor }}
            >
                <div className="container mx-auto px-4 py-16">
                    <Button
                        onClick={handleGoBack}
                        variant="ghost"
                        className="mb-6 text-white hover:bg-white/10 flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Agents
                    </Button>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                        <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                            {agent.avatar ? (
                                <AvatarImage src={agent.avatar} alt={agent.agency_name} />
                            ) : (
                                <AvatarFallback className="bg-teal-100 text-teal-800 text-3xl">
                                    {getInitials(agent.agency_name)}
                                </AvatarFallback>
                            )}
                        </Avatar>

                        <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                                <h1 className="text-3xl md:text-4xl font-bold">{agent.agency_name}</h1>
                                <div className="flex gap-2">
                                    {agent.verified && (
                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                            <Star className="w-3 h-3 mr-1 fill-green-800" /> Verified
                                        </Badge>
                                    )}
                                    {agent.featured && (
                                        <Badge className="bg-white/90 text-teal-800 hover:bg-white">
                                            <Award className="w-3 h-3 mr-1" /> Featured
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <p className="text-lg text-white/90 mb-4">
                                Professional real estate agent with {agent.experience_years} {agent.experience_years === 1 ? 'year' : 'years'} of experience
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Residential</Badge>
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Commercial</Badge>
                                <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Luxury</Badge>
                                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Investment</Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
                            <h3 className="font-semibold text-xl mb-6 pb-3 border-b" style={{ color: primaryColor }}>
                                Contact Information
                            </h3>

                            <div className="space-y-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full" style={{ backgroundColor: `${primaryColor}20` }}>
                                        <Phone className="h-4 w-4" style={{ color: primaryColor }} />
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500">Phone</div>
                                        <span>{agent.phone_number}</span>
                                    </div>
                                </div>

                                {agent.whatsapp_number && (
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-full" style={{ backgroundColor: `${primaryColor}20` }}>
                                            <MessageCircle className="h-4 w-4" style={{ color: primaryColor }} />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500">WhatsApp</div>
                                            <span>{agent.whatsapp_number}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full" style={{ backgroundColor: `${primaryColor}20` }}>
                                        <Mail className="h-4 w-4" style={{ color: primaryColor }} />
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500">Email</div>
                                        <span className="break-all">{agent.user}</span>
                                    </div>
                                </div>

                                {agent.agency_address && (
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-full" style={{ backgroundColor: `${primaryColor}20` }}>
                                            <MapPin className="h-4 w-4" style={{ color: primaryColor }} />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500">Address</div>
                                            <span>{agent.agency_address}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full" style={{ backgroundColor: `${primaryColor}20` }}>
                                        <Clock className="h-4 w-4" style={{ color: primaryColor }} />
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500">Member Since</div>
                                        <span>{new Date(agent.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <h4 className="font-medium mb-3">Preferred Contact Method</h4>
                                <Badge
                                    className="w-full justify-center py-2 capitalize"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    {agent.preferred_contact_mode}
                                </Badge>
                            </div>

                            <div className="mt-8">
                                <Button
                                    variant="outline"
                                    className="w-full flex items-center justify-center gap-2 border h-11"
                                    onClick={handleOpenShareDialog}
                                >
                                    <Share2 className="h-4 w-4" />
                                    Share Profile
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <Tabs defaultValue="about" className="w-full">
                                <TabsList className="w-full border-b flex rounded-none h-14 bg-transparent p-0">
                                    <TabsTrigger
                                        value="about"
                                        className="flex-1 h-full rounded-none border-b-2 data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 data-[state=active]:bg-transparent bg-transparent text-base"
                                        style={{
                                            "--accent-foreground": primaryColor,
                                            "--accent": "transparent"
                                        } as React.CSSProperties}
                                    >
                                        About
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="listings"
                                        className="flex-1 h-full rounded-none border-b-2 data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 data-[state=active]:bg-transparent bg-transparent text-base"
                                        style={{
                                            "--accent-foreground": primaryColor,
                                            "--accent": "transparent"
                                        } as React.CSSProperties}
                                    >
                                        Properties ({agentListings.length})
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="about" className="p-6 md:p-8">
                                    <h2 className="text-2xl font-bold mb-6" style={{ color: primaryColor }}>Agent Bio</h2>

                                    <div className="bg-gray-50 p-6 rounded-lg mb-10">
                                        <p className="text-gray-700 leading-relaxed">
                                            {agent.bio || "No bio information available. This agent has not provided a detailed bio yet."}
                                        </p>
                                    </div>

                                    <h3 className="text-xl font-semibold mb-4" style={{ color: primaryColor }}>Areas of Expertise</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                        <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                                            <h4 className="text-blue-800 font-medium mb-2">Residential Real Estate</h4>
                                            <p className="text-gray-600">Expertise in single-family homes, condos, and apartments in prime locations.</p>
                                        </div>
                                        <div className="bg-green-50 p-5 rounded-lg border border-green-100">
                                            <h4 className="text-green-800 font-medium mb-2">Commercial Properties</h4>
                                            <p className="text-gray-600">Specialized knowledge in office spaces, retail locations, and mixed-use developments.</p>
                                        </div>
                                        <div className="bg-purple-50 p-5 rounded-lg border border-purple-100">
                                            <h4 className="text-purple-800 font-medium mb-2">Luxury Market</h4>
                                            <p className="text-gray-600">Dedicated service for high-end properties and estates with premium amenities.</p>
                                        </div>
                                        <div className="bg-amber-50 p-5 rounded-lg border border-amber-100">
                                            <h4 className="text-amber-800 font-medium mb-2">Investment Opportunities</h4>
                                            <p className="text-gray-600">Guidance for property investors seeking rental income or appreciation potential.</p>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-semibold mb-4" style={{ color: primaryColor }}>Credentials & Education</h3>
                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <div className="flex items-start gap-4 mb-4 pb-4 border-b">
                                            <div className="p-3 rounded-full bg-teal-50 text-teal-600">
                                                <Star className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium">Licensed Real Estate Broker</h4>
                                                <p className="text-gray-500 text-sm">State Certified • Active Since {new Date().getFullYear() - agent.experience_years}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-full bg-teal-50 text-teal-600">
                                                <Award className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium">Top Producer Award</h4>
                                                <p className="text-gray-500 text-sm">Recognized for outstanding sales performance</p>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="listings" className="p-6 md:p-8">
                                    <h2 className="text-2xl font-bold mb-6" style={{ color: primaryColor }}>Agent Properties</h2>

                                    {loading ? (
                                        <div className="flex justify-center py-12">
                                            <div
                                                className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
                                                style={{ borderColor: `${primaryColor} transparent ${primaryColor} ${primaryColor}` }}
                                            ></div>
                                        </div>
                                    ) : agentListings.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                                            {agentListings.map(listing => (
                                                <Card key={listing.id} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all">
                                                    <div className="h-52 bg-gray-200 relative">
                                                        {listing.images && listing.images.length > 0 ? (
                                                            <img
                                                                src={listing.images[0]}
                                                                alt={listing.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                                <Building className="h-12 w-12 text-gray-400" />
                                                            </div>
                                                        )}
                                                        <Badge
                                                            className="absolute top-3 right-3 text-white"
                                                            style={{ backgroundColor: primaryColor }}
                                                        >
                                                            {listing.property_type}
                                                        </Badge>
                                                        <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-white px-3 py-1.5 rounded-md font-medium">
                                                            {listing.currency} {parseFloat(listing.price).toLocaleString()}
                                                        </div>
                                                    </div>
                                                    <CardContent className="p-5">
                                                        <h5 className="font-medium text-lg mb-2">{listing.title}</h5>
                                                        <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                                                            <MapPin className="h-3.5 w-3.5" />
                                                            <span className="capitalize">{listing.city}, {listing.state}</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                                                            <div className="flex items-center gap-1">
                                                                <span className="font-semibold">{listing.bedrooms}</span> Beds
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <span className="font-semibold">{listing.bathrooms}</span> Baths
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <span className="font-semibold">{listing.area}</span> {listing.area_unit}
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 capitalize">
                                                                {listing.listing_type}
                                                            </Badge>
                                                            <Button
                                                                size="sm"
                                                                className="h-9"
                                                                style={{ backgroundColor: primaryColor }}
                                                                onClick={() => window.location.href = `/listings/${listing.id}`}
                                                            >
                                                                View Details
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-16 bg-gray-50 rounded-lg">
                                            <Building className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                            <h3 className="text-xl font-medium text-gray-700 mb-2">No Listings Available</h3>
                                            <p className="text-gray-500 max-w-md mx-auto">This agent doesn't have any active property listings at the moment. Check back later for updates.</p>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>

            {/* Share Dialog */}
            {isShareDialogOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in">
                        <h2 className="text-xl font-semibold mb-2">Share Agent Profile</h2>
                        <p className="text-gray-500 mb-6">Choose a platform to share this agent's profile</p>

                        <div className="flex justify-center gap-6 mb-8">
                            <button
                                onClick={() => handleShare('facebook')}
                                className="p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center justify-center"
                                aria-label="Share on Facebook"
                            >
                                <Facebook className="h-6 w-6" />
                            </button>
                            <button
                                onClick={() => handleShare('twitter')}
                                className="p-3 rounded-full bg-sky-500 text-white hover:bg-sky-600 transition-colors flex items-center justify-center"
                                aria-label="Share on Twitter"
                            >
                                <Twitter className="h-6 w-6" />
                            </button>
                            <button
                                onClick={() => handleShare('linkedin')}
                                className="p-3 rounded-full bg-blue-700 text-white hover:bg-blue-800 transition-colors flex items-center justify-center"
                                aria-label="Share on LinkedIn"
                            >
                                <Linkedin className="h-6 w-6" />
                            </button>
                            <button
                                onClick={() => handleShare('whatsapp')}
                                className="p-3 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors flex items-center justify-center"
                                aria-label="Share on WhatsApp"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                                    <path d="M17.6 6.32A7.85 7.85 0 0 0 12.04 4c-4.32 0-7.83 3.5-7.83 7.8a7.82 7.82 0 0 0 1.04 3.9l-1.1 4.02 4.13-1.08a7.88 7.88 0 0 0 3.76.96h.01c4.32 0 7.83-3.5 7.83-7.8a7.74 7.74 0 0 0-2.27-5.48zm-5.56 12a6.55 6.55 0 0 1-3.33-.91l-.25-.14-2.5.66.67-2.44-.16-.25a6.5 6.5 0 0 1-1-3.45c0-3.6 2.94-6.52 6.54-6.52a6.54 6.54 0 0 1 6.54 6.52c0 3.58-2.93 6.52-6.54 6.53zm3.59-4.88c-.2-.1-1.17-.58-1.35-.64-.18-.07-.32-.1-.45.1-.13.19-.5.63-.62.76-.11.13-.23.15-.43.05a5.5 5.5 0 0 1-2.7-2.35c-.2-.35.2-.33.58-1.1.06-.13.03-.25-.02-.34-.05-.1-.45-1.08-.62-1.47-.17-.4-.33-.34-.45-.34-.11 0-.25-.01-.38-.01-.13 0-.33.04-.5.23-.18.19-.67.65-.67 1.58s.68 1.84.78 1.96c.1.13 1.35 2.07 3.3 2.9.45.2.81.32 1.09.42.46.14.87.12 1.2.07.37-.05 1.13-.46 1.29-.9.16-.45.16-.83.11-.91-.04-.1-.18-.15-.38-.25z" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex flex-col gap-2 mb-6">
                            <label htmlFor="share-url" className="text-sm font-medium">
                                Or copy this link
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    id="share-url"
                                    type="text"
                                    value={shareUrl}
                                    readOnly
                                    className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleCopyLink}
                                    className="shrink-0"
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setIsShareDialogOpen(false)}
                                className="px-6"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="bg-gray-100 border-t mt-12">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center text-gray-500 text-sm">
                        © {new Date().getFullYear()} Real Estate Platform. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default AgentProfilePage;