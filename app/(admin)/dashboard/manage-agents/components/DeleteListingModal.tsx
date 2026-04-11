"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, RefreshCw } from "lucide-react";
import { PropertyListing } from "@/app/types/types";


interface DeleteListingModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    listing: PropertyListing | null;
    loading: boolean;
}

export const DeleteListingModal = ({
    open,
    onClose,
    onConfirm,
    listing,
    loading,
}: DeleteListingModalProps) => (
    <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center mb-3">
                    <Trash2 className="w-5 h-5 text-rose-500" />
                </div>
                <DialogTitle className="text-base font-semibold text-slate-900">
                    Delete Listing
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-500">
                    Are you sure you want to delete{" "}
                    <span className="font-medium text-slate-700">
                        {listing?.title ?? "this listing"}
                    </span>
                    ? This action cannot be undone.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 pt-2">
                <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={loading}
                    className="rounded-xl h-10 text-sm border-slate-200 cursor-pointer"
                >
                    Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    disabled={loading}
                    className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl h-10 text-sm font-medium gap-2 cursor-pointer"
                >
                    {loading ? (
                        <><RefreshCw className="w-4 h-4 animate-spin" />Deleting…</>
                    ) : (
                        <><Trash2 className="w-4 h-4" />Delete Listing</>
                    )}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);