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
    Send,
} from "lucide-react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import api from "@/config/apiClient";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

// Define types
interface AgentRating {
    id: number;
    agent: number;
    rating: number;
    review: string;
    created_at: string;
    updated_at: string;
    user_name: string;
}

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
    ratings: AgentRating[];
    average_rating: number;
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

    // Rating and review states
    const [ratingDistribution, setRatingDistribution] = useState<{ [key: number]: number }>({
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    });
    const [isRatingDialogOpen, setIsRatingDialogOpen] = useState<boolean>(false);
    const [newRating, setNewRating] = useState<number>(5);
    const [reviewText, setReviewText] = useState<string>("");
    const [userName, setUserName] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    useEffect(() => {
        const fetchAgentDetails = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/agents/${agentId}/`);
                setAgent(response.data);
                setAgentListings(response.data.properties || []);
                calculateRatingDistribution(response.data.ratings || []);
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

    const calculateRatingDistribution = (ratings: AgentRating[]) => {
        if (!ratings || ratings.length === 0) return;

        const distribution: any = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

        ratings.forEach(rating => {
            if (rating.rating >= 1 && rating.rating <= 5) {
                distribution[rating.rating]++;
            }
        });

        setRatingDistribution(distribution);
    };

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

    const handleOpenRatingDialog = () => {
        setIsRatingDialogOpen(true);
    };

    const handleRatingChange = (rating: number) => {
        setNewRating(rating);
    };

    const handleSubmitReview = async () => {
        if (!reviewText.trim()) {
            toast.error("Please enter a review comment");
            return;
        }

        if (!userName.trim()) {
            toast.error("Please enter your name");
            return;
        }

        setIsSubmitting(true);

        try {
            await api.post("/agents/rate-agent/", {
                agent: Number(agentId),
                rating: newRating,
                review: reviewText,
                user_name: userName
            }, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Token ${token}`
                }
            });

            toast.success("Your review has been submitted successfully!");
            setIsRatingDialogOpen(false);

            // Refresh agent data
            const response = await api.get(`/agents/${agentId}/`);
            setAgent(response.data);
            calculateRatingDistribution(response.data.ratings || []);

            // Reset form
            setReviewText("");
            setNewRating(5);
            setUserName("");
        } catch (error) {
            console.error("Error submitting review:", error);
            toast.error("Failed to submit your review. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex items-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`h-5 w-5 ${star <= Math.round(agent.average_rating || 0) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                                        />
                                    ))}
                                </div>
                                <span className="text-white font-medium">
                                    {agent.average_rating?.toFixed(1) || "0.0"}
                                </span>
                                <span className="text-white/80">
                                    ({agent.ratings?.length || 0} {agent.ratings?.length === 1 ? "review" : "reviews"})
                                </span>
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

                            <div className="mt-8 space-y-3">
                                <Button
                                    className="w-full flex cursor-pointer items-center justify-center gap-2 h-11"
                                    style={{ backgroundColor: primaryColor }}
                                    onClick={handleOpenRatingDialog}
                                >
                                    <Star className="h-4 w-4" />
                                    Rate This Agent
                                </Button>

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
                                        value="reviews"
                                        className="flex-1 h-full rounded-none border-b-2 data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 data-[state=active]:bg-transparent bg-transparent text-base"
                                        style={{
                                            "--accent-foreground": primaryColor,
                                            "--accent": "transparent"
                                        } as React.CSSProperties}
                                    >
                                        Reviews ({agent.ratings?.length || 0})
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

                                {/* New Reviews Tab */}
                                <TabsContent value="reviews" className="p-6 md:p-8">
                                    <div className="flex flex-col lg:flex-row gap-8">
                                        {/* Rating summary */}
                                        <div className="lg:w-1/3">
                                            <div className="bg-gray-50 p-6 rounded-lg">
                                                <h3 className="text-xl font-semibold mb-4" style={{ color: primaryColor }}>
                                                    Customer Ratings
                                                </h3>

                                                <div className="flex flex-col items-center mb-6">
                                                    <div className="text-5xl font-bold mb-2" style={{ color: primaryColor }}>
                                                        {agent.average_rating?.toFixed(1) || "0.0"}
                                                    </div>
                                                    <div className="flex items-center mb-1">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star
                                                                key={star}
                                                                className={`h-5 w-5 ${star <= Math.round(agent.average_rating || 0) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <div className="text-gray-500 text-sm">
                                                        Based on {agent.ratings?.length || 0} {agent.ratings?.length === 1 ? "review" : "reviews"}
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    {[5, 4, 3, 2, 1].map((rating) => {
                                                        const count = ratingDistribution[rating] || 0;
                                                        const percentage = agent.ratings && agent.ratings.length > 0
                                                            ? (count / agent.ratings.length) * 100
                                                            : 0;

                                                        return (
                                                            <div key={rating} className="flex items-center gap-3">
                                                                <div className="flex items-center w-12 justify-end">
                                                                    <span className="font-medium">{rating}</span>
                                                                    <Star className="h-4 w-4 ml-1 text-gray-400" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <Progress value={percentage} className="h-2" />
                                                                </div>
                                                                <div className="w-10 text-right text-gray-500 text-sm">
                                                                    {count}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                <div className="mt-6">
                                                    <Button
                                                        className="w-full mt-4 cursor-pointer"
                                                        style={{ backgroundColor: primaryColor }}
                                                        onClick={handleOpenRatingDialog}
                                                    >
                                                        Write a Review
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Reviews list */}
                                        <div className="lg:w-2/3">
                                            <h3 className="text-xl font-semibold mb-4" style={{ color: primaryColor }}>
                                                Client Reviews
                                            </h3>

                                            {agent.ratings && agent.ratings.length > 0 ? (
                                                <div className="space-y-6">
                                                    {agent.ratings.map((rating) => (
                                                        <div key={rating.id} className="bg-white border p-6 rounded-lg shadow-sm">
                                                            <div className="flex justify-between mb-3">
                                                                <div className="flex items-center gap-4">
                                                                    <Avatar className="h-10 w-10 border">
                                                                        <AvatarFallback className="bg-gray-100 text-gray-800">
                                                                            {rating.user_name ? getInitials(rating.user_name) : "??"}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div>
                                                                        <div className="font-medium">{rating.user_name}</div>
                                                                        <div className="text-sm text-gray-500">
                                                                            {formatDate(rating.created_at)}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex">
                                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                                        <Star
                                                                            key={star}
                                                                            className={`h-4 w-4 ${star <= rating.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="text-gray-700">{rating.review}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="bg-gray-50 p-8 rounded-lg text-center">
                                                    <div className="mb-3 mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-gray-100">
                                                        <MessageCircle className="h-6 w-6 text-gray-400" />
                                                    </div>
                                                    <h4 className="text-lg font-medium text-gray-700 mb-2">No Reviews Yet</h4>
                                                    <p className="text-gray-500 mb-6">Be the first to leave a review for {agent.agency_name}</p>
                                                    <Button
                                                        className="mx-auto cursor-pointer"
                                                        style={{ backgroundColor: primaryColor }}
                                                        onClick={handleOpenRatingDialog}
                                                    >
                                                        Write a Review
                                                    </Button>
                                                </div>
                                            )}
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {agentListings.map((property) => (
                                                <Card key={property.id} className="overflow-hidden">
                                                    <div className="relative aspect-video bg-gray-100">
                                                        {property.image ? (
                                                            <img
                                                                src={property.image}
                                                                alt={property.title}
                                                                className="object-cover w-full h-full"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Building className="w-12 h-12 text-gray-300" />
                                                            </div>
                                                        )}
                                                        <div className="absolute bottom-3 left-3">
                                                            <Badge className="bg-white text-teal-700 hover:bg-white/90">
                                                                {property.property_type}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <CardContent className="p-4">
                                                        <h3 className="font-bold text-lg mb-1 truncate">{property.title}</h3>
                                                        <p className="text-gray-500 flex items-center gap-1 mb-2">
                                                            <MapPin className="h-3 w-3" />
                                                            <span className="truncate">{property.location}</span>
                                                        </p>
                                                        <div className="flex justify-between items-center">
                                                            <div className="font-bold text-xl" style={{ color: primaryColor }}>
                                                                ${property.price.toLocaleString()}
                                                            </div>
                                                            <Link
                                                                href={`/listings/${property.id}`}
                                                                className="text-xs h-8 rounded-full"
                                                                style={{ borderColor: primaryColor, color: primaryColor }}
                                                            >
                                                                View Details
                                                            </Link>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 p-8 rounded-lg text-center">
                                            <div className="mb-3 mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-gray-100">
                                                <Building className="h-6 w-6 text-gray-400" />
                                            </div>
                                            <h4 className="text-lg font-medium text-gray-700 mb-2">No Properties Listed</h4>
                                            <p className="text-gray-500">
                                                {agent.agency_name} doesn't have any active property listings at the moment.
                                            </p>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rating Dialog */}
            <Dialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Rate {agent.agency_name}</DialogTitle>
                        <DialogDescription>
                            Share your experience working with this agent.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="flex flex-col items-center gap-3">
                            <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => handleRatingChange(star)}
                                        className="p-1 focus:outline-none focus:ring-0"
                                    >
                                        <Star
                                            className={`h-8 w-8 ${star <= newRating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <div className="text-lg font-medium">
                                {newRating === 1 && "Poor"}
                                {newRating === 2 && "Fair"}
                                {newRating === 3 && "Good"}
                                {newRating === 4 && "Very Good"}
                                {newRating === 5 && "Excellent"}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="user-name">Your Name</Label>
                                <Input
                                    id="user-name"
                                    placeholder="Enter your name"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="review">Review</Label>
                                <Textarea
                                    id="review"
                                    placeholder="Share your experience with this agent"
                                    className="min-h-32"
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsRatingDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmitReview}
                            disabled={isSubmitting}
                            style={{ backgroundColor: primaryColor }}
                            className="cursor-pointer"
                        >
                            {isSubmitting ? "Submitting..." : "Submit Review"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Share Dialog */}
            <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Share Agent Profile</DialogTitle>
                        <DialogDescription>
                            Share {agent.agency_name}'s profile with others.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-4 gap-4 py-4">
                        <Button
                            variant="outline"
                            className="flex flex-col items-center justify-center h-24 rounded-lg"
                            onClick={() => handleShare('facebook')}
                        >
                            <Facebook className="h-8 w-8 mb-2 text-blue-600" />
                            <span className="text-xs">Facebook</span>
                        </Button>

                        <Button
                            variant="outline"
                            className="flex flex-col items-center justify-center h-24 rounded-lg"
                            onClick={() => handleShare('twitter')}
                        >
                            <Twitter className="h-8 w-8 mb-2 text-blue-400" />
                            <span className="text-xs">Twitter</span>
                        </Button>

                        <Button
                            variant="outline"
                            className="flex flex-col items-center justify-center h-24 rounded-lg"
                            onClick={() => handleShare('linkedin')}
                        >
                            <Linkedin className="h-8 w-8 mb-2 text-blue-700" />
                            <span className="text-xs">LinkedIn</span>
                        </Button>

                        <Button
                            variant="outline"
                            className="flex flex-col items-center justify-center h-24 rounded-lg"
                            onClick={() => handleShare('whatsapp')}
                        >
                            <Send className="h-8 w-8 mb-2 text-green-500" />
                            <span className="text-xs">WhatsApp</span>
                        </Button>
                    </div>

                    <div className="flex items-center space-x-2">
                        <div className="grid flex-1 gap-2">
                            <Label htmlFor="share-link" className="sr-only">
                                Link
                            </Label>
                            <Input
                                id="share-link"
                                defaultValue={shareUrl}
                                readOnly
                                className="h-9"
                            />
                        </div>
                        <Button
                            type="submit"
                            size="sm"
                            className="px-3"
                            onClick={handleCopyLink}
                            style={{ backgroundColor: primaryColor }}
                        >
                            <span className="sr-only">Copy</span>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AgentProfilePage;