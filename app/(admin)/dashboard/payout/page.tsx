"use client"
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
    DollarSign, CheckCircle2, XCircle, Clock, AlertCircle,
    User, Calendar, Filter, Download, RefreshCw, TrendingUp,
    CreditCard, Hash, Mail, AtSign, FileText,
} from 'lucide-react';
import DashboardLayout from '../DashboardLayout';
import api from '@/config/apiClient';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PayoutRequest {
    id: number;
    user: number;
    user_email: string;
    user_name: string;
    amount: string;
    payment_method: string;
    account_details: string;
    status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
    created_at: string;
    processed_at: string | null;
    admin_notes: string | null;
    reference_number?: string;
    processed_date?: string;
}

interface AlertState {
    message: string;
    type: 'success' | 'error' | 'info';
}

interface Stats {
    total_requests: number;
    pending_requests: number;
    total_amount_requested: number;
    total_amount_paid: number;
}

interface ModalState {
    isOpen: boolean;
    requestId: number | null;
    action: 'approve' | 'reject' | null;
    adminNotes: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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

const StatCard = ({
    label,
    value,
    icon: Icon,
    color,
}: {
    label: string;
    value: string | number;
    icon: React.ElementType;
    color: 'teal' | 'amber' | 'blue' | 'emerald';
}) => {
    const colors = {
        teal: { bg: 'bg-teal-50', icon: 'bg-teal-100 text-teal-600', label: 'text-teal-600', value: 'text-teal-800' },
        amber: { bg: 'bg-amber-50', icon: 'bg-amber-100 text-amber-600', label: 'text-amber-600', value: 'text-amber-800' },
        blue: { bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-600', label: 'text-blue-600', value: 'text-blue-800' },
        emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600', label: 'text-emerald-600', value: 'text-emerald-800' },
    };
    const c = colors[color];
    return (
        <div className={`${c.bg} rounded-2xl border border-white p-5 flex items-center gap-4`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${c.icon}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className={`text-xs font-medium ${c.label}`}>{label}</p>
                <p className={`text-xl font-bold ${c.value} mt-0.5`}>{value}</p>
            </div>
        </div>
    );
};

const statusConfig: Record<string, { label: string; classes: string }> = {
    pending: { label: 'Pending', classes: 'bg-amber-50 text-amber-700 border-amber-100' },
    approved: { label: 'Approved', classes: 'bg-blue-50 text-blue-700 border-blue-100' },
    completed: { label: 'Completed', classes: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    rejected: { label: 'Rejected', classes: 'bg-rose-50 text-rose-700 border-rose-100' },
    processing: { label: 'Processing', classes: 'bg-purple-50 text-purple-700 border-purple-100' },
};

const StatusBadge = ({ status }: { status: string }) => {
    const cfg = statusConfig[status] ?? { label: status, classes: 'bg-slate-100 text-slate-600 border-slate-200' };
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${cfg.classes}`}>
            {status === 'pending' && <Clock className="w-3 h-3" />}
            {status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
            {status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
            {status === 'rejected' && <XCircle className="w-3 h-3" />}
            {status === 'processing' && <RefreshCw className="w-3 h-3" />}
            {cfg.label}
        </span>
    );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);

const formatDate = (dateString: string): string =>
    new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

// ─── Page ─────────────────────────────────────────────────────────────────────

const PayoutRequests: React.FC = () => {
    const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<PayoutRequest[]>([]);
    const [stats, setStats] = useState<Stats>({
        total_requests: 0, pending_requests: 0,
        total_amount_requested: 0, total_amount_paid: 0,
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [alert, setAlert] = useState<AlertState | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [userData, setUserData] = useState<any>(null);
    const [modal, setModal] = useState<ModalState>({
        isOpen: false, requestId: null, action: null, adminNotes: '',
    });
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    useEffect(() => {
        try {
            const stored = localStorage.getItem('userData');
            if (stored) setUserData(JSON.parse(stored));
        } catch { }
    }, []);

    useEffect(() => { fetchPayoutRequests(); }, []);
    useEffect(() => {
        setFilteredRequests(
            statusFilter === 'all' ? payoutRequests : payoutRequests.filter(r => r.status === statusFilter)
        );
    }, [payoutRequests, statusFilter]);

    const fetchPayoutRequests = async (): Promise<void> => {
        setIsLoading(true);
        try {
            const response = await api.get('/accounts/referrals/payouts-requests/', {
                headers: { Authorization: `Token ${token}` },
            });
            const data: PayoutRequest[] = Array.isArray(response.data) ? response.data : [];
            setPayoutRequests(data);
            setStats(data.reduce((acc, r) => {
                acc.total_requests += 1;
                acc.total_amount_requested += parseFloat(r.amount);
                if (r.status === 'pending') acc.pending_requests += 1;
                if (r.status === 'completed' || r.status === 'approved') acc.total_amount_paid += parseFloat(r.amount);
                return acc;
            }, { total_requests: 0, pending_requests: 0, total_amount_requested: 0, total_amount_paid: 0 }));
        } catch {
            showAlert('Error fetching payout requests', 'error');
            setPayoutRequests([]);
        } finally {
            setIsLoading(false);
        }
    };

    const updateRequestStatus = async (): Promise<void> => {
        if (!modal.requestId || !modal.action) return;
        setIsProcessing(true);
        try {
            const newStatus = modal.action === 'approve' ? 'approved' : 'rejected';
            const response = await api.patch(
                `/accounts/referrals/payouts-requests/${modal.requestId}/`,
                { status: newStatus, admin_notes: modal.adminNotes },
                { headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' } }
            );
            setPayoutRequests(prev => prev.map(r => r.id === modal.requestId ? { ...r, ...response.data } : r));
            showAlert(`Payout request ${newStatus} successfully!`, 'success');
            closeModal();
        } catch {
            showAlert('Error updating payout request', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const showAlert = (message: string, type: 'success' | 'error' | 'info' = 'success'): void => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 5000);
    };

    const openModal = (requestId: number, action: 'approve' | 'reject') =>
        setModal({ isOpen: true, requestId, action, adminNotes: '' });

    const closeModal = () =>
        setModal({ isOpen: false, requestId: null, action: null, adminNotes: '' });

    return (
        <DashboardLayout title="Payout Requests" description="Manage and process user payout requests">
            <div className="max-w-6xl mx-auto space-y-2">

                {/* ── Status Alert ── */}
                {alert && (
                    <div className={`relative overflow-hidden rounded-xl border p-4 mb-2 ${alert.type === 'error' ? 'bg-rose-50 border-rose-200'
                            : alert.type === 'info' ? 'bg-blue-50 border-blue-200'
                                : 'bg-emerald-50 border-emerald-200'
                        }`}>
                        <div className={`absolute inset-0 opacity-10 ${alert.type === 'error' ? 'bg-gradient-to-br from-rose-400 to-pink-400'
                                : alert.type === 'info' ? 'bg-gradient-to-br from-blue-400 to-indigo-400'
                                    : 'bg-gradient-to-br from-emerald-400 to-teal-400'
                            }`} />
                        <div className="relative flex items-start gap-2">
                            {alert.type === 'error'
                                ? <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                                : <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />}
                            <div>
                                <h3 className={`font-semibold text-sm mb-0.5 ${alert.type === 'error' ? 'text-rose-900'
                                        : alert.type === 'info' ? 'text-blue-900'
                                            : 'text-emerald-900'
                                    }`}>
                                    {alert.type === 'error' ? 'Something went wrong' : alert.type === 'info' ? 'Info' : 'Success'}
                                </h3>
                                <p className={`text-sm ${alert.type === 'error' ? 'text-rose-700'
                                        : alert.type === 'info' ? 'text-blue-700'
                                            : 'text-emerald-700'
                                    }`}>{alert.message}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard label="Total Requests" value={stats.total_requests} icon={DollarSign} color="teal" />
                    <StatCard label="Pending" value={stats.pending_requests} icon={Clock} color="amber" />
                    <StatCard label="Amount Requested" value={formatCurrency(stats.total_amount_requested)} icon={TrendingUp} color="blue" />
                    <StatCard label="Total Paid" value={formatCurrency(stats.total_amount_paid)} icon={CheckCircle2} color="emerald" />
                </div>

                {/* ── Connector ── */}
                <div className="flex justify-center">
                    <div className="w-px h-4 bg-slate-200" />
                </div>

                {/* ── Header Card ── */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <SectionHeader
                            icon={DollarSign}
                            title="Payout Requests"
                            description={`${filteredRequests.length} request${filteredRequests.length !== 1 ? 's' : ''} ${statusFilter !== 'all' ? `· ${statusFilter}` : ''}`}
                        />
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="bg-slate-50 border border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 rounded-xl h-10 w-40 text-sm text-slate-700 transition-all">
                                        <SelectValue placeholder="Filter status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Requests</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-10 px-4 text-sm font-medium gap-2 shadow-sm cursor-pointer">
                                <Download className="w-4 h-4" />Export
                            </Button>
                        </div>
                    </div>
                </div>

                {/* ── Connector ── */}
                <div className="flex justify-center">
                    <div className="w-px h-4 bg-slate-200" />
                </div>

                {/* ── Requests List ── */}
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <span className="w-6 h-6 border-2 border-teal-200 border-t-teal-500 rounded-full animate-spin" />
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                                <DollarSign className="w-6 h-6 text-slate-400" />
                            </div>
                            <h3 className="text-sm font-semibold text-slate-800 mb-1">No payout requests found</h3>
                            <p className="text-xs text-slate-500">
                                {statusFilter !== 'all' ? `No ${statusFilter} requests at the moment.` : 'All requests will appear here.'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {filteredRequests.map((request: any) => (
                                <div key={request.id} className="p-5 hover:bg-slate-50/60 transition-colors">

                                    {/* Top row: user + status + ref */}
                                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                                                <User className="w-3.5 h-3.5 text-slate-500" />
                                            </div>
                                            <span className="text-sm font-semibold text-slate-800">
                                                {request.user?.first_name} {request.user?.last_name}
                                            </span>
                                        </div>
                                        <StatusBadge status={request.status} />
                                        {request.reference_number && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                                                <Hash className="w-3 h-3" />{request.reference_number}
                                            </span>
                                        )}
                                    </div>

                                    {/* Details grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
                                        {/* Amount */}
                                        <div className="bg-teal-50 rounded-xl p-3 border border-teal-100">
                                            <p className="text-xs text-teal-600 font-medium mb-0.5">Amount Requested</p>
                                            <p className="text-xl font-bold text-teal-700">{formatCurrency(parseFloat(request.amount))}</p>
                                        </div>

                                        {/* Bank Details */}
                                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                            <p className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1">
                                                <CreditCard className="w-3 h-3" />Bank Details
                                            </p>
                                            <p className="text-xs font-semibold text-slate-700">{request.payment_method}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{request.account_details}</p>
                                        </div>

                                        {/* Dates */}
                                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                            <p className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />Dates
                                            </p>
                                            <p className="text-xs text-slate-700">Requested: {formatDate(request.created_at)}</p>
                                            {request.processed_date && (
                                                <p className="text-xs text-slate-500 mt-0.5">Processed: {formatDate(request.processed_date)}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* User details row */}
                                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-3 flex-wrap">
                                        <span className="flex items-center gap-1">
                                            <Mail className="w-3 h-3" />{request.user_email}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <AtSign className="w-3 h-3" />{request.user_name}
                                        </span>
                                    </div>

                                    {/* Admin notes */}
                                    {request.admin_notes && (
                                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-3">
                                            <p className="text-xs font-medium text-amber-700 flex items-center gap-1 mb-1">
                                                <FileText className="w-3 h-3" />Admin Notes
                                            </p>
                                            <p className="text-xs text-amber-800">{request.admin_notes}</p>
                                            {userData?.email && (
                                                <p className="text-xs text-amber-600 mt-1">By: {userData.email}</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Action buttons */}
                                    {request.status === 'pending' && (
                                        <>
                                            <Separator className="mb-3" />
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openModal(request.id, 'reject')}
                                                    className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 hover:border-rose-300 transition-all cursor-pointer"
                                                >
                                                    <XCircle className="w-3.5 h-3.5" />Reject
                                                </button>
                                                <button
                                                    onClick={() => openModal(request.id, 'approve')}
                                                    className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 transition-all cursor-pointer"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" />Approve
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Approve / Reject Dialog ── */}
            <Dialog open={modal.isOpen} onOpenChange={closeModal}>
                <DialogContent className="max-w-md rounded-2xl">
                    <DialogHeader>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${modal.action === 'approve' ? 'bg-teal-50' : 'bg-rose-50'}`}>
                            {modal.action === 'approve'
                                ? <CheckCircle2 className="w-5 h-5 text-teal-600" />
                                : <XCircle className="w-5 h-5 text-rose-500" />}
                        </div>
                        <DialogTitle className="text-base font-semibold text-slate-900">
                            {modal.action === 'approve' ? 'Approve' : 'Reject'} Payout Request
                        </DialogTitle>
                        <DialogDescription className="text-sm text-slate-500">
                            Please provide admin notes for this {modal.action === 'approve' ? 'approval' : 'rejection'}.
                        </DialogDescription>
                    </DialogHeader>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Admin Notes</label>
                        <textarea
                            placeholder={modal.action === 'approve'
                                ? "e.g., Verified bank details, payment approved"
                                : "e.g., Invalid bank details, request rejected"}
                            value={modal.adminNotes}
                            onChange={(e) => setModal(prev => ({ ...prev, adminNotes: e.target.value }))}
                            rows={4}
                            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all resize-none"
                        />
                    </div>

                    <DialogFooter className="gap-2 pt-2">
                        <Button
                            variant="outline"
                            onClick={closeModal}
                            disabled={isProcessing}
                            className="rounded-xl h-10 text-sm border-slate-200 cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={updateRequestStatus}
                            disabled={isProcessing || !modal.adminNotes.trim()}
                            className={`rounded-xl h-10 text-sm font-medium gap-2 cursor-pointer ${modal.action === 'approve'
                                    ? 'bg-teal-600 hover:bg-teal-700 text-white'
                                    : 'bg-rose-500 hover:bg-rose-600 text-white'
                                }`}
                        >
                            {isProcessing ? (
                                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Processing…</>
                            ) : modal.action === 'approve' ? (
                                <><CheckCircle2 className="w-4 h-4" />Approve</>
                            ) : (
                                <><XCircle className="w-4 h-4" />Reject</>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default PayoutRequests