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
    const [errors, setErrors] = useState<any>({});
    const [propertyId, setPropertyId] = useState(null);
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

    const steps = [
        { number: 1, title: "Property Details", icon: Home, description: "Basic information" },
        { number: 2, title: "Upload Files", icon: ImagePlus, description: "Photos & documents" },
        { number: 3, title: "Features", icon: Settings, description: "Amenities & features" },
        { number: 4, title: "Location", icon: MapPin, description: "Add coordinates" },
        { number: 5, title: "Review & Publish", icon: MapPin, description: "Review details & pulish" }
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

    const handleStep1Submit = async () => {
        if (!validateStep1()) return;

        setLoading(true);
        try {
            const payload: any = {
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

            // Only add availability_date if availability is "date"
            if (propertyDetails.availability === "date" && propertyDetails.availability_date) {
                payload.availability_date = propertyDetails.availability_date;
            }

            const response = await api.post("/market/list-property/", payload, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`
                }
            });

            if (response.data) {
                // Store the property ID from response
                setPropertyId(response.data.data.id);
                toast.success("Property details saved successfully!");
                setCompletedSteps([...completedSteps, 1]);
                setCurrentStep(2);
            }
        } catch (error) {
            console.error("Error creating property:", error);
            toast.error("Failed to create property. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    console.log("propertyId", propertyId)

    const handleStep2Submit = async () => {
        if (selectedFiles.length === 0) {
            toast.error("Please add at least one file before proceeding");
            return;
        }

        if (!propertyId) {
            toast.error("Property ID not found. Please go back to step 1.");
            return;
        }

        const allowedTypes = ['pdf', 'png', 'jpg', 'jpeg', 'mp3', 'mp4'];
        const maxFileSize = 10 * 1024 * 1024; // 10MB

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('property', propertyId);

            // Validate and append files
            for (const file of selectedFiles as any) {
                const name = file?.name || `file_${Date.now()}`;
                const extension = name.split('.').pop().toLowerCase();

                if (!allowedTypes.includes(extension)) {
                    toast.error(`File "${name}" is not allowed. Only PDF, JPG, JPEG, MP3, and MP4 files are supported.`);
                    setLoading(false);
                    return;
                }

                if (file.size > maxFileSize) {
                    toast.error(`File "${name}" exceeds the 10MB size limit.`);
                    setLoading(false);
                    return;
                }

                // Determine MIME type
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

            const response = await api.post(`/market/upload-file-market/`, formData, {
                headers: {
                    Authorization: `Token ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (response.data) {
                toast.success("Files uploaded successfully!");
                setCompletedSteps([...completedSteps, 2]);
                setCurrentStep(3);
            }
        } catch (error) {
            console.error("Error uploading files:", error);
            toast.error("Failed to upload files. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleStep3Submit = async () => {
        if (!propertyId) {
            toast.error("Property ID not found. Please go back to step 1.");
            return;
        }

        setLoading(true);
        try {
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

            const response = await api.post(`/market/property/${propertyId}/features/`, payload, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`
                }
            });

            if (response.data) {
                toast.success("Property features updated successfully!");
                setCompletedSteps([...completedSteps, 3]);
                setCurrentStep(4);
            }
        } catch (error) {
            console.error("Error updating features:", error);
            toast.error("Failed to update features. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleStep4Submit = async () => {
        if (!propertyId) {
            toast.error("Property ID not found. Please go back to step 1.");
            return;
        }

        if (coordinates.length === 0) {
            // If no coordinates, just move to review step
            setCompletedSteps([...completedSteps, 4]);
            setCurrentStep(5);
            return;
        }

        setLoading(true);
        try {
            const coordinateData = {
                property: propertyId,
                coordinates: coordinates.map((coord: any) => ({
                    latitude: parseFloat(coord.latitude),
                    longitude: parseFloat(coord.longitude)
                }))
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
                setCompletedSteps([...completedSteps, 4]);
                toast.success("Coordinates saved successfully!");
                setCurrentStep(5);
            }
        } catch (error) {
            console.error("Error adding coordinates:", error);
            toast.error("Failed to add coordinates. Please try again.");
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

    // const handleDragOver = (e) => {
    //     e.preventDefault();
    //     e.stopPropagation();
    // };

    // const handleDrop = (e) => {
    //     e.preventDefault();
    //     e.stopPropagation();

    //     if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    //         const files = Array.from(e.dataTransfer.files);
    //         setSelectedFiles([...selectedFiles, ...files]);
    //     }
    // };

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

                            // Determine connector state for the segment going from this step to the next
                            const hasNext = index < steps.length - 1;
                            const segmentCompleted = index < (currentStep - 1); // full teal up to the previous step

                            return (
                                <div
                                    key={step.number}
                                    className={`relative flex flex-col items-center flex-1 ${canNavigate ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                    onClick={() => canNavigate && setCurrentStep(step.number)}
                                >
                                    {/* Connector from this step to the next (center-to-center) */}
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
                                                    <SelectItem value="villa">Villa</SelectItem>
                                                    <SelectItem value="commercial">Commercial</SelectItem>
                                                    <SelectItem value="land">Land</SelectItem>
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
                                        disabled={loading}
                                        className="bg-teal-600 cursor-pointer hover:bg-teal-700 px-8"
                                    >
                                        {loading ? 'Saving...' : 'Continue'}
                                        <ChevronRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Upload Files */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Files</h2>
                                    <p className="text-gray-600">Add photos, videos, and documents for your property</p>
                                </div>

                                <div
                                    className="border-2 border-dashed border-teal-200 rounded-lg p-12 text-center cursor-pointer hover:bg-teal-50/50 transition-colors"
                                    onClick={() => document.getElementById('file-input')?.click()}
                                >
                                    <Upload className="h-12 w-12 mx-auto text-teal-600 mb-4" />
                                    <p className="text-lg font-medium text-gray-900 mb-2">
                                        Drop files here or click to browse
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Supported: Images (JPG, PNG), Videos (MP4), Audio (MP3), Documents (PDF)
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">Maximum file size: 10MB</p>
                                    <input
                                        id="file-input"
                                        type="file"
                                        multiple
                                        accept="image/*,video/mp4,audio/mp3,.pdf"
                                        className="hidden"
                                        onChange={handleFileSelect}
                                    />
                                </div>

                                {selectedFiles.length > 0 && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-lg font-semibold">
                                                Selected Files ({selectedFiles.length})
                                            </Label>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                            {selectedFiles.map((file: any, index: number) => (
                                                <div key={index} className="relative group">
                                                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                                                        {file.type.startsWith('image/') ? (
                                                            <img
                                                                src={URL.createObjectURL(file)}
                                                                alt={file.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : file.type.startsWith('video/') ? (
                                                            <VideoPreview file={file} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center bg-gray-50">
                                                                <div className="text-center p-4">
                                                                    <FileText className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                                                    <p className="text-xs text-gray-500 truncate">
                                                                        {file.name}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(index)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
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
                                        disabled={loading || selectedFiles.length === 0}
                                        className="bg-teal-600 cursor-pointer hover:bg-teal-700 px-8"
                                    >
                                        {loading ? 'Uploading...' : 'Continue'}
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
                                    <p className="text-gray-600">Specify the amenities and features of your property</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label>Price Negotiable</Label>
                                        <Select
                                            onValueChange={(value) => setFeaturesData({ ...featuresData, negotiable: value })}
                                            value={featuresData.negotiable}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="yes">Yes</SelectItem>
                                                <SelectItem value="no">No</SelectItem>
                                                <SelectItem value="partially">Partially</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-lg font-semibold">Amenities</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {[
                                                { key: 'furnished', label: 'Furnished' },
                                                { key: 'pet_friendly', label: 'Pet Friendly' },
                                                { key: 'parking_available', label: 'Parking' },
                                                { key: 'swimming_pool', label: 'Swimming Pool' },
                                                { key: 'garden', label: 'Garden' },
                                                { key: 'water_supply', label: 'Water Supply' },
                                                { key: 'security', label: 'Security' }
                                            ].map(({ key, label }) => (
                                                <div key={key} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-teal-50/50 transition-colors">
                                                    <Checkbox
                                                        id={key}
                                                        checked={featuresData[key]}
                                                        onCheckedChange={(checked) => setFeaturesData({ ...featuresData, [key]: checked })}
                                                    />
                                                    <Label htmlFor={key} className="cursor-pointer">{label}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-lg font-semibold">Location & Infrastructure</Label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="electricity_proximity">Electricity Proximity</Label>
                                                <Select
                                                    onValueChange={(value) => setFeaturesData({ ...featuresData, electricity_proximity: value })}
                                                    value={featuresData.electricity_proximity}
                                                >
                                                    <SelectTrigger>
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
                                                <Label htmlFor="road_network">Road Network</Label>
                                                <Select
                                                    onValueChange={(value) => setFeaturesData({ ...featuresData, road_network: value })}
                                                    value={featuresData.road_network}
                                                >
                                                    <SelectTrigger>
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
                                                <Label htmlFor="development_level">Development Level</Label>
                                                <Select
                                                    onValueChange={(value) => setFeaturesData({ ...featuresData, development_level: value })}
                                                    value={featuresData.development_level}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="highly_developed">Highly Developed</SelectItem>
                                                        <SelectItem value="moderate">Moderate</SelectItem>
                                                        <SelectItem value="developing">Developing</SelectItem>
                                                        <SelectItem value="undeveloped">Undeveloped</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="additional_features">Additional Features</Label>
                                        <Textarea
                                            id="additional_features"
                                            rows={4}
                                            value={featuresData.additional_features}
                                            onChange={(e) => setFeaturesData({ ...featuresData, additional_features: e.target.value })}
                                            placeholder="Add any other features or amenities not listed above..."
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
                                        disabled={loading}
                                        className="bg-teal-600 cursor-pointer hover:bg-teal-700 px-8"
                                    >
                                        {loading ? 'Saving...' : 'Continue'}
                                        <ChevronRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Location/Coordinates */}
                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Location</h2>
                                    <p className="text-gray-600">Add GPS coordinates for precise location mapping</p>
                                </div>

                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Add multiple coordinates to define the boundary of your property. At least one coordinate is recommended.
                                    </AlertDescription>
                                </Alert>

                                <div className="space-y-4">
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
                                            <p className="text-xs text-gray-500">Range: -90 to 90</p>
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
                                            <p className="text-xs text-gray-500">Range: -180 to 180</p>
                                        </div>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleAddCoordinate}
                                        className="w-full border-teal-200 text-teal-600 hover:bg-teal-50"
                                    >
                                        <MapPin className="h-4 w-4 mr-2" />
                                        Add Coordinate
                                    </Button>
                                </div>

                                {coordinates.length > 0 && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-lg font-semibold">
                                                Added Coordinates ({coordinates.length})
                                            </Label>
                                        </div>
                                        <div className="space-y-2">
                                            {coordinates.map((coord: any, index: number) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between p-4 bg-teal-50/50 border border-teal-100 rounded-lg"
                                                >
                                                    <div className="flex items-center space-x-4">
                                                        <div className="bg-teal-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">
                                                            {index + 1}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">
                                                                Lat: {coord?.latitude}, Lng: {coord?.longitude}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeCoordinate(index)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {coordinates.length === 0 && (
                                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                        <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                        <p className="text-gray-600">No coordinates added yet</p>
                                        <p className="text-sm text-gray-500 mt-1">Add at least one coordinate point above</p>
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
                                        disabled={loading}
                                        className="bg-teal-600 cursor-pointer hover:bg-teal-700 px-8"
                                    >
                                        {loading ? 'Saving...' : 'Continue'}
                                        <CheckCircle className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        )}
                        {currentStep === 5 && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Publish</h2>
                                    <p className="text-gray-600">Review all details before publishing your listing</p>
                                </div>

                                <Alert className="bg-green-50 border-green-200">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <AlertDescription className="text-green-800">
                                        Great job! You've completed all the required steps. Review your listing details below.
                                    </AlertDescription>
                                </Alert>

                                {/* Property Details Summary */}
                                <div className="space-y-4">
                                    <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-6 border border-teal-100">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                            <Home className="h-5 w-5 mr-2 text-teal-600" />
                                            Property Details
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Title</p>
                                                <p className="font-medium text-gray-900">{propertyDetails.title}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Type</p>
                                                <p className="font-medium text-gray-900 capitalize">{propertyDetails.property_type}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Price</p>
                                                <p className="font-medium text-gray-900">
                                                    {propertyDetails.currency} {parseFloat(propertyDetails.price).toLocaleString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Purpose</p>
                                                <p className="font-medium text-gray-900 capitalize">For {propertyDetails.listing_purpose}</p>
                                            </div>
                                            <div className="md:col-span-2">
                                                <p className="text-sm text-gray-600">Location</p>
                                                <p className="font-medium text-gray-900">
                                                    {propertyDetails.address}, {propertyDetails.city}, {propertyDetails.state}
                                                </p>
                                            </div>
                                            {propertyDetails.bedrooms && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Bedrooms</p>
                                                    <p className="font-medium text-gray-900">{propertyDetails.bedrooms}</p>
                                                </div>
                                            )}
                                            {propertyDetails.bathrooms && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Bathrooms</p>
                                                    <p className="font-medium text-gray-900">{propertyDetails.bathrooms}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Files Summary */}
                                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-100">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                            <ImagePlus className="h-5 w-5 mr-2 text-purple-600" />
                                            Uploaded Files
                                        </h3>
                                        <div className="flex items-center space-x-2">
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                            <p className="text-gray-700">
                                                <span className="font-semibold">{selectedFiles.length}</span> file(s) uploaded successfully
                                            </p>
                                        </div>
                                    </div>

                                    {/* Features Summary */}
                                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-100">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                            <Settings className="h-5 w-5 mr-2 text-amber-600" />
                                            Features & Amenities
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {featuresData.furnished && (
                                                <div className="flex items-center space-x-2 text-sm">
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                    <span>Furnished</span>
                                                </div>
                                            )}
                                            {featuresData.parking_available && (
                                                <div className="flex items-center space-x-2 text-sm">
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                    <span>Parking</span>
                                                </div>
                                            )}
                                            {featuresData.swimming_pool && (
                                                <div className="flex items-center space-x-2 text-sm">
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                    <span>Swimming Pool</span>
                                                </div>
                                            )}
                                            {featuresData.garden && (
                                                <div className="flex items-center space-x-2 text-sm">
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                    <span>Garden</span>
                                                </div>
                                            )}
                                            {featuresData.security && (
                                                <div className="flex items-center space-x-2 text-sm">
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                    <span>Security</span>
                                                </div>
                                            )}
                                            {featuresData.water_supply && (
                                                <div className="flex items-center space-x-2 text-sm">
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                    <span>Water Supply</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-4">
                                            <p className="text-sm text-gray-600">Price Negotiable</p>
                                            <p className="font-medium text-gray-900 capitalize">{featuresData.negotiable}</p>
                                        </div>
                                    </div>

                                    {/* Coordinates Summary */}
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-100">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                            <MapPin className="h-5 w-5 mr-2 text-green-600" />
                                            Location Coordinates
                                        </h3>
                                        {coordinates.length > 0 ? (
                                            <div className="flex items-center space-x-2">
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                                <p className="text-gray-700">
                                                    <span className="font-semibold">{coordinates.length}</span> coordinate point(s) added
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="text-gray-600 text-sm">No coordinates added</p>
                                        )}
                                    </div>
                                </div>

                                <Alert className="bg-blue-50 border-blue-200">
                                    <AlertCircle className="h-4 w-4 text-blue-600" />
                                    <AlertDescription className="text-blue-800">
                                        Once published, your listing will be visible to potential buyers/renters. You can edit it later from your profile.
                                    </AlertDescription>
                                </Alert>

                                <div className="flex justify-between pt-6 border-t">
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentStep(4)}
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            toast.success("Property published successfully!");
                                            router.push("/profile");
                                        }}
                                        className="bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 cursor-pointer px-8"
                                    >
                                        Publish Listing
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