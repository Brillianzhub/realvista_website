"use client";

import { useState, useEffect } from "react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ListingFormValues, defaultListingFormValues, PropertyListing } from "@/app/types/types";
import {
    Home, Settings, MapPin, CheckCircle, Check,
    ChevronRight, ArrowLeft, AlertCircle, RefreshCw,
    Upload, X, FileText, Music, Trash2,
} from "lucide-react";
import api from "@/config/apiClient";
import { toast } from "sonner";

const STEPS = [
    { number: 1, title: "Details", icon: Home },
    { number: 2, title: "Files", icon: Upload },
    { number: 3, title: "Features", icon: Settings },
    { number: 4, title: "Location", icon: MapPin },
    { number: 5, title: "Review", icon: CheckCircle },
];

interface ListingFormModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (listing: PropertyListing) => void;
    onRefresh?: () => Promise<void>;
    editingListing: PropertyListing | null;
    agentId: number;
    loading?: boolean;
}

const defaultFeatures = {
    negotiable: "no",
    furnished: false,
    pet_friendly: false,
    parking_available: false,
    swimming_pool: false,
    garden: false,
    water_supply: false,
    security: false,
    electricity_proximity: "moderate",
    road_network: "good",
    development_level: "moderate",
    additional_features: "",
};

export const ListingFormModal = ({
    open, onClose, onSubmit, onRefresh, editingListing, agentId,
}: ListingFormModalProps) => {
    const [step, setStep] = useState(1);
    const [completed, setCompleted] = useState<number[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [form, setForm] = useState<ListingFormValues>(defaultListingFormValues);
    const [propertyId, setPropertyId] = useState<number | null>(null);
    const [stepLoading, setStepLoading] = useState(false);
    const [existingCoordinateIds, setExistingCoordinateIds] = useState<number[]>([]);

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [features, setFeatures] = useState(defaultFeatures);
    const [coordinates, setCoordinates] = useState<{ latitude: string; longitude: string }[]>([]);
    const [newCoordinate, setNewCoordinate] = useState({ latitude: "", longitude: "" });

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const authHeader = { Authorization: `Token ${token}` };

    useEffect(() => {
        if (!open) return;
        if (editingListing) {
            setForm({
                title: editingListing.title,
                description: editingListing.description,
                property_type: editingListing.property_type,
                price: String(editingListing.price),
                currency: editingListing.currency,
                listing_purpose: editingListing.listing_purpose,
                category: editingListing.category ?? "",
                address: editingListing.address,
                city: editingListing.city,
                state: editingListing.state,
                zip_code: editingListing.zip_code ?? "",
                availability: editingListing.availability,
                bedrooms: editingListing.bedrooms ? String(editingListing.bedrooms) : "",
                bathrooms: editingListing.bathrooms ? String(editingListing.bathrooms) : "",
                square_feet: editingListing.square_feet ? String(editingListing.square_feet) : "",
                lot_size: editingListing.lot_size ? String(editingListing.lot_size) : "",
                year_built: editingListing.year_built ? String(editingListing.year_built) : "",
                coordinate_url: editingListing.coordinate_url ?? "",
            });
            setPropertyId(editingListing.id);
            setExistingCoordinateIds(
                editingListing.coordinates?.map((c: any) => c.id) ?? []
            );
            setCompleted([1, 2, 3, 4]);
            setStep(1);
        } else {
            setForm(defaultListingFormValues);
            setPropertyId(null);
            setCompleted([]);
            setStep(1);
        }
        setSelectedFiles([]);
        setFeatures(defaultFeatures);
        setCoordinates([]);
        setErrors({});
    }, [open, editingListing]);

    const setF = <K extends keyof ListingFormValues>(key: K, val: ListingFormValues[K]) =>
        setForm((p) => ({ ...p, [key]: val }));

    // ── Validation ────────────────────────────────────────────────
    const validateStep1 = () => {
        const e: Record<string, string> = {};
        if (!form.title.trim()) e.title = "Title is required";
        if (!form.property_type) e.property_type = "Property type is required";
        if (!form.price) e.price = "Price is required";
        if (!form.listing_purpose) e.listing_purpose = "Purpose is required";
        if (!form.address.trim()) e.address = "Address is required";
        if (!form.city.trim()) e.city = "City is required";
        if (!form.state.trim()) e.state = "State is required";
        if (!form.description.trim()) e.description = "Description is required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    // ── Step 1: POST /market/admin-list-property/ or PUT /market/admin-update-property/ ──
    const submitStep1 = async () => {
        if (!validateStep1()) return;
        setStepLoading(true);
        try {
            const payload = {
                agent_id: agentId,
                title: form.title,
                description: form.description,
                property_type: form.property_type,
                price: Number(form.price),
                currency: form.currency,
                listing_purpose: form.listing_purpose,
                category: form.category || undefined,
                availability: form.availability,
                address: form.address,
                city: form.city,
                state: form.state,
                zip_code: form.zip_code || undefined,
                bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
                bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
                square_feet: form.square_feet ? Number(form.square_feet) : undefined,
                lot_size: form.lot_size ? Number(form.lot_size) : 0,
                year_built: form.year_built ? Number(form.year_built) : undefined,
                status: "draft",
            };

            let response;
            if (editingListing && propertyId) {
                response = await api.put(
                    "/market/admin-update-property/",
                    { property_id: propertyId, ...payload },
                    { headers: authHeader }
                );
            } else {
                response = await api.post(
                    "/market/admin-list-property/",
                    payload,
                    { headers: authHeader }
                );
                const result = response.data.data ?? response.data;
                setPropertyId(result.id);
            }

            setCompleted((p) => [...new Set([...p, 1])]);
            setStep(2);
        } catch (error: any) {
            toast.error(
                error.response?.data?.detail ??
                error.response?.data?.message ??
                "Failed to save details. Please try again."
            );
        } finally {
            setStepLoading(false);
        }
    };

    // ── Step 2: POST /market/admin-property-files/upload/ ────────
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        const valid = files.filter((f) => f.size <= 10 * 1024 * 1024);
        if (valid.length < files.length) toast.error("Some files exceed 10MB and were skipped.");
        setSelectedFiles((prev) => [...prev, ...valid]);
    };

    const removeFile = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const submitStep2 = async () => {
        if (!propertyId) { toast.error("Property ID missing."); return; }
        if (selectedFiles.length === 0) {
            setCompleted((p) => [...new Set([...p, 2])]);
            setStep(3);
            return;
        }
        setStepLoading(true);
        try {
            const formData = new FormData();
            formData.append("property", String(propertyId));
            selectedFiles.forEach((file) => formData.append("file", file));

            await api.post("/market/admin-property-files/upload/", formData, {
                headers: { ...authHeader, "Content-Type": "multipart/form-data" },
            });

            setCompleted((p) => [...new Set([...p, 2])]);
            setStep(3);
        } catch (error: any) {
            toast.error(
                error.response?.data?.detail ??
                error.response?.data?.message ??
                "Failed to upload files."
            );
        } finally {
            setStepLoading(false);
        }
    };

    // ── Step 3: POST /market/property/<property_id>/features/ ─────
    const submitStep3 = async () => {
        if (!propertyId) { toast.error("Property ID missing."); return; }
        setStepLoading(true);
        try {
            await api.post(
                `/market/property/${propertyId}/features/`,
                {
                    negotiable: features.negotiable,
                    furnished: features.furnished,
                    pet_friendly: features.pet_friendly,
                    parking_available: features.parking_available,
                    swimming_pool: features.swimming_pool,
                    garden: features.garden,
                    water_supply: features.water_supply,
                    security: features.security,
                    electricity_proximity: features.electricity_proximity,
                    road_network: features.road_network,
                    development_level: features.development_level,
                    ...(features.additional_features
                        ? { additional_features: features.additional_features }
                        : {}),
                },
                { headers: authHeader }
            );
            setCompleted((p) => [...new Set([...p, 3])]);
            setStep(4);
        } catch (error: any) {
            toast.error(
                error.response?.data?.detail ??
                error.response?.data?.message ??
                "Failed to save features."
            );
        } finally {
            setStepLoading(false);
        }
    };

    // ── Step 4: POST /market/property/coordinates/ ────────────────
    const handleAddCoordinate = () => {
        if (!newCoordinate.latitude || !newCoordinate.longitude) {
            toast.error("Please enter both latitude and longitude.");
            return;
        }
        setCoordinates((prev) => [...prev, newCoordinate]);
        setNewCoordinate({ latitude: "", longitude: "" });
    };

    const removeCoordinate = (index: number) => {
        setCoordinates((prev) => prev.filter((_, i) => i !== index));
    };

    const submitStep4 = async () => {
        if (!propertyId) { toast.error("Property ID missing."); return; }

        // Non-edit with no coordinates → just skip
        if (coordinates.length === 0 && !editingListing) {
            setCompleted((p) => [...new Set([...p, 4])]);
            setStep(5);
            return;
        }

        // Edit with no coordinates → still call update to clear existing ones
        if (coordinates.length === 0 && editingListing && existingCoordinateIds.length === 0) {
            setCompleted((p) => [...new Set([...p, 4])]);
            setStep(5);
            return;
        }

        setStepLoading(true);
        try {
            if (editingListing && existingCoordinateIds.length > 0) {
                await api.put(
                    `/market/coordinates/update/`,
                    {
                        property: propertyId,
                        coordinates: coordinates.map((c, i) => ({
                            id: existingCoordinateIds[i] ?? undefined,
                            latitude: Number(c.latitude),
                            longitude: Number(c.longitude),
                        })),
                    },
                    { headers: authHeader }
                );
            } else {
                await api.post(
                    `/market/property/coordinates/`,
                    {
                        property: propertyId,
                        coordinates: coordinates.map((c) => ({
                            latitude: Number(c.latitude),
                            longitude: Number(c.longitude),
                        })),
                    },
                    { headers: authHeader }
                );
            }
            setCompleted((p) => [...new Set([...p, 4])]);
            setStep(5);
        } catch (error: any) {
            toast.error(
                error.response?.data?.detail ??
                error.response?.data?.message ??
                "Failed to save coordinates."
            );
        } finally {
            setStepLoading(false);
        }
    };

    // ── Step 5: Submit final → call onRefresh to sync latest data ─
    const submitFinal = async () => {
        if (!propertyId) { toast.error("Property ID missing."); return; }
        setStepLoading(true);
        try {
            const response = await api.post(
                "/market/properties/change-status/",
                { id: propertyId, status: "published" },
                { headers: authHeader }
            );
            toast.success(editingListing ? "Listing updated!" : "Listing published successfully!");
            onSubmit(response.data.data ?? response.data);

            // Refresh agent data so listings list reflects the latest state
            if (onRefresh) {
                await onRefresh();
            }

            handleClose();
        } catch (error: any) {
            toast.error(
                error.response?.data?.detail ??
                error.response?.data?.message ??
                "Failed to publish listing."
            );
        } finally {
            setStepLoading(false);
        }
    };

    const handleClose = () => {
        if (!editingListing) setPropertyId(null);
        setStep(1);
        setCompleted([]);
        setErrors({});
        setSelectedFiles([]);
        setFeatures(defaultFeatures);
        setCoordinates([]);
        setExistingCoordinateIds([]); // ← missing
        onClose();
    };

    // ── Shared UI helpers ─────────────────────────────────────────
    const StepBar = () => (
        <div className="flex items-center justify-between mb-5">
            {STEPS.map((s, idx) => {
                const done = completed.includes(s.number);
                const cur = step === s.number;
                return (
                    <div key={s.number} className="relative flex flex-col items-center flex-1">
                        {idx < STEPS.length - 1 && (
                            <div className="absolute top-5 left-1/2 w-full h-0.5 -z-10">
                                <div className="absolute inset-0 bg-slate-200" />
                                {idx < step - 1 && <div className="absolute inset-0 bg-teal-500" />}
                            </div>
                        )}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1.5 transition-all ${done ? "bg-teal-600 text-white" :
                            cur ? "bg-white border-2 border-teal-600 text-teal-600" :
                                "bg-white border-2 border-slate-200 text-slate-400"
                            }`}>
                            {done ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                        </div>
                        <p className={`text-xs font-medium hidden sm:block ${cur ? "text-teal-600" : "text-slate-400"}`}>
                            {s.title}
                        </p>
                    </div>
                );
            })}
        </div>
    );

    const Nav = ({ onBack, onNext, nextLabel = "Save & Continue" }: {
        onBack?: () => void;
        onNext: () => void;
        nextLabel?: string;
    }) => (
        <div className="flex justify-between pt-5 border-t border-slate-100 mt-5">
            {onBack
                ? <Button variant="outline" onClick={onBack} disabled={stepLoading}
                    className="rounded-xl h-9 text-sm border-slate-200 gap-1.5 cursor-pointer">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                : <div />
            }
            <Button onClick={onNext} disabled={stepLoading}
                className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-9 px-5 text-sm gap-1.5 cursor-pointer">
                {stepLoading
                    ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving…</>
                    : <>{nextLabel} <ChevronRight className="w-4 h-4" /></>
                }
            </Button>
        </div>
    );

    const SL = ({ children, req }: { children: React.ReactNode; req?: boolean }) => (
        <p className="text-xs font-semibold text-slate-700 mb-1.5">
            {children}{req && <span className="text-rose-400 ml-0.5">*</span>}
        </p>
    );

    const Err = ({ k }: { k: string }) =>
        errors[k] ? <p className="text-xs text-rose-500 mt-1">{errors[k]}</p> : null;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold text-slate-900">
                        {editingListing ? "Edit Listing" : "Add New Listing"}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-slate-500">
                        {editingListing
                            ? "Update the listing details. Each step saves immediately."
                            : "Each step saves as draft. Publish on the final step."}
                    </DialogDescription>
                </DialogHeader>

                {propertyId && !editingListing && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100 -mt-1">
                        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                        <p className="text-xs text-amber-700">
                            Draft saved · ID <span className="font-mono font-semibold">#{propertyId}</span>
                        </p>
                    </div>
                )}

                <StepBar />

                {/* ── STEP 1 — Property Details ─────────────────────── */}
                {step === 1 && (
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <SL req>Property Title</SL>
                            <Input value={form.title}
                                onChange={(e) => { setF("title", e.target.value); if (errors.title) setErrors({ ...errors, title: "" }); }}
                                placeholder="e.g. Modern 3 Bedroom Apartment"
                                className={errors.title ? "border-rose-300" : ""} />
                            <Err k="title" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <SL req>Property Type</SL>
                                <Select value={form.property_type}
                                    onValueChange={(v) => { setF("property_type", v); if (errors.property_type) setErrors({ ...errors, property_type: "" }); }}>
                                    <SelectTrigger className={`w-full ${errors.property_type ? "border-rose-300" : ""}`}>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {["apartment", "house", "commercial", "land", "duplex", "warehouse", "bungalow", "terrace"].map((t) => (
                                            <SelectItem key={t} value={t} className="capitalize">
                                                {t.charAt(0).toUpperCase() + t.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Err k="property_type" />
                            </div>
                            <div className="space-y-1">
                                <SL req>Purpose</SL>
                                <Select value={form.listing_purpose}
                                    onValueChange={(v) => { setF("listing_purpose", v); if (errors.listing_purpose) setErrors({ ...errors, listing_purpose: "" }); }}>
                                    <SelectTrigger className={`w-full ${errors.listing_purpose ? "border-rose-300" : ""}`}>
                                        <SelectValue placeholder="Select purpose" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sale">For Sale</SelectItem>
                                        <SelectItem value="rent">For Rent</SelectItem>
                                        <SelectItem value="lease">For Lease</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Err k="listing_purpose" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <SL req>Price</SL>
                                <Input
                                    value={form.price ? Number(form.price).toLocaleString() : ""}
                                    onChange={(e) => {
                                        const raw = e.target.value.replace(/,/g, "");
                                        if (!isNaN(Number(raw))) {
                                            setF("price", raw);
                                            if (errors.price) setErrors({ ...errors, price: "" });
                                        }
                                    }}
                                    placeholder="e.g. 5,000,000"
                                    className={errors.price ? "border-rose-300" : ""}
                                />
                            </div>
                            <div className="space-y-1">
                                <SL>Currency</SL>
                                <Select value={form.currency} onValueChange={(v) => setF("currency", v)}>
                                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="NGN">NGN (₦)</SelectItem>
                                        <SelectItem value="USD">USD ($)</SelectItem>
                                        <SelectItem value="EUR">EUR (€)</SelectItem>
                                        <SelectItem value="GBP">GBP (£)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <SL req>Street Address</SL>
                            <Input value={form.address}
                                onChange={(e) => { setF("address", e.target.value); if (errors.address) setErrors({ ...errors, address: "" }); }}
                                placeholder="e.g. 123 Main Street"
                                className={errors.address ? "border-rose-300" : ""} />
                            <Err k="address" />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <SL req>City</SL>
                                <Input value={form.city}
                                    onChange={(e) => { setF("city", e.target.value); if (errors.city) setErrors({ ...errors, city: "" }); }}
                                    placeholder="Lagos"
                                    className={errors.city ? "border-rose-300" : ""} />
                                <Err k="city" />
                            </div>
                            <div className="space-y-1">
                                <SL req>State</SL>
                                <Input value={form.state}
                                    onChange={(e) => { setF("state", e.target.value); if (errors.state) setErrors({ ...errors, state: "" }); }}
                                    placeholder="Lagos State"
                                    className={errors.state ? "border-rose-300" : ""} />
                                <Err k="state" />
                            </div>
                            <div className="space-y-1">
                                <SL>ZIP</SL>
                                <Input value={form.zip_code} onChange={(e) => setF("zip_code", e.target.value)} placeholder="100001" />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <SL>Bedrooms</SL>
                                <Input type="number" value={form.bedrooms} onChange={(e) => setF("bedrooms", e.target.value)} placeholder="3" />
                            </div>
                            <div className="space-y-1">
                                <SL>Bathrooms</SL>
                                <Input type="number" step="0.5" value={form.bathrooms} onChange={(e) => setF("bathrooms", e.target.value)} placeholder="2" />
                            </div>
                            <div className="space-y-1">
                                <SL>Year Built</SL>
                                <Input type="number" value={form.year_built} onChange={(e) => setF("year_built", e.target.value)} placeholder="2020" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <SL>Interior (sq m)</SL>
                                <Input type="number" value={form.square_feet} onChange={(e) => setF("square_feet", e.target.value)} placeholder="120" />
                            </div>
                            <div className="space-y-1">
                                <SL>Plot Size (sq m)</SL>
                                <Input type="number" value={form.lot_size} onChange={(e) => setF("lot_size", e.target.value)} placeholder="0" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <SL req>Description</SL>
                            <Textarea rows={4} value={form.description}
                                onChange={(e) => { setF("description", e.target.value); if (errors.description) setErrors({ ...errors, description: "" }); }}
                                placeholder="Describe the property…"
                                className={errors.description ? "border-rose-300" : ""} />
                            <Err k="description" />
                        </div>

                        <Nav onNext={submitStep1} nextLabel="Save & Continue" />
                    </div>
                )}

                {/* ── STEP 2 — Files ────────────────────────────────── */}
                {step === 2 && (
                    <div className="space-y-4">
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-xs">
                                Supported formats: PDF, PNG, JPG, JPEG, MP4. Max 10MB per file. Files are optional.
                            </AlertDescription>
                        </Alert>

                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-teal-400 transition-colors">
                            <input type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.mp4"
                                onChange={handleFileSelect} className="hidden" id="file-upload" />
                            <label htmlFor="file-upload" className="cursor-pointer">
                                <Upload className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                                <p className="text-sm font-medium text-slate-600 mb-1">Click to upload or drag and drop</p>
                                <p className="text-xs text-slate-400">PDF, PNG, JPG, JPEG, MP4 (max 10MB each)</p>
                            </label>
                        </div>

                        {selectedFiles.length > 0 && (
                            <div className="space-y-3">
                                <p className="text-xs font-semibold text-slate-700">
                                    Selected Files ({selectedFiles.length})
                                </p>
                                <div className="grid grid-cols-3 gap-3">
                                    {selectedFiles.map((file, index) => {
                                        const isImage = file.type.startsWith("image/");
                                        const isVideo = file.type.startsWith("video/");
                                        const isAudio = file.type.startsWith("audio/");
                                        return (
                                            <div key={index} className="relative group">
                                                <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                                                    {isImage && (
                                                        <img src={URL.createObjectURL(file)} alt={file.name}
                                                            className="w-full h-full object-cover" />
                                                    )}
                                                    {isVideo && <FileText className="w-8 h-8 text-slate-400" />}
                                                    {isAudio && <Music className="w-8 h-8 text-slate-400" />}
                                                    {!isImage && !isVideo && !isAudio && (
                                                        <FileText className="w-8 h-8 text-slate-400" />
                                                    )}
                                                </div>
                                                <button onClick={() => removeFile(index)}
                                                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <X className="w-3 h-3" />
                                                </button>
                                                <p className="text-xs text-slate-500 mt-1 truncate">{file.name}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <Nav onBack={() => setStep(1)} onNext={submitStep2}
                            nextLabel={selectedFiles.length === 0 ? "Skip & Continue" : "Upload & Continue"} />
                    </div>
                )}

                {/* ── STEP 3 — Features ─────────────────────────────── */}
                {step === 3 && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <SL>Negotiable</SL>
                                <Select value={features.negotiable} onValueChange={(v) => setFeatures({ ...features, negotiable: v })}>
                                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="yes">Yes</SelectItem>
                                        <SelectItem value="no">No</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <SL>Electricity Proximity</SL>
                                <Select value={features.electricity_proximity} onValueChange={(v) => setFeatures({ ...features, electricity_proximity: v })}>
                                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="near">Near</SelectItem>
                                        <SelectItem value="moderate">Moderate</SelectItem>
                                        <SelectItem value="far">Far</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <SL>Road Network</SL>
                                <Select value={features.road_network} onValueChange={(v) => setFeatures({ ...features, road_network: v })}>
                                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="excellent">Excellent</SelectItem>
                                        <SelectItem value="good">Good</SelectItem>
                                        <SelectItem value="fair">Fair</SelectItem>
                                        <SelectItem value="poor">Poor</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <SL>Development Level</SL>
                                <Select value={features.development_level} onValueChange={(v) => setFeatures({ ...features, development_level: v })}>
                                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="moderate">Moderate</SelectItem>
                                        <SelectItem value="low">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <SL>Amenities</SL>
                            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                {([
                                    ["furnished", "Furnished"],
                                    ["pet_friendly", "Pet Friendly"],
                                    ["parking_available", "Parking Available"],
                                    ["swimming_pool", "Swimming Pool"],
                                    ["garden", "Garden"],
                                    ["water_supply", "Water Supply"],
                                    ["security", "Security"],
                                ] as [keyof typeof features, string][]).map(([key, label]) => (
                                    <div key={key} className="flex items-center gap-2">
                                        <Checkbox
                                            id={key}
                                            checked={features[key] as boolean}
                                            onCheckedChange={(v) => setFeatures({ ...features, [key]: v })}
                                        />
                                        <label htmlFor={key} className="text-xs font-medium text-slate-700 cursor-pointer">
                                            {label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <SL>Additional Features</SL>
                            <Textarea rows={3} value={features.additional_features}
                                onChange={(e) => setFeatures({ ...features, additional_features: e.target.value })}
                                placeholder="List any additional features or amenities…" />
                        </div>

                        <Nav onBack={() => setStep(2)} onNext={submitStep3} />
                    </div>
                )}

                {/* ── STEP 4 — Coordinates ─────────────────────────── */}
                {step === 4 && (
                    <div className="space-y-4">
                        <Alert>
                            <MapPin className="h-4 w-4" />
                            <AlertDescription className="text-xs">
                                Add GPS coordinates to mark property boundaries or key locations. This is optional.
                            </AlertDescription>
                        </Alert>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <SL>Latitude</SL>
                                <Input type="number" step="any" value={newCoordinate.latitude}
                                    onChange={(e) => setNewCoordinate({ ...newCoordinate, latitude: e.target.value })}
                                    placeholder="e.g. 6.5244" />
                            </div>
                            <div className="space-y-1">
                                <SL>Longitude</SL>
                                <Input type="number" step="any" value={newCoordinate.longitude}
                                    onChange={(e) => setNewCoordinate({ ...newCoordinate, longitude: e.target.value })}
                                    placeholder="e.g. 3.3792" />
                            </div>
                        </div>

                        <button onClick={handleAddCoordinate}
                            className="w-full rounded-xl border border-slate-200 h-9 text-sm text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors cursor-pointer">
                            <MapPin className="w-4 h-4" /> Add Coordinate
                        </button>

                        {coordinates.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-slate-700">Added ({coordinates.length})</p>
                                {coordinates.map((coord, index) => (
                                    <div key={index} className="flex items-center justify-between px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <div className="flex items-center gap-2.5">
                                            <MapPin className="w-4 h-4 text-teal-500 shrink-0" />
                                            <div>
                                                <p className="text-xs font-medium text-slate-700">Coordinate {index + 1}</p>
                                                <p className="text-xs text-slate-400">
                                                    Lat: {coord.latitude}, Lng: {coord.longitude}
                                                </p>
                                            </div>
                                        </div>
                                        <button onClick={() => removeCoordinate(index)}
                                            className="text-rose-400 hover:text-rose-600 transition-colors cursor-pointer">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <Nav onBack={() => setStep(3)} onNext={submitStep4}
                            nextLabel={coordinates.length === 0 ? "Skip & Continue" : "Save & Continue"} />
                    </div>
                )}

                {/* ── STEP 5 — Review & Publish ─────────────────────── */}
                {step === 5 && (
                    <div className="space-y-4">
                        <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Property Details</p>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div><span className="text-slate-500 text-xs">Title</span><p className="font-medium">{form.title}</p></div>
                                <div><span className="text-slate-500 text-xs">Type</span><p className="font-medium capitalize">{form.property_type}</p></div>
                                <div><span className="text-slate-500 text-xs">Price</span><p className="font-medium">{form.currency} {Number(form.price).toLocaleString()}</p></div>
                                <div><span className="text-slate-500 text-xs">Purpose</span><p className="font-medium capitalize">{form.listing_purpose}</p></div>
                                <div><span className="text-slate-500 text-xs">Location</span><p className="font-medium">{form.city}, {form.state}</p></div>
                                <div><span className="text-slate-500 text-xs">Address</span><p className="font-medium">{form.address}</p></div>
                                {form.bedrooms && (
                                    <div><span className="text-slate-500 text-xs">Beds / Baths</span><p className="font-medium">{form.bedrooms} / {form.bathrooms}</p></div>
                                )}
                                {form.category && (
                                    <div><span className="text-slate-500 text-xs">Category</span><p className="font-medium capitalize">{form.category}</p></div>
                                )}
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Files & Features</p>
                            <p className="text-xs text-slate-600">{selectedFiles.length} file(s) attached</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {(["furnished", "pet_friendly", "parking_available", "swimming_pool", "garden", "water_supply", "security"] as const).map((k) =>
                                    features[k] ? (
                                        <span key={k} className="text-xs bg-teal-50 text-teal-700 border border-teal-100 px-2 py-0.5 rounded-full capitalize">
                                            ✓ {k.replace(/_/g, " ")}
                                        </span>
                                    ) : null
                                )}
                            </div>
                        </div>

                        {coordinates.length > 0 && (
                            <div className="bg-slate-50 rounded-xl p-4">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Coordinates</p>
                                <p className="text-xs text-slate-600">{coordinates.length} coordinate(s) added</p>
                            </div>
                        )}

                        <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-emerald-50 border border-emerald-100">
                            <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                            <p className="text-xs text-emerald-700 leading-relaxed">
                                Clicking <span className="font-semibold">Publish Listing</span> will make this
                                property <span className="font-semibold">live</span> on the platform immediately.
                                If you exit before this step, the listing will be saved as a draft.
                            </p>
                        </div>

                        <div className="flex justify-between pt-5 border-t border-slate-100">
                            <Button variant="outline" onClick={() => setStep(4)} disabled={stepLoading}
                                className="rounded-xl h-9 text-sm border-slate-200 gap-1.5 cursor-pointer">
                                <ArrowLeft className="w-4 h-4" /> Back
                            </Button>
                            <Button onClick={submitFinal} disabled={stepLoading}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-9 px-5 text-sm gap-1.5 cursor-pointer">
                                {stepLoading
                                    ? <><RefreshCw className="w-4 h-4 animate-spin" /> Publishing…</>
                                    : <><CheckCircle className="w-4 h-4" /> Publish Listing</>
                                }
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};