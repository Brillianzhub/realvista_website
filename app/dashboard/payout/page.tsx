"use client"
import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    DollarSign,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    User,
    Calendar,
    Filter,
    Download,
    RefreshCw
} from 'lucide-react';
import DashboardLayout from '../DashboardLayout';

import api from '@/config/apiClient';

// TypeScript interfaces
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

const PayoutRequests: React.FC = () => {
    const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<PayoutRequest[]>([]);
    const [stats, setStats] = useState<Stats>({
        total_requests: 0,
        pending_requests: 0,
        total_amount_requested: 0,
        total_amount_paid: 0
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [alert, setAlert] = useState<AlertState | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [modal, setModal] = useState<ModalState>({
        isOpen: false,
        requestId: null,
        action: null,
        adminNotes: ''
    });
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    // Mock token - replace with your actual token logic
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    // Fetch payout requests on component mount
    useEffect(() => {
        fetchPayoutRequests();
    }, []);

    // Filter requests when filter changes
    useEffect(() => {
        filterRequests();
    }, [payoutRequests, statusFilter]);

    const fetchPayoutRequests = async (): Promise<void> => {
        try {
            setIsLoading(true);
            const response = await api.get('/accounts/referrals/payouts-requests/', {
                headers: {
                    Authorization: `Token ${token}`
                }
            });

            setPayoutRequests(Array.isArray(response.data) ? response.data : []);
            calculateStats(response.data);
        } catch (error) {
            console.error('API Error:', error);
            showAlert('Error fetching payout requests', 'error');
            setPayoutRequests([]);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshData = async (): Promise<void> => {
        setIsRefreshing(true);
        await fetchPayoutRequests();
        setIsRefreshing(false);
        showAlert('Data refreshed successfully!', 'success');
    };

    const calculateStats = (requests: PayoutRequest[]): void => {
        const stats = requests.reduce((acc, request) => {
            acc.total_requests += 1;
            acc.total_amount_requested += parseFloat(request.amount);

            if (request.status === 'pending') {
                acc.pending_requests += 1;
            }

            if (request.status === 'completed' || request.status === 'approved') {
                acc.total_amount_paid += parseFloat(request.amount);
            }

            return acc;
        }, {
            total_requests: 0,
            pending_requests: 0,
            total_amount_requested: 0,
            total_amount_paid: 0
        });

        setStats(stats);
    };

    const filterRequests = (): void => {
        if (statusFilter === 'all') {
            setFilteredRequests(payoutRequests);
        } else {
            setFilteredRequests(payoutRequests.filter(request => request.status === statusFilter));
        }
    };

    const openModal = (requestId: number, action: 'approve' | 'reject'): void => {
        setModal({
            isOpen: true,
            requestId,
            action,
            adminNotes: ''
        });
    };

    const closeModal = (): void => {
        setModal({
            isOpen: false,
            requestId: null,
            action: null,
            adminNotes: ''
        });
    };

    const updateRequestStatus = async (): Promise<void> => {
        if (!modal.requestId || !modal.action) return;

        try {
            setIsProcessing(true);
            const newStatus = modal.action === 'approve' ? 'approved' : 'rejected';
            
            const response = await api.patch(`/accounts/referrals/payouts-requests/${modal.requestId}/`, {
                status: newStatus,
                admin_notes: modal.adminNotes
            }, {
                headers: {
                    Authorization: `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Update the request in state
            setPayoutRequests(prevRequests =>
                prevRequests.map(request =>
                    request.id === modal.requestId ? { ...request, ...response.data } : request
                )
            );

            showAlert(`Payout request ${newStatus} successfully!`, 'success');
            closeModal();
        } catch (error) {
            console.error('API Error:', error);
            showAlert('Error updating payout request', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const showAlert = (message: string, type: 'success' | 'error' | 'info' = 'success'): void => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 5000);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-4 w-4" />;
            case 'approved':
            case 'completed':
                return <CheckCircle2 className="h-4 w-4" />;
            case 'rejected':
                return <XCircle className="h-4 w-4" />;
            case 'processing':
                return <RefreshCw className="h-4 w-4" />;
            default:
                return <AlertCircle className="h-4 w-4" />;
        }
    };

    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'approved':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'processing':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(amount);
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <DashboardLayout
            title="Payout Requests"
            description="Manage and process user payout requests"
        >
            <div className="space-y-6">
                {alert && (
                    <Alert className={`border-l-4 ${alert.type === 'error'
                        ? 'border-red-500 bg-red-50'
                        : alert.type === 'info'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-teal-500 bg-teal-50'
                        }`}>
                        {alert.type === 'error' ? (
                            <AlertCircle className="h-4 w-4" />
                        ) : (
                            <CheckCircle2 className="h-4 w-4" />
                        )}
                        <AlertTitle>
                            {alert.type === 'error' ? 'Error' : alert.type === 'info' ? 'Info' : 'Success'}
                        </AlertTitle>
                        <AlertDescription>{alert.message}</AlertDescription>
                    </Alert>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-teal-100 text-sm font-medium">Total Requests</p>
                                    <p className="text-3xl font-bold">{stats.total_requests}</p>
                                </div>
                                <DollarSign className="h-8 w-8 text-teal-200" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-yellow-100 text-sm font-medium">Pending</p>
                                    <p className="text-3xl font-bold">{stats.pending_requests}</p>
                                </div>
                                <Clock className="h-8 w-8 text-yellow-200" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium">Total Requested</p>
                                    <p className="text-2xl font-bold">{formatCurrency(stats.total_amount_requested)}</p>
                                </div>
                                <DollarSign className="h-8 w-8 text-blue-200" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm font-medium">Total Paid</p>
                                    <p className="text-2xl font-bold">{formatCurrency(stats.total_amount_paid)}</p>
                                </div>
                                <CheckCircle2 className="h-8 w-8 text-green-200" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Card */}
                <Card className="shadow-lg border-0 bg-white/50 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-teal-600 py-4 px-6 to-teal-800 text-white rounded-t-lg">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-2xl">Payout Requests Management</CardTitle>
                                <CardDescription className="text-teal-100 mt-2">
                                    Review and process user payout requests
                                </CardDescription>
                            </div>
                            {/* <div className="flex space-x-2">
                                <Button
                                    onClick={refreshData}
                                    disabled={isRefreshing}
                                    className="bg-white/20 hover:bg-white/30 cursor-pointer text-white border-white/30"
                                >
                                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                    Refresh
                                </Button>
                                <Button
                                    className="bg-white/20 hover:bg-white/30 cursor-pointer text-white border-white/30"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                </Button>
                            </div> */}
                        </div>
                    </CardHeader>

                    <CardContent className="p-6">
                        {/* Filters */}
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <Filter className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700">Filter by status:</span>
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Requests</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Badge variant="secondary" className="bg-teal-100 text-teal-800">
                                {filteredRequests.length} {filteredRequests.length === 1 ? 'request' : 'requests'}
                            </Badge>
                        </div>

                        {/* Requests List */}
                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                            </div>
                        ) : filteredRequests.length === 0 ? (
                            <Card className="text-center py-12 border-dashed border-2 border-gray-300">
                                <CardContent>
                                    <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <p className="text-gray-500 text-lg">No payout requests found</p>
                                    <p className="text-gray-400 text-sm mt-2">
                                        {statusFilter !== 'all' ? `No ${statusFilter} requests at the moment.` : 'All requests will appear here.'}
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {filteredRequests.map((request: any) => (
                                    <Card key={request.id} className="hover:shadow-md transition-shadow duration-200 border-l-4 border-teal-200">
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-gray-500" />
                                                            <span className="font-semibold text-gray-900">
                                                                {request.user.first_name} {request.user.last_name}
                                                            </span>
                                                        </div>
                                                        <Badge
                                                            className={`${getStatusColor(request.status)} border`}
                                                        >
                                                            {getStatusIcon(request.status)}
                                                            <span className="ml-1 capitalize">{request.status}</span>
                                                        </Badge>
                                                        <Badge variant="outline" className="text-xs">
                                                            #{request.reference_number}
                                                        </Badge>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                                        <div>
                                                            <p className="font-medium">Amount Requested</p>
                                                            <p className="text-2xl font-bold text-teal-600">
                                                                {formatCurrency(request.amount)}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">Bank Details</p>
                                                            <p className="text-gray-600">Payment Method: {request.payment_method}</p>
                                                            <p className='text-sm text-gray-600'>{request.account_details}</p>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">Request Date</p>
                                                            <div className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3 text-gray-400" />
                                                                <p className="text-sm">{formatDate(request.created_at)}</p>
                                                            </div>
                                                            {request.processed_date && (
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    Processed: {formatDate(request.created_at)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="mb-4">
                                                        <p className="text-sm text-gray-500 mb-1">User Details</p>
                                                        <p className="text-sm">
                                                            <span className="font-medium">Email:</span> {request.user_email}
                                                        </p>
                                                        <p className="text-sm">
                                                            <span className="font-medium">Username:</span> @{request.user_name}
                                                        </p>
                                                    </div>

                                                    {request.admin_notes && (
                                                        <div className="mb-4 p-3 bg-gray-50 rounded-md">
                                                            <p className="text-sm text-gray-500 mb-1">Admin Notes</p>
                                                            <p className="text-sm">{request.admin_notes}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <Separator className="mb-4" />

                                            {/* Action Buttons - Only for pending and approved */}
                                            {request.status === 'pending' && (
                                                <div className="flex justify-end space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openModal(request.id, 'reject')}
                                                        className="text-red-600 border-red-200 hover:bg-red-50"
                                                    >
                                                        <XCircle className="h-4 w-4 mr-1" />
                                                        Reject
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => openModal(request.id, 'approve')}
                                                        className="bg-gradient-to-r from-teal-600 cursor-pointer to-teal-800 hover:from-teal-700 hover:to-teal-900"
                                                    >
                                                        <CheckCircle2 className="h-4 w-4 mr-1" />
                                                        Approve
                                                    </Button>
                                                </div>
                                            )}

                                            {request.status === 'approved' && (
                                                <div className="flex justify-end space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openModal(request.id, 'reject')}
                                                        className="text-red-600 border-red-200 hover:bg-red-50"
                                                    >
                                                        <XCircle className="h-4 w-4 mr-1" />
                                                        Reject
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Modal for Admin Notes */}
                <Dialog open={modal.isOpen} onOpenChange={closeModal}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {modal.action === 'approve' ? 'Approve' : 'Reject'} Payout Request
                            </DialogTitle>
                            <DialogDescription className=''>
                                Please provide admin notes for this {modal.action === 'approve' ? 'approval' : 'rejection'}.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                            <div>
                                <Label className='mb-2' htmlFor="admin-notes">Admin Notes</Label>
                                <Textarea
                                    id="admin-notes"
                                    placeholder={
                                        modal.action === 'approve' 
                                            ? "e.g., Verified bank details, payment approved" 
                                            : "e.g., Invalid bank details, request rejected"
                                    }
                                    value={modal.adminNotes}
                                    onChange={(e) => setModal(prev => ({ ...prev, adminNotes: e.target.value }))}
                                    rows={4}
                                    className="resize-none"
                                />
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button 
                                variant="outline" 
                                onClick={closeModal}
                                disabled={isProcessing}
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={updateRequestStatus}
                                disabled={isProcessing || !modal.adminNotes.trim()}
                                className={modal.action === 'approve' 
                                    ? "bg-teal-600 cursor-pointer hover:bg-teal-700" 
                                    : "bg-red-600 hover:bg-red-700"
                                }
                            >
                                {isProcessing ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        {modal.action === 'approve' ? (
                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                        ) : (
                                            <XCircle className="h-4 w-4 mr-2" />
                                        )}
                                        {modal.action === 'approve' ? 'Approve' : 'Reject'}
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

export default PayoutRequests;