"use client"
import React, { useEffect, useRef, useState } from 'react';
import {
    MapPin,
    BedDouble,
    Bath,
    SquareIcon,
    Heart,
    ChevronLeft,
    ChevronRight,
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
    Linkedin,
    Star,
    Calculator,
    DollarSign
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import api from '@/config/apiClient';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';

declare global {
    interface Window {
      google: any;
    }
  }

const PropertyDetailsPage = () => {
    const router = useRouter();
    const params = useParams()
    const id = params.id;
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [listing, setListing] = useState<any>(null);
    const [vendorListings, setVendorListings] = useState([]);
    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
    const [bookmarks, setBookmarks] = useState<Record<number, number>>({});
    const [token, setToken] = useState('');

    // Image Lightbox State
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [lightboxImageIndex, setLightboxImageIndex] = useState(0);

    // Get token from localStorage or your auth context
    useEffect(() => {
        const authToken = localStorage.getItem('token') || localStorage.getItem('authToken');
        if (authToken) {
            setToken(authToken);
        }
    }, []);

    // Fetch property details
    useEffect(() => {
        const fetchPropertyDetails = async () => {
            if (!id) return;

            try {
                setLoading(true);
                const response = await api.get(`/market/properties/${id}/`);

                if (response.status === 200) {
                    setListing(response.data);
                } else {
                    console.error('Failed to fetch property details');
                }
            } catch (error) {
                console.error('Error fetching property details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPropertyDetails();
    }, [id]);

    // Fetch user bookmarks
    useEffect(() => {
        const fetchUserBookmarks = async () => {
            if (!token) return;

            try {
                const response = await api.get('/market/user-bookmarks/', {
                    headers: {
                        Authorization: `Token ${token}`
                    }
                });

                if (response.status === 200) {
                    // Create a mapping of property_id to bookmark_id for efficient lookup
                    const bookmarkMap: Record<number, number> = {};
                    response.data.forEach((bookmark: any) => {
                        bookmarkMap[bookmark.property_id] = bookmark.bookmark_id;
                    });
                    setBookmarks(bookmarkMap);
                }
            } catch (error) {
                console.error('Error fetching bookmarks:', error);
            }
        };

        fetchUserBookmarks();
    }, [token]);

    // Fetch vendor listings
    useEffect(() => {
        const fetchVendorListings = async () => {
            if (!listing?.owner?.email) return;

            try {
                const response = await api.get(`/market/properties/owner/${listing.owner.email}`);
                if (response.status === 200) {
                    setVendorListings(response.data.filter((prop: any) => prop.id !== parseInt(id as string)));
                }
            } catch (error) {
                console.error("Error fetching vendor listings:", error);
            }
        };

        fetchVendorListings();
    }, [listing, id]);

    // Update shareUrl when the component mounts and when listing changes
    useEffect(() => {
        if (typeof window !== 'undefined' && listing?.owner) {
            const baseUrl = window.location.origin;
            const agentId = listing.owner.id || 2;
            setShareUrl(`${baseUrl}/agents/${agentId}`);
        }
    }, [listing]);

    const isBookmarked = (propertyId: any) => {
        return propertyId in bookmarks;
    };

    const toggleFavorite = async (propertyId: any) => {
        if (!token) {
            console.error('Authentication required to manage favorites');
            router.push("/sign-in");
            return;
        }

        try {
            let response;
            const isFavorite = isBookmarked(propertyId);

            if (isFavorite) {
                // Use bookmark_id for removal
                const bookmarkId = bookmarks[propertyId];
                response = await api.post(`/market/remove-bookmark/${bookmarkId}/`, {}, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`
                    }
                });

                // If removal was successful, update the state
                if (response.status === 200) {
                    setBookmarks(prev => {
                        const updated = { ...prev };
                        delete updated[propertyId];
                        return updated;
                    });
                }
            } else {
                // Add to favorites using property_id
                response = await api.post(`/market/bookmark-property/${propertyId}/`, {}, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`
                    }
                });

                // If successful, update the bookmarks map with the new bookmark_id
                if (response.status === 201) {
                    const newBookmarkId = response.data.bookmark_id;
                    setBookmarks(prev => ({
                        ...prev,
                        [propertyId]: newBookmarkId
                    }));
                }
            }

            if (response && (response.status === 200 || response.status === 201)) {
                toast(`Property ${isFavorite ? 'removed from' : 'added to'} favorites successfully`);
            }
            window.location.reload()
        } catch (error: any) {
            console.error('Error toggling favorite status:', error);
            toast.error('Failed to update favorites. Please try again.');
        }
    };

    const handleShare = (platform: any) => {
        let shareLink = '';
        const vendorName = listing?.owner?.owner_name || 'Real Estate Vendor';
        const shareText = `Check out ${vendorName}'s real estate profile!`;

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

        setIsShareDialogOpen(false);
        setTimeout(() => {
            window.open(shareLink, '_blank', 'noopener,noreferrer');
        }, 100);
    };

    const getShareUrl = () => {
        if (typeof window !== 'undefined') {
            return window.location.href;
        }
        return '';
    };

    const copyToClipboard = () => {
        const url = getShareUrl();
        navigator.clipboard.writeText(url)
            .then(() => {
                toast.success("Link copied to clipboard");
            })
            .catch(err => {
                toast.error("Failed to copy link");
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

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        setIsShareDialogOpen(false);
        toast.success("Agent profile link copied!");
    };

    // Image Lightbox Functions
    const openLightbox = (index: any) => {
        setLightboxImageIndex(index);
        setIsLightboxOpen(true);
    };

    const closeLightbox = () => {
        setIsLightboxOpen(false);
    };

    const nextImage = () => {
        setLightboxImageIndex((prev) =>
            prev === propertyImages.length - 1 ? 0 : prev + 1
        );
    };

    const prevImage = () => {
        setLightboxImageIndex((prev) =>
            prev === 0 ? propertyImages.length - 1 : prev - 1
        );
    };

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: any) => {
            if (!isLightboxOpen) return;

            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowRight') {
                nextImage();
            } else if (e.key === 'ArrowLeft') {
                prevImage();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isLightboxOpen]);

    const formatPrice = (price: any) => {
        return parseFloat(price).toLocaleString();
    };

    const formatDate = (dateString: any) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const handlePhoneCall = () => {
        if (listing?.owner.phone_number) {
            window.location.href = `tel:${listing.owner.phone_number}`
        }
    }

    const handleWhatsApp = () => {
        if (listing.owner.phone_number) {
            const message = encodeURIComponent(`Hi ${listing.owner.owner_name}, I'm interested in your property listing.`)
            const whatsappUrl = `https://wa.me/${listing.owner.phone_number.replace(/\D/g, '')}?text=${message}`
            window.open(whatsappUrl, '_blank')
        }
    }

    const handleEmail = () => {
        if (listing.owner.email) {
            const subject = encodeURIComponent('Property Inquiry')
            const body = encodeURIComponent(`Hi ${listing.owner.owner_name},\n\nI'm interested in your property listing and would like to get more information.\n\nThank you.`)
            window.location.href = `mailto:${listing.owner.email}?subject=${subject}&body=${body}`
        }
    }

    // Loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-teal-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-md">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-500 mx-auto"></div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 mt-4">Loading Property Details...</h2>
                    <p className="text-gray-600">Please wait while we fetch the property information.</p>
                </div>
            </div>
        );
    }

    // Property not found state
    if (!listing) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-teal-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Property Not Found</h2>
                    <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
                    <button
                        onClick={() => router.push('/properties')}
                        className="bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600 transition-colors"
                    >
                        Browse Listings
                    </button>
                </div>
            </div>
        );
    }

    const propertyImages = listing.image_files?.map((img: any) => img.file) || [];
    const features = listing.features?.[0] || {};

    const PropertyMap = ({ coordinates, title }: any) => {
        const mapRef = useRef(null);
        const mapInstanceRef = useRef(null);

        useEffect(() => {
            if (!coordinates || coordinates.length === 0) return;

            // Load Google Maps script if not already loaded
            if (!window.google as any) {
                const script = document.createElement('script');
                script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API}&libraries=places`;
                script.async = true;
                script.defer = true;
                script.onload = initializeMap;
                document.head.appendChild(script);
            } else {
                initializeMap();
            }

            function initializeMap() {
                if (!mapRef.current || coordinates.length === 0) return;

                // Use first coordinate as center
                const center = {
                    lat: parseFloat(coordinates[0].latitude),
                    lng: parseFloat(coordinates[0].longitude)
                };

                // Initialize map
                mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
                    zoom: 15,
                    center: center,
                    mapTypeId: 'roadmap',
                    styles: [
                        {
                            featureType: 'poi',
                            elementType: 'labels',
                            stylers: [{ visibility: 'off' }]
                        }
                    ]
                });

                // Add markers for each coordinate
                coordinates.forEach((coord: any, index: number) => {
                    const marker = new window.google.maps.Marker({
                        position: {
                            lat: parseFloat(coord.latitude),
                            lng: parseFloat(coord.longitude)
                        },
                        map: mapInstanceRef.current,
                        title: coord.name || `Location ${index + 1}`,
                        icon: {
                            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                            scaledSize: new window.google.maps.Size(32, 32)
                        }
                    });

                    // Add info window
                    const infoWindow = new window.google.maps.InfoWindow({
                        content: `
                  <div style="padding: 8px;">
                    <h4 style="margin: 0 0 8px 0; color: #333;">${coord.name || title}</h4>
                    <p style="margin: 0; color: #666; font-size: 14px;">
                      ${coord.description || 'Property location'}
                    </p>
                  </div>
                `
                    });

                    marker.addListener('click', () => {
                        infoWindow.open(mapInstanceRef.current, marker);
                    });
                });
            }

            return () => {
                // Cleanup if needed
                if (mapInstanceRef.current) {
                    mapInstanceRef.current = null;
                }
            };
        }, [coordinates, title]);

        if (!coordinates || coordinates.length === 0) {
            return null;
        }
        return (
            <div className="w-full">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Location</h3>
                <div
                    ref={mapRef}
                    className="w-full h-64 md:h-80 rounded-lg border border-gray-300 bg-gray-100"
                    style={{ minHeight: '300px' }}
                />
                <p className="text-sm text-gray-600 mt-2">
                    📍 {coordinates.length} location{coordinates.length > 1 ? 's' : ''} marked
                </p>
            </div>
        );
    };


    return (
        <div className="bg-teal-50 min-h-screen">
            {/* Image Lightbox Overlay */}
            {isLightboxOpen && propertyImages.length > 0 && (
                <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
                    {/* Close Button */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
                    >
                        <X className="w-8 h-8" />
                    </button>

                    {/* Image Counter */}
                    <div className="absolute top-4 left-4 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full z-10">
                        {lightboxImageIndex + 1} / {propertyImages.length}
                    </div>

                    {/* Previous Button */}
                    <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-2"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>

                    {/* Next Button */}
                    <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-2"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>

                    {/* Main Image */}
                    <div className="max-w-4xl max-h-[80vh] w-full h-full flex items-center justify-center p-8">
                        <img
                            src={propertyImages[lightboxImageIndex]}
                            alt={`${listing.title} - Image ${lightboxImageIndex + 1}`}
                            className="max-w-full max-h-full object-contain rounded-lg"
                        />
                    </div>

                    {/* Thumbnail Navigation */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-4xl overflow-x-auto">
                        {propertyImages.map((img: any, index: any) => (
                            <button
                                key={index}
                                onClick={() => setLightboxImageIndex(index)}
                                className={`
                                    flex-shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition-all
                                    ${lightboxImageIndex === index
                                        ? 'border-white opacity-100'
                                        : 'border-transparent opacity-60 hover:opacity-80'}
                                `}
                            >
                                <img
                                    src={img}
                                    alt={`Thumbnail ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Top Banner Section */}
            <div className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <button
                        onClick={() => router.back()}
                        className="text-gray-700 cursor-pointer flex items-center hover:text-teal-600"
                    >
                        <ChevronLeft className="mr-2" /> Back to Listings
                    </button>
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
                                    <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
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
                                    className="w-full h-96 object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                                    onClick={() => openLightbox(activeImageIndex)}
                                />
                            ) : (
                                <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                                    <Home className="w-16 h-16 text-gray-400" />
                                </div>
                            )}

                            <div className="absolute top-4 left-4 bg-teal-500 text-white px-3 py-1 rounded-full flex items-center">
                                {listing.listing_purpose === 'sale' ? 'For Sale' : 'For Rent'}
                            </div>

                            {/* Expand Icon */}
                            {propertyImages.length > 0 && (
                                <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                                    Click to expand
                                </div>
                            )}
                        </div>

                        {propertyImages.length > 0 && (
                            <div className="grid grid-cols-4 gap-4">
                                {propertyImages.map((img: any, index: any) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setActiveImageIndex(index);
                                            openLightbox(index);
                                        }}
                                        className={`
                                            overflow-hidden rounded-lg cursor-pointer hover:scale-105 transition-transform duration-200
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
                                {listing.description}
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
                                    <span className="font-semibold">{listing.lot_size}sq m</span>
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
                                <div className="flex flex-col items-center">
                                    <Calculator className="text-teal-500 mb-2 w-8 h-8" />
                                    <span className="font-semibold">
                                        {listing.price && listing.square_feet
                                            ? `${listing.currency}${Math.round(listing.price / listing.square_feet).toLocaleString()}/sq m`
                                            : 'N/A'
                                        }
                                    </span>
                                    <span className="text-sm text-gray-500">Price per sq m</span>
                                </div>
                            </div>

                            {listing.payment_plans && listing.payment_plans.length > 0 && (
                                <>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Payment Plans</h3>
                                    <div className='w-full flex gap-8 mb-4'>
                                        {listing.payment_plans.map((plan: any, index: any) => (
                                            <p key={index} className='text-base'>
                                                {plan}
                                            </p>
                                        ))}
                                    </div>
                                </>
                            )}

                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Features & Amenities</h3>
                            <div className="grid md:grid-cols-3 grid-cols-2 gap-3 mb-4">
                                <div className="flex items-center">
                                    {features?.parking_available ? (
                                        <Check className="text-teal-500 mr-2 w-5 h-5" />
                                    ) : (
                                        <X className="text-red-500 mr-2 w-5 h-5" />
                                    )}
                                    <span>Parking Available</span>
                                </div>
                                <div className="flex items-center">
                                    {features?.furnished ? (
                                        <Check className="text-teal-500 mr-2 w-5 h-5" />
                                    ) : (
                                        <X className="text-red-500 mr-2 w-5 h-5" />
                                    )}
                                    <span>Furnished</span>
                                </div>
                                <div className="flex items-center">
                                    {features?.pet_friendly ? (
                                        <Check className="text-teal-500 mr-2 w-5 h-5" />
                                    ) : (
                                        <X className="text-red-500 mr-2 w-5 h-5" />
                                    )}
                                    <span>Pet Friendly</span>
                                </div>
                                <div className="flex items-center">
                                    {features?.swimming_pool ? (
                                        <Check className="text-teal-500 mr-2 w-5 h-5" />
                                    ) : (
                                        <X className="text-red-500 mr-2 w-5 h-5" />
                                    )}
                                    <span>Swimming Pool</span>
                                </div>
                                <div className="flex items-center">
                                    {features?.garden ? (
                                        <Check className="text-teal-500 mr-2 w-5 h-5" />
                                    ) : (
                                        <X className="text-red-500 mr-2 w-5 h-5" />
                                    )}
                                    <span>Garden</span>
                                </div>
                                <div className="flex items-center">
                                    {features?.security ? (
                                        <Check className="text-teal-500 mr-2 w-5 h-5" />
                                    ) : (
                                        <X className="text-red-500 mr-2 w-5 h-5" />
                                    )}
                                    <span>Security</span>
                                </div>
                                <div className="flex items-center">
                                    {features?.water_supply ? (
                                        <Check className="text-teal-500 mr-2 w-5 h-5" />
                                    ) : (
                                        <X className="text-red-500 mr-2 w-5 h-5" />
                                    )}
                                    <span>Water Supply</span>
                                </div>
                                {features?.road_network && (
                                    <div className="flex items-center">
                                        <Check className="text-teal-500 mr-2 w-5 h-5" />
                                        <span>Road Network: {features.road_network}</span>
                                    </div>
                                )}
                                {features?.development_level && (
                                    <div className="flex items-center">
                                        <Check className="text-teal-500 mr-2 w-5 h-5" />
                                        <span>Development Level: {features.development_level}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Map */}

                        {listing.market_coordinates && listing.market_coordinates.length > 0 && (
                            <div className="mt-6">
                                <PropertyMap
                                    coordinates={listing.market_coordinates}
                                    title={listing.title}
                                />
                            </div>
                        )}

                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Price Card */}
                        <div className="bg-white rounded-2xl shadow-md p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-3xl font-bold text-gray-800">
                                        {listing.currency}{formatPrice(listing.price)}
                                    </h3>
                                    <p className="text-gray-600">
                                        {listing.listing_purpose === 'sale' ? 'Total Price' : 'Monthly Rent'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => toggleFavorite(listing.id)}
                                    className={`p-2 cursor-pointer rounded-full transition-colors ${isBookmarked(listing.id)
                                        ? 'bg-red-100 text-red-500 hover:bg-red-200'
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                        }`}
                                >
                                    <Heart className={`w-6 h-6 ${isBookmarked(listing.id) ? 'fill-current' : ''}`} />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handlePhoneCall}
                                    className="w-full bg-teal-500 text-white py-3 rounded-lg hover:bg-teal-600 transition-colors flex items-center justify-center"
                                >
                                    <Phone className="mr-2 w-5 h-5" />
                                    Call Agent
                                </button>
                                <button
                                    onClick={handleWhatsApp}
                                    className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
                                >
                                    <MessageCircle className="mr-2 w-5 h-5" />
                                    WhatsApp
                                </button>
                                <button
                                    onClick={handleEmail}
                                    className="w-full border-2 border-teal-500 text-teal-500 py-3 rounded-lg hover:bg-teal-50 transition-colors flex items-center justify-center"
                                >
                                    <Mail className="mr-2 w-5 h-5" />
                                    Send Email
                                </button>
                            </div>
                        </div>

                        {/* Agent Information Card */}
                        <div className="bg-white rounded-2xl shadow-md p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Listed by</h3>
                            <div className="flex items-center mb-4">
                                <Avatar className="w-16 h-16 mr-4">
                                    <AvatarImage src={listing.owner?.profile_picture} alt={listing.owner?.owner_name} />
                                    <AvatarFallback className="bg-teal-100 text-teal-600 text-lg font-semibold">
                                        {listing.owner?.owner_name?.charAt(0) || 'A'}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="font-semibold text-gray-800">{listing.owner?.owner_name}</h4>
                                    <p className="text-gray-600 text-sm">{listing.owner?.business_name}</p>
                                    <div className="flex items-center mt-1">
                                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                        <span className="text-sm text-gray-600 ml-1">{listing.owner?.owner_rating || 0}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center">
                                    <Phone className="w-4 h-4 mr-2" />
                                    <span>{listing.owner?.phone_number}</span>
                                </div>
                                <div className="flex items-center">
                                    <Mail className="w-4 h-4 mr-2" />
                                    <span>{listing.owner?.email}</span>
                                </div>
                                <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    <span>{listing.owner?.base_city}, {listing.owner?.base_state} </span>
                                </div>
                            </div>

                            <button
                                onClick={() => router.push(`/agents/${listing.owner?.id}`)}
                                className="w-full cursor-pointer mt-4 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                View Agent Profile
                            </button>
                        </div>

                        {/* Property Stats */}
                        {/* <div className="bg-white rounded-2xl shadow-md p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Property Stats</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Listed on</span>
                                    <span className="font-semibold">{formatDate(listing.created_at)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Property Type</span>
                                    <span className="font-semibold">{listing.property_type}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Status</span>
                                    <Badge variant={listing.status === 'available' ? 'default' : 'secondary'}>
                                        {listing.status}
                                    </Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Property ID</span>
                                    <span className="font-semibold">#{listing.id}</span>
                                </div>
                            </div>
                        </div> */}
                    </div>
                </div>

                {/* More Properties from this Agent */}
                {vendorListings.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                            More Properties by {listing.owner?.owner_name}
                        </h2>
                        <div className="grid md:grid-cols-3 grid-cols-1 gap-6">
                            {vendorListings.slice(0, 3).map((property: any) => (
                                <div key={property.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="relative">
                                        <img
                                            src={property.image_files?.[0]?.file || '/api/placeholder/300/200'}
                                            alt={property.title}
                                            className="w-full h-48 object-cover"
                                        />
                                        <div className="absolute top-4 left-4 bg-teal-500 text-white px-2 py-1 rounded-full text-xs">
                                            {property.listing_purpose === 'sale' ? 'For Sale' : 'For Rent'}
                                        </div>
                                        <button
                                            onClick={() => toggleFavorite(property.id)}
                                            className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${isBookmarked(property.id)
                                                ? 'bg-red-100 text-red-500 hover:bg-red-200'
                                                : 'bg-white bg-opacity-80 text-gray-600 hover:bg-opacity-100'
                                                }`}
                                        >
                                            <Heart className={`w-4 h-4 ${isBookmarked(property.id) ? 'fill-current' : ''}`} />
                                        </button>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-800 mb-2 truncate">{property.title}</h3>
                                        <div className="flex items-center text-gray-600 mb-2">
                                            <MapPin className="w-4 h-4 mr-1" />
                                            <span className="text-sm truncate">{property.address}, {property.city}</span>
                                        </div>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center space-x-3 text-sm text-gray-600">
                                                <div className="flex items-center">
                                                    <BedDouble className="w-4 h-4 mr-1" />
                                                    <span>{property.bedrooms}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <Bath className="w-4 h-4 mr-1" />
                                                    <span>{property.bathrooms}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <SquareIcon className="w-4 h-4 mr-1" />
                                                    <span>{property.square_feet}sq m</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xl font-bold text-teal-600">
                                                {property.currency}{formatPrice(property.price)}
                                            </span>
                                            <button
                                                onClick={() => router.push(`/properties/${property.id}`)}
                                                className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors text-sm"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PropertyDetailsPage;