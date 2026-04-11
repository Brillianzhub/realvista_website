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
import { RefreshCw, UserPlus, Edit } from "lucide-react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Agent, AgentFormValues, CONTACT_METHODS } from "@/app/types/types";
import { FieldWrapper, inputClass } from "@/lib/AgentUi";

const agentSchema = z.object({
    first_name: z.string().min(1, "First name is required."),
    name: z.string().min(1, "Last name is required."),   // API field for last name
    email: z.string().email("Enter a valid email address."),
    phone_number: z.string().optional(),
    whatsapp_number: z.string().optional(),
    agency_name: z.string().optional(),
    agency_address: z.string().optional(),
    experience_years: z.coerce.number().min(0).max(60).optional(),
    preferred_contact_mode: z.enum(["whatsapp", "phone", "email"]).optional(),
    bio: z.string().optional(),
});

type AgentFormSchema = z.infer<typeof agentSchema>;

const defaultValues: AgentFormSchema = {
    first_name: "",
    name: "",
    email: "",
    phone_number: "",
    whatsapp_number: "",
    agency_name: "",
    agency_address: "",
    experience_years: undefined,
    preferred_contact_mode: "whatsapp",
    bio: "",
};

interface AgentFormModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: AgentFormValues) => Promise<void>;
    editingAgent: Agent | null;
    loading: boolean;
}

export const AgentFormModal = ({
    open,
    onClose,
    onSubmit,
    editingAgent,
    loading,
}: AgentFormModalProps) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(agentSchema),
        defaultValues,
    });

    useEffect(() => {
        if (!open) return;
        if (editingAgent) {
            // agent.user = email from API response
            // first_name / name are not on the Agent response type —
            // pre-fill what we have and let the admin correct if needed
            reset({
                first_name: editingAgent.first_name,
                name: editingAgent.last_name,
                email: editingAgent.user,
                phone_number: editingAgent.phone_number ?? "",
                whatsapp_number: editingAgent.whatsapp_number ?? "",
                agency_name: editingAgent.agency_name ?? "",
                agency_address: editingAgent.agency_address ?? "",
                experience_years: editingAgent.experience_years,
                preferred_contact_mode: editingAgent.preferred_contact_mode ?? "whatsapp",
                bio: editingAgent.bio ?? "",
            });
        } else {
            reset(defaultValues);
        }
    }, [editingAgent, open]);

    const handleClose = () => {
        reset(defaultValues);
        onClose();
    };

    const handleFormSubmit: SubmitHandler<AgentFormSchema> = (data) =>
        onSubmit(data as AgentFormValues);

    const sectionLabel = (text: string) => (
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 pt-1">
            {text}
        </p>
    );

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold text-slate-900">
                        {editingAgent ? "Edit Agent" : "Create New Agent"}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-slate-500">
                        {editingAgent
                            ? "Update the agent's profile information."
                            : "Add a new agent to your team."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5 py-2">

                    {sectionLabel("Personal Information")}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FieldWrapper label="First Name" error={errors.first_name?.message} required>
                            <input
                                placeholder="First Name"
                                className={inputClass}
                                {...register("first_name")}
                            />
                        </FieldWrapper>
                        <FieldWrapper label="Last Name" error={errors.name?.message} required>
                            <input
                                placeholder="Last Name"
                                className={inputClass}
                                {...register("name")}
                            />
                        </FieldWrapper>
                        <FieldWrapper
                            label="Email Address"
                            error={errors.email?.message}
                            required
                            colSpan="md:col-span-2"
                        >
                            <input
                                type="email"
                                placeholder="agent@example.com"
                                // Lock email when editing — changing it would affect the user account
                                disabled={!!editingAgent}
                                className={`${inputClass} disabled:opacity-60 disabled:cursor-not-allowed`}
                                {...register("email")}
                            />
                        </FieldWrapper>
                    </div>

                    {sectionLabel("Agency Information")}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FieldWrapper label="Phone Number" error={errors.phone_number?.message}>
                            <input
                                placeholder="+234 800 000 0000"
                                className={inputClass}
                                {...register("phone_number")}
                            />
                        </FieldWrapper>
                        <FieldWrapper label="WhatsApp Number" error={errors.whatsapp_number?.message}>
                            <input
                                placeholder="+234 800 000 0000"
                                className={inputClass}
                                {...register("whatsapp_number")}
                            />
                        </FieldWrapper>
                        <FieldWrapper label="Agency Name (optional)" error={errors.agency_name?.message}>
                            <input
                                placeholder="Real Estate Agency"
                                className={inputClass}
                                {...register("agency_name")}
                            />
                        </FieldWrapper>
                        <FieldWrapper label="Agency Address (optional)" error={errors.agency_address?.message}>
                            <input
                                placeholder="14 Marina St, Lagos"
                                className={inputClass}
                                {...register("agency_address")}
                            />
                        </FieldWrapper>
                        <FieldWrapper label="Years of Experience" error={errors.experience_years?.message}>
                            <input
                                type="number"
                                min={0}
                                max={60}
                                placeholder="0"
                                className={inputClass}
                                {...register("experience_years")}
                            />
                        </FieldWrapper>
                        <FieldWrapper
                            label="Preferred Contact Mode"
                            error={errors.preferred_contact_mode?.message}
                        >
                            <select
                                className={`${inputClass} appearance-none cursor-pointer`}
                                {...register("preferred_contact_mode")}
                            >
                                {CONTACT_METHODS.map((m) => (
                                    <option key={m} value={m}>
                                        {m.charAt(0).toUpperCase() + m.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </FieldWrapper>
                    </div>

                    <FieldWrapper label="Professional Bio" error={errors.bio?.message}>
                        <textarea
                            rows={3}
                            placeholder="Tell clients about your experience and expertise…"
                            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all resize-none"
                            {...register("bio")}
                        />
                    </FieldWrapper>

                    <DialogFooter className="gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={loading}
                            className="rounded-xl h-10 text-sm border-slate-200 cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-10 text-sm font-medium gap-2 cursor-pointer"
                        >
                            {loading ? (
                                <><RefreshCw className="w-4 h-4 animate-spin" />{editingAgent ? "Updating…" : "Creating…"}</>
                            ) : editingAgent ? (
                                <><Edit className="w-4 h-4" />Update Agent</>
                            ) : (
                                <><UserPlus className="w-4 h-4" />Create Agent</>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};