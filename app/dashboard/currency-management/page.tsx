"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    LayoutDashboard,
    Bell,
    Users,
    Settings,
    HelpCircle,
    LogOut,
    Menu,
    X,
    ChevronDown,
    Save,
    RefreshCw,
    DollarSign,
    Plus,
    Trash2
} from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import api from "@/config/apiClient";
import { useRouter } from "next/navigation";

// Define the form schema with Zod
const currencySchema = z.object({
    currencies: z.array(
        z.object({
            code: z.string().min(3, {
                message: "Currency code must be at least 3 characters.",
            }).max(3, {
                message: "Currency code must be exactly 3 characters.",
            }),
            name: z.string().min(2, {
                message: "Currency name is required.",
            }),
            rate: z.coerce
                .number({
                    invalid_type_error: "Rate must be a number."
                })
                .positive({
                    message: "Rate must be a positive number."
                }),
            isBase: z.boolean().default(false),
        })
    ).min(1, {
        message: "At least one currency is required."
    }),
});

// TypeScript type for our form
type CurrencyFormValues = z.infer<typeof currencySchema>;

// Default values for the form
const defaultValues: CurrencyFormValues = {
    currencies: [
        { code: "USD", name: "US Dollar", rate: 1, isBase: true },
        { code: "EUR", name: "Euro", rate: 0.92, isBase: false },
        { code: "GBP", name: "British Pound", rate: 0.79, isBase: false },
    ],
};

export default function CurrencyRatesPage() {
    // Layout state
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);

    // API state
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const router = useRouter();
    const [userData, setUserData] = useState<any>();
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    // Initialize the form with React Hook Form
    const form = useForm<any>({
        resolver: zodResolver(currencySchema),
        defaultValues,
    });

    // Use field array for dynamic currency list
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "currencies",
    });

    useEffect(() => {
        const loadUserData = () => {
            try {
                const storedUserData = localStorage.getItem('userData');
                if (storedUserData) {
                    setUserData(JSON.parse(storedUserData));
                }
            } catch (error) {
                console.error('Error loading user data from localStorage:', error);
            }
        };

        // Load user data initially
        loadUserData();

        // Set up event listener for login/logout events
        const handleUserLogin = () => loadUserData();
        const handleUserLogout = () => setUserData(null);

        window.addEventListener('userLogin', handleUserLogin);
        window.addEventListener('userLogout', handleUserLogout);

        // Fetch currency data
        fetchCurrencyRates();

        // Clean up event listeners
        return () => {
            window.removeEventListener('userLogin', handleUserLogin);
            window.removeEventListener('userLogout', handleUserLogout);
        };
    }, []);

    const fetchCurrencyRates = async () => {
        setFetchLoading(true);
        try {
            // Mock API call - replace with your actual endpoint
            const response = await api.get('/update-currency-rates/', {
                headers: {
                    Authorization: `Token ${token}`
                }
            });

            // Update form with fetched data
            if (response.data && response.data.currencies) {
                form.reset({ currencies: response.data.currencies });
            }
        } catch (error) {
            console.error("Error fetching currency rates:", error);
            setStatus({
                success: false,
                message: "Failed to fetch currency rates. Using default values.",
            });
        } finally {
            setFetchLoading(false);
        }
    };

    const handleUpdateCurrencyRates = async (values: any) => {
        setLoading(true);
        setStatus(null);

        try {
            // Ensure only one base currency
            const baseCount = values.currencies.filter((c: any) => c.isBase).length;
            if (baseCount !== 1) {
                setStatus({
                    success: false,
                    message: "There must be exactly one base currency selected.",
                });
                setLoading(false);
                return;
            }

            // Send the POST request to the API endpoint
            const response = await api.post('/update-currency-rates/',
                values,
                {
                    headers: {
                        Authorization: `Token ${token}`
                    }
                }
            );

            console.log("API response:", response.data);

            // Handle successful response
            setStatus({ success: true, message: "Currency rates updated successfully!" });
        } catch (error: any) {
            // Handle error
            setStatus({
                success: false,
                message: error.response?.data?.message || "Failed to update currency rates. Please try again."
            });
            console.error("Error updating currency rates:", error);
        } finally {
            setLoading(false);
        }
    };

    const addNewCurrency = () => {
        append({ code: "", name: "", rate: 0, isBase: false });
    };

    const handleBaseChange = (index: number, value: boolean) => {
        if (value) {
            // If this currency is being set as base, set all others to false
            const currencies = form.getValues("currencies");
            currencies.forEach((_: any, i: any) => {
                if (i !== index) {
                    form.setValue(`currencies.${i}.isBase`, false);
                }
            });
        }
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const toggleMobile = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('userData');
        localStorage.removeItem('token');
        setUserData(null);
        router.push("/dashboard/auth");
        window.dispatchEvent(new Event('userLogout'));
    };

    // Currency content component
    const CurrencyContent = () => {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Currency Rates</h1>
                        <p className="text-gray-500">Manage exchange rates for your application</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Update Currency Exchange Rates</CardTitle>
                        <CardDescription>
                            Set and manage currency exchange rates. Select one currency as the base (rate 1.0).
                        </CardDescription>
                    </CardHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleUpdateCurrencyRates)} className="space-y-4">
                            <CardContent>
                                {fetchLoading ? (
                                    <div className="flex justify-center items-center p-6">
                                        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                                        <span className="ml-2 text-gray-500">Loading currency data...</span>
                                    </div>
                                ) : (
                                    <>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Code</TableHead>
                                                    <TableHead>Currency Name</TableHead>
                                                    <TableHead>Exchange Rate</TableHead>
                                                    <TableHead>Base</TableHead>
                                                    <TableHead></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {fields.map((field, index) => (
                                                    <TableRow key={field.id}>
                                                        <TableCell>
                                                            <FormField
                                                                control={form.control}
                                                                name={`currencies.${index}.code`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormControl>
                                                                            <Input placeholder="USD" {...field} className="w-20" maxLength={3} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <FormField
                                                                control={form.control}
                                                                name={`currencies.${index}.name`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormControl>
                                                                            <Input placeholder="US Dollar" {...field} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <FormField
                                                                control={form.control}
                                                                name={`currencies.${index}.rate`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormControl>
                                                                            <Input
                                                                                type="number"
                                                                                step="0.0001"
                                                                                placeholder="1.0"
                                                                                {...field}
                                                                                disabled={form.watch(`currencies.${index}.isBase`)}
                                                                                value={form.watch(`currencies.${index}.isBase`) ? 1 : field.value}
                                                                                className="w-24"
                                                                            />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <FormField
                                                                control={form.control}
                                                                name={`currencies.${index}.isBase`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormControl>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={field.value}
                                                                                onChange={(e) => {
                                                                                    field.onChange(e.target.checked);
                                                                                    handleBaseChange(index, e.target.checked);
                                                                                    if (e.target.checked) {
                                                                                        form.setValue(`currencies.${index}.rate`, 1);
                                                                                    }
                                                                                }}
                                                                                className="h-4 w-4"
                                                                            />
                                                                        </FormControl>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => remove(index)}
                                                                disabled={fields.length <= 1}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-gray-500" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="mt-4"
                                            onClick={addNewCurrency}
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Currency
                                        </Button>
                                    </>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" disabled={loading || fetchLoading} className="ml-auto">
                                    {loading ? (
                                        <>
                                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                </Card>

                {/* Display status message if present */}
                {status && (
                    <Alert variant={status.success ? "default" : "destructive"}>
                        <AlertTitle>{status.success ? "Success" : "Error"}</AlertTitle>
                        <AlertDescription>{status.message}</AlertDescription>
                    </Alert>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar toggle */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b p-4 flex items-center justify-between">
                <div className="flex items-center">
                    <Button variant="ghost" size="icon" onClick={toggleMobile}>
                        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </Button>
                    <span className="ml-3 text-xl font-bold">Realvista</span>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="/avatar.png" />
                                <AvatarFallback>JD</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuItem>Settings</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Mobile sidebar */}
            <div className={`lg:hidden fixed inset-0 z-20 transform ${mobileOpen ? "translate-x-0" : "-translate-x-full"
                } transition-transform duration-300 ease-in-out`}>
                <div className="relative flex flex-col h-full max-w-xs w-full bg-white border-r shadow-lg pt-16">
                    <div className="flex-1 flex flex-col p-4 overflow-y-auto">
                        <nav className="flex-1 space-y-2">
                            <Link href="/dashboard" className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100">
                                <LayoutDashboard className="mr-3 h-5 w-5" />
                                <span>Dashboard</span>
                            </Link>
                            <Link href="/dashboard/notifications" className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100">
                                <Bell className="mr-3 h-5 w-5" />
                                <span>Notifications</span>
                            </Link>
                            <Link href="/dashboard/currency" className="flex items-center px-4 py-3 bg-gray-100 text-gray-900 rounded-lg">
                                <DollarSign className="mr-3 h-5 w-5" />
                                <span>Currency Rates</span>
                            </Link>
                            <Link href="/dashboard/users" className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100">
                                <Users className="mr-3 h-5 w-5" />
                                <span>Users</span>
                            </Link>
                            <Link href="/dashboard/settings" className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100">
                                <Settings className="mr-3 h-5 w-5" />
                                <span>Settings</span>
                            </Link>
                            <Link href="/dashboard/help" className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100">
                                <HelpCircle className="mr-3 h-5 w-5" />
                                <span>Help & Support</span>
                            </Link>
                        </nav>

                        <div className="mt-6 pt-6 border-t">
                            <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                                <LogOut className="mr-3 h-5 w-5" />
                                <span>Logout</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-gray-600 bg-opacity-50"
                    onClick={toggleMobile}
                ></div>
            </div>

            {/* Desktop sidebar */}
            <div className={`hidden lg:flex lg:flex-col fixed inset-y-0 z-10 ${sidebarOpen ? "lg:w-64" : "lg:w-20"
                } transition-all duration-300`}>
                <div className="flex flex-col h-full bg-white border-r">
                    {/* Logo */}
                    <div className={`flex items-center ${sidebarOpen ? "justify-between" : "justify-center"} h-16 px-4`}>
                        {sidebarOpen && <span className="text-xl font-bold">Realvista</span>}
                        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                            <ChevronDown className={`h-5 w-5 transform ${sidebarOpen ? "rotate-0" : "rotate-180"}`} />
                        </Button>
                    </div>

                    {/* Nav Links */}
                    <nav className="flex-1 px-2 py-4 pt-10 space-y-2 overflow-y-auto">
                        <Link
                            href="/dashboard"
                            className={`flex items-center ${sidebarOpen ? "px-4 justify-start" : "justify-center"
                                } py-3 text-gray-700 rounded-lg hover:bg-gray-100`}
                        >
                            <LayoutDashboard className={`${sidebarOpen ? "mr-3" : ""} h-5 w-5`} />
                            {sidebarOpen && <span>Notifications</span>}
                        </Link>

                        <Link
                            href="/dashboard/currency-management"
                            className={`flex items-center ${sidebarOpen ? "px-4 justify-start" : "justify-center"
                                } py-3 bg-gray-100 text-gray-900 rounded-lg`}
                        >
                            <DollarSign className={`${sidebarOpen ? "mr-3" : ""} h-5 w-5`} />
                            {sidebarOpen && <span>Currency Rates</span>}
                        </Link>
                    </nav>

                    {/* Profile */}
                    <div className="border-t p-4">
                        <div className={`flex ${sidebarOpen ? "items-center" : "flex-col items-center justify-center"}`}>
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="/avatar.png" />
                                <AvatarFallback>JD</AvatarFallback>
                            </Avatar>

                            {sidebarOpen && (
                                <div className="ml-3">
                                    <p className="text-sm font-medium">{userData?.name}</p>
                                    <p className="text-xs text-gray-500">{userData?.email}</p>
                                    <button onClick={handleLogout} className="text-xs text-red-500 cursor-pointer">Log Out</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className={`${sidebarOpen ? "lg:pl-64" : "lg:pl-20"
                } transition-all duration-300 pt-0 lg:pt-0`}>
                <div className="lg:hidden h-16">
                    {/* Spacer for mobile header */}
                </div>

                {/* Header */}
                <header className="hidden lg:block bg-white shadow-sm">
                    <div className="px-4 sm:px-6 lg:px-8">
                        {/* Header content if needed */}
                    </div>
                </header>

                {/* Page content */}
                <main className="p-4 sm:p-6 lg:p-8">
                    <CurrencyContent />
                </main>
            </div>
        </div>
    );
}