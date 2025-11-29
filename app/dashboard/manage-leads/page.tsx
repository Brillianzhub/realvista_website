"use client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormDescription,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { RefreshCw, UserPlus, Search, Edit, Trash2, Users } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const leadFormSchema = z.object({
    full_name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
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

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const form = useForm<LeadFormValues>({
        resolver: zodResolver(leadFormSchema),
        defaultValues,
    });

    const { register, setValue, reset, formState: { errors } } = form;

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        setFetchLoading(true);
        try {
            const response = await api.get('/notifications/leads/', {
                headers: {
                    Authorization: `Token ${token}`,
                },
            });

            setLeads(response.data.data || response.data || []);
            console.log(response.data);
        } catch (error) {
            console.error("Error fetching leads:", error);
            setStatus({
                success: false,
                message: "Failed to fetch leads. Please try again.",
            });
        } finally {
            setFetchLoading(false);
        }
    };

    const handleAddLead = async (values: LeadFormValues) => {
        setLoading(true);
        setStatus(null);

        try {
            let response;

            if (editingLead) {
                // Update existing lead
                response = await api.put(
                    `/notifications/lead/update/${editingLead.id}/`,
                    values,
                    {
                        headers: {
                            Authorization: `Token ${token}`,
                        },
                    }
                );
            } else {
                // Create new lead
                response = await api.post(
                    '/notifications/create-lead/',
                    values,
                    {
                        headers: {
                            Authorization: `Token ${token}`,
                        },
                    }
                );
            }

            console.log("API response:", response.data);

            setStatus({
                success: true,
                message: editingLead
                    ? "Lead updated successfully!"
                    : "Lead added successfully!",
            });

            // Reset form and close dialog
            reset(defaultValues);
            setEditingLead(null);
            setShowLeadDialog(false);
            fetchLeads();
        } catch (error: any) {
            setStatus({
                success: false,
                message: error.response?.data?.message ||
                    `Failed to ${editingLead ? 'update' : 'add'} lead. Please try again.`,
            });
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditLead = (lead: Lead) => {
        setEditingLead(lead);
        // Populate form with lead data
        Object.keys(lead).forEach((key) => {
            if (key in defaultValues) {
                setValue(key as keyof LeadFormValues, lead[key as keyof Lead] as any);
            }
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
                headers: {
                    Authorization: `Token ${token}`,
                },
            });

            setStatus({
                success: true,
                message: "Lead deleted successfully!",
            });

            fetchLeads();
        } catch (error) {
            setStatus({
                success: false,
                message: "Failed to delete lead. Please try again.",
            });
            console.error("Error deleting lead:", error);
        } finally {
            setLoading(false);
            setShowDeleteDialog(false);
            setLeadToDelete(null);
        }
    };

    const filteredLeads = leads.filter(lead => {
        const matchesSearch = lead.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.company_name?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSearch;
    });

    return (
        <DashboardLayout
            title="Leads Management"
            description="Add and manage your leads and contacts"
        >
            <div className="space-y-6">
                {/* Status Alert */}
                {status && (
                    <Alert variant={status.success ? "default" : "destructive"}>
                        <AlertTitle>{status.success ? "Success" : "Error"}</AlertTitle>
                        <AlertDescription>{status.message}</AlertDescription>
                    </Alert>
                )}

                {/* Leads List */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <CardTitle>All Leads</CardTitle>
                                <CardDescription className="mt-1.5">
                                    Manage and view all contacts in your database
                                </CardDescription>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <div className="relative flex-1 sm:min-w-[200px]">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search leads..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                                <Button onClick={() => setShowLeadDialog(true)} className="cursor-pointer">
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Create New Lead
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {fetchLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : filteredLeads.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">
                                    {searchQuery ? "No leads found" : "No leads yet"}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {searchQuery
                                        ? "Try adjusting your search"
                                        : "Add your first lead to get started"}
                                </p>
                                {!searchQuery && (
                                    <Button onClick={() => setShowLeadDialog(true)}>
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Create New Lead
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="rounded-md border overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Phone</TableHead>
                                            <TableHead>Company</TableHead>
                                            <TableHead>Address</TableHead>
                                            <TableHead>Date Added</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredLeads.map((lead) => (
                                            <TableRow key={lead.id}>
                                                <TableCell className="font-medium">{lead.full_name}</TableCell>
                                                <TableCell>
                                                    <a
                                                        href={`mailto:${lead.email}`}
                                                        className="text-primary hover:underline"
                                                    >
                                                        {lead.email}
                                                    </a>
                                                </TableCell>
                                                <TableCell>{lead.phone_number || '-'}</TableCell>
                                                <TableCell>{lead.company_name || '-'}</TableCell>
                                                <TableCell className="max-w-xs truncate">{lead.address || '-'}</TableCell>
                                                <TableCell>
                                                    {new Date(lead.created_at).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEditLead(lead)}
                                                            className="cursor-pointer"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setLeadToDelete(lead.id);
                                                                setShowDeleteDialog(true);
                                                            }}
                                                            className="cursor-pointer"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Add/Edit Lead Dialog */}
                <Dialog open={showLeadDialog} onOpenChange={handleCloseDialog}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingLead ? 'Edit Lead' : 'Create New Lead'}</DialogTitle>
                            <DialogDescription>
                                {editingLead
                                    ? 'Update lead information in the database'
                                    : 'Add lead contact information to your database'}
                            </DialogDescription>
                        </DialogHeader>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleAddLead)} className="space-y-4">
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {/* Full Name */}
                                        <FormItem>
                                            <FormLabel>Full Name *</FormLabel>
                                            <Input
                                                placeholder="Enter full name"
                                                {...register("full_name")}
                                            />
                                            {errors.full_name && (
                                                <FormMessage>{errors.full_name.message}</FormMessage>
                                            )}
                                        </FormItem>

                                        {/* Email */}
                                        <FormItem>
                                            <FormLabel>Email Address *</FormLabel>
                                            <Input
                                                type="email"
                                                placeholder="example@domain.com"
                                                {...register("email")}
                                            />
                                            {errors.email && (
                                                <FormMessage>{errors.email.message}</FormMessage>
                                            )}
                                        </FormItem>

                                        {/* Phone Number */}
                                        <FormItem>
                                            <FormLabel>Phone Number</FormLabel>
                                            <Input
                                                placeholder="+234 800 000 0000"
                                                {...register("phone_number")}
                                            />
                                            {errors.phone_number && (
                                                <FormMessage>{errors.phone_number.message}</FormMessage>
                                            )}
                                        </FormItem>

                                        {/* Company Name */}
                                        <FormItem>
                                            <FormLabel>Company Name</FormLabel>
                                            <Input
                                                placeholder="Enter company name"
                                                {...register("company_name")}
                                            />
                                            {errors.company_name && (
                                                <FormMessage>{errors.company_name.message}</FormMessage>
                                            )}
                                        </FormItem>

                                        {/* Address */}
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Address</FormLabel>
                                            <Input
                                                placeholder="Enter full address"
                                                {...register("address")}
                                            />
                                            {errors.address && (
                                                <FormMessage>{errors.address.message}</FormMessage>
                                            )}
                                        </FormItem>
                                    </div>

                                    {/* Notes */}
                                    <FormItem>
                                        <FormLabel>Notes</FormLabel>
                                        <Textarea
                                            placeholder="Add any additional notes or comments..."
                                            rows={4}
                                            {...register("notes")}
                                        />
                                        {errors.notes && (
                                            <FormMessage>{errors.notes.message}</FormMessage>
                                        )}
                                        <FormDescription>
                                            Optional notes about this lead
                                        </FormDescription>
                                    </FormItem>
                                </div>

                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleCloseDialog}
                                        className="cursor-pointer"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={loading} className="cursor-pointer">
                                        {loading ? (
                                            <>
                                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                {editingLead ? 'Updating...' : 'Adding...'}
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="mr-2 h-4 w-4" />
                                                {editingLead ? 'Update Lead' : 'Add Lead'}
                                            </>
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Lead</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete this lead? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowDeleteDialog(false);
                                    setLeadToDelete(null);
                                }}
                                disabled={loading}
                                className="cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteLead}
                                className="cursor-pointer"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Lead
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
};

export default LeadsManagementPage;