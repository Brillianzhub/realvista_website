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
import { Checkbox } from "@/components/ui/checkbox";
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
import { RefreshCw, Send, Eye } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import TipTapEditor from "@/app/_components/TipTapEditor";

const newsletterFormSchema = z.object({
    subject: z.string().min(3, {
        message: "Subject must be at least 3 characters.",
    }),
    message: z.string().min(10, {
        message: "Message body must be at least 10 characters.",
    }),
    recipients: z.array(z.string()).min(1, {
        message: "Select at least one recipient category.",
    }),
});

type NewsletterFormValues = z.infer<typeof newsletterFormSchema>;

const defaultValues: Partial<NewsletterFormValues> = {
    subject: "Realvista Weekly Update",
    message: "<p>Check out the latest properties and market news this week!</p>",
    recipients: ["newsletter"],
};

const recipientCategories = [
    { id: "leads", label: "Leads", description: "Potential clients showing interest" },
    { id: "newsletter", label: "General/Newsletter", description: "All newsletter subscribers" },
    { id: "agents", label: "Agents/Companies", description: "Real estate agents and companies" },
    { id: "buyers", label: "Buyers/Renters", description: "Active buyers and renters" },
    { id: "portfolio", label: "Portfolio Users", description: "Users with property portfolios" },
];

const EmailNewsletterPage = () => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<any>(null);
    const [showPreviewDialog, setShowPreviewDialog] = useState(false);
    const [previewData, setPreviewData] = useState<NewsletterFormValues | null>(null);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const form = useForm<NewsletterFormValues>({
        resolver: zodResolver(newsletterFormSchema),
        defaultValues,
    });

    const { register, setValue, watch, formState: { errors } } = form;

    const handlePreview = () => {
        const values = form.getValues();
        setPreviewData(values);
        setShowPreviewDialog(true);
    };

    const stripHtml = (html: string) => {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };

    const handleSendNewsletter = async (values: NewsletterFormValues) => {
        setLoading(true);
        setStatus(null);
        setShowPreviewDialog(false);

        try {
            const response = await api.post(
                '/notifications/email-notifications/send/',
                {
                    subject: values.subject,
                    message: stripHtml(values.message),
                    recipients: values.recipients,
                },
                {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                }
            );

            console.log("API response:", response.data);

            setStatus({
                success: true,
                message: "Newsletter sent successfully!",
            });

            // Reset form after successful send
            form.reset(defaultValues);
        } catch (error: any) {
            setStatus({
                success: false,
                message: error.response?.data?.message ||
                    "Failed to send newsletter. Please try again.",
            });
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendFromPreview = () => {
        if (previewData) {
            handleSendNewsletter(previewData);
        }
    };

    return (
        <DashboardLayout
            title="Email Newsletter"
            description="Create and send newsletters to your subscribers"
        >
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Compose Newsletter</CardTitle>
                        <CardDescription>
                            Create and send email newsletters to your selected audience
                        </CardDescription>
                    </CardHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handlePreview)} className="space-y-4">
                            <CardContent className="space-y-6">
                                {/* Recipient Categories */}
                                <FormField
                                    control={form.control}
                                    name="recipients"
                                    render={() => (
                                        <FormItem>
                                            <div className="mb-4">
                                                <FormLabel className="text-base">Recipient Categories</FormLabel>
                                                <FormDescription>
                                                    Select one or more categories to send this newsletter to
                                                </FormDescription>
                                            </div>
                                            <div className="space-y-3">
                                                {recipientCategories.map((category) => (
                                                    <FormField
                                                        key={category.id}
                                                        control={form.control}
                                                        name="recipients"
                                                        render={({ field }) => {
                                                            return (
                                                                <FormItem
                                                                    key={category.id}
                                                                    className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent/50 transition-colors"
                                                                >
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={field.value?.includes(category.id)}
                                                                            onCheckedChange={(checked) => {
                                                                                return checked
                                                                                    ? field.onChange([...field.value, category.id])
                                                                                    : field.onChange(
                                                                                        field.value?.filter(
                                                                                            (value) => value !== category.id
                                                                                        )
                                                                                    );
                                                                            }}
                                                                        />
                                                                    </FormControl>
                                                                    <div className="space-y-1 leading-none flex-1">
                                                                        <FormLabel className="font-medium cursor-pointer">
                                                                            {category.label}
                                                                        </FormLabel>
                                                                        <FormDescription className="text-xs">
                                                                            {category.description}
                                                                        </FormDescription>
                                                                    </div>
                                                                </FormItem>
                                                            );
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Subject Line */}
                                <FormItem>
                                    <FormLabel>Subject Line</FormLabel>
                                    <Input
                                        placeholder="Enter email subject"
                                        {...register("subject")}
                                    />
                                    {errors.subject && (
                                        <p className="text-sm text-destructive mt-1">
                                            {errors.subject.message}
                                        </p>
                                    )}
                                </FormItem>

                                {/* TipTap Editor */}
                                <FormItem>
                                    <FormLabel>Message Body</FormLabel>
                                    <TipTapEditor
                                        content={watch('message') || ''}
                                        onChange={(html: any) => {
                                            setValue('message', html, {
                                                shouldValidate: true,
                                                shouldDirty: true
                                            });
                                        }}
                                        error={errors.message?.message}
                                    />
                                    {errors.message && (
                                        <p className="text-sm text-destructive mt-1">
                                            {errors.message.message}
                                        </p>
                                    )}
                                    <FormDescription>
                                        Format your message with rich text, images, and links
                                    </FormDescription>
                                </FormItem>
                            </CardContent>

                            <CardFooter className="flex justify-end gap-3 ">
                                <Button type="submit" disabled={loading} className="cursor-pointer">
                                    <Eye className="mr-2 h-4 w-4" />
                                    Preview & Send
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                </Card>

                {/* Status Alert */}
                {status && (
                    <div className={`relative overflow-hidden rounded-xl border p-4 backdrop-blur-sm ${status.success
                        ? 'bg-emerald-50/90 border-emerald-200'
                        : 'bg-rose-50/90 border-rose-200'
                        }`}>
                        <div className={`absolute inset-0 opacity-10 ${status.success ? 'bg-gradient-to-br from-emerald-400 to-teal-400' : 'bg-gradient-to-br from-rose-400 to-pink-400'
                            }`} />
                        <div className="relative">
                            <h3 className={`font-semibold text-lg mb-1 ${status.success ? 'text-emerald-900' : 'text-rose-900'
                                }`}>
                                {status.success ? "Success" : "Error"}
                            </h3>
                            <p className={`text-sm ${status.success ? 'text-emerald-700' : 'text-rose-700'
                                }`}>
                                {status.message}
                            </p>
                        </div>
                    </div>
                )}

                {/* Preview Dialog */}
                <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Preview Newsletter</DialogTitle>
                            <DialogDescription>
                                Review your newsletter before sending it to recipients
                            </DialogDescription>
                        </DialogHeader>

                        {previewData && (
                            <div className="space-y-4 py-4">
                                {/* Email Header Info */}
                                <div className="space-y-2 pb-4 border-b">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-muted-foreground">To:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {previewData.recipients.map(id => {
                                                    const category = recipientCategories.find(c => c.id === id);
                                                    return (
                                                        <span
                                                            key={id}
                                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                                                        >
                                                            {category?.label}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Subject:</p>
                                        <p className="text-base font-semibold">{previewData.subject}</p>
                                    </div>
                                </div>

                                {/* Email Body Preview */}
                                <div className="rounded-lg border bg-muted/30 p-6">
                                    <div
                                        className="prose prose-sm max-w-none dark:prose-invert"
                                        dangerouslySetInnerHTML={{ __html: previewData.message }}
                                    />
                                </div>
                            </div>
                        )}

                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowPreviewDialog(false)}
                                disabled={loading}
                            >
                                Edit Newsletter
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSendFromPreview}
                                className="cursor-pointer"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        Confirm & Send
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

export default EmailNewsletterPage;