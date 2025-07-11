"use client"
import React, { useState, useEffect, useRef, useCallback } from 'react';
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
    Play,
    Music,
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
    Loader2,
    Trash2,
    MoreVertical,
    ImagePlus
} from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
import CancellationModal from './SubscriptionCancelModal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';

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
        subscription_code: string
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


const VideoPreview = ({ file, className }: any) => {
    const [videoUrl, setVideoUrl] = useState(null);

    useEffect(() => {
        if (file && file.type.startsWith('video/')) {
            const url = URL.createObjectURL(file);
            setVideoUrl(url as any);

            // Cleanup function to revoke the URL
            return () => {
                URL.revokeObjectURL(url);
            };
        }
    }, [file]);

    if (!videoUrl) return null;

    return (
        <div className="h-full w-full relative">
            <video
                src={videoUrl}
                className={className}
                controls={false}
                muted
                playsInline
                preload="metadata"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                <Play className="h-8 w-8 text-white" />
            </div>
        </div>
    );
};

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
    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)
    const [referrerCode, setReferrerCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isListingDialogOpen, setIsListingDialogOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isFeaturesDialogOpen, setIsFeaturesDialogOpen] = useState(false);
    const [currentFeaturesListingId, setCurrentFeaturesListingId] = useState(null);
    const [featuresData, setFeaturesData] = useState<any>({
        negotiable: 'no',
        furnished: false,
        pet_friendly: false,
        parking_available: false,
        swimming_pool: false,
        garden: false,
        electricity_proximity: 'moderate',
        road_network: 'good',
        development_level: 'moderate',
        water_supply: false,
        security: false,
        additional_features: ''
    });
    const [featuresLoading, setFeaturesLoading] = useState(false);
    const [isCoordinatesDialogOpen, setIsCoordinatesDialogOpen] = useState(false);
    const [currentCoordinatesListingId, setCurrentCoordinatesListingId] = useState(null);
    const [coordinatesLoading, setCoordinatesLoading] = useState(false);
    const [currentCoordinates, setCurrentCoordinates] = useState<any>([]);
    const [newCoordinate, setNewCoordinate] = useState({
        latitude: '',
        longitude: ''
    });
    const [isFilesDialogOpen, setIsFilesDialogOpen] = useState(false);
    const [currentFilesListingId, setCurrentFilesListingId] = useState(null);
    const [filesLoading, setFilesLoading] = useState(false);
    const [existingFiles, setExistingFiles] = useState<any>([]);
    const [selectedFiles, setSelectedFiles] = useState<any>([]);
    const [withdrawalAmount, setWithdrawalAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('bank');
    const [accountDetails, setAccountDetails] = useState('');
    const [withdrawalError, setWithdrawalError] = useState('');
    const [isWithdrawalSubmitting, setIsWithdrawalSubmitting] = useState(false);



    console.log("currentCordinates--->", currentCoordinates)

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

    const combineAllFiles = (property: any) => {
        const allFiles = [];

        // Add images
        if (property.image_files && property.image_files.length > 0) {
            allFiles.push(...property.image_files.map((file: any) => ({
                ...file,
                file_name: file.name,
                file_type: 'image/' + (file.name.split('.').pop()?.toLowerCase() || 'jpeg')
            })));
        }

        // Add videos
        if (property.videos && property.videos.length > 0) {
            allFiles.push(...property.videos.map((file: any) => ({
                ...file,
                file_name: file.name,
                file_type: 'video/' + (file.name.split('.').pop()?.toLowerCase() || 'mp4')
            })));
        }

        // Add documents
        if (property.documents && property.documents.length > 0) {
            allFiles.push(...property.documents.map((file: any) => ({
                ...file,
                file_name: file.name,
                file_type: 'application/' + (file.name.split('.').pop()?.toLowerCase() || 'pdf')
            })));
        }

        return allFiles;
    };

    const handleAddFiles = async (listingId: any) => {
        try {
            setCurrentFilesListingId(listingId);
            setFilesLoading(true);

            await new Promise(resolve => setTimeout(resolve, 100));
            const property = userProperties.find((prop: any) => prop.id === listingId);

            // Combine all files (images, videos, documents) instead of just images
            const allExistingFiles = combineAllFiles(property);

            setExistingFiles(allExistingFiles);

            setIsFilesDialogOpen(true);
            setFilesLoading(false);
        } catch (error) {
            console.error("Error fetching files:", error);
            setFilesLoading(false);
            // If no files exist yet, open with empty state
            setExistingFiles([]);
            setIsFilesDialogOpen(true);
            // toast.info("No existing files found. You can upload new files and images.");
        }
    };

    const handleDeleteFile = async (fileId: number) => {
        try {
            // setFilesLoading(true);

            const response = await api.delete('/market/property-file/delete/', {
                data: { id: fileId },
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`
                }
            });

            if (response.status === 200) {
                // Remove the deleted file from existingFiles state
                setExistingFiles((prevFiles: any[]) =>
                    prevFiles.filter((file: any) => file.id !== fileId)
                );

                // Update the userProperties state to reflect the change in all file arrays
                setUserProperties((prevProperties: any[]) =>
                    prevProperties.map((property: any) => {
                        if (property.id === currentFilesListingId) {
                            return {
                                ...property,
                                // Remove from image_files array
                                image_files: property.image_files?.filter((file: any) => file.id !== fileId) || [],
                                // Remove from videos array
                                videos: property.videos?.filter((file: any) => file.id !== fileId) || [],
                                // Remove from documents array
                                documents: property.documents?.filter((file: any) => file.id !== fileId) || []
                            };
                        }
                        return property;
                    })
                );

                toast.success("File deleted successfully");
            }
        } catch (error) {
            console.error("Error deleting file:", error);
            // toast.error("Failed to delete file");
        } finally {
            // setFilesLoading(false);
        }
    };

    const handleFileUpload = async () => {
        if (!selectedFiles.length || !currentFilesListingId) {
            toast.error("Please select files to upload");
            return;
        }

        const allowedTypes = ['pdf', 'png', 'jpg', 'jpeg', 'mp3', 'mp4'];
        const maxFileSize = 10 * 1024 * 1024; // 10MB

        try {
            setFilesLoading(true);
            const formData = new FormData();

            // Append the property ID to FormData
            formData.append('property', currentFilesListingId);

            // Loop through the selected files and add them to FormData
            selectedFiles.forEach((file: any) => {
                const name = file.name || `file_${Date.now()}`;
                const extension = name.split('.').pop().toLowerCase();

                // Validate file type
                if (!allowedTypes.includes(extension)) {
                    toast.error(`The file "${name}" is not allowed. Only PDF, JPG, JPEG, MP3, and MP4 files are supported.`);
                    setFilesLoading(false);
                    return;
                }

                // Validate file size
                if (file.size > maxFileSize) {
                    toast.error(`The file "${name}" exceeds the 10MB size limit.`);
                    setFilesLoading(false);
                    return;
                }

                // Determine the MIME type based on the extension
                let type = 'application/octet-stream';
                if (['jpg', 'jpeg', 'png'].includes(extension)) {
                    type = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
                } else if (extension === 'pdf') {
                    type = 'application/pdf';
                } else if (extension === 'mp3') {
                    type = 'audio/mpeg';
                } else if (extension === 'mp4') {
                    type = 'video/mp4';
                }

                // Append file to formData (FormData expects file objects)
                const fileObj = new File([file], name, { type });
                formData.append('file', fileObj);
            });

            // Send the request to upload the files
            const response = await api.post(`/market/upload-file-market/`, formData, {
                headers: {
                    Authorization: `Token ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (response.data) {
                toast.success("Files uploaded successfully!");
                setSelectedFiles([]);
                setIsFilesDialogOpen(false);
                fetchProfile(); // Refresh listings
            }
        } catch (error) {
            console.error("Error uploading files:", error);
            toast.error("Failed to upload files. Please try again.");
        } finally {
            setFilesLoading(false);
        }
    };


    const handleImagePick = (event: any) => {
        const files = Array.from(event.target.files);
        setSelectedFiles((prevFiles: any) => [...prevFiles, ...files]);
    };

    // Remove file from selection
    const removeFile = (index: any) => {
        setSelectedFiles((prevFiles: any) => prevFiles.filter((_: any, i: any) => i !== index));
    };


    const handleDeleteClick = async (e: any, id: any) => {
        e.stopPropagation(); // Prevent card click event
        await new Promise(resolve => setTimeout(resolve, 100));
        setPendingDeleteId(id);
        setIsAlertOpen(true);
    };

    const confirmDelete = async () => {
        if (!pendingDeleteId) return;

        setIsDeleting(true);
        try {
            await api.delete(`/market/delete-property/${pendingDeleteId}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`
                }
            });
            setIsAlertOpen(false);
            setIsDeleting(false);

            // Notify parent component to refresh the listing data
            toast.success("Property deleted successfully")
        } catch (error) {
            console.error("Failed to delete property:", error);
            setIsDeleting(false);
        }
        fetchProfile()
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

    const handleWithdrawalSubmit = async (e: any) => {
        e.preventDefault();
        setWithdrawalError('');

        // Basic validation
        if (!withdrawalAmount || !accountDetails.trim()) {
            setWithdrawalError('Please fill in all required fields');
            return;
        }

        if (parseFloat(withdrawalAmount) <= 0) {
            setWithdrawalError('Amount must be greater than 0');
            return;
        }

        setIsWithdrawalSubmitting(true);

        try {
            const payload = {
                amount: withdrawalAmount,
                payment_method: paymentMethod,
                account_details: accountDetails
            };

            const response = await api.post("/accounts/referrals/payout/", payload, {
                headers: {
                    Authorization: `Token ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });

            // Success handling
            toast.success("Withdrawal request submitted successfully!");
            setIsWithdrawOpen(false);

            // Reset form
            setWithdrawalAmount('');
            setPaymentMethod('bank');
            setAccountDetails('');

        } catch (error: any) {
            console.error('Withdrawal request failed:', error);
            setWithdrawalError(
                error.response?.data?.message ||
                error.response?.data?.error ||
                'Failed to submit withdrawal request. Please try again.'
            );
        } finally {
            setIsWithdrawalSubmitting(false);
        }
    };


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
    const [isUpdatingListing, setIsUpdatingListing] = useState(false);
    const [currentListingId, setCurrentListingId] = useState(null);
    const [userProperties, setUserProperties] = useState<any>(null)
    const [newListing, setNewListing] = useState<any>({
        title: "",
        description: "",
        property_type: "",
        price: "",
        currency: "",
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
    const [selectedFile, setSelectedFile] = useState(null);
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

    const [errors, setErrors] = useState<any>({});

    const validateForm = () => {
        const newErrors: any = {};

        if (!newListing.title?.trim()) {
            newErrors.title = "Property title is required";
        }

        if (!newListing.property_type) {
            newErrors.property_type = "Property type is required";
        }

        if (!newListing.price) {
            newErrors.price = "Price is required";
        }

        if (!newListing.description?.trim()) {
            newErrors.description = "Description is required";
        }

        if (!newListing.address?.trim()) {
            newErrors.address = "Street address is required";
        }

        if (!newListing.city?.trim()) {
            newErrors.city = "City is required";
        }

        if (!newListing.state?.trim()) {
            newErrors.state = "State is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    console.log("editableProfile--->", editableProfile)

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const [activeTab, setActiveTab] = useState("");

    useEffect(() => {
        if (profileData) {
            setActiveTab(profileData.agent ? "dashboard" : "profile");
        }
    }, [profileData]);


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

    console.log("favorites--->", favorites)


    const fetchUserProperties = async () => {
        try {
            setLoading(true)
            const response = await api.get("/market/fetch-user-listed-properties/", {
                headers: {
                    "Content-Type": "Application/json",
                    Authorization: `Token ${token}`
                }
            });
            setUserProperties(response.data);
            setListings(response.data)
        } catch (error) {
            console.error("Error fetching user data:", error);
            setLoading(false);
            toast.error("Failed to load profile data. Please try again later.");
        }
    }

    console.log('userproperties--->', userProperties)


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
                bio: userData.agent?.bio,
                verified: userData.is_active || false,
                agency_name: userData.agent?.agency_name,
                agency_address: userData.agent?.agency_address,
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
                referrer: userData.referrer || "",
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
                const activeListings = properties?.length; // Assuming all are active for now
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
            // setListings(userData.agent?.properties)
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
        fetchUserProperties()
    }, [token]);

    const handleEditFileSelect = (event: any) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error("Please select a valid image file");
                return;
            }

            // Validate file size (optional - 5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size should be less than 5MB");
                return;
            }

            setSelectedFile(file);

            // Create preview URL for immediate display
            const previewUrl = URL.createObjectURL(file);
            setEditableProfile((prev: any) => ({
                ...prev,
                photo: previewUrl
            }));
        }
    };


    const handleUpdateDetails = async (listingId: any) => {
        const listingToUpdate = listings.find((listing: any) => listing.id === listingId);
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log("listingToUpdate--->", listingToUpdate)
        if (listingToUpdate) {
            setNewListing({
                title: listingToUpdate.title || "",
                description: listingToUpdate.description || "",
                property_type: listingToUpdate.property_type || listingToUpdate.type || "",
                price: listingToUpdate.price?.toString() || "",
                currency: listingToUpdate.currency || "USD",
                listing_purpose: listingToUpdate.listing_purpose || "sale",
                address: listingToUpdate.address || "",
                city: listingToUpdate.city || "",
                state: listingToUpdate.state || "",
                // ADD THESE MISSING FIELDS:
                zip_code: listingToUpdate.zip_code || "",
                bedrooms: listingToUpdate.bedrooms?.toString() || "",
                bathrooms: listingToUpdate.bathrooms?.toString() || "",
                square_feet: listingToUpdate.square_feet?.toString() || listingToUpdate.area?.toString() || "",
                lot_size: listingToUpdate.lot_size?.toString() || "",
                year_built: listingToUpdate.year_built?.toString() || "",
                availability: listingToUpdate.availability || "now",
                availability_date: listingToUpdate.availability_date || ""
            });

            setIsUpdatingListing(true);
            setCurrentListingId(listingId);
            setIsListingDialogOpen(true);
        }
    }


    const handleUpdateFeatures = async (listingId: any) => {
        try {
            setCurrentFeaturesListingId(listingId);
            setFeaturesLoading(true);
            await new Promise(resolve => setTimeout(resolve, 100));

            // Find the specific property by listingId
            const property = userProperties.find((prop: any) => prop.id === listingId);

            // Get the first features object from the array (or use default if none exists)
            const existingFeatures = property?.features?.[0] || {
                negotiable: 'no',
                furnished: false,
                pet_friendly: false,
                parking_available: false,
                swimming_pool: false,
                garden: false,
                electricity_proximity: 'moderate',
                road_network: 'good',
                development_level: 'moderate',
                water_supply: false,
                security: false,
                additional_features: ''
            };

            setFeaturesData(existingFeatures);
            setIsFeaturesDialogOpen(true);
            setFeaturesLoading(false);
        } catch (error) {
            console.error("Error fetching features:", error);
            setFeaturesLoading(false);
            // If features don't exist yet, open with default values
            setIsFeaturesDialogOpen(true);
            toast.info("No existing features found. You can add new features.");
        }
    };

    const handleSubmitFeatures = async () => {
        try {
            setFeaturesLoading(true);

            const payload = {
                negotiable: featuresData.negotiable,
                furnished: featuresData.furnished,
                pet_friendly: featuresData.pet_friendly,
                parking_available: featuresData.parking_available,
                swimming_pool: featuresData.swimming_pool,
                garden: featuresData.garden,
                electricity_proximity: featuresData.electricity_proximity,
                road_network: featuresData.road_network,
                development_level: featuresData.development_level,
                water_supply: featuresData.water_supply,
                security: featuresData.security,
                additional_features: featuresData.additional_features
            };

            const response = await api.post(`/market/property/${currentFeaturesListingId}/features/`, payload, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`
                }
            });

            if (response.data) {
                toast.success("Property features updated successfully!");
                setIsFeaturesDialogOpen(false);
                resetFeaturesForm();
                fetchProfile(); // Refresh the listings
            }

            setFeaturesLoading(false);
        } catch (error) {
            console.error("Error updating features:", error);
            setFeaturesLoading(false);
            toast.error("Failed to update property features. Please try again.");
        }
    };

    // Function to reset features form
    const resetFeaturesForm = () => {
        setFeaturesData({
            negotiable: 'no',
            furnished: false,
            pet_friendly: false,
            parking_available: false,
            swimming_pool: false,
            garden: false,
            electricity_proximity: 'moderate',
            road_network: 'good',
            development_level: 'moderate',
            water_supply: false,
            security: false,
            additional_features: ''
        });
        setCurrentFeaturesListingId(null);
    };

    const handleManageCoordinates = async (listingId: any) => {
        try {
            setCurrentCoordinatesListingId(listingId);
            setCoordinatesLoading(true);
            await new Promise(resolve => setTimeout(resolve, 100));

            // Find the specific property by listingId
            const property = userProperties.find((prop: any) => prop.id === listingId);

            // Set existing coordinates or empty array if none exist
            const existingCoordinates = property?.market_coordinates || [];
            setCurrentCoordinates(existingCoordinates);

            setIsCoordinatesDialogOpen(true);
            setCoordinatesLoading(false);
        } catch (error) {
            console.error("Error fetching coordinates:", error);
            setCoordinatesLoading(false);
            toast.error("Failed to load coordinates");
        }
    };

    const handleAddCoordinate = async () => {
        if (!newCoordinate.latitude || !newCoordinate.longitude) {
            toast.error("Please enter both latitude and longitude");
            return;
        }

        // Validate coordinate values
        const lat = parseFloat(newCoordinate.latitude);
        const lng = parseFloat(newCoordinate.longitude);

        if (isNaN(lat) || isNaN(lng)) {
            toast.error("Please enter valid numeric coordinates");
            return;
        }

        if (lat < -90 || lat > 90) {
            toast.error("Latitude must be between -90 and 90");
            return;
        }

        if (lng < -180 || lng > 180) {
            toast.error("Longitude must be between -180 and 180");
            return;
        }

        try {
            setCoordinatesLoading(true);

            const coordinateData = {
                property: currentCoordinatesListingId,
                coordinates: [
                    {
                        latitude: lat,
                        longitude: lng
                    }
                ]
            };

            const response = await api.post(
                `/market/property/coordinates/`,
                coordinateData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${token}`,
                    }
                }
            );

            if (response.data) {
                fetchProfile();
                toast.success("Coordinate added successfully!");
                setIsCoordinatesDialogOpen(false);
            }

            // Update current coordinates list
            const newCoord = { latitude: lat, longitude: lng };
            setCurrentCoordinates((prev: any) => [...prev, newCoord]);

            // Update the property in userProperties
            setUserProperties((prev: any) => prev.map((prop: any) =>
                prop.id === currentCoordinatesListingId
                    ? { ...prop, coordinates: [...(prop.coordinates || []), newCoord] }
                    : prop
            ));

            // Reset form
            setNewCoordinate({ latitude: '', longitude: '' });

            setCoordinatesLoading(false);
        } catch (error: any) {
            console.error("Error adding coordinate:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to add coordinate";
            toast.error(errorMessage);
            setCoordinatesLoading(false);
        }
    };

    // Function to delete a coordinate
    const handleDeleteCoordinate = async (coordinateIndex: any) => {
        try {
            setCoordinatesLoading(true);

            const coordinateToDelete = currentCoordinates[coordinateIndex];

            await api.delete(
                `/market/coordinates/delete/`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${token}`,
                    },
                    data: coordinateToDelete
                }
            );

            // Update current coordinates list
            const updatedCoordinates = currentCoordinates.filter((_: any, index: number) => index !== coordinateIndex);
            setCurrentCoordinates(updatedCoordinates);

            // Update the property in userProperties
            setUserProperties((prev: any) => prev.map((prop: any) =>
                prop.id === currentCoordinatesListingId
                    ? { ...prop, coordinates: updatedCoordinates }
                    : prop
            ));

            toast.success("Coordinate deleted successfully!");
            setCoordinatesLoading(false);
        } catch (error: any) {
            console.error("Error deleting coordinate:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to delete coordinate";
            toast.error(errorMessage);
            setCoordinatesLoading(false);
        }
    };


    // Function to reset coordinates form
    const resetCoordinatesForm = () => {
        setNewCoordinate({ latitude: '', longitude: '' });
        setCurrentCoordinates([]);
        setCurrentCoordinatesListingId(null);
    };


    // Reset form function
    const resetListingForm = () => {
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
            availability: "now",
            availability_date: ""
        });
        setIsAddingListing(false);
        setIsUpdatingListing(false);
        setCurrentListingId(null);
        setErrors({});
    };

    const handleProfileUpdate = async () => {
        try {
            setLoading(true);

            // Create FormData to handle both file and text data
            const formData = new FormData();

            // Add text fields
            formData.append('phone_number', editableProfile.phone_number || "");
            formData.append('country_of_residence', editableProfile.country_of_residence || "Nigeria");
            formData.append('state', editableProfile.state || "");
            formData.append('city', editableProfile.city || "");
            formData.append('street', editableProfile.street || "");
            formData.append('house_number', editableProfile.house_number || "");
            formData.append('postal_code', editableProfile.postal_code || "");
            formData.append('birth_date', editableProfile.birth_date || "");
            formData.append('bio', editableProfile.bio || "");

            // Add avatar file if selected
            if (selectedFile) {
                formData.append('avatar', selectedFile);
            }

            // Make API call to update profile
            const response = await api.put("/accounts/profile/create/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
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
                birth_date: editableProfile.birth_date,
                bio: editableProfile.bio,
                photo: response.data.photo || response.data.avatar || editableProfile.photo // Update photo from response
            }));

            // Clear selected file after successful update
            setSelectedFile(null);
            setIsEditing(false);
            setIsEditDialogOpen(false);
            setLoading(false);
            toast.success("Profile updated successfully!");
        } catch (err) {
            console.error("Error updating profile:", err);
            setLoading(false);
            toast.error("Failed to update profile. Please try again later.");
        }
    };


    const handleAddListing = async () => {
        if (!validateForm()) {
            return;
        }
        try {
            setLoading(true);

            const payload: any = {
                title: newListing.title,
                description: newListing.description,
                property_type: newListing.property_type,
                price: newListing.price,
                currency: newListing.currency,
                listing_purpose: newListing.listing_purpose,
                address: newListing.address,
                city: newListing.city,
                state: newListing.state || null,
                zip_code: newListing.zip_code || null,
                bedrooms: newListing.bedrooms || null,
                bathrooms: newListing.bathrooms || null,
                square_feet: newListing.square_feet || null,
                lot_size: newListing.lot_size || null,
                year_built: newListing.year_built || null,
                availability: newListing.availability || null,
            };

            // Only add availability_date to the payload if availability is "date"
            if (newListing.availability === "date" && newListing.availability_date) {
                payload.availability_date = newListing.availability_date;
            }

            console.log("Payload:", payload);

            let response;

            if (isUpdatingListing && currentListingId) {
                const data = { ...payload, property_id: currentListingId }
                // Update existing listing
                response = await api.put(`/market/update-property/`, data, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`
                    }
                });
                toast.success("Property updated successfully!");
            } else {
                // Create new listing
                response = await api.post("/market/list-property/", payload, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`
                    }
                });
                toast.success("New property listed successfully!");
            }

            // If successful, reset form and refresh data
            if (response.data) {
                resetListingForm();
                setIsListingDialogOpen(false);
                fetchProfile(); // Refresh the listings
                window.location.reload()
            }

            setLoading(false);
        } catch (error) {
            console.error("Error with property:", error);
            setLoading(false);
            const action = isUpdatingListing ? "update" : "add";
            toast.error(`Failed to ${action} property. Please try again.`);
        }
    };

    console.log("errors", errors)


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

    const handleImageSelect = (event: any) => {
        const files = Array.from(event.target.files);
        console.log('Selected files:', files); // Debug log
        setSelectedFiles((prevFiles: any) => [...prevFiles, ...files]);
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

    const resetListingFormState = () => {
        setIsUpdatingListing(false);
        setCurrentListingId(null);
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
            availability: "now",
            availability_date: ""
        });
        // window.location.reload();

    };

    const handleDrop = (e: any) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.dataTransfer.files && e.dataTransfer.files?.length > 0) {
            const files = Array.from(e.dataTransfer.files);

            // Create previews for the dropped files
            const newImages = files?.map((file: any) => ({
                file,
                preview: URL.createObjectURL(file),
                name: file.name
            }));

            // Update the selectedImages state
            setSelectedImages((prevImages: any) => [...prevImages, ...newImages]);
        }
    };

    const formatDate = (dateString: any) => {
        const options: any = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getStatusColor = (purpose: string) => {
        switch (purpose?.toLowerCase()) {
            case 'shop':
                return 'bg-purple-500 hover:bg-purple-600';
            case 'land':
                return 'bg-amber-500 hover:bg-amber-600';
            case 'duplex':
                return 'bg-indigo-500 hover:bg-indigo-600';
            case 'apartment':
                return 'bg-emerald-500 hover:bg-emerald-600';
            default:
                return 'bg-gray-500 hover:bg-gray-600';
        }
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
            status: profileData.subscription.status || "inactive",
            subscription_code: profileData.subscription_code
        };
    };

    const subscriptionInfo = getSubscriptionInfo();
    const hasPlan = subscriptionInfo.plan !== "Free" && subscriptionInfo.status === "active";

    const handleOpenCancelModal = () => {
        if (!hasPlan) return;
        setIsModalOpen(true);
    };

    const handleCloseCancelModal = () => {
        setIsModalOpen(false);
    };

    const handleCancelPlan = async (cancellationReason: string) => {
        if (!hasPlan) return;

        try {
            setLoading(true);

            const payload = {
                subscription_code: profile?.subscription?.subscription_code,
                cancellationReason: cancellationReason
            };

            console.log("Cancellation payload:", payload);

            // Verify we have a valid subscription code before proceeding
            if (!profile?.subscription?.subscription_code) {
                toast("Subscription information not found. Please try again later.");
                return;
            }

            const response = await api.post("subscriptions/cancel-subscription/", payload, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`
                }
            });

            if (response.data) {
                toast("Your subscription has been cancelled successfully");
                handleCloseCancelModal();
                fetchProfile()
            } else {
                throw new Error("Failed to cancel subscription");
            }
        } catch (error) {
            console.error("Cancellation error:", error);
            toast("Failed to cancel your subscription. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const getCancellationReasonText = (type: any) => {
        const reasons: any = {
            too_expensive: "Too expensive for my budget",
            not_using: "Not using the service enough",
            missing_features: "Missing features I need",
            switching: "Switching to another service",
            technical_issues: "Technical issues/bugs",
            other: "Other reason"
        };
        return reasons[type] || type;
    };

    const handleInputChange = (field: any, value: any) => {
        setNewListing({ ...newListing, [field]: value });

        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };


    // Get user initials for avatar
    const getUserInitials = () => {
        if (!profileData.name) return "";
        return profileData.name.split(' ')?.map((n: any) => n[0]).join('');
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
                                    <Badge variant="outline" className="bg-teal-50 text-teal-600 border-teal-200">
                                        Active since {new Date(profileData.joinedDate).getFullYear()}
                                    </Badge>
                                    {/* {profileData.verified === true && (
                                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                            <Check className="h-3 w-3 mr-1" /> Verified
                                        </Badge>
                                    )} */}
                                </div>
                            </CardHeader>
                            <CardContent className="text-center space-y-2">
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
                                                phone_number: profileData.phone, // Add this mapping
                                                photo: profileData.photo,
                                                bio: profileData.bio || "", // Add bio field
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
                                                        <div className="relative cursor-pointer">
                                                            <input
                                                                type="file"
                                                                id="avatar-upload"
                                                                accept="image/*"
                                                                onChange={handleEditFileSelect}
                                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                            />
                                                            <Button variant="outline" size="sm" className="cursor-pointer">
                                                                <Upload className="h-4 w-4 mr-1" /> Upload
                                                            </Button>
                                                        </div>
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
                                                        onChange={(e) => setEditableProfile({
                                                            ...editableProfile,
                                                            phone: e.target.value,
                                                            phone_number: e.target.value
                                                        })}
                                                    />
                                                </div>
                                            </div>
                                            {/* Bio field - Added here */}
                                            <div className="space-y-2">
                                                <Label htmlFor="bio">Bio</Label>
                                                <textarea
                                                    id="bio"
                                                    value={editableProfile.bio || ""}
                                                    onChange={(e) => setEditableProfile({ ...editableProfile, bio: e.target.value })}
                                                    placeholder="Tell us about yourself..."
                                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    rows={3}
                                                />
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
                                        </div>
                                        <DialogFooter>
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
                                <div className="flex flex-col gap-3 mt-3">
                                    <Button
                                        onClick={() => router.push("/pricing")}
                                        variant="default"
                                        className="w-full bg-teal-600 hover:bg-teal-700 cursor-pointer"
                                    >
                                        {hasPlan ? "Upgrade Plan" : "Choose Plan"}
                                    </Button>

                                    {hasPlan && (
                                        <Button
                                            onClick={handleOpenCancelModal}
                                            variant="outline"
                                            className="w-full text-red-500 hover:text-red-600 cursor-pointer"
                                            disabled={loading}
                                        >
                                            {loading ? "Cancelling..." : "Cancel Plan"}
                                        </Button>
                                    )}
                                </div>
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
                                        <div className="flex flex-col gap-3 mt-1">
                                            <p>{profileData.referral_code}</p>
                                            <Button
                                                variant="outline"
                                                className='w-max'
                                                size="sm"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(profileData.referral_code);
                                                    toast.success("Referral link copied to clipboard!");
                                                }}
                                            >
                                                Copy
                                            </Button>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Your Referral Link</p>
                                        <div className="flex flex-col gap-3 mt-1">
                                            <code className="bg-gray-100 px-2 py-1 rounded text-sm flex-1">
                                                {(() => {
                                                    const baseUrl = process.env.NODE_ENV === 'development' ? 'localhost:3000' : 'realvistaproperties.com';
                                                    return `${baseUrl}/register?ref=${profileData.referral_code}`;
                                                })()}
                                            </code>
                                            <Button
                                                variant="outline"
                                                className='w-max'
                                                size="sm"
                                                onClick={() => {
                                                    const baseUrl = process.env.NODE_ENV === 'development' ? 'localhost:3000' : 'realvistaproperties.com';
                                                    const referralUrl = `${baseUrl}/register?ref=${profileData.referral_code}`;
                                                    navigator.clipboard.writeText(referralUrl);
                                                    toast.success("Referral link copied to clipboard!");
                                                }}
                                            >
                                                Copy
                                            </Button>
                                        </div>
                                    </div>
                                    {profileData.referrer && (<div>
                                        <p className="text-sm text-gray-500">Referrer</p>
                                        <p className="font-medium">{profileData.referrer}</p>
                                    </div>)}

                                    <div>
                                        <p className="text-sm text-gray-500">Referred Users</p>
                                        <p className="font-medium">{profileData.referred_users_count}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Total Earnings</p>
                                        <p className="font-medium">₦{profileData.total_referral_earnings.toLocaleString()}</p>
                                    </div>

                                    {/* New button to enter referrer code */}
                                    {!profileData.referrer && (<div className="pt-2 border-t border-gray-100">
                                        <Button

                                            className="w-full flex items-center bg-teal-600 cursor-pointer hover:bg-teal-700 text-white justify-center hover:text-teal-70"
                                            onClick={() => setIsDialogOpen(true)}
                                        >
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Enter Referrer Code
                                        </Button>
                                    </div>)}
                                    <Button

                                        className="w-full flex items-center bg-orange-400 cursor-pointer hover:bg-orange-500 font-bold text-white justify-center hover:text-teal-70"
                                        onClick={() => setIsWithdrawOpen(true)}
                                    >
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Withdraw Earnings
                                    </Button>

                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Main Content Area */}
                    <div className="w-full md:w-3/4 mb-10">
                        {profileData &&
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className={`grid gap-8 mb-8 ${profileData?.agent ? 'grid-cols-4' : 'grid-cols-2'}`}>
                                    {profileData?.agent && (<TabsTrigger value="dashboard">Dashboard</TabsTrigger>)}
                                    {profileData?.agent && (<TabsTrigger value="listings">My Listings</TabsTrigger>)}
                                    <TabsTrigger value="profile">Profile</TabsTrigger>
                                    <TabsTrigger value="favorites">Favorites</TabsTrigger>
                                </TabsList>

                                {/* Dashboard Tab */}
                                {profileData?.agent &&
                                    <TabsContent value="dashboard" className="space-y-6">
                                        {/* Stats Cards */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                            {profileData?.agent && (<Card className="bg-white">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-sm font-medium text-gray-500">Total Listings</CardTitle>
                                                </CardHeader>
                                                <CardContent className="pt-0">
                                                    <div className="text-2xl font-bold">{analytics.totalListings}</div>
                                                    <p className="text-xs text-gray-500 mt-1">Properties in your portfolio</p>
                                                </CardContent>
                                            </Card>)}
                                            <Card className="bg-white">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-sm font-medium text-gray-500">Total Favorites</CardTitle>
                                                </CardHeader>
                                                <CardContent className="pt-0">
                                                    <div className="text-2xl font-bold">{favorites?.length}</div>
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
                                        {profileData?.agent?.top_performing_properties?.length > 0 && (<Card>
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
                                        </Card>)}

                                    </TabsContent>
                                }
                                {/* Listings Tab */}
                                <TabsContent value="listings" className="space-y-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold">My Properties</h2>
                                        <Dialog open={isListingDialogOpen}
                                            onOpenChange={(open) => {
                                                setIsListingDialogOpen(open);
                                                if (!open) {
                                                    resetListingFormState();
                                                }
                                            }}>
                                            <DialogTrigger asChild>
                                                <Button className='bg-teal-600 cursor-pointer hover:bg-teal-700' onClick={() => setIsAddingListing(true)}>
                                                    <Plus className="h-4 w-4 mr-1" /> Add New Property
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[625px] max-h-[85vh] overflow-y-auto">
                                                <DialogHeader>
                                                    <DialogTitle>
                                                        {isUpdatingListing ? "Update Property" : "Add New Property"}
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        {isUpdatingListing
                                                            ? "Update the details for your property listing."
                                                            : "Enter details for your new property listing."
                                                        }
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    {/* Basic Property Information */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="title">Property Title*</Label>
                                                        <Input
                                                            id="title"
                                                            value={newListing.title}
                                                            onChange={(e) => handleInputChange('title', e.target.value)}
                                                            // onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
                                                            placeholder="e.g. Modern 3 Bedroom Apartment"
                                                            required
                                                        />
                                                          {errors.title && (
                                                            <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                                                        )}
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
                                                                    {/* <SelectItem value="service apartment">Service Apartment</SelectItem> */}
                                                                    {/* <SelectItem value="townhouse">Townhouse</SelectItem> */}
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
                                                                onChange={(e) => handleInputChange('price', e.target.value)}
                                                                // onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
                                                                placeholder="e.g. 250000"
                                                                required
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="currency">Currency</Label>
                                                            <Select
                                                                onValueChange={(value) => setNewListing({ ...newListing, currency: value })}
                                                                value={newListing.currency}
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
                                                            onChange={(e) => handleInputChange('address', e.target.value)}
                                                            // onChange={(e) => setNewListing({ ...newListing, address: e.target.value })}
                                                            placeholder="e.g. 123 Main Street"
                                                            required
                                                        />
                                                          {errors.address && (
                                                            <p className="text-sm text-red-500 mt-1">{errors.address}</p>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="city">City*</Label>
                                                            <Input
                                                                id="city"
                                                                value={newListing.city}
                                                                onChange={(e) => handleInputChange('city', e.target.value)}
                                                                // onChange={(e) => setNewListing({ ...newListing, city: e.target.value })}
                                                                placeholder="e.g. San Francisco"
                                                                required
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="state">State*</Label>
                                                            <Input
                                                                id="state"
                                                                value={newListing.state}
                                                                onChange={(e) => handleInputChange('state', e.target.value)}
                                                                // onChange={(e) => setNewListing({ ...newListing, state: e.target.value })}
                                                                placeholder="e.g. California"
                                                                required
                                                            />
                                                        </div>
                                                        {errors.city && (
                                                            <p className="text-sm text-red-500 mt-1">{errors.city}</p>
                                                        )}
                                                        {/* <div className="space-y-2">
                                                            <Label htmlFor="zip_code">ZIP Code</Label>
                                                            <Input
                                                                id="zip_code"
                                                                value={newListing.zip_code}
                                                                onChange={(e) => setNewListing({ ...newListing, zip_code: e.target.value })}
                                                                placeholder="e.g. 94103"
                                                            />
                                                        </div> */}
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
                                                            <Label htmlFor="square_feet">Square Meter (Interior)</Label>
                                                            <Input
                                                                id="square_feet"
                                                                type="number"
                                                                value={newListing.square_feet}
                                                                onChange={(e) => setNewListing({ ...newListing, square_feet: e.target.value })}
                                                                placeholder="e.g. 1200"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="lot_size">Plot Size (sq m)</Label>
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
                                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                                            // onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                                                            placeholder="Describe the property features and highlights"
                                                            required
                                                        />
                                                        {errors.description && (
                                                            <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                                                        )}
                                                    </div>

                                                </div>
                                                <DialogFooter>
                                                    <Button variant="outline" onClick={() => setIsListingDialogOpen(false)}>Cancel</Button>
                                                    <Button
                                                        onClick={handleAddListing}
                                                        className='cursor-pointer'
                                                        disabled={loading || !newListing.title || !newListing.property_type || !newListing.price}
                                                    >
                                                        {loading ? (
                                                            <>
                                                                <span className="mr-2">
                                                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                    </svg>
                                                                </span>
                                                                {isUpdatingListing ? "Updating Property..." : "Adding Property..."}
                                                            </>
                                                        ) : (
                                                            isUpdatingListing ? "Update Property" : "Add Property"
                                                        )}
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>

                                    {/* Listing Cards */}
                                    {listings?.length === 0 ? (
                                        <EmptyState />
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {listings?.map((listing: any) => (
                                                <Card
                                                    key={listing.id}
                                                    className="h-full cursor-pointer overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group bg-white rounded-xl"
                                                >
                                                    <div
                                                        className="relative h-62 mt-[-1.8rem] overflow-hidden"
                                                        onClick={() => handleCardClick(listing.id)}
                                                    >
                                                        <img
                                                            src={listing?.image_files[0]?.file}
                                                            alt={listing.title}
                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        />
                                                        <Badge
                                                            className={`absolute top-4 right-4 ${getStatusColor(listing.property_type)} text-white px-3 py-1 text-sm font-medium`}
                                                        >
                                                            {listing.property_type}
                                                        </Badge>
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                    </div>

                                                    <CardHeader className="pb-3 relative">
                                                        <div className="absolute right-4 top-4">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        <MoreVertical className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-48 shadow-lg">
                                                                    <DropdownMenuItem
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleUpdateDetails(listing.id);
                                                                        }}
                                                                        className="cursor-pointer"
                                                                    >
                                                                        <Edit className="h-4 w-4 mr-2" />
                                                                        Update Details
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleUpdateFeatures(listing.id);
                                                                        }}
                                                                        className="cursor-pointer"
                                                                    >
                                                                        <Settings className="h-4 w-4 mr-2" />
                                                                        Update Features
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleManageCoordinates(listing.id);
                                                                        }}
                                                                        className="cursor-pointer"
                                                                    >
                                                                        <MapPin className="h-4 w-4 mr-2" />
                                                                        Manage Coordinates
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleAddFiles(listing.id);
                                                                        }}
                                                                        className="cursor-pointer"
                                                                    >
                                                                        <ImagePlus className="h-4 w-4 mr-2" />
                                                                        Add Files/Images
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDeleteClick(e, listing.id);
                                                                        }}
                                                                        className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                                                    >
                                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                                        Delete Listing
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>

                                                        <div className="pr-10">
                                                            <CardTitle className="text-base font-bold text-gray-900 mb-2">{listing.title}</CardTitle>
                                                            <CardDescription className="flex items-center text-gray-600 mb-3">
                                                                <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                                                                <span>{listing.address}</span>
                                                            </CardDescription>
                                                            <div className="space-y-1">
                                                                <p className="text-xl font-bold text-gray-900">{listing.currency} {parseFloat(listing.price).toLocaleString()}</p>
                                                                <p className="text-sm text-gray-500">Listed on {formatDate(listing.listed_date)}</p>
                                                            </div>
                                                        </div>
                                                    </CardHeader>

                                                    <CardContent className="pt-0 space-y-4">
                                                        <div className="flex flex-wrap gap-2">
                                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                                {listing.bedrooms} {listing.bedrooms === 1 ? 'Bed' : 'Beds'}
                                                            </Badge>
                                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                                {listing.bathrooms} {listing.bathrooms === 1 ? 'Bath' : 'Baths'}
                                                            </Badge>
                                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                                {listing.area} sqm
                                                            </Badge>
                                                            <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                                                                {listing.type}
                                                            </Badge>
                                                        </div>

                                                        <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-100">
                                                            <div className="text-center">
                                                                <div className="flex items-center justify-center text-gray-500 mb-1">
                                                                    <Eye className="h-4 w-4 mr-1" />
                                                                    <p className="text-sm">Views</p>
                                                                </div>
                                                                <p className="text-lg font-semibold text-gray-900">{listing.views}</p>
                                                            </div>
                                                            <div className="text-center">
                                                                <div className="flex items-center justify-center text-gray-500 mb-1">
                                                                    <MessageSquare className="h-4 w-4 mr-1" />
                                                                    <p className="text-sm">Inquiries</p>
                                                                </div>
                                                                <p className="text-lg font-semibold text-gray-900">{listing.inquiries}</p>
                                                            </div>
                                                            <div className="text-center">
                                                                <div className="flex items-center justify-center text-gray-500 mb-1">
                                                                    <Heart className="h-4 w-4 mr-1" />
                                                                    <p className="text-sm">Favorites</p>
                                                                </div>
                                                                <p className="text-lg font-semibold text-gray-900">{listing.bookmarked}</p>
                                                            </div>
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
                                                            {profile?.is_phone_verified ? (
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
                                                            <div className='cursor-pointer'>
                                                                {profile?.is_identity_verified ? (
                                                                    <>
                                                                        <Button variant="outline" size="sm" disabled className="bg-green-50">
                                                                            <Check className="h-4 w-4 mr-1 text-green-500" />
                                                                            Verified
                                                                        </Button>
                                                                    </>
                                                                ) : (
                                                                    <Button variant="outline" size="sm" className="bg-green-50">
                                                                        <CreditCard className="h-4 w-4 mr-1" />
                                                                        Verify
                                                                    </Button>
                                                                )}
                                                            </div>
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
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="favorites" className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {favorites?.map((listing: any, index: number) => (
                                            <Card key={index} onClick={() => handleCardClick(listing.property_id)} className="h-full cursor-pointer">
                                                <div className="relative h-48 mt-[-24px]">
                                                    <img
                                                        src={listing.images[0]}
                                                        alt={listing.title}
                                                        className="w-full h-full object-cover rounded-t-md"
                                                    />
                                                </div>
                                                <CardHeader className="pb-2">
                                                    <div className="flex flex-col">
                                                        <div>
                                                            <CardTitle>{listing.title}</CardTitle>
                                                            <CardDescription className="flex items-center mt-1">
                                                                <MapPin className="h-3 w-3 mr-1" /> {listing.address}
                                                            </CardDescription>
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="font-bold text-lg">{listing.currency} {listing.price.toLocaleString()}</p>
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

                                                    {/* <div className="grid grid-cols-3 gap-2 text-center py-2 border-t border-b border-gray-100">
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
                                                    </div> */}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                    {favorites?.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                                            <svg
                                                className="w-16 h-16 text-gray-300 mb-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                                />
                                            </svg>
                                            <h2 className="text-lg font-medium text-gray-700 mb-1">No favorites found</h2>
                                            <p className="text-gray-500 text-center">This user hasn't added any items to their favorites yet.</p>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        }
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
            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this property? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className="bg-red-600 cursor-pointer hover:bg-red-700 focus:ring-red-600"
                        >
                            {isDeleting ? "Deleting..." : "Delete Property"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Dialog open={isFeaturesDialogOpen} onOpenChange={setIsFeaturesDialogOpen}>
                <DialogContent className="sm:max-w-[625px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Update Property Features</DialogTitle>
                        <DialogDescription>
                            Update the features and amenities for your property listing.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Negotiable */}
                        <div className="space-y-2">
                            <Label htmlFor="negotiable">Price Negotiable</Label>
                            <Select
                                onValueChange={(value) => setFeaturesData({ ...featuresData, negotiable: value })}
                                value={featuresData.negotiable}
                            >
                                <SelectTrigger id="negotiable">
                                    <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="yes">Yes</SelectItem>
                                    <SelectItem value="no">No</SelectItem>
                                    <SelectItem value="partially">Partially</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Boolean Features */}
                        <div className="space-y-4">
                            <Label className="text-base font-semibold">Property Amenities</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="furnished"
                                        checked={featuresData.furnished}
                                        onCheckedChange={(checked) => setFeaturesData({ ...featuresData, furnished: checked })}
                                    />
                                    <Label htmlFor="furnished" className="text-sm">Furnished</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="pet_friendly"
                                        checked={featuresData.pet_friendly}
                                        onCheckedChange={(checked) => setFeaturesData({ ...featuresData, pet_friendly: checked })}
                                    />
                                    <Label htmlFor="pet_friendly" className="text-sm">Pet Friendly</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="parking_available"
                                        checked={featuresData.parking_available}
                                        onCheckedChange={(checked) => setFeaturesData({ ...featuresData, parking_available: checked })}
                                    />
                                    <Label htmlFor="parking_available" className="text-sm">Parking Available</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="swimming_pool"
                                        checked={featuresData.swimming_pool}
                                        onCheckedChange={(checked) => setFeaturesData({ ...featuresData, swimming_pool: checked })}
                                    />
                                    <Label htmlFor="swimming_pool" className="text-sm">Swimming Pool</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="garden"
                                        checked={featuresData.garden}
                                        onCheckedChange={(checked) => setFeaturesData({ ...featuresData, garden: checked })}
                                    />
                                    <Label htmlFor="garden" className="text-sm">Garden</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="water_supply"
                                        checked={featuresData.water_supply}
                                        onCheckedChange={(checked) => setFeaturesData({ ...featuresData, water_supply: checked })}
                                    />
                                    <Label htmlFor="water_supply" className="text-sm">Water Supply</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="security"
                                        checked={featuresData.security}
                                        onCheckedChange={(checked) => setFeaturesData({ ...featuresData, security: checked })}
                                    />
                                    <Label htmlFor="security" className="text-sm">Security</Label>
                                </div>
                            </div>
                        </div>

                        {/* Location & Infrastructure Features */}
                        <div className="space-y-4">
                            <Label className="text-base font-semibold">Location & Infrastructure</Label>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="electricity_proximity">Electricity Proximity</Label>
                                    <Select
                                        onValueChange={(value) => setFeaturesData({ ...featuresData, electricity_proximity: value })}
                                        value={featuresData.electricity_proximity}
                                    >
                                        <SelectTrigger id="electricity_proximity">
                                            <SelectValue placeholder="Select proximity" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="excellent">Excellent</SelectItem>
                                            <SelectItem value="good">Good</SelectItem>
                                            <SelectItem value="moderate">Moderate</SelectItem>
                                            <SelectItem value="poor">Poor</SelectItem>
                                            <SelectItem value="none">None</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="road_network">Road Network</Label>
                                    <Select
                                        onValueChange={(value) => setFeaturesData({ ...featuresData, road_network: value })}
                                        value={featuresData.road_network}
                                    >
                                        <SelectTrigger id="road_network">
                                            <SelectValue placeholder="Select road network quality" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="excellent">Excellent</SelectItem>
                                            <SelectItem value="good">Good</SelectItem>
                                            <SelectItem value="moderate">Moderate</SelectItem>
                                            <SelectItem value="poor">Poor</SelectItem>
                                            <SelectItem value="none">None</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="development_level">Development Level</Label>
                                    <Select
                                        onValueChange={(value) => setFeaturesData({ ...featuresData, development_level: value })}
                                        value={featuresData.development_level}
                                    >
                                        <SelectTrigger id="development_level">
                                            <SelectValue placeholder="Select development level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="highly_developed">Highly Developed</SelectItem>
                                            <SelectItem value="well_developed">Well Developed</SelectItem>
                                            <SelectItem value="moderate">Moderate</SelectItem>
                                            <SelectItem value="developing">Developing</SelectItem>
                                            <SelectItem value="undeveloped">Undeveloped</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Additional Features */}
                        <div className="space-y-2">
                            <Label htmlFor="additional_features">Additional Features</Label>
                            <Textarea
                                id="additional_features"
                                rows={3}
                                value={featuresData.additional_features || ""}
                                onChange={(e) => setFeaturesData({ ...featuresData, additional_features: e.target.value })}
                                placeholder="Describe any additional features or amenities..."
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsFeaturesDialogOpen(false);
                                resetFeaturesForm();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmitFeatures}
                            disabled={featuresLoading}
                            className="cursor-pointer"
                        >
                            {featuresLoading ? (
                                <>
                                    <span className="mr-2">
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </span>
                                    Updating Features...
                                </>
                            ) : (
                                "Update Features"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <CancellationModal
                isOpen={isModalOpen}
                onClose={handleCloseCancelModal}
                onSubmit={handleCancelPlan}
                loading={loading}
            />
            <Dialog open={isFilesDialogOpen} onOpenChange={setIsFilesDialogOpen}>
                <DialogContent className="sm:max-w-[625px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Upload Files & Images</DialogTitle>
                        <DialogDescription>
                            Add photos, videos, and documents for your property listing.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Existing Files */}
                        {existingFiles?.length > 0 && (
                            <div className="space-y-2">
                                <Label>Existing Files ({existingFiles.length})</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {existingFiles.map((file: any, index: any) => (
                                        <div key={index} className="relative group">
                                            <div className="aspect-square bg-gray-100 rounded-md overflow-hidden border">
                                                {file.file_type?.startsWith('image/') ? (
                                                    <img
                                                        src={file.file}
                                                        alt={file.file_name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : file.file_type?.startsWith('video/') ? (
                                                    <div className="h-full w-full relative">
                                                        <video
                                                            src={file.file}
                                                            className="h-full w-full object-cover"
                                                            controls={false}
                                                            muted
                                                            playsInline
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                                                            <Play className="h-8 w-8 text-white" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center bg-gray-50">
                                                        <div className="text-center">
                                                            <FileText className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                                            <p className="text-xs text-gray-500 truncate px-2">
                                                                {file.file_name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            {/* Delete button for existing files */}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteFile(file.id);
                                                }}
                                                disabled={filesLoading}
                                                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Delete file"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                            <p className="text-xs text-gray-500 truncate mt-1">
                                                {file.file_name}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* File Upload Area */}
                        <div className="space-y-2">
                            <Label htmlFor="files">Upload Videos/Images/Documents</Label>
                            <div
                                className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => document.getElementById('file-input')?.click()}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                            >
                                <Upload className="h-8 w-8 mx-auto text-gray-400" />
                                <p className="mt-2 text-sm text-gray-500">
                                    Drag and drop files here or click to browse
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Supported: Images (JPG, PNG, GIF), Videos (MP4), Audio (MP3) and Documents (PDF, DOC, DOCX) <br></br>
                                    Size: 10MB (max)
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-4"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        document.getElementById('file-input')?.click();
                                    }}
                                >
                                    Choose Files
                                </Button>
                                <input
                                    id="file-input"
                                    type="file"
                                    multiple
                                    accept="image/*,video/mp4,audio/mp3,.pdf,.doc,.docx"
                                    className="hidden"
                                    onChange={handleImagePick}
                                />
                            </div>

                            {/* Selected Files Preview */}
                            {selectedFiles?.length > 0 && (
                                <div className="mt-4">
                                    <Label>Selected Files ({selectedFiles.length})</Label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
                                        {selectedFiles.map((file: any, index: any) => (
                                            <div key={index} className="relative group">
                                                <div className="aspect-square bg-gray-100 rounded-md overflow-hidden border">
                                                    {file.type.startsWith('image/') ? (
                                                        <img
                                                            src={URL.createObjectURL(file)}
                                                            alt={file.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : file.type.startsWith('video/') ? (
                                                        <VideoPreview
                                                            file={file}
                                                            className="h-full w-full object-cover"
                                                        />

                                                    ) : file.type.startsWith('audio/') ? (
                                                        <div className="h-full w-full flex items-center justify-center bg-gray-50">
                                                            <div className="text-center">
                                                                <Music className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                                                <p className="text-xs text-gray-500 truncate px-2">
                                                                    {file.name}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center bg-gray-50">
                                                            <div className="text-center">
                                                                <FileText className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                                                <p className="text-xs text-gray-500 truncate px-2">
                                                                    {file.name}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeFile(index);
                                                    }}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                                <p className="text-xs text-gray-500 truncate mt-1">
                                                    {file.name}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsFilesDialogOpen(false);
                                setSelectedFiles([]);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleFileUpload}
                            disabled={filesLoading}
                            className="cursor-pointer"
                        >
                            {filesLoading ? (
                                <>
                                    <span className="mr-2">
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </span>
                                    Uploading
                                </>
                            ) : (
                                selectedFiles.length > 0
                                    ? `Upload ${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}`
                                    : 'Upload'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={isCoordinatesDialogOpen} onOpenChange={setIsCoordinatesDialogOpen}>
                <DialogContent className="sm:max-w-[625px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Manage Property Coordinates</DialogTitle>
                        <DialogDescription>
                            Add or remove coordinates for your property listing. These help buyers locate your property accurately.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Add New Coordinate */}
                        <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                            <Label className="text-base font-semibold">Add New Coordinate</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="new_latitude">Latitude</Label>
                                    <Input
                                        id="new_latitude"
                                        type="number"
                                        step="any"
                                        placeholder="e.g., 6.5244"
                                        value={newCoordinate.latitude}
                                        onChange={(e) => setNewCoordinate({ ...newCoordinate, latitude: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new_longitude">Longitude</Label>
                                    <Input
                                        id="new_longitude"
                                        type="number"
                                        step="any"
                                        placeholder="e.g., 3.3792"
                                        value={newCoordinate.longitude}
                                        onChange={(e) => setNewCoordinate({ ...newCoordinate, longitude: e.target.value })}
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={handleAddCoordinate}
                                disabled={coordinatesLoading || !newCoordinate.latitude || !newCoordinate.longitude}
                                className="w-full cursor-pointer"
                            >
                                {coordinatesLoading ? (
                                    <>
                                        <span className="mr-2">
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        </span>
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Coordinate
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Existing Coordinates */}
                        <div className="space-y-4">
                            <Label className="text-base font-semibold">Existing Coordinates</Label>
                            {currentCoordinates.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                    <p>No coordinates added yet</p>
                                    <p className="text-sm">Add coordinates to help buyers locate your property</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                    {currentCoordinates.map((coord: any, index: number) => (
                                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                                            <div className="flex items-center space-x-3">
                                                <MapPin className="h-4 w-4 text-blue-500" />
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        Lat: {coord.latitude}, Lng: {coord.longitude}
                                                    </p>
                                                    <p className="text-xs text-gray-500">Coordinate {index + 1}</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteCoordinate(index)}
                                                disabled={coordinatesLoading}
                                                className="text-red-600 cursor-pointer hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsCoordinatesDialogOpen(false);
                                resetCoordinatesForm();
                            }}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Request Withdrawal</DialogTitle>
                        <DialogDescription>
                            Enter your withdrawal details and payment information
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleWithdrawalSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="Enter amount"
                                    value={withdrawalAmount}
                                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                                    className={withdrawalError ? "border-red-300 focus-visible:ring-teal-500" : ""}
                                    min="1"
                                    step="0.01"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="paymentMethod">Payment Method</Label>
                                <select
                                    id="paymentMethod"
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="bank">Bank Transfer</option>
                                    <option value="mobile_money">Mobile Money</option>
                                    <option value="paypal">PayPal</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="accountDetails">Account Details</Label>
                                <Textarea
                                    id="accountDetails"
                                    placeholder="e.g. Access, 12345678, John Doe"
                                    value={accountDetails}
                                    onChange={(e) => setAccountDetails(e.target.value)}
                                    className={withdrawalError ? "border-red-300 focus-visible:ring-teal-500" : ""}
                                    rows={4}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Include all necessary details like bank name, account number, and account name
                                </p>
                            </div>

                            {withdrawalError && (
                                <div className="text-sm text-red-500 flex items-center">
                                    <X className="h-4 w-4 mr-1" /> {withdrawalError}
                                </div>
                            )}
                        </div>

                        <DialogFooter className="sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsWithdrawOpen(false)}
                                disabled={isWithdrawalSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isWithdrawalSubmitting}
                                className='bg-teal-600 hover:bg-teal-700 cursor-pointer'
                            >
                                {isWithdrawalSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : 'Request Withdrawal'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Profile;