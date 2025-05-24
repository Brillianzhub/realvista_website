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
import DashboardLayout from "../DashboardLayout";

// Currency interface based on your API response
interface Currency {
    id: number;
    currency_code: string;
    description: string | null;
    rate: string;
    base: string;
}

// Define the form schema with Zod
const currencySchema = z.object({
    currencies: z.array(
        z.object({
            id: z.number().optional(),
            currency_code: z.string().min(3, {
                message: "Currency code must be at least 3 characters.",
            }).max(3, {
                message: "Currency code must be exactly 3 characters.",
            }),
            description: z.string().nullable().optional(),
            rate: z.string().refine(
                (val) => !isNaN(Number(val)) && Number(val) > 0,
                {
                    message: "Rate must be a positive number."
                }
            ),
            base: z.string(),
            isBase: z.boolean().default(false),
        })
    ).min(1, {
        message: "At least one currency is required."
    }),
});

// TypeScript type for our form
type CurrencyFormValues = z.infer<typeof currencySchema>;

export default function CurrencyRatesPage() {
    // Layout state
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);

    // API state
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [updateLoading, setUpdateLoading] = useState(false);
    const router = useRouter();
    const [userData, setUserData] = useState<any>();
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [baseCurrency, setBaseCurrency] = useState<string>("EUR");
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    // Initialize the form with React Hook Form
    const form = useForm<any>({
        resolver: zodResolver(currencySchema),
        defaultValues: {
            currencies: []
        },
    });

    // Use field array for dynamic currency list
    const { fields, append, remove, replace } = useFieldArray({
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
            const response = await api.get('/currencies/', {
                headers: {
                    Authorization: `Token ${token}`
                }
            });

            // The response is an array of currency objects
            const currencyData: Currency[] = response.data;
            setCurrencies(currencyData);
            
            // Find the base currency (should be EUR based on your data)
            const baseCurr = currencyData.find(c => c.base === c.currency_code);
            if (baseCurr) {
                setBaseCurrency(baseCurr.currency_code);
            }

            // Transform data for the form
            const formData = currencyData.map(currency => ({
                id: currency.id,
                currency_code: currency.currency_code,
                description: currency.description,
                rate: currency.rate,
                base: currency.base,
                isBase: currency.base === currency.currency_code
            }));

            replace(formData);
            
        } catch (error) {
            console.error("Error fetching currency rates:", error);
            setStatus({
                success: false,
                message: "Failed to fetch currency rates. Please try again.",
            });
        } finally {
            setFetchLoading(false);
        }
    };

    const handleUpdateCurrencyRates = async () => {
        setUpdateLoading(true);
        setStatus(null);

        try {
            // Call the update endpoint using GET method
            const response = await api.get('/update-currency-rates/', {
                headers: {
                    Authorization: `Token ${token}`
                }
            });

            console.log("Update API response:", response.data);

            // Handle successful response
            setStatus({ 
                success: true, 
                message: "Currency rates updated successfully from external source!" 
            });

            // Refresh the currency data after update
            await fetchCurrencyRates();
            
        } catch (error: any) {
            // Handle error
            setStatus({
                success: false,
                message: error.response?.data?.message || "Failed to update currency rates. Please try again."
            });
            console.error("Error updating currency rates:", error);
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleSaveCurrencyRates = async (values: CurrencyFormValues) => {
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

            // Transform the data back to the API format if needed
            const apiData = values.currencies.map(currency => ({
                id: currency.id,
                currency_code: currency.currency_code,
                description: currency.description,
                rate: currency.rate,
                base: currency.base
            }));

            // Send the POST request to save the manually edited rates
            const response = await api.post('/currencies/',
                { currencies: apiData },
                {
                    headers: {
                        Authorization: `Token ${token}`
                    }
                }
            );

            console.log("Save API response:", response.data);

            // Handle successful response
            setStatus({ success: true, message: "Currency rates saved successfully!" });
        } catch (error: any) {
            // Handle error
            setStatus({
                success: false,
                message: error.response?.data?.message || "Failed to save currency rates. Please try again."
            });
            console.error("Error saving currency rates:", error);
        } finally {
            setLoading(false);
        }
    };

    // const addNewCurrency = () => {
    //     append({ 
    //         currency_code: "", 
    //         description: "", 
    //         rate: "1.0", 
    //         base: baseCurrency,
    //         isBase: false 
    //     });
    // };

    const handleBaseChange = (index: number, value: boolean) => {
        if (value) {
            // If this currency is being set as base, set all others to false
            const currencies = form.getValues("currencies");
            currencies.forEach((_: any, i: any) => {
                if (i !== index) {
                    form.setValue(`currencies.${i}.isBase`, false);
                }
            });
            
            // Set the new base currency
            const newBaseCurrency = form.getValues(`currencies.${index}.currency_code`);
            setBaseCurrency(newBaseCurrency);
            
            // Update all currencies to have this as their base
            currencies.forEach((_: any, i: any) => {
                form.setValue(`currencies.${i}.base`, newBaseCurrency);
            });
        }
    };

    // Currency content component
    const CurrencyContent = () => {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>Manage Currency Exchange Rates</CardTitle>
                                <CardDescription>
                                    View and manage currency exchange rates. Base currency: {baseCurrency}
                                </CardDescription>
                            </div>
                            <Button 
                                onClick={handleUpdateCurrencyRates}
                                disabled={updateLoading || fetchLoading}
                                variant="outline"
                                className="ml-4"
                            >
                                {updateLoading ? (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Fetch Latest Rates
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSaveCurrencyRates)} className="space-y-4">
                            <CardContent>
                                {fetchLoading ? (
                                    <div className="flex justify-center items-center p-6">
                                        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                                        <span className="ml-2 text-gray-500">Loading currency data...</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-20">Code</TableHead>
                                                        {/* <TableHead>Currency Name</TableHead> */}
                                                        <TableHead className="w-32">Exchange Rate</TableHead>
                                                        <TableHead className="w-20">Base</TableHead>
                                                        {/* <TableHead className="w-20">Actions</TableHead> */}
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {fields.map((field, index) => (
                                                        <TableRow key={field.id}>
                                                            <TableCell>
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`currencies.${index}.currency_code`}
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormControl>
                                                                                <Input 
                                                                                    placeholder="USD" 
                                                                                    {...field} 
                                                                                    className="w-16 text-center font-mono" 
                                                                                    maxLength={3}
                                                                                    style={{ textTransform: 'uppercase' }}
                                                                                />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            </TableCell>
                                                            {/* <TableCell>
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`currencies.${index}.description`}
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormControl>
                                                                                <Input 
                                                                                    placeholder="US Dollar" 
                                                                                    {...field} 
                                                                                    value={field.value || ''}
                                                                                />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            </TableCell> */}
                                                            <TableCell>
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`currencies.${index}.rate`}
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormControl>
                                                                                <Input
                                                                                    type="text"
                                                                                    placeholder="1.0"
                                                                                    {...field}
                                                                                    disabled={form.watch(`currencies.${index}.isBase`)}
                                                                                    value={form.watch(`currencies.${index}.isBase`) ? "1.000000" : field.value}
                                                                                    className="w-28 text-right font-mono"
                                                                                />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="text-center">
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
                                                                                            form.setValue(`currencies.${index}.rate`, "1.000000");
                                                                                        }
                                                                                    }}
                                                                                    className="h-4 w-4"
                                                                                />
                                                                            </FormControl>
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            </TableCell>
                                                            {/* <TableCell>
                                                                {fields.length > 1 && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => remove(index)}
                                                                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                            </TableCell> */}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        {/* <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="mt-4"
                                            onClick={addNewCurrency}
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Currency
                                        </Button> */}
                                    </>
                                )}
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <div className="text-sm text-gray-500">
                                    {currencies.length} currencies loaded
                                </div>
                                {/* <Button type="submit" disabled={loading || fetchLoading}>
                                    {loading ? (
                                        <>
                                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Save Manual Changes
                                        </>
                                    )}
                                </Button> */}
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
        <DashboardLayout
            title="Currency Rates"
            description="Manage exchange rates for your application"
        >
            <CurrencyContent />
        </DashboardLayout>
    );
}