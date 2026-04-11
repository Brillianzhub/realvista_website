"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    BarChart3,
    TrendingUp,
    Mail,
    Eye,
    MousePointerClick,
    XCircle,
    RefreshCw,
    Calendar,
    Download
} from "lucide-react";
import DashboardLayout from "../DashboardLayout";
import { useState, useEffect } from "react";
import api from "@/config/apiClient";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface CampaignAnalytics {
    id: number;
    subject: string;
    sentDate: string;
    recipients: number;
    delivered: number;
    opened: number;
    clicked: number;
    failed: number;
    recipientCategories: string[];
}

const CampaignAnalyticsPage = () => {
    const [loading, setLoading] = useState(false);
    const [analyticsData, setAnalyticsData] = useState<CampaignAnalytics[]>([]);
    const [timeFilter, setTimeFilter] = useState("all");
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    useEffect(() => {
        fetchAnalytics();
    }, [timeFilter]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const response = await api.get('/notifications/newsletter/analytics/', {
                headers: {
                    Authorization: `Token ${token}`,
                },
                params: {
                    time_filter: timeFilter,
                }
            });

            setAnalyticsData(response.data);
        } catch (error) {
            console.error("Error fetching analytics:", error);
            // Fallback to mock data for development
            setAnalyticsData([
                {
                    id: 1,
                    subject: "Summer Property Deals",
                    sentDate: "2025-11-10",
                    recipients: 1250,
                    delivered: 1235,
                    opened: 890,
                    clicked: 234,
                    failed: 15,
                    recipientCategories: ["newsletter", "buyers"]
                },
                {
                    id: 2,
                    subject: "New Luxury Listings",
                    sentDate: "2025-11-08",
                    recipients: 980,
                    delivered: 975,
                    opened: 654,
                    clicked: 187,
                    failed: 5,
                    recipientCategories: ["agents", "portfolio"]
                },
                {
                    id: 3,
                    subject: "Market Trends Report Q4",
                    sentDate: "2025-11-05",
                    recipients: 1450,
                    delivered: 1440,
                    opened: 1020,
                    clicked: 312,
                    failed: 10,
                    recipientCategories: ["newsletter"]
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const calculateRate = (numerator: number, denominator: number): string => {
        return denominator > 0 ? ((numerator / denominator) * 100).toFixed(1) : "0.0";
    };

    const calculateOverallStats = () => {
        const totalRecipients = analyticsData.reduce((sum, item) => sum + item.recipients, 0);
        const totalDelivered = analyticsData.reduce((sum, item) => sum + item.delivered, 0);
        const totalOpened = analyticsData.reduce((sum, item) => sum + item.opened, 0);
        const totalClicked = analyticsData.reduce((sum, item) => sum + item.clicked, 0);
        const totalFailed = analyticsData.reduce((sum, item) => sum + item.failed, 0);

        return {
            totalSent: totalRecipients,
            deliveryRate: calculateRate(totalDelivered, totalRecipients),
            openRate: calculateRate(totalOpened, totalDelivered),
            clickRate: calculateRate(totalClicked, totalOpened),
            failedCount: totalFailed,
        };
    };

    const stats = calculateOverallStats();

    const handleExport = () => {
        // Export analytics data as CSV
        const headers = ['Subject', 'Date', 'Recipients', 'Delivered', 'Open Rate', 'CTR', 'Failed'];
        const rows = analyticsData.map(item => [
            item.subject,
            item.sentDate,
            item.recipients,
            item.delivered,
            `${calculateRate(item.opened, item.delivered)}%`,
            `${calculateRate(item.clicked, item.opened)}%`,
            item.failed
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `campaign-analytics-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <DashboardLayout
            title="Campaign Analytics"
            description="Track performance metrics for your email campaigns"
        >
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                            <Mail className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalSent.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Across {analyticsData.length} campaigns
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.deliveryRate}%</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Successfully delivered
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.openRate}%</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Average across campaigns
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
                            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.clickRate}%</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Click-through rate
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Failed</CardTitle>
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-destructive">{stats.failedCount}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Delivery failures
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Campaigns Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Campaign Performance
                                </CardTitle>
                                <CardDescription className="mt-1.5">
                                    Detailed metrics for each newsletter campaign
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-3">
                                <Select value={timeFilter} onValueChange={setTimeFilter}>
                                    <SelectTrigger className="w-[180px]">
                                        <Calendar className="mr-2 h-4 w-4" />
                                        <SelectValue placeholder="Select period" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Time</SelectItem>
                                        <SelectItem value="7days">Last 7 Days</SelectItem>
                                        <SelectItem value="30days">Last 30 Days</SelectItem>
                                        <SelectItem value="90days">Last 90 Days</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={fetchAnalytics}
                                    disabled={loading}
                                >
                                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                    Refresh
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleExport}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export CSV
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : analyticsData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
                                <p className="text-sm text-muted-foreground">
                                    Send your first newsletter to see analytics here
                                </p>
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Campaign</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Recipients</TableHead>
                                            <TableHead className="text-right">Delivered</TableHead>
                                            <TableHead className="text-right">Opened</TableHead>
                                            <TableHead className="text-right">Clicked</TableHead>
                                            <TableHead className="text-right">Failed</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {analyticsData.map((item) => {
                                            const deliveryRate = calculateRate(item.delivered, item.recipients);
                                            const openRate = calculateRate(item.opened, item.delivered);
                                            const clickRate = calculateRate(item.clicked, item.opened);

                                            return (
                                                <TableRow key={item.id}>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{item.subject}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {item.recipientCategories.join(', ')}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(item.sentDate).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-medium">{item.recipients.toLocaleString()}</span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex flex-col items-end">
                                                            <span className="font-medium">{item.delivered.toLocaleString()}</span>
                                                            <span className="text-xs text-muted-foreground">{deliveryRate}%</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex flex-col items-end">
                                                            <span className="font-medium">{item.opened.toLocaleString()}</span>
                                                            <span className={`text-xs ${parseFloat(openRate) > 30
                                                                    ? 'text-green-600 dark:text-green-400'
                                                                    : parseFloat(openRate) > 15
                                                                        ? 'text-yellow-600 dark:text-yellow-400'
                                                                        : 'text-red-600 dark:text-red-400'
                                                                }`}>
                                                                {openRate}%
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex flex-col items-end">
                                                            <span className="font-medium">{item.clicked.toLocaleString()}</span>
                                                            <span className={`text-xs ${parseFloat(clickRate) > 10
                                                                    ? 'text-green-600 dark:text-green-400'
                                                                    : parseFloat(clickRate) > 5
                                                                        ? 'text-yellow-600 dark:text-yellow-400'
                                                                        : 'text-red-600 dark:text-red-400'
                                                                }`}>
                                                                {clickRate}%
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <span className={`font-medium ${item.failed > 0 ? 'text-destructive' : 'text-muted-foreground'
                                                            }`}>
                                                            {item.failed}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

               
            </div>
        </DashboardLayout>
    );
};

export default CampaignAnalyticsPage;