"use client"
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
import { RefreshCw, Send, Eye, Mail, Users, FileText } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import TipTapEditor from "@/app/_components/TipTapEditor";

const newsletterFormSchema = z.object({
    subject: z.string().min(3, { message: "Subject must be at least 3 characters." }),
    message: z.string().min(10, { message: "Message body must be at least 10 characters." }),
    recipients: z.array(z.string()).min(1, { message: "Select at least one recipient category." }),
});

type NewsletterFormValues = z.infer<typeof newsletterFormSchema>;

const defaultValues: Partial<NewsletterFormValues> = {
    subject: "Realvista Weekly Update",
    message: "<p>Check out the latest properties and market news this week!</p>",
    recipients: ["newsletter"],
};

const recipientCategories = [
    { id: "leads",      label: "Leads",             description: "Potential clients showing interest"  },
    { id: "newsletter", label: "General/Newsletter", description: "All newsletter subscribers"          },
    { id: "agents",     label: "Agents/Companies",   description: "Real estate agents and companies"    },
    { id: "buyers",     label: "Buyers/Renters",     description: "Active buyers and renters"           },
    { id: "portfolio",  label: "Portfolio Users",    description: "Users with property portfolios"      },
];

const SectionHeader = ({
    icon: Icon,
    title,
    description,
}: {
    icon: React.ElementType;
    title: string;
    description: string;
}) => (
    <div className="flex items-start gap-3 mb-5">
        <div className="mt-0.5 w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 text-teal-600" />
        </div>
        <div>
            <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
    </div>
);

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
                { headers: { Authorization: `Token ${token}` } }
            );
            console.log("API response:", response.data);
            setStatus({ success: true, message: "Newsletter sent successfully!" });
            form.reset(defaultValues);
        } catch (error: any) {
            setStatus({
                success: false,
                message: error.response?.data?.message || "Failed to send newsletter. Please try again.",
            });
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendFromPreview = () => {
        if (previewData) handleSendNewsletter(previewData);
    };

    return (
        <DashboardLayout
            title="Email Newsletter"
            description="Create and send newsletters to your subscribers"
        >
            {/* Full-width container, no max-w constraint */}
            <div className="max-w-6xl mx-auto space-y-2">

                {/* Status Alert */}
                {status && (
                    <div className={`relative overflow-hidden rounded-xl border p-4 mb-6 ${
                        status.success ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"
                    }`}>
                        <div className={`absolute inset-0 opacity-10 ${
                            status.success
                                ? "bg-gradient-to-br from-emerald-400 to-teal-400"
                                : "bg-gradient-to-br from-rose-400 to-pink-400"
                        }`} />
                        <div className="relative">
                            <h3 className={`font-semibold text-sm mb-0.5 ${
                                status.success ? "text-emerald-900" : "text-rose-900"
                            }`}>
                                {status.success ? "Sent Successfully" : "Something went wrong"}
                            </h3>
                            <p className={`text-sm ${status.success ? "text-emerald-700" : "text-rose-700"}`}>
                                {status.message}
                            </p>
                        </div>
                    </div>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handlePreview)} className="space-y-0">

                        {/* ── Section 1: Recipients ── */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-6">
                            <SectionHeader
                                icon={Users}
                                title="Recipient Categories"
                                description="Select one or more groups to receive this newsletter"
                            />
                            <FormField
                                control={form.control}
                                name="recipients"
                                render={() => (
                                    <FormItem>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                                            {recipientCategories.map((category) => (
                                                <FormField
                                                    key={category.id}
                                                    control={form.control}
                                                    name="recipients"
                                                    render={({ field }) => {
                                                        const checked = field.value?.includes(category.id);
                                                        return (
                                                            <FormItem key={category.id}>
                                                                <FormControl>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            field.onChange(
                                                                                checked
                                                                                    ? field.value.filter((v) => v !== category.id)
                                                                                    : [...field.value, category.id]
                                                                            );
                                                                        }}
                                                                        className={`w-full flex flex-col items-start gap-2 p-3.5 rounded-xl transition-all duration-150 text-left ${
                                                                            checked
                                                                                ? "bg-teal-50 shadow-[inset_0_0_0_1.5px_theme(colors.teal.400)]"
                                                                                : "bg-slate-50 hover:bg-slate-100 shadow-[inset_0_0_0_1px_theme(colors.slate.200)]"
                                                                        }`}
                                                                    >
                                                                        {/* Custom checkbox dot */}
                                                                        <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                                                                            checked ? "bg-teal-500" : "bg-white border-2 border-slate-300"
                                                                        }`}>
                                                                            {checked && (
                                                                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                                                                                    <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                                </svg>
                                                                            )}
                                                                        </span>
                                                                        <span className="space-y-0.5">
                                                                            <span className={`block text-xs font-semibold ${checked ? "text-teal-700" : "text-slate-700"}`}>
                                                                                {category.label}
                                                                            </span>
                                                                            <span className="block text-[11px] text-slate-400 leading-snug">
                                                                                {category.description}
                                                                            </span>
                                                                        </span>
                                                                    </button>
                                                                </FormControl>
                                                            </FormItem>
                                                        );
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <FormMessage className="mt-2 text-xs" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* ── Connector ── */}
                        <div className="flex justify-center">
                            <div className="w-px h-4 bg-slate-200" />
                        </div>

                        {/* ── Section 2: Subject ── */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-6 ">
                            <SectionHeader
                                icon={Mail}
                                title="Subject Line"
                                description="The first thing recipients will see in their inbox"
                            />
                            <FormItem>
                                <Input
                                    placeholder="Enter email subject…"
                                    className="bg-slate-50 border-slate-200 focus:bg-white focus:border-teal-400 focus:ring-teal-500/20 rounded-xl h-11 text-sm text-slate-800 placeholder:text-slate-400 transition-all"
                                    {...register("subject")}
                                />
                                {errors.subject && (
                                    <p className="text-xs text-rose-500 mt-1.5">{errors.subject.message}</p>
                                )}
                            </FormItem>
                        </div>

                        {/* ── Connector ── */}
                        <div className="flex justify-center">
                            <div className="w-px h-4 bg-slate-200" />
                        </div>

                        {/* ── Section 3: Message Body ── */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-6">
                            <SectionHeader
                                icon={FileText}
                                title="Message Body"
                                description="Format your message with rich text, images, and links"
                            />
                            <FormItem>
                                <TipTapEditor
                                    content={watch("message") || ""}
                                    onChange={(html: any) => {
                                        setValue("message", html, {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                        });
                                    }}
                                    error={errors.message?.message}
                                />
                                {errors.message && (
                                    <p className="text-xs text-rose-500 mt-1.5">{errors.message.message}</p>
                                )}
                            </FormItem>
                        </div>

                        {/* ── Action row ── */}
                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-6 h-11 text-sm font-medium gap-2 shadow-sm transition-all cursor-pointer"
                            >
                                <Eye className="w-4 h-4" />
                                Preview & Send
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>

            {/* ── Preview Dialog ── */}
            <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-slate-900">
                            Preview Newsletter
                        </DialogTitle>
                        <DialogDescription className="text-sm text-slate-500">
                            Review your newsletter before sending it to recipients
                        </DialogDescription>
                    </DialogHeader>

                    {previewData && (
                        <div className="space-y-4 py-2">
                            <div className="space-y-3 pb-4 border-b border-slate-100">
                                <div>
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">To</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {previewData.recipients.map((id) => {
                                            const category = recipientCategories.find((c) => c.id === id);
                                            return (
                                                <span
                                                    key={id}
                                                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-teal-50 text-teal-700 border border-teal-100"
                                                >
                                                    {category?.label}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Subject</p>
                                    <p className="text-sm font-semibold text-slate-800">{previewData.subject}</p>
                                </div>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-5">
                                <div
                                    className="prose prose-sm max-w-none text-slate-700"
                                    dangerouslySetInnerHTML={{ __html: previewData.message }}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowPreviewDialog(false)}
                            disabled={loading}
                            className="rounded-xl h-10 text-sm border-slate-200"
                        >
                            Edit
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSendFromPreview}
                            disabled={loading}
                            className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-10 text-sm font-medium gap-2 cursor-pointer"
                        >
                            {loading ? (
                                <><RefreshCw className="w-4 h-4 animate-spin" /> Sending…</>
                            ) : (
                                <><Send className="w-4 h-4" /> Confirm & Send</>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default EmailNewsletterPage;