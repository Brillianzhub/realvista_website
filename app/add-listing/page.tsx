"use client"
import React, { useState, useRef, useEffect } from 'react';
import {
    Check,
    ChevronRight,
    Home,
    ImagePlus,
    Settings,
    MapPin,
    Upload,
    X,
    Play,
    FileText,
    Music,
    Trash2,
    ArrowLeft,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import api from '@/config/apiClient';

const STORAGE_KEY = 'property_listing_draft';

const VideoPreview = ({ file, className }: any) => {
    const [videoUrl, setVideoUrl] = useState(null);

    useEffect(() => {
        if (file && file.type.startsWith('video/')) {
            const url: any = URL.createObjectURL(file);
            setVideoUrl(url);
            return () => URL.revokeObjectURL(url);
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

const ListingManagement = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState<any>([]);
    const [loading, setLoading] = useState(false);
    const [draftLoaded, setDraftLoaded] = useState(false);
    const [errors, setErrors] = useState<any>({});
    const router = useRouter();
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    // Step 1: Property Details
    const [propertyDetails, setPropertyDetails] = useState({
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

    // Step 2: Files
    const [selectedFiles, setSelectedFiles] = useState<any>([]);

    // Step 3: Features
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

    // Step 4: Coordinates
    const [coordinates, setCoordinates] = useState<any>([]);
    const [newCoordinate, setNewCoordinate] = useState({
        latitude: '',
        longitude: ''
    });

    useEffect(() => {
        const loadDraft = () => {
            const savedDraft = localStorage.getItem(STORAGE_KEY);
            if (savedDraft) {
                try {
                    const parsed = JSON.parse(savedDraft);

                    // Only load if there's actual data (not just empty initial state)
                    if (parsed.propertyDetails && parsed.propertyDetails.title) {
                        setPropertyDetails(parsed.propertyDetails);
                        setFeaturesData(parsed.featuresData || featuresData);
                        setCoordinates(parsed.coordinates || []);
                        setCurrentStep(parsed.currentStep || 1);
                        setCompletedSteps(parsed.completedSteps || []);
                        setDraftLoaded(true);

                        // Note: Files cannot be restored from localStorage
                        if (parsed.fileCount > 0) {
                            toast.info(`Draft loaded! Please re-upload ${parsed.fileCount} file(s) from Step 2.`, {
                                duration: 5000
                            });
                        } else {
                            toast.success('Draft loaded successfully!');
                        }
                    }
                } catch (error) {
                    console.error('Error loading draft:', error);
                    toast.error('Failed to load draft');
                }
            }
        };

        loadDraft();
    }, []);

    useEffect(() => {
        // Only save if there's meaningful data (avoid saving empty initial state on first render)
        if (propertyDetails.title || featuresData.additional_features || coordinates.length > 0 || selectedFiles.length > 0) {
            const draftData = {
                propertyDetails,
                featuresData,
                coordinates,
                currentStep,
                completedSteps,
                fileCount: selectedFiles.length,
                lastSaved: new Date().toISOString()
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(draftData));
        }
    }, [propertyDetails, featuresData, coordinates, currentStep, completedSteps, selectedFiles.length]);


    const steps = [
        { number: 1, title: "Property Details", icon: Home, description: "Basic information" },
        { number: 2, title: "Upload Files", icon: ImagePlus, description: "Photos & documents" },
        { number: 3, title: "Features", icon: Settings, description: "Amenities & features" },
        { number: 4, title: "Location", icon: MapPin, description: "Add coordinates" },
        { number: 5, title: "Review & Publish", icon: CheckCircle, description: "Review details & publish" }
    ];

    const validateStep1 = () => {
        const newErrors: any = {};
        if (!propertyDetails.title?.trim()) newErrors.title = "Property title is required";
        if (!propertyDetails.property_type) newErrors.property_type = "Property type is required";
        if (!propertyDetails.price) newErrors.price = "Price is required";
        if (!propertyDetails.description?.trim()) newErrors.description = "Description is required";
        if (!propertyDetails.address?.trim()) newErrors.address = "Address is required";
        if (!propertyDetails.city?.trim()) newErrors.city = "City is required";
        if (!propertyDetails.state?.trim()) newErrors.state = "State is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleStep1Submit = () => {
        if (!validateStep1()) return;

        toast.success("Property details saved to draft!");
        setCompletedSteps([...completedSteps, 1]);
        setCurrentStep(2);
    };

    const handleStep2Submit = () => {
        if (selectedFiles.length === 0) {
            toast.error("Please add at least one file before proceeding");
            return;
        }

        const allowedTypes = ['pdf', 'png', 'jpg', 'jpeg', 'mp3', 'mp4'];
        const maxFileSize = 10 * 1024 * 1024; // 10MB

        // Validate files
        for (const file of selectedFiles as any) {
            const name = file?.name || `file_${Date.now()}`;
            const extension = name.split('.').pop().toLowerCase();

            if (!allowedTypes.includes(extension)) {
                toast.error(`File "${name}" is not allowed. Only PDF, JPG, JPEG, MP3, and MP4 files are supported.`);
                return;
            }

            if (file.size > maxFileSize) {
                toast.error(`File "${name}" exceeds the 10MB size limit.`);
                return;
            }
        }

        toast.success("Files validated and saved to draft!");
        setCompletedSteps([...completedSteps, 2]);
        setCurrentStep(3);
    };

    const handleStep3Submit = () => {
        toast.success("Property features saved to draft!");
        setCompletedSteps([...completedSteps, 3]);
        setCurrentStep(4);
    };

    const handleStep4Submit = () => {
        if (coordinates.length > 0) {
            toast.success("Coordinates saved to draft!");
        }
        setCompletedSteps([...completedSteps, 4]);
        setCurrentStep(5);
    };

    const handleFinalPublish = async () => {
        setLoading(true);
        try {
            // Step 1: Create property
            const propertyPayload: any = {
                title: propertyDetails.title,
                description: propertyDetails.description,
                property_type: propertyDetails.property_type,
                price: propertyDetails.price,
                currency: propertyDetails.currency,
                listing_purpose: propertyDetails.listing_purpose,
                address: propertyDetails.address,
                city: propertyDetails.city,
                state: propertyDetails.state || null,
                zip_code: propertyDetails.zip_code || null,
                bedrooms: propertyDetails.bedrooms || null,
                bathrooms: propertyDetails.bathrooms || null,
                square_feet: propertyDetails.square_feet || null,
                lot_size: propertyDetails.lot_size || null,
                year_built: propertyDetails.year_built || null,
                availability: propertyDetails.availability || null,
            };

            if (propertyDetails.availability === "date" && propertyDetails.availability_date) {
                propertyPayload.availability_date = propertyDetails.availability_date;
            }

            const propertyResponse = await api.post("/market/list-property/", propertyPayload, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`
                }
            });

            const propertyId = propertyResponse.data.data.id;

            // Step 2: Upload files
            if (selectedFiles.length > 0) {
                const formData = new FormData();
                formData.append('property', propertyId);

                for (const file of selectedFiles as any) {
                    const name = file?.name || `file_${Date.now()}`;
                    const extension = name.split('.').pop().toLowerCase();

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

                    const fileObj = new File([file], name, { type });
                    formData.append('file', fileObj);
                }

                await api.post(`/market/upload-file-market/`, formData, {
                    headers: {
                        Authorization: `Token ${token}`,
                        'Content-Type': 'multipart/form-data',
                    }
                });
            }

            // Step 3: Add features
            const featuresPayload = {
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

            await api.post(`/market/property/${propertyId}/features/`, featuresPayload, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`
                }
            });

            // Step 4: Add coordinates (if any)
            if (coordinates.length > 0) {
                const coordinateData = {
                    property: propertyId,
                    coordinates: coordinates.map((coord: any) => ({
                        latitude: parseFloat(coord.latitude),
                        longitude: parseFloat(coord.longitude)
                    }))
                };

                await api.post(`/market/property/coordinates/`, coordinateData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${token}`,
                    }
                });
            }

            // Clear localStorage after successful publish
            localStorage.removeItem(STORAGE_KEY);

            toast.success("Property published successfully!");
            router.push("/profile");
        } catch (error) {
            console.error("Error publishing property:", error);
            toast.error("Failed to publish property. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (event: any) => {
        const files = Array.from(event.target.files);
        setSelectedFiles([...selectedFiles, ...files]);
    };

    const removeFile = (index: number) => {
        setSelectedFiles(selectedFiles.filter((_: any, i: any) => i !== index));
    };

    const handleAddCoordinate = () => {
        if (!newCoordinate.latitude || !newCoordinate.longitude) {
            toast.error("Please enter both latitude and longitude");
            return;
        }

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

        setCoordinates([...coordinates, { latitude: lat, longitude: lng }]);
        setNewCoordinate({ latitude: '', longitude: '' });
        toast.success("Coordinate added successfully!");
    };

    const removeCoordinate = (index: number) => {
        setCoordinates(coordinates.filter((_: any, i: any) => i !== index));
        toast.success("Coordinate removed");
    };

    const canNavigateToStep = (stepNumber: any) => {
        if (stepNumber === 1) return true;
        return completedSteps.includes(stepNumber - 1);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50/30 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        className="mb-4 text-gray-600 hover:text-teal-600"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Profile
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Listing</h1>
                    <p className="text-gray-600">Follow the steps below to add your property</p>
                </div>

                <div className="mb-12">
                    {/* Overall Progress Indicator */}
                    <div className="mb-8 bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Overall Progress: Step {currentStep} of 5
                                </h3>
                                <p className="text-sm text-amber-600 font-medium mt-1">
                                    {5 - currentStep} {5 - currentStep === 1 ? 'step' : 'steps'} remaining
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-amber-600">
                                    {Math.round((currentStep / 5) * 100)}%
                                </div>
                                <p className="text-xs text-gray-500">Complete</p>
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${(currentStep / 5) * 100}%` }}
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between relative">
                        {steps.map((step, index) => {
                            const isCompleted = completedSteps.includes(step.number);
                            const isCurrent = currentStep === step.number;
                            const canNavigate = canNavigateToStep(step.number);

                            const hasNext = index < steps.length - 1;
                            const segmentCompleted = index < (currentStep - 1);

                            return (
                                <div
                                    key={step.number}
                                    className={`relative flex flex-col items-center flex-1 ${canNavigate ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                    onClick={() => canNavigate && setCurrentStep(step.number)}
                                >
                                    {hasNext && (
                                        <div className="absolute top-6 left-1/2 w-full h-0.5 -z-10">
                                            <div className="absolute inset-0 bg-gray-300" />
                                            {segmentCompleted && (
                                                <div className="absolute inset-0 bg-teal-600" />
                                            )}
                                        </div>
                                    )}

                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${isCompleted
                                            ? 'bg-teal-600 text-white shadow-lg shadow-teal-200'
                                            : isCurrent
                                                ? 'bg-white border-2 border-teal-600 text-teal-600 shadow-lg'
                                                : 'bg-white border-2 border-gray-200 text-gray-400'
                                            }`}
                                    >
                                        {isCompleted ? <Check className="h-6 w-6" /> : <step.icon className="h-6 w-6" />}
                                    </div>

                                    <div className="text-center">
                                        <p className={`text-sm font-semibold ${isCurrent ? 'text-teal-600' : 'text-gray-600'}`}>
                                            {step.title}
                                        </p>
                                        <p className="text-xs text-gray-500 hidden sm:block">{step.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Step Content */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur">
                    <CardContent className="p-8">
                        {/* Step 1: Property Details */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Details</h2>
                                    <p className="text-gray-600">Enter the basic information about your property</p>
                                </div>

                                <div className="grid gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Property Title *</Label>
                                        <Input
                                            id="title"
                                            value={propertyDetails.title}
                                            onChange={(e) => {
                                                setPropertyDetails({ ...propertyDetails, title: e.target.value });
                                                if (errors.title) setErrors({ ...errors, title: '' });
                                            }}
                                            placeholder="e.g. Modern 3 Bedroom Apartment"
                                            className={errors.title ? 'border-red-300' : ''}
                                        />
                                        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="property_type">Property Type *</Label>
                                            <Select
                                                onValueChange={(value) => {
                                                    setPropertyDetails({ ...propertyDetails, property_type: value });
                                                    if (errors.property_type) setErrors({ ...errors, property_type: '' });
                                                }}
                                                value={propertyDetails.property_type}
                                            >
                                                <SelectTrigger className={`w-full ${errors.property_type ? 'border-red-300' : ''}`}>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="apartment">Apartment</SelectItem>
                                                    <SelectItem value="house">House</SelectItem>
                                                    <SelectItem value="commercial">Commercial</SelectItem>
                                                    <SelectItem value="land">Land</SelectItem>
                                                    <SelectItem value="duplex">Duplex</SelectItem>
                                                    <SelectItem value="warehouse">Warehouse</SelectItem>
                                                    <SelectItem value="bungalow">Bungalow</SelectItem>
                                                    <SelectItem value="terrace">Terrace</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.property_type && <p className="text-sm text-red-500">{errors.property_type}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="listing_purpose">Listing Purpose *</Label>
                                            <Select
                                                onValueChange={(value) => setPropertyDetails({ ...propertyDetails, listing_purpose: value })}
                                                value={propertyDetails.listing_purpose}
                                            >
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="sale">For Sale</SelectItem>
                                                    <SelectItem value="rent">For Rent</SelectItem>
                                                    <SelectItem value="lease">For Lease</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="price">Price *</Label>
                                            <Input
                                                id="price"
                                                type="number"
                                                value={propertyDetails.price}
                                                onChange={(e) => {
                                                    setPropertyDetails({ ...propertyDetails, price: e.target.value });
                                                    if (errors.price) setErrors({ ...errors, price: '' });
                                                }}
                                                placeholder="e.g. 250000"
                                                className={errors.price ? 'border-red-300' : ''}
                                            />
                                            {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="currency">Currency</Label>
                                            <Select
                                                onValueChange={(value) => setPropertyDetails({ ...propertyDetails, currency: value })}
                                                value={propertyDetails.currency}
                                            >
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue />
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

                                    <div className="space-y-2">
                                        <Label htmlFor="address">Street Address *</Label>
                                        <Input
                                            id="address"
                                            value={propertyDetails.address}
                                            onChange={(e) => {
                                                setPropertyDetails({ ...propertyDetails, address: e.target.value });
                                                if (errors.address) setErrors({ ...errors, address: '' });
                                            }}
                                            placeholder="e.g. 123 Main Street"
                                            className={errors.address ? 'border-red-300' : ''}
                                        />
                                        {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="city">City *</Label>
                                            <Input
                                                id="city"
                                                value={propertyDetails.city}
                                                onChange={(e) => {
                                                    setPropertyDetails({ ...propertyDetails, city: e.target.value });
                                                    if (errors.city) setErrors({ ...errors, city: '' });
                                                }}
                                                placeholder="e.g. Lagos"
                                                className={errors.city ? 'border-red-300' : ''}
                                            />
                                            {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="state">State *</Label>
                                            <Input
                                                id="state"
                                                value={propertyDetails.state}
                                                onChange={(e) => {
                                                    setPropertyDetails({ ...propertyDetails, state: e.target.value });
                                                    if (errors.state) setErrors({ ...errors, state: '' });
                                                }}
                                                placeholder="e.g. Lagos State"
                                                className={errors.state ? 'border-red-300' : ''}
                                            />
                                            {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="bedrooms">Bedrooms</Label>
                                            <Input
                                                id="bedrooms"
                                                type="number"
                                                value={propertyDetails.bedrooms}
                                                onChange={(e) => setPropertyDetails({ ...propertyDetails, bedrooms: e.target.value })}
                                                placeholder="e.g. 3"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="bathrooms">Bathrooms</Label>
                                            <Input
                                                id="bathrooms"
                                                type="number"
                                                value={propertyDetails.bathrooms}
                                                onChange={(e) => setPropertyDetails({ ...propertyDetails, bathrooms: e.target.value })}
                                                placeholder="e.g. 2"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="year_built">Year Built</Label>
                                            <Input
                                                id="year_built"
                                                type="number"
                                                value={propertyDetails.year_built}
                                                onChange={(e) => setPropertyDetails({ ...propertyDetails, year_built: e.target.value })}
                                                placeholder="e.g. 2020"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="square_feet">Square Meter (Interior)</Label>
                                            <Input
                                                id="square_feet"
                                                type="number"
                                                value={propertyDetails.square_feet}
                                                onChange={(e) => setPropertyDetails({ ...propertyDetails, square_feet: e.target.value })}
                                                placeholder="e.g. 1200"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="lot_size">Plot Size (sq m)</Label>
                                            <Input
                                                id="lot_size"
                                                type="number"
                                                value={propertyDetails.lot_size}
                                                onChange={(e) => setPropertyDetails({ ...propertyDetails, lot_size: e.target.value })}
                                                placeholder="e.g. 1500"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description *</Label>
                                        <Textarea
                                            id="description"
                                            rows={5}
                                            value={propertyDetails.description}
                                            onChange={(e) => {
                                                setPropertyDetails({ ...propertyDetails, description: e.target.value });
                                                if (errors.description) setErrors({ ...errors, description: '' });
                                            }}
                                            placeholder="Describe the property features and highlights..."
                                            className={errors.description ? 'border-red-300' : ''}
                                        />
                                        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                                    </div>
                                </div>

                                <div className="flex justify-end pt-6 border-t">
                                    <Button
                                        onClick={handleStep1Submit}
                                        className="bg-teal-600 cursor-pointer hover:bg-teal-700 px-8"
                                    >
                                        Continue
                                        <ChevronRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        )}


                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Files</h2>
                                    <p className="text-gray-600">Add photos, videos, and documents for your property</p>
                                </div>

                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Supported formats: PDF, PNG, JPG, JPEG, MP3, MP4. Max file size: 10MB per file.
                                    </AlertDescription>
                                </Alert>

                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-400 transition-colors">
                                    <input
                                        type="file"
                                        multiple
                                        accept=".pdf,.png,.jpg,.jpeg,.mp3,.mp4"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <label htmlFor="file-upload" className="cursor-pointer">
                                        <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                        <p className="text-lg font-medium text-gray-700 mb-2">
                                            Click to upload or drag and drop
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            PDF, PNG, JPG, JPEG, MP3, MP4 (max 10MB each)
                                        </p>
                                    </label>
                                </div>

                                {selectedFiles.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-gray-900">Uploaded Files ({selectedFiles.length})</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {selectedFiles.map((file: any, index: number) => {
                                                const isImage = file.type.startsWith('image/');
                                                const isVideo = file.type.startsWith('video/');
                                                const isAudio = file.type.startsWith('audio/');
                                                const isPdf = file.type === 'application/pdf';

                                                return (
                                                    <div key={index} className="relative group">
                                                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                                            {isImage && (
                                                                <img
                                                                    src={URL.createObjectURL(file)}
                                                                    alt={file.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            )}
                                                            {isVideo && (
                                                                <VideoPreview file={file} className="w-full h-full object-cover" />
                                                            )}
                                                            {isAudio && (
                                                                <div className="flex items-center justify-center h-full">
                                                                    <Music className="h-12 w-12 text-gray-400" />
                                                                </div>
                                                            )}
                                                            {isPdf && (
                                                                <div className="flex items-center justify-center h-full">
                                                                    <FileText className="h-12 w-12 text-gray-400" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => removeFile(index)}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                        <p className="text-xs text-gray-600 mt-2 truncate">{file.name}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between pt-6 border-t">
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentStep(1)}
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back
                                    </Button>
                                    <Button
                                        onClick={handleStep2Submit}
                                        className="bg-teal-600 hover:bg-teal-700 px-8"
                                    >
                                        Continue
                                        <ChevronRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Features */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Features</h2>
                                    <p className="text-gray-600">Select amenities and features available</p>
                                </div>

                                <div className="grid gap-6">
                                    <div className="space-y-2">
                                        <Label>Negotiable</Label>
                                        <Select
                                            onValueChange={(value) => setFeaturesData({ ...featuresData, negotiable: value })}
                                            value={featuresData.negotiable}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="yes">Yes</SelectItem>
                                                <SelectItem value="no">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-base font-semibold">Amenities</Label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="furnished"
                                                    checked={featuresData.furnished}
                                                    onCheckedChange={(checked) => setFeaturesData({ ...featuresData, furnished: checked })}
                                                />
                                                <label htmlFor="furnished" className="text-sm font-medium cursor-pointer">
                                                    Furnished
                                                </label>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="pet_friendly"
                                                    checked={featuresData.pet_friendly}
                                                    onCheckedChange={(checked) => setFeaturesData({ ...featuresData, pet_friendly: checked })}
                                                />
                                                <label htmlFor="pet_friendly" className="text-sm font-medium cursor-pointer">
                                                    Pet Friendly
                                                </label>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="parking"
                                                    checked={featuresData.parking_available}
                                                    onCheckedChange={(checked) => setFeaturesData({ ...featuresData, parking_available: checked })}
                                                />
                                                <label htmlFor="parking" className="text-sm font-medium cursor-pointer">
                                                    Parking Available
                                                </label>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="pool"
                                                    checked={featuresData.swimming_pool}
                                                    onCheckedChange={(checked) => setFeaturesData({ ...featuresData, swimming_pool: checked })}
                                                />
                                                <label htmlFor="pool" className="text-sm font-medium cursor-pointer">
                                                    Swimming Pool
                                                </label>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="garden"
                                                    checked={featuresData.garden}
                                                    onCheckedChange={(checked) => setFeaturesData({ ...featuresData, garden: checked })}
                                                />
                                                <label htmlFor="garden" className="text-sm font-medium cursor-pointer">
                                                    Garden
                                                </label>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="water"
                                                    checked={featuresData.water_supply}
                                                    onCheckedChange={(checked) => setFeaturesData({ ...featuresData, water_supply: checked })}
                                                />
                                                <label htmlFor="water" className="text-sm font-medium cursor-pointer">
                                                    Water Supply
                                                </label>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="security"
                                                    checked={featuresData.security}
                                                    onCheckedChange={(checked) => setFeaturesData({ ...featuresData, security: checked })}
                                                />
                                                <label htmlFor="security" className="text-sm font-medium cursor-pointer">
                                                    Security
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label>Electricity Proximity</Label>
                                            <Select
                                                onValueChange={(value) => setFeaturesData({ ...featuresData, electricity_proximity: value })}
                                                value={featuresData.electricity_proximity}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="close">Close</SelectItem>
                                                    <SelectItem value="moderate">Moderate</SelectItem>
                                                    <SelectItem value="far">Far</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Road Network</Label>
                                            <Select
                                                onValueChange={(value) => setFeaturesData({ ...featuresData, road_network: value })}
                                                value={featuresData.road_network}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="excellent">Excellent</SelectItem>
                                                    <SelectItem value="good">Good</SelectItem>
                                                    <SelectItem value="fair">Fair</SelectItem>
                                                    <SelectItem value="poor">Poor</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Development Level</Label>
                                            <Select
                                                onValueChange={(value) => setFeaturesData({ ...featuresData, development_level: value })}
                                                value={featuresData.development_level}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="high">High</SelectItem>
                                                    <SelectItem value="moderate">Moderate</SelectItem>
                                                    <SelectItem value="low">Low</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="additional_features">Additional Features</Label>
                                        <Textarea
                                            id="additional_features"
                                            rows={4}
                                            value={featuresData.additional_features}
                                            onChange={(e) => setFeaturesData({ ...featuresData, additional_features: e.target.value })}
                                            placeholder="List any additional features or amenities..."
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-between pt-6 border-t">
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentStep(2)}
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back
                                    </Button>
                                    <Button
                                        onClick={handleStep3Submit}
                                        className="bg-teal-600 hover:bg-teal-700 px-8"
                                    >
                                        Continue
                                        <ChevronRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Location/Coordinates */}
                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Location Coordinates</h2>
                                    <p className="text-gray-600">Add GPS coordinates for precise location (Optional)</p>
                                </div>

                                <Alert>
                                    <MapPin className="h-4 w-4" />
                                    <AlertDescription>
                                        You can add multiple coordinates to mark property boundaries or key locations.
                                    </AlertDescription>
                                </Alert>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="latitude">Latitude</Label>
                                        <Input
                                            id="latitude"
                                            type="number"
                                            step="any"
                                            value={newCoordinate.latitude}
                                            onChange={(e) => setNewCoordinate({ ...newCoordinate, latitude: e.target.value })}
                                            placeholder="e.g. 6.5244"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="longitude">Longitude</Label>
                                        <Input
                                            id="longitude"
                                            type="number"
                                            step="any"
                                            value={newCoordinate.longitude}
                                            onChange={(e) => setNewCoordinate({ ...newCoordinate, longitude: e.target.value })}
                                            placeholder="e.g. 3.3792"
                                        />
                                    </div>
                                </div>

                                <Button
                                    onClick={handleAddCoordinate}
                                    variant="outline"
                                    className="w-full"
                                >
                                    <MapPin className="h-4 w-4 mr-2" />
                                    Add Coordinate
                                </Button>

                                {coordinates.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-gray-900">Added Coordinates ({coordinates.length})</h3>
                                        <div className="space-y-2">
                                            {coordinates.map((coord: any, index: any) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center space-x-3">
                                                        <MapPin className="h-4 w-4 text-teal-600" />
                                                        <div>
                                                            <p className="text-sm font-medium">Coordinate {index + 1}</p>
                                                            <p className="text-xs text-gray-600">
                                                                Lat: {coord.latitude}, Lng: {coord.longitude}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeCoordinate(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between pt-6 border-t">
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentStep(3)}
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back
                                    </Button>
                                    <Button
                                        onClick={handleStep4Submit}
                                        className="bg-teal-600 hover:bg-teal-700 px-8"
                                    >
                                        Continue
                                        <ChevronRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 5: Review & Publish */}
                        {currentStep === 5 && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Publish</h2>
                                    <p className="text-gray-600">Review your listing before publishing</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h3 className="font-semibold text-lg mb-4">Property Details</h3>
                                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <dt className="text-gray-600">Title</dt>
                                                <dd className="font-medium">{propertyDetails.title}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-gray-600">Type</dt>
                                                <dd className="font-medium capitalize">{propertyDetails.property_type}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-gray-600">Price</dt>
                                                <dd className="font-medium">{propertyDetails.currency} {propertyDetails.price}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-gray-600">Purpose</dt>
                                                <dd className="font-medium capitalize">{propertyDetails.listing_purpose}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-gray-600">Location</dt>
                                                <dd className="font-medium">{propertyDetails.city}, {propertyDetails.state}</dd>
                                            </div>
                                            {propertyDetails.bedrooms && (
                                                <div>
                                                    <dt className="text-gray-600">Bedrooms/Bathrooms</dt>
                                                    <dd className="font-medium">{propertyDetails.bedrooms} / {propertyDetails.bathrooms}</dd>
                                                </div>
                                            )}
                                        </dl>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h3 className="font-semibold text-lg mb-4">Files</h3>
                                        <p className="text-sm text-gray-600">{selectedFiles.length} file(s) uploaded</p>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h3 className="font-semibold text-lg mb-4">Features</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                                            {featuresData.furnished && <span className="text-green-600">✓ Furnished</span>}
                                            {featuresData.pet_friendly && <span className="text-green-600">✓ Pet Friendly</span>}
                                            {featuresData.parking_available && <span className="text-green-600">✓ Parking</span>}
                                            {featuresData.swimming_pool && <span className="text-green-600">✓ Pool</span>}
                                            {featuresData.garden && <span className="text-green-600">✓ Garden</span>}
                                            {featuresData.water_supply && <span className="text-green-600">✓ Water Supply</span>}
                                            {featuresData.security && <span className="text-green-600">✓ Security</span>}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h3 className="font-semibold text-lg mb-4">Coordinates</h3>
                                        <p className="text-sm text-gray-600">
                                            {coordinates.length > 0 ? `${coordinates.length} coordinate(s) added` : 'No coordinates added'}
                                        </p>
                                    </div>
                                </div>

                                <Alert className="bg-amber-50 border-amber-200">
                                    <AlertCircle className="h-4 w-4 text-amber-600" />
                                    <AlertDescription className="text-amber-800">
                                        Once published, your listing will be visible to potential buyers/renters. Make sure all information is accurate.
                                    </AlertDescription>
                                </Alert>

                                <div className="flex justify-between pt-6 border-t">
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentStep(4)}
                                        disabled={loading}
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back
                                    </Button>
                                    <Button
                                        onClick={handleFinalPublish}
                                        className="bg-teal-600 cursor-pointer hover:bg-teal-700 px-8"
                                        disabled={loading}
                                    >
                                        {loading ? 'Publishing...' : 'Publish Listing'}
                                        <CheckCircle className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ListingManagement;