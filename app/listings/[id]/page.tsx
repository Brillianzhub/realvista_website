"use client"
import React, { useEffect, useState } from 'react';
import {
    MapPin,
    BedDouble,
    Bath,
    SquareIcon,
    Heart,
    ChevronLeft,
    Share2,
    Check,
    Phone,
    Mail,
    Calendar,
    Home,
    Clock,
    User,
    Grid2x2,
    CalendarDays,
    MapPinCheckInside,
    X,
    ListFilter,
    Building,
    MessageCircle,
    Copy,
    Facebook,
    Twitter,
    Linkedin
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api from '@/config/apiClient';

// Import shadcn components
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { FaWhatsapp } from 'react-icons/fa';

const PropertyDetailsPage = () => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [listing, setListing] = useState<any>(null);
    const [vendorListings, setVendorListings] = useState<any[]>([]);
    const params = useParams();
    const id = params.id;

    const getShareUrl = () => {
        if (typeof window !== 'undefined') {
            return window.location.href;
        }
        return '';
    };

    useEffect(() => {
        const getListing = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/market/properties/${id}`);
                setListing(response.data);
            } catch (error) {
                console.error("Error fetching property:", error);
            } finally {
                setLoading(false);
            }
        };
        getListing();
    }, [id]);

    const copyToClipboard = () => {
        const url = getShareUrl();
        navigator.clipboard.writeText(url)
            .then(() => {
                toast("Link copied", {
                    description: "Property link has been copied to clipboard",
                })
            })
            .catch(err => {
                toast(
                    "Failed to copy", {
                    description: "Could not copy the link. Please try again.",
                });
            });
    };

    const shareOnSocialMedia = (platform: any) => {
        const url = encodeURIComponent(getShareUrl());
        const title = encodeURIComponent(listing ? listing.title : 'Check out this property!');

        let shareUrl = '';

        switch (platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${title} ${url}`;
                break;
            default:
                return;
        }

        window.open(shareUrl, '_blank', 'width=600,height=400');
    };

    // Fetch vendor's other listings when dialog opens
    const fetchVendorListings = async () => {
        if (!listing) return;

        try {
            const response = await api.get(`/market/properties/owner/${listing.owner.email}`);
            setVendorListings(response.data.filter((prop: any) => prop.id !== parseInt(id as string)));
        } catch (error) {
            console.error("Error fetching vendor listings:", error);
        }
    };

    // Format price with commas
    const formatPrice = (price: any) => {
        return parseFloat(price).toLocaleString();
    };

    // Format date to readable format
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-teal-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-700">Loading property details...</p>
                </div>
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-teal-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Property Not Found</h2>
                    <p className="text-gray-600 mb-6">The property you&apos;re looking for doesn&apos;t exist or has been removed.</p>
                    <Link href="/listings" className="bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600 transition-colors">
                        Browse Listings
                    </Link>
                </div>
            </div>
        );
    }

    const propertyImages = listing.image_files.map((img: any) => img.file);
    const features = listing.features[0];

    return (
        <div className="bg-teal-50 min-h-screen">
            {/* Top Banner Section */}
            <div className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Link href="/listings" className="text-gray-700 cursor-pointer flex items-center hover:text-teal-600">
                        <ChevronLeft className="mr-2" /> Back to Listings
                    </Link>
                    <div className="flex items-center space-x-4">
                        {/* Share dropdown menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="text-gray-700 cursor-pointer hover:text-teal-600 flex items-center gap-1">
                                    <Share2 className="w-5 h-5" />
                                    <span className="hidden md:inline-block">Share</span>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={copyToClipboard} className="cursor-pointer">
                                    <Copy className="w-4 h-4 mr-2" /> Copy link
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => shareOnSocialMedia('facebook')} className="cursor-pointer">
                                    <Facebook className="w-4 h-4 mr-2" /> Facebook
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => shareOnSocialMedia('twitter')} className="cursor-pointer">
                                    <Twitter className="w-4 h-4 mr-2" /> Twitter
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => shareOnSocialMedia('linkedin')} className="cursor-pointer">
                                    <Linkedin className="w-4 h-4 mr-2" /> LinkedIn
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => shareOnSocialMedia('whatsapp')} className="cursor-pointer">
                                    <FaWhatsapp className="w-4 h-4 mr-2" /> WhatsApp
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Property Title and Location */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">{listing.title}</h1>
                    <div className="flex items-center text-gray-600">
                        <MapPin className="mr-2 text-teal-500 w-5 h-5" />
                        <span className="text-lg">{listing.address}, {listing.city}, {listing.state}</span>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Image Gallery Section */}
                    <div className="md:col-span-2">
                        <div className="relative mb-4 rounded-2xl overflow-hidden shadow-lg">
                            {propertyImages.length > 0 ? (
                                <img
                                    src={propertyImages[activeImageIndex]}
                                    alt={listing.title}
                                    className="w-full h-96 object-cover"
                                />
                            ) : (
                                <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                                    <Home className="w-16 h-16 text-gray-400" />
                                </div>
                            )}

                            <div className="absolute top-4 left-4 bg-teal-500 text-white px-3 py-1 rounded-full flex items-center">
                                {listing.listing_purpose === 'sale' ? 'For Sale' : 'For Rent'}
                            </div>
                        </div>

                        {propertyImages.length > 0 && (
                            <div className="grid grid-cols-4 gap-4">
                                {propertyImages.map((img: any, index: number) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveImageIndex(index)}
                                        className={`
                                            overflow-hidden rounded-lg 
                                            ${activeImageIndex === index
                                                ? 'border-2 border-teal-500'
                                                : 'border border-gray-200 opacity-70 hover:opacity-100'}
                                        `}
                                    >
                                        <img
                                            src={img}
                                            alt={`Property view ${index + 1}`}
                                            className="w-full h-24 object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Property Description Section */}
                        <div className="mt-8 bg-white rounded-2xl shadow-md p-6">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Property Details</h2>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                {listing.description || "This beautiful property is located in a prime area offering comfort and convenience. Perfect for families looking for their dream home."}
                            </p>

                            <div className="grid md:grid-cols-4 grid-cols-2 gap-6 mb-6">
                                <div className="flex flex-col items-center">
                                    <BedDouble className="text-teal-500 mb-2 w-8 h-8" />
                                    <span className="font-semibold">{listing.bedrooms}</span>
                                    <span className="text-sm text-gray-500">Bedrooms</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <Bath className="text-teal-500 mb-2 w-8 h-8" />
                                    <span className="font-semibold">{listing.bathrooms}</span>
                                    <span className="text-sm text-gray-500">Bathrooms</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <SquareIcon className="text-teal-500 mb-2 w-8 h-8" />
                                    <span className="font-semibold">{listing.square_feet}sq m</span>
                                    <span className="text-sm text-gray-500">Area</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <MapPinCheckInside className="text-teal-500 mb-2 w-8 h-8" />
                                    <span className="font-semibold">{listing.lot_size}</span>
                                    <span className="text-sm text-gray-500">Plot size</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <Calendar className="text-teal-500 mb-2 w-8 h-8" />
                                    <span className="font-semibold">{listing.year_built}</span>
                                    <span className="text-sm text-gray-500">Year Built</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <CalendarDays className="text-teal-500 mb-2 w-8 h-8" />
                                    <span className="font-semibold">{listing.availability}</span>
                                    <span className="text-sm text-gray-500">Availability</span>
                                </div>
                            </div>

                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Features & Amenities</h3>
                            <div className="grid md:grid-cols-3 grid-cols-2 gap-3 mb-4">
                                <div className="flex items-center">
                                    {features.parking_available ? (
                                        <Check className="text-teal-500 mr-2 w-5 h-5" />
                                    ) : (
                                        <X className="text-red-500 mr-2 w-5 h-5" />
                                    )}
                                    <span>Parking Available</span>
                                </div>
                                <div className="flex items-center">
                                    {features.furnished ? (
                                        <Check className="text-teal-500 mr-2 w-5 h-5" />
                                    ) : (
                                        <X className="text-red-500 mr-2 w-5 h-5" />
                                    )}
                                    <span>Furnished</span>
                                </div>
                                <div className="flex items-center">
                                    {features.pet_friendly ? (
                                        <Check className="text-teal-500 mr-2 w-5 h-5" />
                                    ) : (
                                        <X className="text-red-500 mr-2 w-5 h-5" />
                                    )}
                                    <span>Pet Friendly</span>
                                </div>
                                <div className="flex items-center">
                                    {features.swimming_pool ? (
                                        <Check className="text-teal-500 mr-2 w-5 h-5" />
                                    ) : (
                                        <X className="text-red-500 mr-2 w-5 h-5" />
                                    )}
                                    <span>Swimming Pool</span>
                                </div>
                                <div className="flex items-center">
                                    {features.garden ? (
                                        <Check className="text-teal-500 mr-2 w-5 h-5" />
                                    ) : (
                                        <X className="text-red-500 mr-2 w-5 h-5" />
                                    )}
                                    <span>Garden</span>
                                </div>
                                <div className="flex items-center">
                                    {features.security ? (
                                        <Check className="text-teal-500 mr-2 w-5 h-5" />
                                    ) : (
                                        <X className="text-red-500 mr-2 w-5 h-5" />
                                    )}
                                    <span>Security</span>
                                </div>
                                <div className="flex items-center">
                                    {features.water_supply ? (
                                        <Check className="text-teal-500 mr-2 w-5 h-5" />
                                    ) : (
                                        <X className="text-red-500 mr-2 w-5 h-5" />
                                    )}
                                    <span>Water Supply</span>
                                </div>
                                <div className="flex items-center">
                                    <Check className="text-teal-500 mr-2 w-5 h-5" />
                                    <span>Road Network: {features.road_network}</span>
                                </div>
                                <div className="flex items-center">
                                    <Check className="text-teal-500 mr-2 w-5 h-5" />
                                    <span>Development: {features.development_level}</span>
                                </div>
                                <div className="flex items-center">
                                    <Check className="text-teal-500 mr-2 w-5 h-5" />
                                    <span>Electricity: {features.electricity_proximity}</span>
                                </div>
                            </div>

                            <div className="flex items-center text-gray-600 mt-6">
                                <Clock className="mr-2 text-teal-500 w-5 h-5" />
                                <span>Available: {listing.availability === 'now' ? 'Immediately' : formatDate(listing.availability_date)}</span>
                            </div>

                            <div className="flex items-center text-gray-600 mt-2">
                                <Calendar className="mr-2 text-teal-500 w-5 h-5" />
                                <span>Listed on: {formatDate(listing.listed_date)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="md:col-span-1">
                        {/* Price Card */}
                        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">Price</h2>
                            <div className="text-3xl font-bold text-teal-600 mb-2">
                                {listing.currency} {formatPrice(listing.price)}
                            </div>
                            {features.negotiable && (
                                <span className="text-sm bg-teal-100 text-teal-700 px-3 py-1 rounded-full">
                                    {features.negotiable === 'yes' ? 'Negotiable' :
                                        features.negotiable === 'slightly' ? 'Slightly Negotiable' : 'Fixed Price'}
                                </span>
                            )}
                        </div>

                        {/* Map Button Card - ADD THIS NEW SECTION */}
                        {listing.market_coordinates && listing.market_coordinates.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Location</h2>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <button className="flex cursor-pointer items-center justify-center w-full bg-teal-500 text-white py-3 px-4 rounded-lg hover:bg-teal-600 transition-colors">
                                            <MapPin className="mr-2 w-5 h-5" /> View on Map
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-4xl max-h-[85vh]">
                                        <DialogHeader>
                                            <DialogTitle className="text-2xl font-bold">Property Location</DialogTitle>
                                            <DialogDescription>
                                                {listing.address}, {listing.city}, {listing.state}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="h-96 w-full bg-gray-100 rounded-lg overflow-hidden">
                                            <iframe
                                                title="Property Location"
                                                width="100%"
                                                height="100%"
                                                frameBorder="0"
                                                src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${listing.market_coordinates[0].latitude},${listing.market_coordinates[0].longitude}`}
                                                allowFullScreen
                                            ></iframe>
                                        </div>
                                        <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
                                            <div className="flex items-center">
                                                <MapPin className="text-teal-500 mr-1 w-4 h-4" />
                                                Coordinates: {listing.market_coordinates[0].latitude.toFixed(6)}, {listing.market_coordinates[0].longitude.toFixed(6)}
                                            </div>
                                            <a
                                                href={`https://www.google.com/maps/dir/?api=1&destination=${listing.market_coordinates[0].latitude},${listing.market_coordinates[0].longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center text-teal-600 hover:underline"
                                            >
                                                Get Directions
                                                <ChevronLeft className="rotate-180 ml-1 w-4 h-4" />
                                            </a>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        )}

                        {/* Agent/Owner Info Card */}
                        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Vendor</h2>
                            <div className="flex items-center mb-4">
                                {listing.owner.owner_photo ? (
                                    <img
                                        src={listing.owner.owner_photo}
                                        alt={listing.owner.owner_name}
                                        className="w-16 h-16 rounded-full object-cover mr-4"
                                    />
                                ) : (
                                    <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mr-4">
                                        <User className="w-8 h-8 text-teal-500" />
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-semibold text-gray-800">{listing.owner.owner_name}</h3>
                                    <p className="text-sm text-gray-600">
                                        {listing.owner.base_city}, {listing.owner.base_state}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Active since {new Date(listing.owner.active_since).getFullYear()}
                                    </p>
                                </div>
                            </div>

                            {/* Vendor Details Dialog */}
                            <Dialog>
                                <DialogTrigger asChild>
                                    <button
                                        className="flex cursor-pointer items-center justify-center w-full bg-teal-50 border border-teal-500 text-teal-600 py-3 px-4 rounded-lg hover:bg-teal-100 transition-colors mb-3"
                                        onClick={fetchVendorListings}
                                    >
                                        <User className="mr-2 w-5 h-5" /> View Vendor Details
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto">
                                    {listing && (
                                        <>
                                            <DialogHeader>
                                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                                    <DialogTitle className="text-2xl font-bold">{listing.owner.owner_name}</DialogTitle>
                                                    <div className="flex gap-2">
                                                        {features.verified_user && (
                                                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                                                <Check className="w-3 h-3 mr-1" /> Verified Vendor
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <DialogDescription>
                                                    {listing.owner.base_city}, {listing.owner.base_state} • Active since {new Date(listing.owner.active_since).getFullYear()}
                                                </DialogDescription>
                                            </DialogHeader>

                                            <div className="flex flex-col md:flex-row gap-8 py-6">
                                                <div className="md:w-1/3 flex flex-col items-center">
                                                    <Avatar className="w-32 h-32 mb-6 border-4 border-white shadow-md">
                                                        {listing.owner.owner_photo ? (
                                                            <AvatarImage src={listing.owner.owner_photo} alt={listing.owner.owner_name} />
                                                        ) : (
                                                            <AvatarFallback style={{ backgroundColor: "#0F766E20", color: "#0F766E" }}>
                                                                <User className="w-10 h-10 text-teal-500" />
                                                            </AvatarFallback>
                                                        )}
                                                    </Avatar>

                                                    <div className="space-y-3 w-full bg-gray-50 p-4 rounded-lg">
                                                        <h4 className="font-medium mb-2 text-center text-teal-600">Contact Information</h4>
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 rounded-full bg-teal-100">
                                                                <Phone className="h-4 w-4 text-teal-600" />
                                                            </div>
                                                            <span className="text-sm">{listing.owner.phone_number}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 rounded-full bg-teal-100">
                                                                <Mail className="h-4 w-4 text-teal-600" />
                                                            </div>
                                                            <span className="text-sm">{listing.owner.email}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 rounded-full bg-teal-100">
                                                                <MapPin className="h-4 w-4 text-teal-600" />
                                                            </div>
                                                            <span className="text-sm">{listing.owner.base_city}, {listing.owner.base_state}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 rounded-full bg-teal-100">
                                                                <Clock className="h-4 w-4 text-teal-600" />
                                                            </div>
                                                            <span className="text-sm">Active since {new Date(listing.owner.active_since).getFullYear()}</span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-6 w-full">
                                                        <h4 className="font-medium mb-2">Preferred Contact Method</h4>
                                                        <div className="flex space-x-2 text-sm justify-center">
                                                            <Badge className={`py-2 ${listing.owner.contact_by_phone ? 'bg-teal-500' : 'bg-gray-200 text-gray-600'}`}>
                                                                <Phone className="h-3 w-3 mr-1" /> Phone
                                                            </Badge>
                                                            <Badge className={`py-2 ${listing.owner.contact_by_whatsapp ? 'bg-teal-500' : 'bg-gray-200 text-gray-600'}`}>
                                                                <MessageCircle className="h-3 w-3 mr-1" /> WhatsApp
                                                            </Badge>
                                                            <Badge className={`py-2 ${listing.owner.contact_by_email ? 'bg-teal-500' : 'bg-gray-200 text-gray-600'}`}>
                                                                <Mail className="h-3 w-3 mr-1" /> Email
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="md:w-2/3">
                                                    <Tabs defaultValue="about">
                                                        <TabsList className="grid w-full grid-cols-1" style={{ backgroundColor: "#0F766E20" }}>
                                                            <TabsTrigger
                                                                value="about"
                                                                className="data-[state=active]:text-white"
                                                                style={{
                                                                    color: "#0F766E"
                                                                }}
                                                            >
                                                                About the Vendor
                                                            </TabsTrigger>
                                                        </TabsList>

                                                        <TabsContent value="about" className="mt-6">
                                                            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                                                <h4 className="font-medium mb-3 text-lg text-teal-600">Vendor Bio</h4>
                                                                <p className="text-gray-700 mb-4 leading-relaxed">
                                                                    {listing.owner.bio ||
                                                                        `${listing.owner.owner_name} is a trusted real estate vendor based in ${listing.owner.base_city}, ${listing.owner.base_state}. 
                      With years of industry experience since ${new Date(listing.owner.active_since).getFullYear()}, 
                      they have established a reputation for reliability and professionalism in the local market.`
                                                                    }
                                                                </p>
                                                            </div>

                                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                                <h4 className="font-medium mb-3 text-lg text-teal-600">Specialization</h4>
                                                                <div className="flex flex-wrap gap-2 mb-4">
                                                                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Residential</Badge>
                                                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Commercial</Badge>
                                                                    {/* {listing.owner.specialties && listing.owner.specialties.map((specialty, index) => (
                                                                        <Badge key={index} className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                                                                            {specialty}
                                                                        </Badge>
                                                                    ))} */}
                                                                </div>

                                                                {listing.owner.descriptions && (
                                                                    <>
                                                                        <h4 className="font-medium mb-3 text-lg text-teal-600 mt-6">Business Philosophy</h4>
                                                                        <p className="text-gray-700 leading-relaxed">
                                                                            {listing.owner.descriptions}
                                                                        </p>
                                                                    </>
                                                                )}
                                                            </div>

                                                            {listing.owner.achievements && listing.owner.achievements.length > 0 && (
                                                                <div className="bg-gray-50 p-4 rounded-lg mt-6">
                                                                    <h4 className="font-medium mb-3 text-lg text-teal-600">Achievements</h4>
                                                                    <ul className="list-disc pl-5 space-y-2">
                                                                        {listing.owner.achievements.map((achievement:any, index:number) => (
                                                                            <li key={index} className="text-gray-700">{achievement}</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}

                                                            <div className="bg-gray-50 p-4 rounded-lg mt-6">
                                                                <h4 className="font-medium mb-3 text-lg text-teal-600">Service Areas</h4>
                                                                <div className="flex flex-wrap gap-2">
                                                                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                                                                        {listing.owner.base_city}
                                                                    </Badge>
                                                                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                                                                        {listing.owner.base_state}
                                                                    </Badge>
                                                                    {listing.owner.service_areas && listing.owner.service_areas.map((area:any, index:number) => (
                                                                        <Badge key={index} className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                                                                            {area}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </TabsContent>
                                                    </Tabs>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </DialogContent>
                            </Dialog>

                            {/* Contact Buttons */}
                            <div className="space-y-3">
                                <a
                                    href={`tel:${listing.owner.phone_number}`}
                                    className="flex items-center justify-center w-full bg-teal-500 text-white py-3 px-4 rounded-lg hover:bg-teal-600 transition-colors"
                                >
                                    <Phone className="mr-2 w-5 h-5" /> Call
                                </a>
                                <a
                                    href={`https://wa.me/${listing.owner.phone_number.replace(/\+/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors"
                                >
                                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm.03 19.18c-1.731 0-3.434-.446-4.936-1.285l-5.091 1.33 1.36-4.967C2.496 12.662 2 10.84 2 8.923 2 4.005 6.505 0 12.03 0c2.683 0 5.207 1.045 7.102 2.942C21.025 4.835 22 7.399 22 10.177c0 5.518-4.505 9.003-9.97 9.003z" fill="currentColor" />
                                    </svg>
                                    WhatsApp
                                </a>
                                <a
                                    href={`mailto:${listing.owner.email}`}
                                    className="flex items-center justify-center w-full bg-white border-2 border-teal-500 text-teal-600 py-3 px-4 rounded-lg hover:bg-teal-50 transition-colors"
                                >
                                    <Mail className="mr-2 w-5 h-5" /> Email
                                </a>
                            </div>
                        </div>

                        {/* Property Features Card - Replaced Stats */}
                        <div className="bg-white rounded-2xl shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Property Features</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Furnished</span>
                                    <span className={`font-semibold ${features.furnished ? 'text-green-600' : 'text-red-600'}`}>
                                        {features.furnished ? 'Yes' : 'No'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Pet Friendly</span>
                                    <span className={`font-semibold ${features.pet_friendly ? 'text-green-600' : 'text-red-600'}`}>
                                        {features.pet_friendly ? 'Yes' : 'No'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Parking Available</span>
                                    <span className={`font-semibold ${features.parking_available ? 'text-green-600' : 'text-red-600'}`}>
                                        {features.parking_available ? 'Yes' : 'No'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Electricity</span>
                                    <span className="font-semibold capitalize">{features.electricity_proximity}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Road Network</span>
                                    <span className="font-semibold capitalize">{features.road_network}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Negotiable</span>
                                    <span className="font-semibold capitalize">{features.negotiable || 'No'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetailsPage;