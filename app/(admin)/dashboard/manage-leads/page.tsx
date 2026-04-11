"use client"
import {
    Form,
    FormItem,
    FormLabel,
    FormDescription,
    FormMessage,
} from "@/components/ui/form";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import api from "@/config/apiClient";
import DashboardLayout from "../DashboardLayout";
import { Button } from "@/components/ui/button";
import {
    RefreshCw, UserPlus, Search, Edit, Trash2, Users,
    ChevronLeft, ChevronRight, FileText, Building2, Phone, MapPin, Mail, User,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const leadFormSchema = z.object({
    full_name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    phone_number: z.string().optional(),
    address: z.string().optional(),
    company_name: z.string().optional(),
    notes: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

const defaultValues: Partial<LeadFormValues> = {
    full_name: "",
    email: "",
    phone_number: "",
    address: "",
    company_name: "",
    notes: "",
};

interface Lead {
    id: number;
    full_name: string;
    email: string;
    phone_number?: string;
    address?: string;
    company_name?: string;
    notes?: string;
    created_at: string;
}

const ITEMS_PER_PAGE = 10;

const SectionHeader = ({
    icon: Icon,
    title,
    description,
}: {
    icon: React.ElementType;
    title: string;
    description: string;
}) => (
    <div className="flex items-start gap-3">
        <div className="mt-0.5 w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 text-teal-600" />
        </div>
        <div>
            <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
    </div>
);

const FieldInput = ({
    label,
    placeholder,
    type = "text",
    error,
    registration,
    colSpan,
}: {
    label: string;
    placeholder: string;
    type?: string;
    error?: string;
    registration: any;
    colSpan?: string;
}) => (
    <div className={colSpan}>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</label>
        <input
            type={type}
            placeholder={placeholder}
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 rounded-xl h-10 px-3 text-sm text-slate-800 placeholder:text-slate-400 transition-all"
            {...registration}
        />
        {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
    </div>
);

const LeadsManagementPage = () => {
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);
    const [status, setStatus] = useState<any>(null);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showLeadDialog, setShowLeadDialog] = useState(false);
    const [leadToDelete, setLeadToDelete] = useState<number | null>(null);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const form = useForm<LeadFormValues>({
        resolver: zodResolver(leadFormSchema),
        defaultValues,
    });

    const { register, setValue, reset, formState: { errors } } = form;

    useEffect(() => { fetchLeads(); }, []);

    // Reset to page 1 on search
    useEffect(() => { setCurrentPage(1); }, [searchQuery]);

    const fetchLeads = async () => {
        setFetchLoading(true);
        try {
            const response = await api.get('/notifications/leads/', {
                headers: { Authorization: `Token ${token}` },
            });
            setLeads(response.data.data || response.data || []);
        } catch (error) {
            console.error("Error fetching leads:", error);
            setStatus({ success: false, message: "Failed to fetch leads. Please try again." });
        } finally {
            setFetchLoading(false);
        }
    };

    const handleAddLead = async (values: LeadFormValues) => {
        setLoading(true);
        setStatus(null);
        try {
            if (editingLead) {
                await api.put(`/notifications/lead/update/${editingLead.id}/`, values, {
                    headers: { Authorization: `Token ${token}` },
                });
            } else {
                await api.post('/notifications/create-lead/', values, {
                    headers: { Authorization: `Token ${token}` },
                });
            }
            setStatus({ success: true, message: editingLead ? "Lead updated successfully!" : "Lead added successfully!" });
            reset(defaultValues);
            setEditingLead(null);
            setShowLeadDialog(false);
            fetchLeads();
        } catch (error: any) {
            setStatus({
                success: false,
                message: error.response?.data?.message || `Failed to ${editingLead ? 'update' : 'add'} lead. Please try again.`,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEditLead = (lead: Lead) => {
        setEditingLead(lead);
        Object.keys(lead).forEach((key) => {
            if (key in defaultValues) setValue(key as keyof LeadFormValues, lead[key as keyof Lead] as any);
        });
        setShowLeadDialog(true);
    };

    const handleCloseDialog = () => {
        setShowLeadDialog(false);
        setEditingLead(null);
        reset(defaultValues);
        setStatus(null);
    };

    const handleDeleteLead = async () => {
        if (!leadToDelete) return;
        setLoading(true);
        try {
            await api.delete(`/notifications/lead/delete/${leadToDelete}/`, {
                headers: { Authorization: `Token ${token}` },
            });
            setStatus({ success: true, message: "Lead deleted successfully!" });
            fetchLeads();
        } catch (error) {
            setStatus({ success: false, message: "Failed to delete lead. Please try again." });
        } finally {
            setLoading(false);
            setShowDeleteDialog(false);
            setLeadToDelete(null);
        }
    };

    const filteredLeads = leads.filter(lead =>
        lead.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
    const paginatedLeads = filteredLeads.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <DashboardLayout
            title="Leads Management"
            description="Add and manage your leads and contacts"
        >
            <div className="max-w-6xl mx-auto space-y-2">

                {/* Status Alert */}
                {status && (
                    <div className={`relative overflow-hidden rounded-xl border p-4 mb-6 ${status.success ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
                        <div className={`absolute inset-0 opacity-10 ${status.success ? "bg-gradient-to-br from-emerald-400 to-teal-400" : "bg-gradient-to-br from-rose-400 to-pink-400"}`} />
                        <div className="relative">
                            <h3 className={`font-semibold text-sm mb-0.5 ${status.success ? "text-emerald-900" : "text-rose-900"}`}>
                                {status.success ? "Success" : "Something went wrong"}
                            </h3>
                            <p className={`text-sm ${status.success ? "text-emerald-700" : "text-rose-700"}`}>{status.message}</p>
                        </div>
                    </div>
                )}

                {/* ── Header Section ── */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <SectionHeader
                            icon={Users}
                            title="All Leads"
                            description={`${filteredLeads.length} contact${filteredLeads.length !== 1 ? 's' : ''} in your database`}
                        />
                        <div className="flex flex-col sm:flex-row gap-2">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    placeholder="Search leads…"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-4 w-full sm:w-56 bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 rounded-xl h-10 text-sm text-slate-800 placeholder:text-slate-400 transition-all"
                                />
                            </div>
                            <Button
                                onClick={() => setShowLeadDialog(true)}
                                className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-10 px-4 text-sm font-medium gap-2 shadow-sm cursor-pointer"
                            >
                                <UserPlus className="w-4 h-4" />
                                New Lead
                            </Button>
                        </div>
                    </div>
                </div>

                {/* ── Connector ── */}
                <div className="flex justify-center">
                    <div className="w-px h-4 bg-slate-200" />
                </div>

                {/* ── Table Section ── */}
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    {fetchLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <RefreshCw className="w-6 h-6 animate-spin text-teal-500" />
                        </div>
                    ) : filteredLeads.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                                <Users className="w-6 h-6 text-slate-400" />
                            </div>
                            <h3 className="text-sm font-semibold text-slate-800 mb-1">
                                {searchQuery ? "No leads found" : "No leads yet"}
                            </h3>
                            <p className="text-xs text-slate-500 mb-4">
                                {searchQuery ? "Try adjusting your search terms" : "Add your first lead to get started"}
                            </p>
                            {!searchQuery && (
                                <Button
                                    onClick={() => setShowLeadDialog(true)}
                                    className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-9 px-4 text-sm cursor-pointer"
                                >
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Create New Lead
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-100">
                                            <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide py-3.5 pl-6">Name</TableHead>
                                            <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide py-3.5">Email</TableHead>
                                            <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide py-3.5">Phone</TableHead>
                                            <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide py-3.5">Company</TableHead>
                                            <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide py-3.5">Address</TableHead>
                                            <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide py-3.5">Date Added</TableHead>
                                            <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide py-3.5 pr-6 text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedLeads.map((lead) => (
                                            <TableRow key={lead.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                                                <TableCell className="py-3.5 pl-6">
                                                    <span className="text-sm font-medium text-slate-800">{lead.full_name}</span>
                                                </TableCell>
                                                <TableCell className="py-3.5">
                                                    <a href={`mailto:${lead.email}`} className="text-sm text-teal-600 hover:text-teal-700 hover:underline">
                                                        {lead.email}
                                                    </a>
                                                </TableCell>
                                                <TableCell className="py-3.5">
                                                    <span className="text-sm text-slate-600">{lead.phone_number || <span className="text-slate-300">—</span>}</span>
                                                </TableCell>
                                                <TableCell className="py-3.5">
                                                    <span className="text-sm text-slate-600">{lead.company_name || <span className="text-slate-300">—</span>}</span>
                                                </TableCell>
                                                <TableCell className="py-3.5 max-w-[160px]">
                                                    <span className="text-sm text-slate-600 truncate block">{lead.address || <span className="text-slate-300">—</span>}</span>
                                                </TableCell>
                                                <TableCell className="py-3.5">
                                                    <span className="text-sm text-slate-500">
                                                        {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="py-3.5 pr-6">
                                                    <div className="flex justify-end gap-1">
                                                        <button
                                                            onClick={() => handleEditLead(lead)}
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors cursor-pointer"
                                                        >
                                                            <Edit className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => { setLeadToDelete(lead.id); setShowDeleteDialog(true); }}
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                                        </button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* ── Pagination ── */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                                    <p className="text-xs text-slate-500">
                                        Showing <span className="font-medium text-slate-700">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>–<span className="font-medium text-slate-700">{Math.min(currentPage * ITEMS_PER_PAGE, filteredLeads.length)}</span> of <span className="font-medium text-slate-700">{filteredLeads.length}</span> leads
                                    </p>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                            .reduce<(number | string)[]>((acc, p, idx, arr) => {
                                                if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("…");
                                                acc.push(p);
                                                return acc;
                                            }, [])
                                            .map((p, idx) =>
                                                p === "…" ? (
                                                    <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-xs text-slate-400">…</span>
                                                ) : (
                                                    <button
                                                        key={p}
                                                        onClick={() => setCurrentPage(p as number)}
                                                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${currentPage === p
                                                                ? "bg-teal-600 text-white"
                                                                : "text-slate-600 hover:bg-slate-100"
                                                            }`}
                                                    >
                                                        {p}
                                                    </button>
                                                )
                                            )}
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* ── Add / Edit Lead Dialog ── */}
            <Dialog open={showLeadDialog} onOpenChange={handleCloseDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-slate-900">
                            {editingLead ? "Edit Lead" : "Create New Lead"}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-slate-500">
                            {editingLead ? "Update lead information in the database" : "Add a new contact to your leads database"}
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleAddLead)} className="space-y-4 py-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FieldInput label="Full Name *" placeholder="Enter full name" error={errors.full_name?.message} registration={register("full_name")} />
                                <FieldInput label="Email Address *" placeholder="example@domain.com" type="email" error={errors.email?.message} registration={register("email")} />
                                <FieldInput label="Phone Number" placeholder="+234 800 000 0000" error={errors.phone_number?.message} registration={register("phone_number")} />
                                <FieldInput label="Company Name" placeholder="Enter company name" error={errors.company_name?.message} registration={register("company_name")} />
                                <FieldInput label="Address" placeholder="Enter full address" error={errors.address?.message} registration={register("address")} colSpan="md:col-span-2" />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Notes</label>
                                <textarea
                                    placeholder="Add any additional notes or comments…"
                                    rows={3}
                                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all resize-none"
                                    {...register("notes")}
                                />
                                {errors.notes && <p className="text-xs text-rose-500 mt-1">{errors.notes.message}</p>}
                                <p className="text-xs text-slate-400 mt-1">Optional notes about this lead</p>
                            </div>

                            <DialogFooter className="gap-2 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCloseDialog}
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
                                        <><RefreshCw className="w-4 h-4 animate-spin" />{editingLead ? "Updating…" : "Adding…"}</>
                                    ) : (
                                        <><UserPlus className="w-4 h-4" />{editingLead ? "Update Lead" : "Add Lead"}</>
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="max-w-md rounded-2xl">
                    <DialogHeader>
                        <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center mb-3">
                            <Trash2 className="w-5 h-5 text-rose-500" />
                        </div>
                        <DialogTitle className="text-base font-semibold text-slate-900">Delete Lead</DialogTitle>
                        <DialogDescription className="text-sm text-slate-500">
                            Are you sure you want to delete this lead? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => { setShowDeleteDialog(false); setLeadToDelete(null); }}
                            disabled={loading}
                            className="rounded-xl h-10 text-sm border-slate-200 cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeleteLead}
                            disabled={loading}
                            className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl h-10 text-sm font-medium gap-2 cursor-pointer"
                        >
                            {loading ? (
                                <><RefreshCw className="w-4 h-4 animate-spin" />Deleting…</>
                            ) : (
                                <><Trash2 className="w-4 h-4" />Delete Lead</>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default LeadsManagementPage;