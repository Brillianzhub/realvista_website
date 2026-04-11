"use client"
import {
    Form,
    FormItem,
} from "@/components/ui/form";
import api from "@/config/apiClient";
import DashboardLayout from "../DashboardLayout";
import { Button } from "@/components/ui/button";
import { RefreshCw, Send, Bell, Smartphone, AlignLeft } from "lucide-react";
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

type PushNotificationFormValues = z.infer<typeof pushNotificationSchema>;

const defaultValues: Partial<PushNotificationFormValues> = {
    title: "Realvista Update",
    message: "Check out the latest properties and market updates available now!",
    data: "{}",
};

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

const PushNotificationsPage = () => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<any>(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const form = useForm<any>({
        resolver: zodResolver(pushNotificationSchema),
        defaultValues,
    });

    const { register, watch, formState: { errors } } = form;

    const handleSendPushNotification = async (values: PushNotificationFormValues) => {
        setLoading(true);
        setStatus(null);

        try {
            let parsedData = {};
            if (values.data && values.data.trim()) {
                try {
                    parsedData = JSON.parse(values.data);
                } catch (jsonError) {
                    throw new Error("Invalid JSON format in data field");
                }
            }

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

            setStatus({
                success: true,
                message: "Push notification sent successfully to all users!"
            });

        } catch (error: any) {
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

    return (
        <DashboardLayout
            title="Push Notifications"
            description="Send instant notifications to your mobile app users"
        >
            <div className="max-w-6xl mx-auto space-y-2">

                {/* Status Alert */}
                {status && (
                    <div className={`relative overflow-hidden rounded-xl border p-4 mb-6 ${status.success ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"
                        }`}>
                        <div className={`absolute inset-0 opacity-10 ${status.success
                            ? "bg-gradient-to-br from-emerald-400 to-teal-400"
                            : "bg-gradient-to-br from-rose-400 to-pink-400"
                            }`} />
                        <div className="relative">
                            <h3 className={`font-semibold text-sm mb-0.5 ${status.success ? "text-emerald-900" : "text-rose-900"
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
                    <form onSubmit={form.handleSubmit(handleSendPushNotification)} className="space-y-0">

                        {/* ── Section 1: Info Banner ── */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-6">
                            <SectionHeader
                                icon={Smartphone}
                                title="Audience"
                                description="Who will receive this notification"
                            />
                            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-teal-50 border border-teal-100">
                                <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center shrink-0">
                                    <Bell className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-teal-800">All Mobile App Users</p>
                                    <p className="text-xs text-teal-600 mt-0.5">
                                        Sent to everyone with the app installed and notifications enabled
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ── Connector ── */}
                        <div className="flex justify-center">
                            <div className="w-px h-4 bg-slate-200" />
                        </div>

                        {/* ── Section 2: Title ── */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-6">
                            <SectionHeader
                                icon={Bell}
                                title="Notification Title"
                                description="The main heading users will see first (max 100 characters)"
                            />
                            <FormItem>
                                <input
                                    placeholder="Enter notification title…"
                                    maxLength={100}
                                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 rounded-xl h-11 px-3 text-sm text-slate-800 placeholder:text-slate-400 transition-all"
                                    {...register("title")}
                                />
                                {errors.title && (
                                    <p className="text-xs text-rose-500 mt-1.5">{errors.title.message as string}</p>
                                )}
                            </FormItem>
                        </div>

                        {/* ── Connector ── */}
                        <div className="flex justify-center">
                            <div className="w-px h-4 bg-slate-200" />
                        </div>

                        {/* ── Section 3: Message ── */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-6">
                            <SectionHeader
                                icon={AlignLeft}
                                title="Message Body"
                                description="The detailed content of your notification (max 500 characters)"
                            />
                            <FormItem>
                                <textarea
                                    placeholder="Enter your notification message here…"
                                    rows={7}
                                    maxLength={500}
                                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 transition-all resize-none px-3 py-2.5"
                                    {...register("message")}
                                />
                            </FormItem>
                        </div>

                        {/* ── Connector ── */}
                        <div className="flex justify-center">
                            <div className="w-px h-4 bg-slate-200" />
                        </div>

                        {/* ── Section 4: Live Preview ── */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-6">
                            <SectionHeader
                                icon={Smartphone}
                                title="Live Preview"
                                description="How your notification will appear on a device"
                            />
                            <div className="flex justify-start">
                                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 w-full max-w-sm shadow-sm">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-teal-500 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                                            <Bell className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-sm text-slate-900 truncate">
                                                {watch("title") || "Notification Title"}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                                {watch("message") || "Notification message will appear here"}
                                            </p>
                                        </div>
                                        <span className="text-[10px] text-slate-400 shrink-0 mt-0.5">now</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Action row ── */}
                        <div className="flex justify-between pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => form.reset(defaultValues)}
                                disabled={loading}
                                className="rounded-xl h-11 text-sm border-slate-200 px-4 cursor-pointer"
                            >
                                Reset
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-6 h-11 text-sm font-medium gap-2 shadow-sm transition-all cursor-pointer"
                            >
                                {loading ? (
                                    <><RefreshCw className="w-4 h-4 animate-spin" /> Sending…</>
                                ) : (
                                    <><Send className="w-4 h-4" /> Send Notification</>
                                )}
                            </Button>
                        </div>

                    </form>
                </Form>
            </div>
        </DashboardLayout>
    );
};

export default PushNotificationsPage;