"use client"
import React, { useState, useEffect } from 'react';
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
    CreditCard
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
}

interface UserProfile {
    id: string;
    name?: string;
    first_name?: string;
    email?: string;
    profile?: Profile;
    agent?: Agent | null;
    is_active?: boolean;
    date_joined?: string;
    subscription?: {
        plan: string;
        status: string;
    };
    referral_code?: string;
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
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);
    const [isIdVerified, setIsIdVerified] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

    const handlePasswordChange = () => {
        // Password change logic would go here
        alert("Password updated successfully!");
        setPasswordDialogOpen(false);
        // Reset fields
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
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

    // Listings data state
    const [listings, setListings] = useState([
    ]);

    // Analytics data for dashboard
    const [analytics, setAnalytics] = useState({
        totalListings: 0,
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

    // State for forms
    const [isEditing, setIsEditing] = useState(false);
    const [editableProfile, setEditableProfile] = useState({ ...profileData });
    const [isAddingListing, setIsAddingListing] = useState(false);
    const [newListing, setNewListing] = useState({
        title: "",
        address: "",
        price: "",
        type: "",
        bedrooms: "",
        bathrooms: "",
        area: "",
        description: ""
    });


    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    useEffect(() => {
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

                setEditableProfile({
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
                    joinedDate: userData.date_joined || ""
                });

                // Update analytics based on agent data if available
                if (userData.agent) {
                    setAnalytics({
                        ...analytics,
                        totalListings: userData.agent.total_listings || 0,
                        activeListings: userData.agent.total_listings || 0,
                        totalViews: userData.agent.total_views || 0,
                        totalInquiries: userData.agent.total_inquiries || 0
                    });
                }

                setLoading(false);
            } catch (err) {
                console.error("Error fetching user data:", err);
                setLoading(false);
                toast.error("Failed to load profile data. Please try again later.");
            }
        };

        fetchProfile();
    }, [token]);

    // Handle profile update
    const handleProfileUpdate = async () => {
        try {
            setLoading(true);

            // Extract the data needed for the API
            const updateData: UpdateData  = {
                name: editableProfile.name,
                profile: {
                    phone_number: editableProfile.phone,
                    city: editableProfile.location.split(',')[0]?.trim(),
                    state: editableProfile.location.split(',')[1]?.trim() || "",
                }
            };

            // For agent data if user is an agent
            if (profile && profile?.agent) {
                updateData.agent = {
                    agency_name: editableProfile.agency_name,
                    agency_address: editableProfile.agency_address,
                    phone_number: editableProfile.phone,
                    whatsapp_number: editableProfile.whatsapp_number,
                    bio: editableProfile.bio,
                    preferred_contact_mode: editableProfile.preferred_contact_mode
                };
            }

            // Make API call to update profile
            const response = await api.patch("/accounts/update-profile/", updateData, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`
                }
            });

            // Update the local state with the response data
            setProfileData({ ...editableProfile });
            setIsEditing(false);
            setLoading(false);
            toast.success("Profile updated successfully!");
        } catch (err) {
            console.error("Error updating profile:", err);
            setLoading(false);
            toast.error("Failed to update profile. Please try again later.");
        }
    };

    // Handle new listing creation
    const handleAddListing = () => {
        const listing = {
            ...newListing,
            id: (listings.length + 1).toString(),
            status: "Active",
            image: "/api/placeholder/300/200",
            listed_date: new Date().toISOString().split('T')[0],
            views: 0,
            inquiries: 0,
            favorites: 0,
            performance: {
                viewsPerDay: 0,
                trend: "neutral",
                percentageChange: 0
            }
        };

        // setListings([listing, ...listings]);
        setIsAddingListing(false);
        setNewListing({
            title: "",
            address: "",
            price: "",
            type: "",
            bedrooms: "",
            bathrooms: "",
            area: "",
            description: ""
        });

        toast.success("New property listed successfully!");
    };

    // Format price with commas
    const formatPrice = (price: any) => {
        return price.toLocaleString('en-US', {
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
        return profileData.name.split(' ').map((n:any) => n[0]).join('');
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
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="text-teal-600" onClick={() => {
                                            setIsEditing(true);
                                            setEditableProfile({ ...profileData });
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
                                                        onChange={(e) => setEditableProfile({ ...editableProfile, phone: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="location">Location (City, State)</Label>
                                                <Input
                                                    id="location"
                                                    value={editableProfile.location}
                                                    onChange={(e) => setEditableProfile({ ...editableProfile, location: e.target.value })}
                                                    placeholder="e.g. Lagos, Nigeria"
                                                />
                                            </div>
                                            {profileData.agent && (
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
                                            )}
                                            <div className="space-y-2">
                                                <Label htmlFor="bio">Bio</Label>
                                                <Textarea
                                                    id="bio"
                                                    rows={4}
                                                    value={editableProfile.bio}
                                                    onChange={(e) => setEditableProfile({ ...editableProfile, bio: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                                            <Button onClick={handleProfileUpdate} disabled={loading}>
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

                                {getSubscriptionInfo().plan === "Free" && (
                                    <div className="pt-2">
                                        <Button variant="outline" className="w-full" size="sm">
                                            Upgrade Plan
                                        </Button>
                                    </div>
                                )}
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
                                        <p className="text-sm text-gray-500">Referred Users</p>
                                        <p className="font-medium">{profileData.referred_users_count}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Total Earnings</p>
                                        <p className="font-medium">₦{profileData.total_referral_earnings.toLocaleString()}</p>
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
                                            <CardTitle className="text-sm font-medium text-gray-500">Active Listings</CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="text-2xl font-bold">{analytics.activeListings}</div>
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
                                        <CardTitle>Recent Activities</CardTitle>
                                        <CardDescription>Latest interactions with your listings</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex items-start space-x-4">
                                                <div className="bg-blue-100 p-2 rounded-full">
                                                    <Eye className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">New view on <span className="text-blue-600">Modern Luxury Apartment</span></p>
                                                    <p className="text-xs text-gray-500">10 minutes ago</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start space-x-4">
                                                <div className="bg-green-100 p-2 rounded-full">
                                                    <MessageSquare className="h-5 w-5 text-green-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">New inquiry for <span className="text-blue-600">Waterfront Villa with Pool</span></p>
                                                    <p className="text-xs text-gray-500">2 hours ago</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start space-x-4">
                                                <div className="bg-red-100 p-2 rounded-full">
                                                    <Heart className="h-5 w-5 text-red-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">New favorite on <span className="text-blue-600">Downtown Commercial Space</span></p>
                                                    <p className="text-xs text-gray-500">4 hours ago</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Listings Tab */}
                            <TabsContent value="listings" className="space-y-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold">My Properties</h2>
                                    <Dialog>
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
                                                <div className="space-y-2">
                                                    <Label htmlFor="title">Property Title</Label>
                                                    <Input
                                                        id="title"
                                                        value={newListing.title}
                                                        onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
                                                        placeholder="e.g. Modern 3 Bedroom Apartment"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="type">Property Type</Label>
                                                        <Select
                                                            onValueChange={(value) => setNewListing({ ...newListing, type: value })}
                                                        >
                                                            <SelectTrigger id="type">
                                                                <SelectValue placeholder="Select type" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Apartment">Apartment</SelectItem>
                                                                <SelectItem value="House">House</SelectItem>
                                                                <SelectItem value="Villa">Villa</SelectItem>
                                                                <SelectItem value="Commercial">Commercial</SelectItem>
                                                                <SelectItem value="Land">Land</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="price">Price (USD)</Label>
                                                        <Input
                                                            id="price"
                                                            type="number"
                                                            value={newListing.price}
                                                            onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
                                                            placeholder="e.g. 500000"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="address">Address</Label>
                                                    <Input
                                                        id="address"
                                                        value={newListing.address}
                                                        onChange={(e) => setNewListing({ ...newListing, address: e.target.value })}
                                                        placeholder="Full property address"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="bedrooms">Bedrooms</Label>
                                                        <Input
                                                            id="bedrooms"
                                                            type="number"
                                                            value={newListing.bedrooms}
                                                            onChange={(e) => setNewListing({ ...newListing, bedrooms: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="bathrooms">Bathrooms</Label>
                                                        <Input
                                                            id="bathrooms"
                                                            type="number"
                                                            value={newListing.bathrooms}
                                                            onChange={(e) => setNewListing({ ...newListing, bathrooms: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="area">Area (sq ft)</Label>
                                                        <Input
                                                            id="area"
                                                            type="number"
                                                            value={newListing.area}
                                                            onChange={(e) => setNewListing({ ...newListing, area: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="description">Description</Label>
                                                    <Textarea
                                                        id="description"
                                                        rows={4}
                                                        value={newListing.description}
                                                        onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                                                        placeholder="Describe the property features and highlights"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="images">Upload Images</Label>
                                                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                                                        <Upload className="h-8 w-8 mx-auto text-gray-400" />
                                                        <p className="mt-2 text-sm text-gray-500">Drag and drop images here or click to browse</p>
                                                        <Button variant="outline" size="sm" className="mt-4">
                                                            Choose Files
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setIsAddingListing(false)}>Cancel</Button>
                                                <Button onClick={handleAddListing}>Add Property</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                {/* Listing Cards */}
                                {listings.length === 0 ? (<EmptyState />) : listings.map((listing: any) => (
                                    <div key={listing.id} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Card className="overflow-hidden">
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
                                                    <div className="flex items-center">
                                                        <Badge variant="outline" className="mr-2">
                                                            {listing.bedrooms} {listing.bedrooms === 1 ? 'Bed' : 'Beds'}
                                                        </Badge>
                                                        <Badge variant="outline" className="mr-2">
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
                                                        <div className={`flex items-center ${listing.performance.trend === 'up' ? 'text-green-600' :
                                                            listing.performance.trend === 'down' ? 'text-red-600' :
                                                                'text-gray-600'
                                                            }`}>
                                                            {listing.performance.trend === 'up' ? (
                                                                <TrendingUp className="h-4 w-4 mr-1" />
                                                            ) : listing.performance.trend === 'down' ? (
                                                                <ArrowUpRight className="h-4 w-4 mr-1 transform rotate-90" />
                                                            ) : (
                                                                <ArrowUpRight className="h-4 w-4 mr-1 transform rotate-45" />
                                                            )}
                                                            <span className="text-sm font-medium">
                                                                {listing.performance.percentageChange}% {listing.performance.trend !== 'neutral' && (listing.performance.trend === 'up' ? 'increase' : 'decrease')}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-gray-500 ml-2">in views this week</span>
                                                    </div>
                                                    <Button variant="outline" size="sm">
                                                        <FileEdit className="h-4 w-4 mr-1" /> Edit
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ))}
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
                                        <div className="flex items-center justify-between py-2">
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
                                                    onCheckedChange={setEmailNotifications}
                                                />
                                                <Label htmlFor="email-notifications">
                                                    {emailNotifications ? "Active" : "Inactive"}
                                                </Label>
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
                                                        Update
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
                                                            <Input
                                                                id="current-password"
                                                                type="password"
                                                                placeholder="Enter current password"
                                                                value={currentPassword}
                                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="new-password">New Password</Label>
                                                            <Input
                                                                id="new-password"
                                                                type="password"
                                                                placeholder="Enter new password"
                                                                value={newPassword}
                                                                onChange={(e) => setNewPassword(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                                                            Cancel
                                                        </Button>
                                                        <Button type="button" onClick={handlePasswordChange}>
                                                            Save Changes
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
                                            <Dialog>
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
                                            </Dialog>
                                        </div>

                                        {/* ID Card Verification */}
                                        <div className="flex items-center justify-between py-2 border-t border-gray-200">
                                            <div>
                                                <h3 className="font-medium">ID Card Verification</h3>
                                                <p className="text-sm text-gray-500">
                                                    Verify your identity with a government-issued ID
                                                </p>
                                            </div>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm">
                                                        <CreditCard className="h-4 w-4 mr-1" />
                                                        {isIdVerified ? "Verified" : "Verify"}
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Verify Your Identity</DialogTitle>
                                                        <DialogDescription>
                                                            Upload a photo of your government-issued ID
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="space-y-4 py-4">
                                                        <div className="border-2 border-dashed border-gray-200 p-6 rounded-md text-center">
                                                            <div className="flex flex-col items-center">
                                                                <CreditCard className="h-8 w-8 text-gray-400 mb-2" />
                                                                <p className="text-sm text-gray-500 mb-2">
                                                                    Drag and drop or click to upload
                                                                </p>
                                                                <input
                                                                    type="file"
                                                                    className="hidden"
                                                                    id="id-upload"
                                                                    accept="image/*"
                                                                />
                                                                <label htmlFor="id-upload">
                                                                    <Button variant="outline" size="sm" type="button">
                                                                        Select File
                                                                    </Button>
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            onClick={() => setIsIdVerified(true)}
                                                            className="w-full"
                                                        >
                                                            Submit for Verification
                                                        </Button>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>

                                        {/* Delete Account - Confirmation Modal */}
                                        <div className="flex items-center justify-between py-2 border-t border-gray-200">
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
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;