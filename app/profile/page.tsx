"use client"
import React, { useState, useEffect, useRef } from 'react';
import {
    User,
    MapPin,
    Mail,
    Phone,
    Building,
    Edit,
    ChevronRight,
    Home,
    PieChart,
    Settings,
    LogOut,
    Plus,
    Check,
    Briefcase,
    Clock,
    Eye,
    MessageSquare,
    Heart,
    TrendingUp,
    ArrowUpRight,
    BarChart,
    Calendar,
    FileEdit,
    Upload,
    CheckCircle,
    HeartIcon,
    AlertCircle,
    CreditCard,
    X,
    EyeOff,
    FileText,
    Camera,
    PlusCircle,
    Loader2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from 'sonner';
import api from '@/config/apiClient';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Agent {
    id: string | null;
    agency_name: string;
    agency_address: string;
    phone_number: string;
    whatsapp_number: string;
    experience_years: number;
    preferred_contact_mode: string;
    verified: boolean;
    featured: boolean;
    bio: string;
    total_views: number;
    total_inquiries: number;
    total_bookmarks: number;
    total_listings: number;
}

interface Profile {
    avatar?: string;
    phone_number?: string;
    city?: string;
    state?: string;
    is_phone_verified: string
    is_email_verified: string
}

interface UserProfile {
    id: string;
    name?: string;
    first_name?: string;
    email?: string;
    profile?: Profile;
    agent?: Agent | null;
    is_active?: boolean;
    is_phone_verified: string;
    is_email_verified: string;
    is_identity_verified: string;
    date_joined?: string;
    subscription?: {
        plan: string;
        status: string;
    };
    referral_code?: string;
    referrer: string;
    referred_users_count?: number;
    total_referral_earnings?: number;
}

interface UpdateData {
    name: string;
    profile: {
        phone_number: string;
        city: string;
        state: string;
    };
    agent?: {
        agency_name: string;
        agency_address: string;
        phone_number: string;
        whatsapp_number: string;
        bio: string;
        preferred_contact_mode: string;
    };
}

const Profile = () => {

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isDocDialogOpen, setIsDocDialogOpen] = useState(false);
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);
    const [isIdVerified, setIsIdVerified] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const fileInputRef = useRef<any>(null);
    const [selectedImages, setSelectedImages] = useState<any>([]);
    const [favorites, setFavorites] = useState<any>(null)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const router = useRouter()
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [referrerCode, setReferrerCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isListingDialogOpen, setIsListingDialogOpen] = useState(false)



    const handlePasswordChange = async () => {
        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("All fields are required");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("New passwords don't match");
            return;
        }

        console.log(currentPassword, newPassword, confirmPassword)

        // Password strength validation
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&#]{4,}$/;
        if (!passwordRegex.test(newPassword)) {
            toast.error("Password must be at least 4 characters and include uppercase, lowercase, and number");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post("/accounts/change-password/", {
                old_password: currentPassword,
                new_password: newPassword,
                confirm_password: confirmPassword
            }, {
                headers: {
                    "Content-Type": "Application/json",
                    Authorization: `Token ${token}`
                }
            });

            toast.success("Password updated successfully!");
            setPasswordDialogOpen(false);
            // Reset fields
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            // Handle axios error responses
            const errorMessage = error.response?.data?.message || error.message || "Failed to update password";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = () => {
        // Account deletion logic would go here
        alert("Account scheduled for deletion in 30 days");
        setIsDeleteConfirmOpen(false);
    };

    const [profileData, setProfileData] = useState<any>({
        id: "",
        name: "",
        first_name: "",
        email: "",
        photo: "/api/placeholder/150/150", // A default placeholder is fine
        phone: "",
        location: "",
        bio: "",
        verified: false,
        agency_name: "",
        agency_address: "",
        whatsapp_number: "",
        experience_years: 0,
        preferred_contact_mode: "",
        featured: false,
        specialties: [],
        languages: [],
        certifications: [],
        socialMedia: {
            linkedin: "",
            twitter: "",
            instagram: ""
        },
        achievements: [],
        joinedDate: "",
        subscription: {
            plan: "Free",
            status: "active"
        },
        referral_code: "",
        referred_users_count: 0,
        total_referral_earnings: 0,
        agent: {
            id: null,
            agency_name: "",
            agency_address: "",
            phone_number: "",
            whatsapp_number: "",
            experience_years: 0,
            preferred_contact_mode: "",
            verified: false,
            featured: false,
            bio: "",
            total_views: 0,
            total_inquiries: 0,
            total_bookmarks: 0,
            total_listings: 0
        }
    });


    const handleCardClick = (listingId: string) => {
        router.push(`/listings/${listingId}`);
    };

    // Listings data state
    const [listings, setListings] = useState<any>([
    ]);

    const idCardInputRef = useRef(null);
    const photoInputRef = useRef(null);
    const businessRegInputRef = useRef(null);

    // Analytics data for dashboard
    const [analytics, setAnalytics] = useState({
        totalListings: 0,
        totalFavorites: 0,
        activeListings: 0,
        underContractListings: 0,
        soldListings: 0,
        totalViews: 0,
        totalInquiries: 0,
        conversionRate: 0,
        averageDaysToSell: 0,
        performanceByMonth: [
            { month: "Jan", sales: 0, value: 0 },
            { month: "Feb", sales: 0, value: 0 },
            { month: "Mar", sales: 0, value: 0 },
            { month: "Apr", sales: 0, value: 0 },
            { month: "May", sales: 0, value: 0 },
            { month: "Jun", sales: 0, value: 0 }
        ]
    });

    console.log("profileData-->", profile)

    // State for forms
    const [isEditing, setIsEditing] = useState(false);
    const [editableProfile, setEditableProfile] = useState({ ...profileData });
    const [isAddingListing, setIsAddingListing] = useState(false);
    const [newListing, setNewListing] = useState<any>({
        title: "",
        description: "",
        property_type: "",
        price: "",
        currency: "USD",
        listing_purpose: "sale",
        address: "",
        city: "",
        state: "",
        zip_code: "",
        bedrooms: "",
        bathrooms: "",
        square_feet: "",
        lot_size: "",
        year_built: "",
        availability: "now",
        availability_date: ""
    });
    const [submitStatus, setSubmitStatus] = useState<any>(null); // null, 'success', 'error'
    const [statusMessage, setStatusMessage] = useState<any>("");
    const [files, setFiles] = useState<any>({
        id_card: null,
        photo: null,
        business_registration: null,
    });
    const isFileSelected = (type: any) => {
        return files[type] !== null;
    };
    const resetForm = () => {
        setFiles({
            id_card: null,
            photo: null,
            business_registration: null
        });
        setSubmitStatus(null);
        setStatusMessage("");
    };


    console.log("editableProfile--->", editableProfile)

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;


        const fetchUserFavorites = async () => {
            setLoading(true);
            try {
                const response = await api.get("/market/user-bookmarks/", {
                    headers: {
                        "Content-Type": "Application/json",
                        Authorization: `Token ${token}`
                    }
                });
                setFavorites(response.data)
                setLoading(false)
            } catch (error) {
                console.error("Error fetching user data:", error);
                setLoading(false)
            }

        }


    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await api.get("/accounts/current-user/", {
                headers: {
                    "Content-Type": "Application/json",
                    Authorization: `Token ${token}`
                }
            });
            setProfile(response.data);

            // Update profileData with fetched data
            const userData = response.data;
            console.log("API response:", userData); // Debug: Log the full API response

            // Set the main profileData state
            setProfileData({
                id: userData.id,
                name: userData.name || "",
                first_name: userData.first_name || "",
                email: userData.email || "",
                photo: userData.profile?.avatar || "/api/placeholder/150/150",
                phone: userData.agent?.phone_number || userData.profile?.phone_number || "",
                location: userData.profile?.city ?
                    `${userData.profile.city}${userData.profile.state ? ', ' + userData.profile.state : ''}` :
                    "Uyo, Nigeria",
                bio: userData.agent?.bio || "A nice agent that charges high fee.",
                verified: userData.is_active || false,
                agency_name: userData.agent?.agency_name || "Developer Agent",
                agency_address: userData.agent?.agency_address || "Umuahia Road 5, Uyo.",
                whatsapp_number: userData.agent?.whatsapp_number || "+23470641230",
                experience_years: userData.agent?.experience_years || 5,
                preferred_contact_mode: userData.agent?.preferred_contact_mode || "phone",
                featured: userData.agent?.featured || false,
                specialties: [],
                languages: ["English"],
                certifications: [],
                socialMedia: {
                    linkedin: "",
                    twitter: "",
                    instagram: ""
                },
                achievements: [],
                joinedDate: userData.date_joined || "",
                subscription: {
                    plan: userData.subscription?.plan || "Free",
                    status: userData.subscription?.status || "active"
                },
                referral_code: userData.referral_code || "",
                referred_users_count: userData.referred_users_count || 0,
                total_referral_earnings: userData.total_referral_earnings || 0,
                agent: userData.agent || null
            });

            // Extract profile data directly from the API response
            const profile = userData.profile || {};

            // Set the editable profile with values directly from the profile object
            // This avoids relying on nested optional chaining that might miss fields
            setEditableProfile({
                id: userData.id,
                name: userData.name || "",
                first_name: userData.first_name || "",
                email: userData.email || "",
                photo: profile.avatar || "/api/placeholder/150/150",
                // Handle phone numbers from both profile and agent
                phone: userData.agent?.phone_number || profile.phone_number || "",
                phone_number: userData.agent?.phone_number || profile.phone_number || "",
                // Extract all address fields directly from profile
                country_of_residence: profile.country_of_residence || "Nigeria",
                state: profile.state || "",
                city: profile.city || "",
                street: profile.street || "",
                house_number: profile.house_number || "",
                postal_code: profile.postal_code || "",
                birth_date: profile.birth_date || "",
                // Create location string for display
                location: profile.city && profile.state ?
                    `${profile.city}, ${profile.state}` :
                    "Uyo, Nigeria",
                // Agent-specific fields
                bio: userData.agent?.bio || "A nice agent that charges high fee.",
                verified: userData.is_active || false,
                agency_name: userData.agent?.agency_name || "Developer Agent",
                agency_address: userData.agent?.agency_address || "Umuahia Road 5, Uyo.",
                whatsapp_number: userData.agent?.whatsapp_number || "+23470641230",
                experience_years: userData.agent?.experience_years || 5,
                preferred_contact_mode: userData.agent?.preferred_contact_mode || "phone",
                featured: userData.agent?.featured || false,
                // Additional fields
                specialties: [],
                languages: ["English"],
                certifications: [],
                socialMedia: {
                    linkedin: "",
                    twitter: "",
                    instagram: ""
                },
                achievements: [],
                joinedDate: userData.date_joined || ""
            });

            console.log("Editable profile after setting:", JSON.stringify(editableProfile, null, 2)); // Debug

            // Update analytics data from the agent information
            if (userData.agent) {
                // Calculate active and sold listings (for demonstration - update with your actual logic)
                const properties = userData.agent.properties || [];
                const activeListings = properties.length; // Assuming all are active for now
                const soldListings = 0; // You'll need to determine this based on your data structure
                const underContractListings = 0; // You'll need to determine this based on your data structure

                // Calculate average days to sell if you have the data
                const averageDaysToSell = 0; // You'll need to calculate this based on your data

                // Calculate conversion rate (inquiries to sales)
                const conversionRate = userData.agent.total_inquiries > 0
                    ? (soldListings / userData.agent.total_inquiries) * 100
                    : 0;

                // Generate performance by month (you may need to adjust this based on your actual data)
                const currentMonth = new Date().getMonth();
                const performanceByMonth = [
                    { month: "Jan", sales: 0, value: 0 },
                    { month: "Feb", sales: 0, value: 0 },
                    { month: "Mar", sales: 0, value: 0 },
                    { month: "Apr", sales: 0, value: 0 },
                    { month: "May", sales: 0, value: 0 },
                    { month: "Jun", sales: 0, value: 0 }
                ];

                setAnalytics({
                    totalListings: userData.agent.total_listings || 0,
                    totalFavorites: userData.agent.total_bookmarks || 0,
                    activeListings,
                    underContractListings,
                    soldListings,
                    totalViews: userData.agent.total_views || 0,
                    totalInquiries: userData.agent.total_inquiries || 0,
                    conversionRate,
                    averageDaysToSell,
                    performanceByMonth
                });
            }
            setListings(userData.agent?.properties)
            setLoading(false);
        } catch (err) {
            console.error("Error fetching user data:", err);
            setLoading(false);
            toast.error("Failed to load profile data. Please try again later.");
        }
    };


    useEffect(() => {
        fetchProfile();
        fetchUserFavorites()
    }, [token]);

    const handleProfileUpdate = async () => {
        try {
            setLoading(true);

            // Create the update data object using the proper property names
            const updateData = {
                phone_number: editableProfile.phone_number || "",
                country_of_residence: editableProfile.country_of_residence || "Nigeria",
                state: editableProfile.state || "",
                city: editableProfile.city || "",
                street: editableProfile.street || "",
                house_number: editableProfile.house_number || "",
                postal_code: editableProfile.postal_code || "",
                birth_date: editableProfile.birth_date || ""
            };

            // Make API call to update profile
            const response = await api.put("/accounts/profile/create/", updateData, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`
                }
            });

            // Update the local state with the response data
            setProfileData((prev: any) => ({
                ...prev,
                phone: editableProfile.phone_number,
                city: editableProfile.city,
                state: editableProfile.state,
                country_of_residence: editableProfile.country_of_residence,
                street: editableProfile.street,
                house_number: editableProfile.house_number,
                postal_code: editableProfile.postal_code,
                birth_date: editableProfile.birth_date
            }));

            setIsEditing(false);
            setIsEditDialogOpen(false)
            setLoading(false);
            toast.success("Profile updated successfully!");
        } catch (err) {
            console.error("Error updating profile:", err);
            setLoading(false);
            toast.error("Failed to update profile. Please try again later.");
        }
    };

    const handleAddListing = async () => {
        try {
            setLoading(true);

            // Prepare the payload according to the required format
            const payload: any = {
                title: newListing.title,
                description: newListing.description,
                property_type: newListing.property_type,
                price: newListing.price,
                currency: newListing.currency,
                listing_purpose: newListing.listing_purpose,
                address: newListing.address,
                city: newListing.city,
                state: newListing.state,
                zip_code: newListing.zip_code,
                bedrooms: newListing.bedrooms,
                bathrooms: newListing.bathrooms,
                square_feet: newListing.square_feet,
                lot_size: newListing.lot_size,
                year_built: newListing.year_built,
                availability: newListing.availability,
            };

            // Only add availability_date to the payload if availability is "date"
            if (newListing.availability === "date" && newListing.availability_date) {
                payload.availability_date = newListing.availability_date;
            }

            console.log("console.log----->", payload);

            // Make API call to list the property
            const response = await api.post("/market/list-property/", payload, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`
                }
            });

            // If successful, add to local state
            if (response.data) {
                setIsAddingListing(false);

                // Reset the form - notice we don't include availability_date when availability is "now"
                setNewListing({
                    title: "",
                    description: "",
                    property_type: "",
                    price: "",
                    currency: "USD",
                    listing_purpose: "sale",
                    address: "",
                    city: "",
                    state: "",
                    zip_code: "",
                    bedrooms: "",
                    bathrooms: "",
                    square_feet: "",
                    lot_size: "",
                    year_built: "",
                    availability: "now"
                });
                setIsListingDialogOpen(false)

                fetchProfile()

                toast.success("New property listed successfully!");
            }

            setLoading(false);
        } catch (error) {
            console.error("Error adding property:", error);
            setLoading(false);
            toast.error("Failed to add property. Please try again.");
        }
    };

    const handleEmailNotificationToggle = async (checked: any) => {
        try {
            setLoading(true);

            // Determine which endpoint to use based on the toggle state
            const endpoint = checked
                ? "/notifications/email-notifications/subscribe/"
                : "/notifications/email-notifications/unsubscribe/";

            // Prepare the payload with username and email
            const payload = {
                username: profileData.name,
                email: profileData.email
            };

            // Make the API call
            const response = await api.post(endpoint, payload, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`
                }
            });

            // Update the state based on the response
            setEmailNotifications(checked);

            // Show success message
            toast.success(checked
                ? "Successfully subscribed to email notifications"
                : "Successfully unsubscribed from email notifications");

        } catch (error) {
            console.error("Error toggling email notifications:", error);

            // Revert the UI state since the API call failed
            setEmailNotifications(!checked);

            toast.error("Failed to update email notification preferences. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const triggerFileInput = (inputRef: any) => () => {
        if (inputRef && inputRef.current) {
            inputRef.current.click();
        }
    };


    // Remove an image
    const removeImage = (indexToRemove: any) => {
        setSelectedImages((prevImages: any) =>
            prevImages.filter(((_: any, index: any) => index !== indexToRemove)
            ));
    };

    // Handle drag events
    const handleDragOver = (e: any) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleFileSelect = (type: any) => (e: any) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFiles((prev: any) => ({
                ...prev,
                [type]: selectedFile
            }));
        }
    };


    const handleSubmitReferrerCode = async (e: any) => {
        e.preventDefault();

        if (!referrerCode.trim()) {
            setError('Please enter a referrer code');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const response = await api.post('/accounts/submit-referral/', {
                referrer_code: referrerCode.trim()
            }, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`
                }
            });

            toast.success('Referrer code applied successfully!');
            setReferrerCode('');
            setIsDialogOpen(false);

            // Optional: Update the profile data if needed
            // updateProfileData();

        } catch (error: any) {
            console.error('Error submitting referrer code:', error);

            if (error.response) {
                setError(error.response.data.error);
            } else {
                setError('Failed to apply referrer code. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleVerificationSubmit = async () => {
        // Check if required files are present
        if (!files.id_card || !files.photo) {
            setSubmitStatus("error");
            setStatusMessage("ID card and photo are required.");
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            // Create form data to send files
            const formData = new FormData();
            formData.append("id_card", files.id_card);
            formData.append("photo", files.photo);

            // Only append business registration if it exists
            if (files.business_registration) {
                formData.append("business_registration", files.business_registration);
            }

            // Make API request using axios
            const response = await api.post(
                "/agents/verifications/",
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Token ${token}`
                    }
                }
            );

            toast.success("ID verification was successful")

            // Axios automatically throws errors for non-2xx responses,
            // so if we reach here, the request was successful
            setIsIdVerified(true);
            setSubmitStatus("success");
            setStatusMessage("Verification submitted successfully!");


        } catch (error: any) {
            console.error("Verification error:", error);

            // Extract error message from axios error object
            const errorMessage = error.response?.data?.message ||
                error.message ||
                "Something went wrong. Please try again.";

            setSubmitStatus("error");
            setStatusMessage(errorMessage);
            setTimeout(() => {
                setIsDocDialogOpen(false);
            }, 1500);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDrop = (e: any) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files);

            // Create previews for the dropped files
            const newImages = files.map((file: any) => ({
                file,
                preview: URL.createObjectURL(file),
                name: file.name
            }));

            // Update the selectedImages state
            setSelectedImages((prevImages: any) => [...prevImages, ...newImages]);
        }
    };

    // Format price with commas
    const formatPrice = (price: any) => {
        return price?.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        });
    };

    // Format date
    const formatDate = (dateString: any) => {
        if (!dateString) return "";
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options as any);
    };

    // Calculate years of experience
    const calculateExperience = (dateString: any) => {
        if (!profileData.experience_years) return "New";
        return profileData.experience_years;
    };

    // Get subscription status
    const getSubscriptionInfo = () => {
        if (!profileData.subscription) return { plan: "Free", status: "inactive" };
        return {
            plan: profileData.subscription.plan || "Free",
            status: profileData.subscription.status || "inactive"
        };
    };

    // Get user initials for avatar
    const getUserInitials = () => {
        if (!profileData.name) return "";
        return profileData.name.split(' ').map((n: any) => n[0]).join('');
    };

    if (loading && !profile) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-t-teal-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading profile data...</p>
                </div>
            </div>
        );
    }


    const EmptyState = () => (
        <div className="border border-dashed rounded-lg p-12 flex w-full flex-col items-center justify-center text-center bg-gray-50">
            <div className="bg-blue-100 p-4 rounded-full mb-6">
                <Home className="h-12 w-12 text-teal-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No listings yet</h3>
            <p className="text-gray-500 mb-6 max-w-md">
                You haven't added any property listings to your portfolio. Add your first property to start tracking performance.
            </p>
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Left Sidebar */}
                    <div className="w-full md:w-1/4 space-y-6">
                        {/* Profile Card */}
                        <Card>
                            <CardHeader className="text-center pb-2">
                                <div className="flex justify-center mb-4">
                                    <Avatar className="h-24 w-24">
                                        <AvatarImage src={profileData.photo} alt={profileData.name} />
                                        <AvatarFallback>{getUserInitials()}</AvatarFallback>
                                    </Avatar>
                                </div>
                                <CardTitle>{profileData.name}</CardTitle>
                                <div className="flex items-center justify-center space-x-2 mt-1">
                                    <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                                        {calculateExperience(profileData.joinedDate)} yrs Experience
                                    </Badge>
                                    {profileData.verified && (
                                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                            <Check className="h-3 w-3 mr-1" /> Verified
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="text-center space-y-2 pt-2">
                                {profileData.location && (
                                    <div className="flex items-center justify-center text-gray-600">
                                        <MapPin className="h-4 w-4 mr-1" /> {profileData.location}
                                    </div>
                                )}
                                <div className="flex items-center justify-center text-gray-600">
                                    <Mail className="h-4 w-4 mr-1" /> {profileData.email}
                                </div>
                                {profileData.phone && (
                                    <div className="flex items-center justify-center text-gray-600">
                                        <Phone className="h-4 w-4 mr-1" /> {profileData.phone}
                                    </div>
                                )}
                                {profileData.agency_name && (
                                    <div className="flex items-center justify-center text-gray-600">
                                        <Building className="h-4 w-4 mr-1" /> {profileData.agency_name}
                                    </div>
                                )}
                                <div className="mt-2">
                                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                                        {getSubscriptionInfo().plan} Plan
                                    </Badge>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-center pt-2">
                                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="text-teal-600 cursor-pointer" onClick={() => {
                                            setIsEditing(true);
                                            setEditableProfile((prevEditableProfile: any) => ({
                                                ...prevEditableProfile,

                                                name: profileData.name,
                                                email: profileData.email,
                                                phone: profileData.phone,
                                                photo: profileData.photo,
                                            }));
                                        }}>
                                            <Edit className="h-4 w-4 mr-1" /> Edit Profile
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[625px] max-h-[85vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>Edit Your Profile</DialogTitle>
                                            <DialogDescription>
                                                Update your profile information to keep your clients informed.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name">Full Name</Label>
                                                    <Input
                                                        id="name"
                                                        value={editableProfile.name}
                                                        disabled
                                                        onChange={(e) => setEditableProfile({ ...editableProfile, name: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="photo">Profile Photo</Label>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarImage src={editableProfile.photo} alt={editableProfile.name} />
                                                            <AvatarFallback>{getUserInitials()}</AvatarFallback>
                                                        </Avatar>
                                                        <Button variant="outline" size="sm">
                                                            <Upload className="h-4 w-4 mr-1" /> Upload
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="email">Email</Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        value={editableProfile.email}
                                                        disabled
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="phone">Phone</Label>
                                                    <Input
                                                        id="phone"
                                                        type="tel"
                                                        value={editableProfile.phone}
                                                        placeholder='+2348061752152"'
                                                        onChange={(e) => setEditableProfile({ ...editableProfile, phone: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="birth_date">Date of Birth</Label>
                                                <Input
                                                    id="birth_date"
                                                    type="date"
                                                    value={editableProfile.birth_date || ""}
                                                    onChange={(e) => setEditableProfile({ ...editableProfile, birth_date: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="location">Location</Label>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="city">City</Label>
                                                        <Input
                                                            id="city"
                                                            value={editableProfile.city || ""}
                                                            onChange={(e) => setEditableProfile({ ...editableProfile, city: e.target.value })}
                                                            placeholder="e.g. Ikeja"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="state">State</Label>
                                                        <Input
                                                            id="state"
                                                            value={editableProfile.state || ""}
                                                            onChange={(e) => setEditableProfile({ ...editableProfile, state: e.target.value })}
                                                            placeholder="e.g. Lagos"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="house_number">House Number</Label>
                                                    <Input
                                                        id="house_number"
                                                        value={editableProfile.house_number || ""}
                                                        onChange={(e) => setEditableProfile({ ...editableProfile, house_number: e.target.value })}
                                                        placeholder="e.g. 12B"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="postal_code">Postal Code</Label>
                                                    <Input
                                                        id="postal_code"
                                                        value={editableProfile.postal_code || ""}
                                                        onChange={(e) => setEditableProfile({ ...editableProfile, postal_code: e.target.value })}
                                                        placeholder="e.g. 100001"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="street">Street</Label>
                                                <Input
                                                    id="street"
                                                    value={editableProfile.street || ""}
                                                    onChange={(e) => setEditableProfile({ ...editableProfile, street: e.target.value })}
                                                    placeholder="e.g. Allen Avenue"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="country">Country</Label>
                                                <Input
                                                    id="country"
                                                    value={editableProfile.country_of_residence || "Nigeria"}
                                                    onChange={(e) => setEditableProfile({ ...editableProfile, country_of_residence: e.target.value })}
                                                />
                                            </div>
                                            {/* {profileData.agent && (
                                                <>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="agencyName">Agency Name</Label>
                                                        <Input
                                                            id="agencyName"
                                                            value={editableProfile.agency_name}
                                                            onChange={(e) => setEditableProfile({ ...editableProfile, agency_name: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="agencyAddress">Agency Address</Label>
                                                        <Input
                                                            id="agencyAddress"
                                                            value={editableProfile.agency_address}
                                                            onChange={(e) => setEditableProfile({ ...editableProfile, agency_address: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="whatsapp">WhatsApp Number</Label>
                                                        <Input
                                                            id="whatsapp"
                                                            value={editableProfile.whatsapp_number}
                                                            onChange={(e) => setEditableProfile({ ...editableProfile, whatsapp_number: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="preferredContact">Preferred Contact Method</Label>
                                                        <Select
                                                            defaultValue={editableProfile.preferred_contact_mode}
                                                            onValueChange={(value) => setEditableProfile({ ...editableProfile, preferred_contact_mode: value })}
                                                        >
                                                            <SelectTrigger id="preferredContact">
                                                                <SelectValue placeholder="Select contact method" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="phone">Phone</SelectItem>
                                                                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                                                <SelectItem value="email">Email</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </>
                                            )} */}
                                        </div>
                                        <DialogFooter>
                                            {/* <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button> */}
                                            <Button className='cursor-pointer bg-teal-600 hover:bg-teal-700' onClick={handleProfileUpdate} disabled={loading}>
                                                {loading ? "Saving..." : "Save Changes"}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </CardFooter>
                        </Card>

                        {/* Subscription Info */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Subscription</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2 space-y-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">{getSubscriptionInfo().plan} Plan</p>
                                        <p className="text-sm text-gray-500">Status: {getSubscriptionInfo().status}</p>
                                    </div>
                                    <Badge className="capitalize">
                                        {getSubscriptionInfo().status}
                                    </Badge>
                                </div>

                                {/* {getSubscriptionInfo().plan === "Free" && (
                                    <div className="pt-2">
                                        <Button variant="outline" className="w-full" size="sm">
                                            Upgrade Plan
                                        </Button>
                                    </div>
                                )} */}
                            </CardContent>
                        </Card>

                        {/* Referral Info */}
                        {profileData.referral_code && (
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Referrals</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-2 space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Your Referral Code</p>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <code className="bg-gray-100 px-2 py-1 rounded text-sm flex-1">{profileData.referral_code}</code>
                                            <Button variant="outline" size="sm" onClick={() => {
                                                navigator.clipboard.writeText(profileData.referral_code);
                                                toast.success("Referral code copied to clipboard!");
                                            }}>
                                                Copy
                                            </Button>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Referrer</p>
                                        <p className="font-medium">{profileData.referrer || "No referrer"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Referred Users</p>
                                        <p className="font-medium">{profileData.referred_users_count}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Total Earnings</p>
                                        <p className="font-medium">₦{profileData.total_referral_earnings.toLocaleString()}</p>
                                    </div>

                                    {/* New button to enter referrer code */}
                                    <div className="pt-2 border-t border-gray-100">
                                        <Button

                                            className="w-full flex items-center bg-teal-600 cursor-pointer hover:bg-teal-700 text-white justify-center hover:text-teal-70"
                                            onClick={() => setIsDialogOpen(true)}
                                        >
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Enter Referrer Code
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Main Content Area */}
                    <div className="w-full md:w-3/4 mb-10">
                        <Tabs defaultValue="dashboard">
                            <TabsList className="grid grid-cols-4 gap-8 mb-8">
                                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                                <TabsTrigger value="listings">My Listings</TabsTrigger>
                                <TabsTrigger value="profile">Profile</TabsTrigger>
                                <TabsTrigger value="favorites">Favorites</TabsTrigger>
                            </TabsList>

                            {/* Dashboard Tab */}
                            <TabsContent value="dashboard" className="space-y-6">
                                {/* Stats Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <Card className="bg-white">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium text-gray-500">Total Listings</CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="text-2xl font-bold">{analytics.totalListings}</div>
                                            <p className="text-xs text-gray-500 mt-1">Properties in your portfolio</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-white">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium text-gray-500">Total Favorites</CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="text-2xl font-bold">{analytics?.totalFavorites}</div>
                                            <p className="text-xs text-gray-500 mt-1">Currently on the market</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-white">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium text-gray-500">Total Views</CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="text-2xl font-bold">{analytics.totalViews}</div>
                                            <p className="text-xs text-gray-500 mt-1">Across all properties</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-white">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium text-gray-500">Total Inquiries</CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="text-2xl font-bold">{analytics.totalInquiries}</div>
                                            <p className="text-xs text-gray-500 mt-1">From potential buyers</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Performance Charts */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Property Views Trend</CardTitle>
                                            <CardDescription>Last 30 days performance</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="h-[300px] flex items-center justify-center">
                                                <BarChart className="h-10 w-10 text-gray-300" />
                                                <p className="text-gray-500 ml-2">Chart visualization will appear here</p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Inquiries Conversion</CardTitle>
                                            <CardDescription>Views to inquiries ratio</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="h-[300px] flex items-center justify-center">
                                                <PieChart className="h-10 w-10 text-gray-300" />
                                                <p className="text-gray-500 ml-2">Chart visualization will appear here</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Recent Activities */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Top Performing Properties</CardTitle>
                                        <CardDescription>Below are the top performing properties</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {profileData?.agent?.top_performing_properties?.map((property: any, index: number) => (
                                                <div key={index} className="flex items-start space-x-4">
                                                    <div className="bg-blue-100 p-2 rounded-full">
                                                        <Eye className="h-5 w-5 text-teal-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">{property?.title}</p>
                                                        <p className="text-teal-600 text-sm"><span className='text-gray-800 mr-1'>{property.currency}</span>
                                                            {(property?.price)?.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Listings Tab */}
                            <TabsContent value="listings" className="space-y-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold">My Properties</h2>
                                    <Dialog open={isListingDialogOpen} onOpenChange={setIsListingDialogOpen} >
                                        <DialogTrigger asChild>
                                            <Button className='bg-teal-600 cursor-pointer hover:bg-teal-700' onClick={() => setIsAddingListing(true)}>
                                                <Plus className="h-4 w-4 mr-1" /> Add New Property
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[625px] max-h-[85vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle>Add New Property</DialogTitle>
                                                <DialogDescription>
                                                    Enter details for your new property listing.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                {/* Basic Property Information */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="title">Property Title*</Label>
                                                    <Input
                                                        id="title"
                                                        value={newListing.title}
                                                        onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
                                                        placeholder="e.g. Modern 3 Bedroom Apartment"
                                                        required
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2 w-full">
                                                        <Label htmlFor="property_type">Property Type*</Label>
                                                        <Select
                                                            onValueChange={(value) => setNewListing({ ...newListing, property_type: value })}
                                                            value={newListing.property_type}

                                                        >
                                                            <SelectTrigger id="property_type" className="w-full">
                                                                <SelectValue placeholder="Select type" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="apartment">Apartment</SelectItem>
                                                                <SelectItem value="house">House</SelectItem>
                                                                <SelectItem value="villa">Villa</SelectItem>
                                                                <SelectItem value="commercial">Commercial</SelectItem>
                                                                <SelectItem value="land">Land</SelectItem>
                                                                <SelectItem value="condo">Condo</SelectItem>
                                                                <SelectItem value="townhouse">Townhouse</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2 w-full">
                                                        <Label htmlFor="listing_purpose">Listing Purpose*</Label>
                                                        <Select
                                                            onValueChange={(value) => setNewListing({ ...newListing, listing_purpose: value })}
                                                            defaultValue="sale"
                                                        >
                                                            <SelectTrigger id="listing_purpose" className='w-full'>
                                                                <SelectValue placeholder="Select purpose" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="sale">For Sale</SelectItem>
                                                                <SelectItem value="rent">For Rent</SelectItem>
                                                                <SelectItem value="lease">For Lease</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="price">Price*</Label>
                                                        <Input
                                                            id="price"
                                                            type="number"
                                                            value={newListing.price}
                                                            onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
                                                            placeholder="e.g. 250000"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="currency">Currency</Label>
                                                        <Select
                                                            onValueChange={(value) => setNewListing({ ...newListing, currency: value })}
                                                            defaultValue="USD"
                                                        >
                                                            <SelectTrigger id="currency" className='w-full'>
                                                                <SelectValue placeholder="Select currency" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="USD">USD ($)</SelectItem>
                                                                <SelectItem value="NGN">NGN (₦)</SelectItem>
                                                                <SelectItem value="EUR">EUR (€)</SelectItem>
                                                                <SelectItem value="GBP">GBP (£)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>

                                                {/* Location Information */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="address">Street Address*</Label>
                                                    <Input
                                                        id="address"
                                                        value={newListing.address}
                                                        onChange={(e) => setNewListing({ ...newListing, address: e.target.value })}
                                                        placeholder="e.g. 123 Main Street"
                                                        required
                                                    />
                                                </div>

                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="city">City*</Label>
                                                        <Input
                                                            id="city"
                                                            value={newListing.city}
                                                            onChange={(e) => setNewListing({ ...newListing, city: e.target.value })}
                                                            placeholder="e.g. San Francisco"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="state">State*</Label>
                                                        <Input
                                                            id="state"
                                                            value={newListing.state}
                                                            onChange={(e) => setNewListing({ ...newListing, state: e.target.value })}
                                                            placeholder="e.g. California"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="zip_code">ZIP Code</Label>
                                                        <Input
                                                            id="zip_code"
                                                            value={newListing.zip_code}
                                                            onChange={(e) => setNewListing({ ...newListing, zip_code: e.target.value })}
                                                            placeholder="e.g. 94103"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Property Details */}
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="bedrooms">Bedrooms</Label>
                                                        <Input
                                                            id="bedrooms"
                                                            type="number"
                                                            value={newListing.bedrooms}
                                                            onChange={(e) => setNewListing({ ...newListing, bedrooms: e.target.value })}
                                                            placeholder="e.g. 3"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="bathrooms">Bathrooms</Label>
                                                        <Input
                                                            id="bathrooms"
                                                            type="number"
                                                            value={newListing.bathrooms}
                                                            onChange={(e) => setNewListing({ ...newListing, bathrooms: e.target.value })}
                                                            placeholder="e.g. 2"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="year_built">Year Built</Label>
                                                        <Input
                                                            id="year_built"
                                                            type="number"
                                                            value={newListing.year_built}
                                                            onChange={(e) => setNewListing({ ...newListing, year_built: e.target.value })}
                                                            placeholder="e.g. 2015"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="square_feet">Square Feet (Interior)</Label>
                                                        <Input
                                                            id="square_feet"
                                                            type="number"
                                                            value={newListing.square_feet}
                                                            onChange={(e) => setNewListing({ ...newListing, square_feet: e.target.value })}
                                                            placeholder="e.g. 1200"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="lot_size">Lot Size (sq ft)</Label>
                                                        <Input
                                                            id="lot_size"
                                                            type="number"
                                                            value={newListing.lot_size}
                                                            onChange={(e) => setNewListing({ ...newListing, lot_size: e.target.value })}
                                                            placeholder="e.g. 1500"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Availability */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="availability">Availability</Label>
                                                        <Select
                                                            onValueChange={(value) => {
                                                                if (value === "now") {
                                                                    // Remove the availability_date field when "Available Now" is selected
                                                                    const { availability_date, ...restOfNewListing } = newListing;
                                                                    setNewListing({ ...restOfNewListing, availability: value });
                                                                } else {
                                                                    // Keep or initialize the availability_date when "Available From Date" is selected
                                                                    setNewListing({
                                                                        ...newListing,
                                                                        availability: value,
                                                                        availability_date: newListing.availability_date || new Date().toISOString().split('T')[0]
                                                                    });
                                                                }
                                                            }}
                                                            defaultValue="now"
                                                        >
                                                            <SelectTrigger id="availability">
                                                                <SelectValue placeholder="Select availability" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="now">Available Now</SelectItem>
                                                                <SelectItem value="date">Available From Date</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    {newListing.availability === "date" && (
                                                        <div className="space-y-2">
                                                            <Label htmlFor="availability_date">Available From</Label>
                                                            <Input
                                                                id="availability_date"
                                                                type="date"
                                                                value={newListing.availability_date}
                                                                onChange={(e) => setNewListing({ ...newListing, availability_date: e.target.value })}
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Description */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="description">Description*</Label>
                                                    <Textarea
                                                        id="description"
                                                        rows={4}
                                                        value={newListing.description}
                                                        onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                                                        placeholder="Describe the property features and highlights"
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="images">Upload Images</Label>
                                                    <div
                                                        className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                                                        onClick={() => fileInputRef.current.click()}
                                                        onDragOver={handleDragOver}
                                                        onDrop={handleDrop}
                                                    >
                                                        <Upload className="h-8 w-8 mx-auto text-gray-400" />
                                                        <p className="mt-2 text-sm text-gray-500">Drag and drop images here or click to browse</p>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="mt-4"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                fileInputRef.current.click();
                                                            }}
                                                        >
                                                            Choose Files
                                                        </Button>
                                                        <input
                                                            type="file"
                                                            ref={fileInputRef}
                                                            multiple
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={handleFileSelect('business_registration')}
                                                        />
                                                    </div>

                                                    {/* Image Previews */}
                                                    {selectedImages.length > 0 && (
                                                        <div className="mt-4">
                                                            <Label>Selected Images ({selectedImages.length})</Label>
                                                            <div className="grid grid-cols-3 gap-4 mt-2">
                                                                {selectedImages.map((image: any, index: any) => (
                                                                    <div key={index} className="relative group">
                                                                        <div className="aspect-square bg-gray-100 rounded-md overflow-hidden">
                                                                            <img
                                                                                src={image.preview}
                                                                                alt={`Property image ${index + 1}`}
                                                                                className="h-full w-full object-cover"
                                                                            />
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation(); // Prevent triggering the parent click handler
                                                                                removeImage(index);
                                                                            }}
                                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        >
                                                                            <X className="h-4 w-4" />
                                                                        </button>
                                                                        <p className="text-xs text-gray-500 truncate mt-1">{image.name}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setIsAddingListing(false)}>Cancel</Button>
                                                <Button
                                                    onClick={handleAddListing}
                                                    disabled={loading || !newListing.title || !newListing.description || !newListing.property_type || !newListing.price}
                                                >
                                                    {loading ? (
                                                        <>
                                                            <span className="mr-2">
                                                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                            </span>
                                                            Adding Property...
                                                        </>
                                                    ) : (
                                                        "Add Property"
                                                    )}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                {/* Listing Cards */}
                                {listings.length === 0 ? (
                                    <EmptyState />
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {listings.map((listing: any) => (
                                            <Card onClick={() => handleCardClick(listing.id)} key={listing.id} className="h-full cursor-pointer">
                                                <div className="relative h-48">
                                                    <img
                                                        src={listing.image}
                                                        alt={listing.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <Badge
                                                        className={`absolute top-3 right-3 ${listing.status === 'Active' ? 'bg-green-500' :
                                                            listing.status === 'Under Contract' ? 'bg-amber-500' :
                                                                'bg-blue-500'
                                                            }`}
                                                    >
                                                        {listing.status}
                                                    </Badge>
                                                </div>
                                                <CardHeader className="pb-2">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <CardTitle>{listing.title}</CardTitle>
                                                            <CardDescription className="flex items-center mt-1">
                                                                <MapPin className="h-3 w-3 mr-1" /> {listing.address}
                                                            </CardDescription>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-lg">{formatPrice(listing.price)}</p>
                                                            <p className="text-xs text-gray-500">Listed on {formatDate(listing.listed_date)}</p>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="pt-2">
                                                    <div className="flex justify-between text-sm mb-4">
                                                        <div className="flex items-center flex-wrap gap-1">
                                                            <Badge variant="outline" className="mr-1">
                                                                {listing.bedrooms} {listing.bedrooms === 1 ? 'Bed' : 'Beds'}
                                                            </Badge>
                                                            <Badge variant="outline" className="mr-1">
                                                                {listing.bathrooms} {listing.bathrooms === 1 ? 'Bath' : 'Baths'}
                                                            </Badge>
                                                            <Badge variant="outline">
                                                                {listing.area} sqft
                                                            </Badge>
                                                        </div>
                                                        <Badge variant="secondary">{listing.type}</Badge>
                                                    </div>

                                                    <div className="grid grid-cols-3 gap-2 text-center py-2 border-t border-b border-gray-100">
                                                        <div>
                                                            <p className="text-xs text-gray-500">Views</p>
                                                            <p className="font-semibold">{listing.views}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Inquiries</p>
                                                            <p className="font-semibold">{listing.inquiries}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Favorites</p>
                                                            <p className="font-semibold">{listing.favorites}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between mt-4">
                                                        <div className="flex items-center">
                                                            <div className={`flex items-center ${listing.performance?.trend === 'up' ? 'text-green-600' :
                                                                listing.performance?.trend === 'down' ? 'text-red-600' :
                                                                    'text-gray-600'
                                                                }`}>
                                                                {listing.performance?.trend === 'up' ? (
                                                                    <TrendingUp className="h-4 w-4 mr-1" />
                                                                ) : listing.performance?.trend === 'down' ? (
                                                                    <ArrowUpRight className="h-4 w-4 mr-1 transform rotate-90" />
                                                                ) : (
                                                                    <ArrowUpRight className="h-4 w-4 mr-1 transform rotate-45" />
                                                                )}
                                                                <span className="text-sm font-medium">
                                                                    {listing.performance?.percentageChange}% {listing.performance?.trend !== 'neutral' && (listing.performance?.trend === 'up' ? 'increase' : 'decrease')}
                                                                </span>
                                                            </div>
                                                            <span className="text-xs text-gray-500 ml-2">in views this week</span>
                                                        </div>
                                                        {/* <Button variant="outline" size="sm">
                                                            <FileEdit className="h-4 w-4 mr-1" /> Edit
                                                        </Button> */}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            {/* Profile Tab */}
                            <TabsContent value="profile" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Personal Information</CardTitle>
                                        <CardDescription>Review and update your personal details</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-500 mb-2">Full Name</h3>
                                                <p>{profileData.name}</p>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-500 mb-2">Email Address</h3>
                                                <p>{profileData.email}</p>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-500 mb-2">Phone Number</h3>
                                                <p>{profileData.phone}</p>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-500 mb-2">Location</h3>
                                                <p>{profileData.location}</p>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-200">
                                            <h3 className="text-sm font-medium text-gray-500 mb-2">Bio</h3>
                                            <p className="text-gray-700">{profileData.bio}</p>
                                        </div>

                                    </CardContent>
                                </Card>

                                {profileData.agent && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Agency Information</CardTitle>
                                            <CardDescription>Your real estate business details</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-500 mb-2">Agency Name</h3>
                                                    <p>{profileData.agency_name}</p>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-500 mb-2">Experience</h3>
                                                    <p>{profileData.experience_years} years</p>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-500 mb-2">Agency Address</h3>
                                                    <p>{profileData.agency_address}</p>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-500 mb-2">WhatsApp</h3>
                                                    <p>{profileData.whatsapp_number}</p>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-500 mb-2">Preferred Contact Method</h3>
                                                    <p className="capitalize">{profileData.preferred_contact_mode}</p>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-500 mb-2">Verification Status</h3>
                                                    <div className="flex items-center">
                                                        {profileData.verified ? (
                                                            <>
                                                                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                                                <span className="text-green-600">Verified</span>
                                                            </>
                                                        ) : (
                                                            <span className="text-amber-600">Pending Verification</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-gray-200">
                                                <h3 className="text-sm font-medium text-gray-500 mb-3">Account Statistics</h3>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                                                        <p className="text-sm text-gray-500">Total Views</p>
                                                        <p className="text-xl font-bold">{profileData.agent.total_views}</p>
                                                    </div>
                                                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                                                        <p className="text-sm text-gray-500">Total Inquiries</p>
                                                        <p className="text-xl font-bold">{profileData.agent.total_inquiries}</p>
                                                    </div>
                                                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                                                        <p className="text-sm text-gray-500">Bookmarks</p>
                                                        <p className="text-xl font-bold">{profileData.agent.total_bookmarks}</p>
                                                    </div>
                                                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                                                        <p className="text-sm text-gray-500">Total Listings</p>
                                                        <p className="text-xl font-bold">{profileData.agent.total_listings}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Account Settings</CardTitle>
                                        <CardDescription>Manage your account preferences</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Email Notifications - Toggle */}
                                        {/* <div className="flex items-center justify-between py-2">
                                            <div>
                                                <h3 className="font-medium">Email Notifications</h3>
                                                <p className="text-sm text-gray-500">
                                                    Receive updates about your listings and inquiries
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    id="email-notifications"
                                                    checked={emailNotifications}
                                                    onCheckedChange={handleEmailNotificationToggle}
                                                    disabled={loading}
                                                />
                                                <Label htmlFor="email-notifications">
                                                    {emailNotifications ? "Active" : "Inactive"}
                                                </Label>
                                            </div>
                                        </div> */}
                                        <div className="flex items-center justify-between py-2 border-t border-gray-200">
                                            <div>
                                                <h3 className="font-medium">Email Verification</h3>
                                                <p className="text-sm text-gray-500">
                                                    Verify your email address for account security
                                                </p>
                                            </div>
                                            <div className='flex flex-col gap-4'>
                                                <div className="flex items-center space-x-2">
                                                    <Switch
                                                        id="email-notifications"
                                                        checked={emailNotifications}
                                                        onCheckedChange={handleEmailNotificationToggle}
                                                        disabled={loading}
                                                    />
                                                    <Label htmlFor="email-notifications">
                                                        {emailNotifications ? "Active" : "Inactive"}
                                                    </Label>
                                                </div>
                                                {profile?.is_email_verified && (<Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled
                                                    className={profile?.is_email_verified ? "bg-green-50" : ""}
                                                >

                                                    <Check className="h-4 w-4 mr-1 text-green-500" />
                                                    Verified
                                                </Button>)}
                                            </div>
                                        </div>

                                        {/* Change Password - Dialog Modal */}
                                        <div className="flex items-center justify-between py-2 border-t border-gray-200">
                                            <div>
                                                <h3 className="font-medium">Change Password</h3>
                                                <p className="text-sm text-gray-500">Update your account password</p>
                                            </div>
                                            <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm">
                                                        Update Password
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-md">
                                                    <DialogHeader>
                                                        <DialogTitle>Change Password</DialogTitle>
                                                        <DialogDescription>
                                                            Enter your old password and a new password to update
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="space-y-4 py-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="current-password">Current Password</Label>
                                                            <div className="relative">
                                                                <Input
                                                                    id="current-password"
                                                                    type={showCurrentPassword ? "text" : "password"}
                                                                    placeholder="Enter current password"
                                                                    value={currentPassword}
                                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                                >
                                                                    {showCurrentPassword ? (
                                                                        <EyeOff className="h-4 w-4" />
                                                                    ) : (
                                                                        <Eye className="h-4 w-4" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="new-password">New Password</Label>
                                                            <div className="relative">
                                                                <Input
                                                                    id="new-password"
                                                                    type={showNewPassword ? "text" : "password"}
                                                                    placeholder="Enter new password"
                                                                    value={newPassword}
                                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                                >
                                                                    {showNewPassword ? (
                                                                        <EyeOff className="h-4 w-4" />
                                                                    ) : (
                                                                        <Eye className="h-4 w-4" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                                                            <div className="relative">
                                                                <Input
                                                                    id="confirm-password"
                                                                    type={showConfirmPassword ? "text" : "password"}
                                                                    placeholder="Confirm new password"
                                                                    value={confirmPassword}
                                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                                >
                                                                    {showConfirmPassword ? (
                                                                        <EyeOff className="h-4 w-4" />
                                                                    ) : (
                                                                        <Eye className="h-4 w-4" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                setPasswordDialogOpen(false);
                                                                setCurrentPassword("");
                                                                setNewPassword("");
                                                                setConfirmPassword("");
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            className='bg-teal-600 hover:bg-teal-700 cursor-pointer'
                                                            onClick={handlePasswordChange}
                                                            disabled={loading}
                                                        >
                                                            {loading ? "Updating..." : "Save Changes"}
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>

                                        {/* Phone Verification */}
                                        <div className="flex items-center justify-between py-2 border-t border-gray-200">
                                            <div>
                                                <h3 className="font-medium">Phone Verification</h3>
                                                <p className="text-sm text-gray-500">
                                                    Add an extra layer of security to your account
                                                </p>
                                            </div>
                                            {profile?.is_phone_verified ? (
                                                <Button variant="outline" size="sm" disabled className="bg-green-50">
                                                    <Check className="h-4 w-4 mr-1 text-green-500" />
                                                    Verified
                                                </Button>
                                            ) : (
                                                <Link href="/verify-number">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="cursor-pointer"
                                                    >
                                                        <Phone className="h-4 w-4 mr-1" />
                                                        Verify
                                                    </Button>
                                                </Link>
                                            )}
                                            {/* <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm">
                                                        <Phone className="h-4 w-4 mr-1" />
                                                        {isPhoneVerified ? "Verified" : "Verify"}
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Verify Your Phone Number</DialogTitle>
                                                        <DialogDescription>
                                                            Enter your phone number to receive a verification code
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="space-y-4 py-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="phone-number">Phone Number</Label>
                                                            <Input
                                                                id="phone-number"
                                                                type="tel"
                                                                placeholder="+1 (555) 123-4567"
                                                            />
                                                        </div>
                                                        <Button
                                                            onClick={() => setIsPhoneVerified(true)}
                                                            className="w-full"
                                                        >
                                                            Send Verification Code
                                                        </Button>
                                                    </div>
                                                </DialogContent>
                                            </Dialog> */}
                                        </div>

                                        {/* ID Card Verification */}
                                        {profileData.agent && (
                                            <div className="flex items-center justify-between py-2 border-t border-gray-200">
                                                <div>
                                                    <h3 className="font-medium">ID Card Verification</h3>
                                                    <p className="text-sm text-gray-500">
                                                        Verify your identity with a government-issued ID
                                                    </p>
                                                </div>
                                                <Dialog open={isDocDialogOpen} onOpenChange={(open) => {
                                                    setIsDocDialogOpen(open);
                                                    if (!open) resetForm();
                                                }}>
                                                    <DialogTrigger asChild>
                                                        <Button className='cursor-pointer' variant="outline" size="sm">
                                                            {profile?.is_identity_verified ? (
                                                                <>
                                                                    <Button variant="outline" size="sm" disabled className="bg-green-50">
                                                                        <Check className="h-4 w-4 mr-1 text-green-500" />
                                                                        Verified
                                                                    </Button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CreditCard className="h-4 w-4 mr-1" />
                                                                    Verify
                                                                </>
                                                            )}
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-lg">
                                                        <DialogHeader>
                                                            <DialogTitle>Verify Your Identity</DialogTitle>
                                                            <DialogDescription>
                                                                Please provide the required documents for verification
                                                            </DialogDescription>
                                                        </DialogHeader>

                                                        {submitStatus && (
                                                            <Alert variant={submitStatus === "success" ? "default" : "destructive"} className="mb-4">
                                                                <AlertCircle className="h-4 w-4" />
                                                                <AlertTitle>
                                                                    {submitStatus === "success" ? "Success" : "Error"}
                                                                </AlertTitle>
                                                                <AlertDescription>{statusMessage}</AlertDescription>
                                                            </Alert>
                                                        )}

                                                        <div className="space-y-4 py-4">
                                                            {/* ID Card Upload */}
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium">
                                                                    ID Card <span className="text-red-500">*</span>
                                                                </label>
                                                                <div
                                                                    className={`border-2 border-dashed rounded-md p-4 text-center
                                                                        ${isFileSelected('id_card') ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}
                                                                >
                                                                    <div className="flex flex-col items-center">
                                                                        <CreditCard className={`h-6 w-6 mb-2 ${isFileSelected('id_card') ? 'text-green-500' : 'text-gray-400'}`} />
                                                                        <p className="text-sm text-gray-500 mb-2">
                                                                            {isFileSelected('id_card')
                                                                                ? files.id_card.name
                                                                                : "Upload a photo of your government-issued ID"}
                                                                        </p>
                                                                        <input
                                                                            type="file"
                                                                            className="hidden"
                                                                            id="id-card-upload"
                                                                            ref={idCardInputRef}
                                                                            accept="image/*"
                                                                            onChange={handleFileSelect('id_card')}
                                                                        />
                                                                        <Button variant="outline" size="sm" type="button" onClick={triggerFileInput(idCardInputRef)}>
                                                                            <Upload className="h-4 w-4 mr-1" />
                                                                            {isFileSelected('id_card') ? "Change File" : "Select File"}
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Photo Upload */}
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium">
                                                                    Your Photo <span className="text-red-500">*</span>
                                                                </label>
                                                                <div
                                                                    className={`border-2 border-dashed rounded-md p-4 text-center
                  ${isFileSelected('photo') ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}
                                                                >
                                                                    <div className="flex flex-col items-center">
                                                                        <Camera className={`h-6 w-6 mb-2 ${isFileSelected('photo') ? 'text-green-500' : 'text-gray-400'}`} />
                                                                        <p className="text-sm text-gray-500 mb-2">
                                                                            {isFileSelected('photo')
                                                                                ? files.photo.name
                                                                                : "Upload a recent photo of yourself"}
                                                                        </p>
                                                                        <input
                                                                            type="file"
                                                                            className="hidden"
                                                                            id="photo-upload"
                                                                            ref={photoInputRef}
                                                                            accept="image/*"
                                                                            onChange={handleFileSelect('photo')}
                                                                        />
                                                                        <Button variant="outline" size="sm" type="button" onClick={triggerFileInput(photoInputRef)}>
                                                                            <Upload className="h-4 w-4 mr-1" />
                                                                            {isFileSelected('photo') ? "Change File" : "Select File"}
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Business Registration Upload (Optional) */}
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium">
                                                                    Business Registration <span className="text-gray-400">(Optional)</span>
                                                                </label>
                                                                <div
                                                                    className={`border-2 border-dashed rounded-md p-4 text-center
                  ${isFileSelected('business_registration') ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}
                                                                >
                                                                    <div className="flex flex-col items-center">
                                                                        <FileText className={`h-6 w-6 mb-2 ${isFileSelected('business_registration') ? 'text-green-500' : 'text-gray-400'}`} />
                                                                        <p className="text-sm text-gray-500 mb-2">
                                                                            {isFileSelected('business_registration')
                                                                                ? files.business_registration.name
                                                                                : "Upload business registration if applicable"}
                                                                        </p>
                                                                        <input
                                                                            type="file"
                                                                            className="hidden"
                                                                            id="business-reg-upload"
                                                                            ref={businessRegInputRef}
                                                                            accept="image/*,application/pdf"
                                                                            onChange={handleFileSelect('business_registration')}
                                                                        />
                                                                        <Button variant="outline" size="sm" type="button" onClick={triggerFileInput(businessRegInputRef)}>
                                                                            <Upload className="h-4 w-4 mr-1" />
                                                                            {isFileSelected('business_registration') ? "Change File" : "Select File"}
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Submit Button */}
                                                            <Button
                                                                onClick={handleVerificationSubmit}
                                                                className="w-full cursor-pointer bg-teal-600 hover:bg-teal-700"
                                                                disabled={isSubmitting || !files.id_card || !files.photo}
                                                            >
                                                                {isSubmitting ? "Submitting..." : "Submit for Verification"}
                                                            </Button>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        )}

                                        {/* Delete Account - Confirmation Modal */}
                                        {/* <div className="flex items-center justify-between py-2 border-t border-gray-200">
                                            <div>
                                                <h3 className="font-medium text-red-600">Delete Account</h3>
                                                <p className="text-sm text-gray-500">
                                                    Permanently remove your account and all data
                                                </p>
                                            </div>
                                            <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                                                <DialogTrigger asChild>
                                                    <Button variant="destructive" size="sm">
                                                        Delete
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Schedule Account Deletion</DialogTitle>
                                                        <DialogDescription>
                                                            Your account will be scheduled for deletion in 30 days. During this period, you can log in to cancel the deletion process.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="py-4">
                                                        <Alert variant="destructive">
                                                            <AlertCircle className="h-4 w-4" />
                                                            <AlertTitle>Warning</AlertTitle>
                                                            <AlertDescription>
                                                                This action cannot be undone after the 30-day period. All your data will be permanently deleted.
                                                            </AlertDescription>
                                                        </Alert>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
                                                            Cancel
                                                        </Button>
                                                        <Button variant="destructive" onClick={handleDeleteAccount}>
                                                            Schedule Deletion
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div> */}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="favorites" className="space-y-6">
                                {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {favorites?.map((listing: any) => (
                                        <Card onClick={() => handleCardClick(listing.id)} key={listing.id} className="h-full cursor-pointer">
                                            <div className="relative h-48">
                                                <img
                                                    src={listing.image}
                                                    alt={listing.title}
                                                    className="w-full h-full object-cover"
                                                />
                                                <Badge
                                                    className={`absolute top-3 right-3 ${listing.status === 'Active' ? 'bg-green-500' :
                                                        listing.status === 'Under Contract' ? 'bg-amber-500' :
                                                            'bg-blue-500'
                                                        }`}
                                                >
                                                    {listing.status}
                                                </Badge>
                                            </div>
                                            <CardHeader className="pb-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <CardTitle>{listing.title}</CardTitle>
                                                        <CardDescription className="flex items-center mt-1">
                                                            <MapPin className="h-3 w-3 mr-1" /> {listing.address}
                                                        </CardDescription>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-lg">{formatPrice(listing.price)}</p>
                                                        <p className="text-xs text-gray-500">Listed on {formatDate(listing.listed_date)}</p>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pt-2">
                                                <div className="flex justify-between text-sm mb-4">
                                                    <div className="flex items-center flex-wrap gap-1">
                                                        <Badge variant="outline" className="mr-1">
                                                            {listing.bedrooms} {listing.bedrooms === 1 ? 'Bed' : 'Beds'}
                                                        </Badge>
                                                        <Badge variant="outline" className="mr-1">
                                                            {listing.bathrooms} {listing.bathrooms === 1 ? 'Bath' : 'Baths'}
                                                        </Badge>
                                                        <Badge variant="outline">
                                                            {listing.area} sqft
                                                        </Badge>
                                                    </div>
                                                    <Badge variant="secondary">{listing.type}</Badge>
                                                </div>

                                                <div className="grid grid-cols-3 gap-2 text-center py-2 border-t border-b border-gray-100">
                                                    <div>
                                                        <p className="text-xs text-gray-500">Views</p>
                                                        <p className="font-semibold">{listing.views}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Inquiries</p>
                                                        <p className="font-semibold">{listing.inquiries}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Favorites</p>
                                                        <p className="font-semibold">{listing.favorites}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mt-4">
                                                    <div className="flex items-center">
                                                        <div className={`flex items-center ${listing.performance?.trend === 'up' ? 'text-green-600' :
                                                            listing.performance?.trend === 'down' ? 'text-red-600' :
                                                                'text-gray-600'
                                                            }`}>
                                                            {listing.performance?.trend === 'up' ? (
                                                                <TrendingUp className="h-4 w-4 mr-1" />
                                                            ) : listing.performance?.trend === 'down' ? (
                                                                <ArrowUpRight className="h-4 w-4 mr-1 transform rotate-90" />
                                                            ) : (
                                                                <ArrowUpRight className="h-4 w-4 mr-1 transform rotate-45" />
                                                            )}
                                                            <span className="text-sm font-medium">
                                                                {listing.performance?.percentageChange}% {listing.performance?.trend !== 'neutral' && (listing.performance?.trend === 'up' ? 'increase' : 'decrease')}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-gray-500 ml-2">in views this week</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div> */}
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Enter Referrer Code</DialogTitle>
                        <DialogDescription>
                            Enter someone's referral code to join their network
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmitReferrerCode}>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="referrerCode">Referrer Code</Label>
                                <Input
                                    id="referrerCode"
                                    placeholder="Enter code here"
                                    value={referrerCode}
                                    onChange={(e) => setReferrerCode(e.target.value)}
                                    className={error ? "border-red-300 focus-visible:ring-red-500" : ""}
                                />
                                {error && (
                                    <p className="text-sm text-red-500 flex items-center">
                                        <X className="h-4 w-4 mr-1" /> {error}
                                    </p>
                                )}
                            </div>
                        </div>

                        <DialogFooter className="sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className='bg-teal-600 hover:bg-teal-700 cursor-pointer'
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : 'Submit'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Profile;