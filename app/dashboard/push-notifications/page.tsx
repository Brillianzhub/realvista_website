"use client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import api from "@/config/apiClient";
import DashboardLayout from "../DashboardLayout";
import { Button } from "@/components/ui/button";
import { RefreshCw, Send, Bell, Smartphone } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const pushNotificationSchema = z.object({
    title: z.string().min(3, {
        message: "Title must be at least 3 characters.",
    }).max(100, {
        message: "Title must not exceed 100 characters.",
    }),
    message: z.string().min(10, {
        message: "Message must be at least 10 characters.",
    }).max(500, {
        message: "Message must not exceed 500 characters.",
    }),
    data: z.string().optional().default("{}"),
});

// TypeScript type for our form
type PushNotificationFormValues = z.infer<typeof pushNotificationSchema>;

// Default values for the form
const defaultValues: Partial<PushNotificationFormValues> = {
    title: "Realvista Update",
    message: "Check out the latest properties and market updates available now!",
    data: "{}",
};

const PushNotificationsPage = () => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<any>(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const form = useForm<any>({
        resolver: zodResolver(pushNotificationSchema),
        defaultValues,
    });

    const handleSendPushNotification = async (values: PushNotificationFormValues) => {
        setLoading(true);
        setStatus(null);

        try {
            // Parse the data field to ensure it's valid JSON
            let parsedData = {};
            if (values.data && values.data.trim()) {
                try {
                    parsedData = JSON.parse(values.data);
                } catch (jsonError) {
                    throw new Error("Invalid JSON format in data field");
                }
            }

            // Send the POST request to the API endpoint
            const response = await api.post('/notifications/send-general-notification/',
                {
                    title: values.title,
                    message: values.message,
                },
                {
                    headers: {
                        Authorization: `Token ${token}`
                    }
                }
            );

            console.log("API response:", response.data);

            // Handle successful response
            setStatus({
                success: true,
                message: "Push notification sent successfully to all users!"
            });

            // Optionally reset form after successful send
            // form.reset(defaultValues);

        } catch (error: any) {
            // Handle error
            let errorMessage = "Failed to send push notification. Please try again.";

            if (error.message === "Invalid JSON format in data field") {
                errorMessage = "Invalid JSON format in the data field. Please check your JSON syntax.";
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            }

            setStatus({
                success: false,
                message: errorMessage
            });
            console.error("Error sending push notification:", error);
        } finally {
            setLoading(false);
        }
    };

    const validateAndFormatJSON = (value: string) => {
        if (!value || value.trim() === "") return "{}";

        try {
            const parsed = JSON.parse(value);
            return JSON.stringify(parsed, null, 2);
        } catch (error) {
            return value; // Return as-is if invalid, let form validation handle it
        }
    };

    return (
        <DashboardLayout
            title="Push Notifications"
            description="Send instant notifications to your mobile app users"
        >
            <div className="space-y-6">
                {/* Info Card */}
                <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-teal-800">
                            <Smartphone className="h-5 w-5" />
                            Push Notification Info
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-teal-700 text-sm">
                            Push notifications will be sent to all users who have the mobile app installed
                            and have granted notification permissions. Make sure your message is clear and actionable.
                        </p>
                    </CardContent>
                </Card>

                {/* Main Form Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Send Push Notification
                        </CardTitle>
                        <CardDescription>
                            Create and send push notifications to all your mobile app users
                        </CardDescription>
                    </CardHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSendPushNotification)} className="space-y-4">
                            <CardContent className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }: any) => (
                                        <FormItem>
                                            <FormLabel>Notification Title</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter notification title"
                                                    {...field}
                                                    maxLength={100}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                The main heading that users will see first (max 100 characters)
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="message"
                                    render={({ field }: any) => (
                                        <FormItem>
                                            <FormLabel>Message</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Enter your notification message here"
                                                    rows={4}
                                                    maxLength={500}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                The detailed message content (max 500 characters)
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Preview Section */}
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                                    <h4 className="font-medium text-sm text-gray-700 mb-2">Notification Preview:</h4>
                                    <div className="bg-white p-3 rounded border shadow-sm max-w-sm">
                                        <div className="flex items-start gap-2">
                                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Bell className="w-3 h-3 text-white" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-sm text-gray-900 truncate">
                                                    {form.watch("title") || "Notification Title"}
                                                </p>
                                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                    {form.watch("message") || "Notification message will appear here"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => form.reset(defaultValues)}
                                    className="cursor-pointer"
                                    disabled={loading}
                                >
                                    Reset Form
                                </Button>
                                <Button type="submit" disabled={loading} className="cursor-pointer">
                                    {loading ? (
                                        <>
                                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-2 h-4 w-4" />
                                            Send Push Notification
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
        </DashboardLayout>
    );
};

export default PushNotificationsPage;