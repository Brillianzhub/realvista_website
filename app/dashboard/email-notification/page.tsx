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
import { RefreshCw, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const notificationFormSchema = z.object({
    subject: z.string().min(3, {
        message: "Subject must be at least 3 characters.",
    }),
    message: z.string().min(10, {
        message: "Message must be at least 10 characters.",
    }),
});

// TypeScript type for our form
type NotificationFormValues = z.infer<typeof notificationFormSchema>;

// Default values for the form
const defaultValues: Partial<NotificationFormValues> = {
    subject: "Realvista Weekly Update",
    message: "Check out the latest properties and market news this week!",
};


const EmailNotificationsPage = () => {
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<any>(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const form = useForm<NotificationFormValues>({
        resolver: zodResolver(notificationFormSchema),
        defaultValues,
    });

    const handleSendEmail = async (values: NotificationFormValues) => {
        setLoading(true);
        setStatus(null);

        try {
            // Send the POST request to the API endpoint using axios
            const response = await api.post('/notifications/email-notifications/send/',
                { subject: values.subject, message: values.message },
                {
                    headers: {
                        Authorization: `Token ${token}`
                    }
                }
            );

            console.log("API response:", response.data);

            // Handle successful response
            setStatus({ success: true, message: "Email notification sent successfully!" });
        } catch (error: any) {
            // Handle error
            setStatus({
                success: false,
                message: error.response?.data?.message || "Failed to send email notification. Please try again."
            });
            console.error("Error sending email:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout
            title="Email Notifications"
            description="Send updates and news to your users"
        >
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Send Email Notification</CardTitle>
                        <CardDescription>
                            Create and send email notifications to your users
                        </CardDescription>
                    </CardHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSendEmail)} className="space-y-4">
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="subject"
                                    render={({ field }: any) => (
                                        <FormItem>
                                            <FormLabel>Subject Line</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter email subject" {...field} />
                                            </FormControl>
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
                                                    placeholder="Enter your message here"
                                                    rows={10}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" disabled={loading} className="ml-auto cursor-pointer">
                                    {loading ? (
                                        <>
                                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-2 h-4 w-4" />
                                            Send Email
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
}
export default EmailNotificationsPage 