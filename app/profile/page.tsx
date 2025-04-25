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
    CheckCircle
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

const AgentProfile = () => {
    // Agent profile data state
    const [profileData, setProfileData] = useState({
        id: "1",
        name: "David Williams",
        photo: "/api/placeholder/150/150",
        email: "david.williams@realestate.com",
        phone: "+123-456-7890",
        location: "New York, NY",
        bio: "Experienced real estate agent with over 10 years of expertise in residential and commercial properties. Specializing in luxury homes and investment properties in the greater New York area.",
        verified: true,
        specialties: ["Luxury Homes", "Commercial", "Investment Properties"],
        languages: ["English", "Spanish"],
        certifications: ["Licensed Real Estate Broker", "Certified Residential Specialist (CRS)"],
        socialMedia: {
            linkedin: "linkedin.com/in/davidwilliams",
            twitter: "twitter.com/davidwilliams",
            instagram: "instagram.com/davidwilliams_realty"
        },
        achievements: [
            "Top Producer 2023",
            "$50M+ in sales volume last year",
            "180+ properties sold lifetime"
        ],
        joinedDate: "2014-05-12"
    });

    // Listings data state
    const [listings, setListings] = useState<any>([
        {
            id: "1",
            title: "Modern Luxury Apartment",
            address: "123 Park Avenue, New York, NY",
            price: 750000,
            type: "Apartment",
            status: "Active",
            bedrooms: 2,
            bathrooms: 2,
            area: 1200,
            image: "/api/placeholder/300/200",
            listed_date: "2024-02-15",
            views: 342,
            inquiries: 24,
            favorites: 18,
            performance: {
                viewsPerDay: 12,
                trend: "up",
                percentageChange: 8
            }
        },
        {
            id: "2",
            title: "Waterfront Villa with Pool",
            address: "456 Ocean Drive, Miami, FL",
            price: 1250000,
            type: "Villa",
            status: "Active",
            bedrooms: 4,
            bathrooms: 3,
            area: 3200,
            image: "/api/placeholder/300/200",
            listed_date: "2024-01-08",
            views: 520,
            inquiries: 35,
            favorites: 42,
            performance: {
                viewsPerDay: 9,
                trend: "down",
                percentageChange: 3
            }
        },
        {
            id: "3",
            title: "Downtown Commercial Space",
            address: "789 Business Ave, Chicago, IL",
            price: 980000,
            type: "Commercial",
            status: "Under Contract",
            bedrooms: 0,
            bathrooms: 2,
            area: 2800,
            image: "/api/placeholder/300/200",
            listed_date: "2023-11-20",
            views: 270,
            inquiries: 18,
            favorites: 9,
            performance: {
                viewsPerDay: 5,
                trend: "up",
                percentageChange: 2
            }
        },
        {
            id: "4",
            title: "Suburban Family Home",
            address: "321 Maple St, Boston, MA",
            price: 595000,
            type: "House",
            status: "Sold",
            bedrooms: 3,
            bathrooms: 2.5,
            area: 2100,
            image: "/api/placeholder/300/200",
            listed_date: "2023-10-05",
            views: 480,
            inquiries: 29,
            favorites: 26,
            performance: {
                viewsPerDay: 0,
                trend: "neutral",
                percentageChange: 0
            }
        }
    ]);

    // Analytics data for dashboard
    const [analytics, setAnalytics] = useState({
        totalListings: 18,
        activeListings: 9,
        underContractListings: 3,
        soldListings: 6,
        totalViews: 6892,
        totalInquiries: 418,
        conversionRate: 6.1,
        averageDaysToSell: 32,
        performanceByMonth: [
            { month: "Jan", sales: 2, value: 850000 },
            { month: "Feb", sales: 1, value: 420000 },
            { month: "Mar", sales: 3, value: 1250000 },
            { month: "Apr", sales: 2, value: 980000 },
            { month: "May", sales: 4, value: 1600000 },
            { month: "Jun", sales: 2, value: 925000 }
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

    // Handle profile update
    const handleProfileUpdate = () => {
        setProfileData(editableProfile);
        setIsEditing(false);
        toast.success("Profile updated successfully!");
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

        setListings([listing, ...listings]);
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
        const options: any = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    // Calculate years of experience
    const calculateExperience = (dateString: any) => {
        const joinedYear = new Date(dateString).getFullYear();
        const currentYear = new Date().getFullYear();
        return currentYear - joinedYear;
    };

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
                                        <AvatarFallback>{profileData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                </div>
                                <CardTitle>{profileData.name}</CardTitle>
                                <div className="flex items-center justify-center space-x-2 mt-1">
                                    <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                                        {calculateExperience(profileData.joinedDate)}+ Years Experience
                                    </Badge>
                                    {profileData.verified && (
                                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                            <Check className="h-3 w-3 mr-1" /> Verified
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="text-center space-y-2 pt-2">
                                <div className="flex items-center justify-center text-gray-600">
                                    <MapPin className="h-4 w-4 mr-1" /> {profileData.location}
                                </div>
                                <div className="flex items-center justify-center text-gray-600">
                                    <Mail className="h-4 w-4 mr-1" /> {profileData.email}
                                </div>
                                <div className="flex items-center justify-center text-gray-600">
                                    <Phone className="h-4 w-4 mr-1" /> {profileData.phone}
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
                                                            <AvatarFallback>{editableProfile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
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
                                                        onChange={(e) => setEditableProfile({ ...editableProfile, email: e.target.value })}
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
                                                <Label htmlFor="location">Location</Label>
                                                <Input
                                                    id="location"
                                                    value={editableProfile.location}
                                                    onChange={(e) => setEditableProfile({ ...editableProfile, location: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="bio">Bio</Label>
                                                <Textarea
                                                    id="bio"
                                                    rows={4}
                                                    value={editableProfile.bio}
                                                    onChange={(e: any) => setEditableProfile({ ...editableProfile, bio: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="specialties">Specialties (comma separated)</Label>
                                                <Input
                                                    id="specialties"
                                                    value={editableProfile.specialties.join(', ')}
                                                    onChange={(e) => setEditableProfile({ ...editableProfile, specialties: e.target.value.split(',').map(s => s.trim()) })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="certifications">Certifications (comma separated)</Label>
                                                <Input
                                                    id="certifications"
                                                    value={editableProfile.certifications.join(', ')}
                                                    onChange={(e) => setEditableProfile({ ...editableProfile, certifications: e.target.value.split(',').map(s => s.trim()) })}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                                            <Button onClick={handleProfileUpdate}>Save Changes</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </CardFooter>
                        </Card>

                        {/* Navigation Links */}
                        <Card>
                            <CardContent className="p-4">
                                <nav className="space-y-1">
                                    <a className="flex items-center px-3 py-2 text-teal-600 bg-teal-50 rounded-md font-medium">
                                        <Home className="h-5 w-5 mr-2" /> Dashboard
                                    </a>
                                    <a className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                                        <Building className="h-5 w-5 mr-2" /> My Listings
                                    </a>
                                    <a className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                                        <Settings className="h-5 w-5 mr-2" /> Settings
                                    </a>
                                    <a className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                                        <LogOut className="h-5 w-5 mr-2" /> Logout
                                    </a>
                                </nav>
                            </CardContent>
                        </Card>

                        {/* Achievements Card */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Achievements</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2">
                                <ul className="space-y-2">
                                    {profileData.achievements.map((achievement, index) => (
                                        <li key={index} className="flex items-center">
                                            <CheckCircle className="h-4 w-4 text-teal-500 mr-2 flex-shrink-0" />
                                            <span className="text-sm">{achievement}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Area */}
                    <div className="w-full md:w-3/4 mb-10">
                        <Tabs defaultValue="dashboard">
                            <TabsList className="grid grid-cols-3 mb-8">
                                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                                <TabsTrigger value="listings">My Listings</TabsTrigger>
                                <TabsTrigger value="profile">Profile</TabsTrigger>
                            </TabsList>

                            {/* Dashboard Tab */}
                            <TabsContent value="dashboard" className="space-y-6">
                                {/* Stats Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <Card className="bg-white">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium text-gray-500">Total Listings</CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-2">
                                            <div className="text-2xl font-bold">{analytics.totalListings}</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Active: {analytics.activeListings} | Sold: {analytics.soldListings}
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-white">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium text-gray-500">Total Views</CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-2">
                                            <div className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Last 30 days: +942 views
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-white">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium text-gray-500">Inquiries</CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-2">
                                            <div className="text-2xl font-bold">{analytics.totalInquiries}</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Conversion: {analytics.conversionRate}%
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-white">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium text-gray-500">Avg. Days to Sell</CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-2">
                                            <div className="text-2xl font-bold">{analytics.averageDaysToSell}</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Industry Avg: 45 days
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Performance Chart */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Performance Overview</CardTitle>
                                        <CardDescription>
                                            Monthly sales performance and value
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-80 w-full">
                                            {/* Chart would go here - simplified representation */}
                                            <div className="h-full w-full bg-gray-50 rounded-md flex items-center justify-center">
                                                <div className="space-y-6 w-full px-6">
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="font-medium">Sales by Month</span>
                                                            <span className="text-gray-500">Total: 14 Properties</span>
                                                        </div>
                                                        <div className="flex space-x-2 h-40">
                                                            {analytics.performanceByMonth.map((month, index) => (
                                                                <div key={index} className="flex-1 flex flex-col justify-end">
                                                                    <div
                                                                        className="bg-teal-500 rounded-t-sm w-full"
                                                                        style={{ height: `${(month.sales / 4) * 100}%` }}
                                                                    ></div>
                                                                    <div className="text-xs text-center mt-1">{month.month}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="font-medium">Sales Value ($)</span>
                                                            <span className="text-gray-500">Total: $6.02M</span>
                                                        </div>
                                                        <div className="flex space-x-2 h-40">
                                                            {analytics.performanceByMonth.map((month, index) => (
                                                                <div key={index} className="flex-1 flex flex-col justify-end">
                                                                    <div
                                                                        className="bg-blue-400 rounded-t-sm w-full"
                                                                        style={{ height: `${(month.value / 1600000) * 100}%` }}
                                                                    ></div>
                                                                    <div className="text-xs text-center mt-1">{month.month}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Top Performing Listings */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Top Performing Listings</CardTitle>
                                        <CardDescription>
                                            Properties with the highest engagement rates
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {listings
                                                .sort((a: any, b: any) => b.views - a.views)
                                                .slice(0, 3)
                                                .map((listing: any) => (
                                                    <div key={listing.id} className="flex items-center space-x-4">
                                                        <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                                                            <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-sm font-medium text-gray-900 truncate">{listing.title}</h4>
                                                            <p className="text-sm text-gray-500 truncate">{listing.address}</p>
                                                            <div className="flex items-center mt-1">
                                                                <span className="text-xs font-medium text-gray-700 mr-4">{formatPrice(listing.price)}</span>
                                                                <span className="text-xs text-gray-500 flex items-center">
                                                                    <Eye className="h-3 w-3 mr-1" /> {listing.views}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className={`flex items-center text-xs font-medium ${listing.performance.trend === 'up' ? 'text-green-600' :
                                                            listing.performance.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                                                            }`}>
                                                            {listing.performance.trend === 'up' && <ArrowUpRight className="h-3 w-3 mr-1" />}
                                                            {listing.performance.trend === 'down' && <ArrowUpRight className="h-3 w-3 mr-1 transform rotate-90" />}
                                                            {listing.performance.trend === 'neutral' && <ChevronRight className="h-3 w-3 mr-1" />}
                                                            {listing.performance.percentageChange}%
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Listings Tab */}
                            <TabsContent value="listings" className="space-y-6">
                                {/* Add New Listing Button */}
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-gray-800">My Properties</h2>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button onClick={() => setIsAddingListing(true)}>
                                                <Plus className="h-4 w-4 mr-1" /> Add New Listing
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[625px] max-h-[85vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle>Add New Property Listing</DialogTitle>
                                                <DialogDescription>
                                                    Fill in the details to create a new property listing.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="title">Property Title</Label>
                                                    <Input
                                                        id="title"
                                                        value={newListing.title}
                                                        onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="address">Address</Label>
                                                    <Input
                                                        id="address"
                                                        value={newListing.address}
                                                        onChange={(e) => setNewListing({ ...newListing, address: e.target.value })}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="price">Price ($)</Label>
                                                        <Input
                                                            id="price"
                                                            type="number"
                                                            value={newListing.price}
                                                            onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="type">Property Type</Label>
                                                        <Select onValueChange={(value) => setNewListing({ ...newListing, type: value })}>
                                                            <SelectTrigger id="type">
                                                                <SelectValue placeholder="Select type" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="House">House</SelectItem>
                                                                <SelectItem value="Apartment">Apartment</SelectItem>
                                                                <SelectItem value="Condo">Condo</SelectItem>
                                                                <SelectItem value="Villa">Villa</SelectItem>
                                                                <SelectItem value="Commercial">Commercial</SelectItem>
                                                                <SelectItem value="Land">Land</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
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
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="photo">Property Photos</Label>
                                                    <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                                                        <Upload className="h-8 w-8 mx-auto text-gray-400" />
                                                        <p className="mt-2 text-sm text-gray-500">Drag and drop images here or click to browse</p>
                                                        <Button variant="outline" size="sm" className="mt-2">
                                                            Upload Photos
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setIsAddingListing(false)}>Cancel</Button>
                                                <Button onClick={handleAddListing}>Create Listing</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                {/* Listings Filter */}
                                <Card className="bg-white">
                                    <CardContent className="p-4">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <div className="flex-1 min-w-[200px]">
                                                <Input placeholder="Search listings..." />
                                            </div>
                                            <Select defaultValue="all">
                                                <SelectTrigger className="w-[150px]">
                                                    <SelectValue placeholder="Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Status</SelectItem>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="under-contract">Under Contract</SelectItem>
                                                    <SelectItem value="sold">Sold</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Select defaultValue="all">
                                                <SelectTrigger className="w-[150px]">
                                                    <SelectValue placeholder="Property Type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Types</SelectItem>
                                                    <SelectItem value="house">House</SelectItem>
                                                    <SelectItem value="apartment">Apartment</SelectItem>
                                                    <SelectItem value="condo">Condo</SelectItem>
                                                    <SelectItem value="villa">Villa</SelectItem>
                                                    <SelectItem value="commercial">Commercial</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Select defaultValue="newest">
                                                <SelectTrigger className="w-[150px]">
                                                    <SelectValue placeholder="Sort By" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="newest">Newest First</SelectItem>
                                                    <SelectItem value="price-high">Price (High-Low)</SelectItem>
                                                    <SelectItem value="price-low">Price (Low-High)</SelectItem>
                                                    <SelectItem value="views">Most Viewed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Listings Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {listings.map((listing: any) => (
                                        <Card key={listing.id} className="overflow-hidden">
                                            <div className="relative">
                                                <img
                                                    src={listing.image}
                                                    alt={listing.title}
                                                    className="w-full h-48 object-cover"
                                                />
                                                <Badge
                                                    className={`absolute top-3 left-3 ${listing.status === 'Active' ? 'bg-green-100 text-green-800 border-green-200' :
                                                        listing.status === 'Under Contract' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                                            'bg-blue-100 text-blue-800 border-blue-200'
                                                        }`}
                                                >
                                                    {listing.status}
                                                </Badge>
                                            </div>
                                            <CardHeader className="pb-2">
                                                <div className="flex justify-between items-start">
                                                    <CardTitle className="text-lg">{listing.title}</CardTitle>
                                                    <div className="text-lg font-bold text-teal-600">{formatPrice(listing.price)}</div>
                                                </div>
                                                <CardDescription className="flex items-center">
                                                    <MapPin className="h-3 w-3 mr-1" /> {listing.address}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="pb-2 pt-0">
                                                <div className="flex justify-between mb-4">
                                                    <div className="flex space-x-4">
                                                        <div className="text-sm">
                                                            <span className="font-medium">{listing.bedrooms}</span> <span className="text-gray-500">bd</span>
                                                        </div>
                                                        <div className="text-sm">
                                                            <span className="font-medium">{listing.bathrooms}</span> <span className="text-gray-500">ba</span>
                                                        </div>
                                                        <div className="text-sm">
                                                            <span className="font-medium">{listing.area.toLocaleString()}</span> <span className="text-gray-500">sqft</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        Listed: {formatDate(listing.listed_date)}
                                                    </div>
                                                </div>
                                                <div className="flex space-x-4 text-sm text-gray-500">
                                                    <div className="flex items-center">
                                                        <Eye className="h-4 w-4 mr-1" /> {listing.views}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <MessageSquare className="h-4 w-4 mr-1" /> {listing.inquiries}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Heart className="h-4 w-4 mr-1" /> {listing.favorites}
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <CardFooter className="pt-0 flex justify-between">
                                                <Button variant="outline" size="sm">
                                                    <Eye className="h-4 w-4 mr-1" /> View
                                                </Button>
                                                <Button variant="outline" size="sm">
                                                    <FileEdit className="h-4 w-4 mr-1" /> Edit
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>

                            {/* Profile Tab */}
                            <TabsContent value="profile" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Agent Information</CardTitle>
                                        <CardDescription>
                                            Complete profile information that will be visible to clients and other agents.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            <div className="w-full md:w-1/3">
                                                <div className="aspect-square rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
                                                    <img
                                                        src={profileData.photo}
                                                        alt={profileData.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="mt-4 text-center">
                                                    <Button variant="outline" size="sm">
                                                        <Upload className="h-4 w-4 mr-1" /> Change Photo
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="w-full md:w-2/3 space-y-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold">{profileData.name}</h3>
                                                    <p className="text-gray-500">Member since {formatDate(profileData.joinedDate)}</p>
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="font-medium">Contact Information</div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="flex items-center space-x-2 text-gray-700">
                                                            <Mail className="h-4 w-4" />
                                                            <span>{profileData.email}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2 text-gray-700">
                                                            <Phone className="h-4 w-4" />
                                                            <span>{profileData.phone}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="font-medium">Personal Bio</div>
                                                    <p className="text-gray-700">{profileData.bio}</p>
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="font-medium">Specialties</div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {profileData.specialties.map((specialty, index) => (
                                                            <Badge key={index} variant="secondary">{specialty}</Badge>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="font-medium">Languages</div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {profileData.languages.map((language, index) => (
                                                            <Badge key={index} variant="outline">{language}</Badge>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="font-medium">Certifications</div>
                                                    <ul className="list-disc list-inside text-gray-700">
                                                        {profileData.certifications.map((cert, index) => (
                                                            <li key={index}>{cert}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button onClick={() => {
                                            setIsEditing(true);
                                            setEditableProfile({ ...profileData });
                                        }}>
                                            <Edit className="h-4 w-4 mr-1" /> Edit Profile
                                        </Button>
                                    </CardFooter>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Account Settings</CardTitle>
                                        <CardDescription>
                                            Manage your account preferences and security settings.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium">Email Notifications</h4>
                                                <p className="text-sm text-gray-500">Receive notifications about new inquiries, messages, and listing updates.</p>
                                            </div>
                                            <div>
                                                {/* Toggle component placeholder */}
                                                <div className="w-12 h-6 bg-teal-500 rounded-full relative cursor-pointer">
                                                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium">Two-Factor Authentication</h4>
                                                <p className="text-sm text-gray-500">Add an extra layer of security to your account.</p>
                                            </div>
                                            <Button variant="outline" size="sm">Enable</Button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium">Password</h4>
                                                <p className="text-sm text-gray-500">Last changed 3 months ago</p>
                                            </div>
                                            <Button variant="outline" size="sm">Change</Button>
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

export default AgentProfile;