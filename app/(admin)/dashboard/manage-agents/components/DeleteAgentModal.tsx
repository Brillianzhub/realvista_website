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
import { Trash2, RefreshCw, UserCheck } from "lucide-react";
import { Agent } from "@/app/types/types";

interface DeleteAgentModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    agent: Agent | null;
    loading: boolean;
}

export const DeleteAgentModal = ({
    open,
    onClose,
    onConfirm,
    agent,
    loading,
}: DeleteAgentModalProps) => {
    const isActive = agent?.is_active;
    const agentName = agent ? `${agent.first_name} ${agent.last_name}` : "this agent";

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md rounded-2xl">
                <DialogHeader>
                    <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${isActive ? "bg-rose-50" : "bg-teal-50"
                            }`}
                    >
                        {isActive ? (
                            <Trash2 className="w-5 h-5 text-rose-500" />
                        ) : (
                            <UserCheck className="w-5 h-5 text-teal-500" />
                        )}
                    </div>
                    <DialogTitle className="text-base font-semibold text-slate-900">
                        {isActive ? "Deactivate Agent" : "Activate Agent"}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-slate-500">
                        {isActive ? (
                            <>
                                Are you sure you want to deactivate{" "}
                                <span className="font-medium text-slate-700">{agentName}</span>?
                                They will lose access to the platform until reactivated.
                            </>
                        ) : (
                            <>
                                Are you sure you want to activate{" "}
                                <span className="font-medium text-slate-700">{agentName}</span>?
                                They will regain full access to the platform.
                            </>
                        )}
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
                        className={`text-white rounded-xl h-10 text-sm font-medium gap-2 cursor-pointer ${isActive
                                ? "bg-rose-500 hover:bg-rose-600"
                                : "bg-teal-600 hover:bg-teal-700"
                            }`}
                    >
                        {loading ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                {isActive ? "Deactivating…" : "Activating…"}
                            </>
                        ) : (
                            <>
                                {isActive ? (
                                    <Trash2 className="w-4 h-4" />
                                ) : (
                                    <UserCheck className="w-4 h-4" />
                                )}
                                {isActive ? "Deactivate Agent" : "Activate Agent"}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};