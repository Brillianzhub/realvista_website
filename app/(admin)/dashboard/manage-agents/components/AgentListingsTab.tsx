"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Plus, MoreVertical, Edit, Trash2, Home,
    ChevronLeft, ChevronRight, Building2, MapPin,
    BedDouble, Bath, CalendarDays, ImageOff,
} from "lucide-react";
import { PropertyListing } from "@/app/types/types";
import { ListingFormModal } from "./ListingsFormModal";
import { DeleteListingModal } from "./DeleteListingModal";
import { toast } from "sonner";
import api from "@/config/apiClient";

const ITEMS_PER_PAGE = 9;

const purposeBadge = (p: string) => {
    const map: Record<string, string> = {
        sale: "bg-blue-50 text-blue-700 border-blue-100",
        rent: "bg-amber-50 text-amber-700 border-amber-100",
        lease: "bg-violet-50 text-violet-700 border-violet-100",
    };
    return (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${map[p] ?? "bg-slate-100 text-slate-600"}`}>
            {p}
        </span>
    );
};

const statusBadge = (s: string) => {
    const map: Record<string, string> = {
        published: "bg-emerald-50 text-emerald-700 border-emerald-100",
        pending: "bg-amber-50 text-amber-700 border-amber-100",
        draft: "bg-slate-100 text-slate-500 border-slate-200",
        rejected: "bg-rose-50 text-rose-600 border-rose-100",
    };
    const dot: Record<string, string> = {
        published: "bg-emerald-500",
        pending: "bg-amber-400",
        draft: "bg-slate-400",
        rejected: "bg-rose-500",
    };
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${map[s] ?? "bg-slate-100 text-slate-500 border-slate-200"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dot[s] ?? "bg-slate-400"}`} />
            {s ?? "draft"}
        </span>
    );
};

interface AgentListingsTabProps {
    agentId: number;
    initialListings: PropertyListing[];
}

export const AgentListingsTab = ({ agentId, initialListings }: AgentListingsTabProps) => {
    const [listings, setListings] = useState<PropertyListing[]>(initialListings);
    const [actionLoading, setActionLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingListing, setEditingListing] = useState<PropertyListing | null>(null);
    const [listingToDelete, setListingToDelete] = useState<PropertyListing | null>(null);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const authHeader = { Authorization: `Token ${token}` };

    const totalPages = Math.ceil(listings.length / ITEMS_PER_PAGE);
    const paginated = listings.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleStatusChange = async (listing: PropertyListing, newStatus: string) => {
        try {
            await api.put(
                `/market/admin-update-property/`,
                { property_id: listing.id, agent_id: agentId, status: newStatus },
                { headers: authHeader }
            );
            setListings((prev) =>
                prev.map((l) =>
                    l.id === listing.id
                        ? { ...l, status: newStatus as PropertyListing["status"] }
                        : l
                )
            );
            toast.success(`Listing ${newStatus === "published" ? "published" : `moved to ${newStatus}`}.`);
        } catch (error: any) {
            toast.error(
                error.response?.data?.detail ??
                error.response?.data?.message ??
                "Failed to update status."
            );
        }
    };
    // ── Delete ────────────────────────────────────────────────
    const handleDeleteConfirm = async () => {
        if (!listingToDelete) return;
        setActionLoading(true);
        try {
            await api.delete(
                `/market/admin-update-property/`,
                {
                    headers: authHeader,
                    data: { property_id: listingToDelete.id },
                }
            );
            setListings((prev) => prev.filter((l) => l.id !== listingToDelete.id));
            toast.success("Listing deleted.");
            setShowDeleteModal(false);
            setListingToDelete(null);
        } catch (error: any) {
            toast.error(
                error.response?.data?.detail ??
                error.response?.data?.message ??
                "Failed to delete listing."
            );
        } finally {
            setActionLoading(false);
        }
    };

    const openEdit = async (listing: PropertyListing) => {
        await new Promise((r) => setTimeout(r, 200));
        setEditingListing(listing);
        setShowFormModal(true);
    };

    const openDelete = async (listing: PropertyListing) => {
        await new Promise((r) => setTimeout(r, 200));
        setListingToDelete(listing);
        setShowDeleteModal(true);
    };

    return (
        <div className="space-y-4">

            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-teal-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-800">Property Listings</h3>
                        <p className="text-xs text-slate-500">
                            {listings.length} listing{listings.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
                <Button
                    onClick={() => { setEditingListing(null); setShowFormModal(true); }}
                    className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-9 px-4 text-sm font-medium gap-2 cursor-pointer"
                >
                    <Plus className="w-4 h-4" /> Add Listing
                </Button>
            </div>

            {/* ── Empty state ── */}
            {listings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center py-16 text-center px-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                        <Home className="w-6 h-6 text-slate-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-1">No listings yet</h3>
                    <p className="text-xs text-slate-500 mb-4">Add the first property listing for this agent</p>
                    <Button
                        onClick={() => setShowFormModal(true)}
                        className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-9 px-4 text-sm cursor-pointer"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add Listing
                    </Button>
                </div>
            ) : (
                <>
                    {/* ── Card grid ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {paginated.map((listing) => (
                            <div
                                key={listing.id}
                                className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-slate-200 hover:shadow-sm transition-all flex flex-col"
                            >
                                {/* Thumbnail */}
                                <div className="relative h-40 bg-slate-100 shrink-0">
                                    {listing.images?.[0] ? (
                                        <img
                                            src={listing.images[0]}
                                            alt={listing.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center gap-1.5">
                                            <ImageOff className="w-7 h-7 text-slate-300" />
                                            <span className="text-xs text-slate-400">No image</span>
                                        </div>
                                    )}

                                    {/* Status badge */}
                                    <div className="absolute top-2.5 left-2.5">
                                        {statusBadge(listing.status ?? "draft")}
                                    </div>

                                    {/* Three-dot menu */}
                                    <div className="absolute top-2 right-2">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="w-7 h-7 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-white transition-colors cursor-pointer outline-none shadow-sm">
                                                    <MoreVertical className="w-3.5 h-3.5" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-44">
                                                <DropdownMenuItem
                                                    onClick={() => openEdit(listing)}
                                                    className="flex items-center gap-2.5 text-xs font-medium cursor-pointer"
                                                >
                                                    <Edit className="w-3.5 h-3.5" /> Edit Listing
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => openDelete(listing)}
                                                    className="flex items-center gap-2.5 text-xs font-medium text-rose-500 focus:text-rose-600 focus:bg-rose-50 cursor-pointer"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" /> Delete Listing
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                {/* Card body */}
                                <div className="p-4 flex flex-col gap-3 flex-1">
                                    <div>
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2">
                                                {listing.title}
                                            </p>
                                            {listing.listing_purpose && purposeBadge(listing.listing_purpose)}
                                        </div>
                                        <p className="text-xs text-slate-400 capitalize">{listing.property_type}</p>
                                    </div>

                                    <p className="text-base font-bold text-teal-700">
                                        {listing.currency} {Number(listing.price).toLocaleString()}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3 shrink-0" />
                                            {listing.city}, {listing.state}
                                        </span>
                                        {listing.bedrooms && (
                                            <span className="flex items-center gap-1">
                                                <BedDouble className="w-3 h-3 shrink-0" />
                                                {listing.bedrooms} bed
                                            </span>
                                        )}
                                        {listing.bathrooms && (
                                            <span className="flex items-center gap-1">
                                                <Bath className="w-3 h-3 shrink-0" />
                                                {listing.bathrooms} bath
                                            </span>
                                        )}
                                    </div>

                                    {/* ── Status actions ── */}
                                    {(listing.status === "draft" || !listing.status) && (
                                        <button
                                            onClick={() => handleStatusChange(listing, "published")}
                                            className="w-full mt-auto rounded-xl py-2 text-xs font-semibold transition-all cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
                                        >
                                            Publish Listing
                                        </button>
                                    )}

                                    {listing.status === "pending" && (
                                        <div className="mt-auto px-3 py-2 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-600 font-medium text-center">
                                            ⏳ Pending Review
                                        </div>
                                    )}

                                    {listing.status === "rejected" && (
                                        <div className="mt-auto px-3 py-2 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-600 font-medium text-center">
                                            Rejected — Edit to resubmit
                                        </div>
                                    )}

                                    {listing.status === "published" && (
                                        <div className="mt-auto px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-600 font-medium text-center">
                                            ✓ Live on platform
                                        </div>
                                    )}

                                    <div className="flex items-center gap-1 text-xs text-slate-400 pt-2 border-t border-slate-50">
                                        <CalendarDays className="w-3 h-3" />
                                        {new Date(listing.listed_date ?? listing.created_at).toLocaleDateString("en-GB", {
                                            day: "numeric", month: "short", year: "numeric",
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── Pagination ── */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-1 py-2">
                            <p className="text-xs text-slate-500">
                                Showing{" "}
                                <span className="font-medium text-slate-700">
                                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                                </span>–
                                <span className="font-medium text-slate-700">
                                    {Math.min(currentPage * ITEMS_PER_PAGE, listings.length)}
                                </span>{" "}
                                of{" "}
                                <span className="font-medium text-slate-700">{listings.length}</span>
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setCurrentPage(p)}
                                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${currentPage === p
                                            ? "bg-teal-600 text-white"
                                            : "text-slate-600 hover:bg-slate-100"
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ── Modals ── */}
            <ListingFormModal
                open={showFormModal}
                onClose={() => { setShowFormModal(false); setEditingListing(null); }}
                onSubmit={(listing) => {
                    const result = (listing as any).data ?? listing;
                    setListings((prev) =>
                        editingListing
                            ? prev.map((l) => (l.id === result.id ? result : l))
                            : [result, ...prev]
                    );
                }}
                editingListing={editingListing}
                agentId={agentId}
                loading={actionLoading}
            />
            <DeleteListingModal
                open={showDeleteModal}
                onClose={() => { setShowDeleteModal(false); setListingToDelete(null); }}
                onConfirm={handleDeleteConfirm}
                listing={listingToDelete}
                loading={actionLoading}
            />
        </div>
    );
};