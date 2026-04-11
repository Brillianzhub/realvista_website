"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, KeyRound, ShieldCheck, ArrowRight, RefreshCw, CheckCircle2 } from "lucide-react";
import api from "@/config/apiClient";

const schema = z
    .object({
        password: z
            .string()
            .min(8, "Password must be at least 8 characters.")
            .regex(/[A-Z]/, "Must contain at least one uppercase letter.")
            .regex(/[0-9]/, "Must contain at least one number."),
        confirmPassword: z.string().min(1, "Please confirm your password."),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: "Passwords do not match.",
        path: ["confirmPassword"],
    });

type FormValues = z.infer<typeof schema>;

const StrengthBar = ({ password }: { password: string }) => {
    const checks = [
        password.length >= 8,
        /[A-Z]/.test(password),
        /[0-9]/.test(password),
        /[^A-Za-z0-9]/.test(password),
        password.length >= 12,
    ];
    const score = checks.filter(Boolean).length;

    const label = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"][score];
    const colors = [
        "bg-slate-200",
        "bg-rose-400",
        "bg-amber-400",
        "bg-yellow-400",
        "bg-teal-400",
        "bg-emerald-500",
    ];

    if (!password) return null;

    return (
        <div className="mt-2 space-y-1.5">
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : "bg-slate-100"
                            }`}
                    />
                ))}
            </div>
            <p className={`text-xs font-medium ${score <= 2 ? "text-rose-500" : score <= 3 ? "text-amber-500" : "text-teal-600"
                }`}>
                {label}
            </p>
        </div>
    );
};

// ── Inner component that uses useSearchParams ─────────────
const SetPasswordForm = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token") ?? "";

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<FormValues>({ resolver: zodResolver(schema) });

    const passwordValue = watch("password") ?? "";

    useEffect(() => {
        if (!success) return;
        const t = setTimeout(() => router.push("/sign-in"), 3000);
        return () => clearTimeout(t);
    }, [success, router]);

    const onSubmit = async (values: FormValues) => {
        setLoading(true);
        setServerError(null);
        try {
            await api.post("/accounts/set-password/", {
                token,
                password: values.password,
            });
            setSuccess(true);
        } catch (err: any) {
            setServerError(
                err.response?.data?.message ??
                err.response?.data?.error ??
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative w-full max-w-lg">
            <div className="bg-white rounded-3xl shadow-[0_4px_40px_rgba(0,0,0,0.08)] overflow-hidden">
                <div className="h-1.5 w-full bg-gradient-to-r from-teal-400 via-teal-600 to-emerald-500" />

                <div className="px-8 pt-8 pb-10">
                    <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center mb-6 shadow-[inset_0_0_0_1px_rgba(20,184,166,0.2)]">
                        <KeyRound className="w-6 h-6 text-teal-600" />
                    </div>

                    {success ? (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
                                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h2 className="text-xl font-semibold text-slate-900 mb-2">Password Set!</h2>
                            <p className="text-sm text-slate-500 mb-1">
                                Your account is ready. Redirecting you to sign in…
                            </p>
                            <div className="flex justify-center mt-4">
                                <div className="flex gap-1">
                                    {[0, 1, 2].map((i) => (
                                        <span
                                            key={i}
                                            className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce"
                                            style={{ animationDelay: `${i * 0.15}s` }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="mb-7">
                                <h1 className="text-[22px] font-semibold text-slate-900 tracking-tight mb-1.5">
                                    Set your password
                                </h1>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    Your account has been created by an admin. Choose a strong password to get started.
                                </p>
                            </div>

                            {serverError && (
                                <div className="mb-5 px-4 py-3 rounded-xl bg-rose-50 border border-rose-100">
                                    <p className="text-sm text-rose-600">{serverError}</p>
                                </div>
                            )}

                            {!token && (
                                <div className="mb-5 px-4 py-3 rounded-xl bg-amber-50 border border-amber-100">
                                    <p className="text-sm text-amber-700">
                                        Invalid or missing reset token. Please use the link from your email.
                                    </p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                                        New Password <span className="text-rose-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Min. 8 characters"
                                            autoComplete="new-password"
                                            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 pr-11 transition-all"
                                            {...register("password")}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((v) => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <StrengthBar password={passwordValue} />
                                    {errors.password && (
                                        <p className="text-xs text-rose-500 mt-1.5">{errors.password.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                                        Confirm Password <span className="text-rose-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirm ? "text" : "password"}
                                            placeholder="Re-enter your password"
                                            autoComplete="new-password"
                                            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 pr-11 transition-all"
                                            {...register("confirmPassword")}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm((v) => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                            tabIndex={-1}
                                        >
                                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="text-xs text-rose-500 mt-1.5">{errors.confirmPassword.message}</p>
                                    )}
                                </div>

                                <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-teal-50/60 border border-teal-100">
                                    <ShieldCheck className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                                    <p className="text-xs text-teal-700 leading-relaxed">
                                        Use at least 8 characters with one uppercase letter and one number for a strong password.
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !token}
                                    className="w-full flex cursor-pointer items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl h-12 text-sm font-semibold shadow-sm transition-all"
                                >
                                    {loading ? (
                                        <><RefreshCw className="w-4 h-4 animate-spin" /> Setting Password…</>
                                    ) : (
                                        <>Set Password <ArrowRight className="w-4 h-4" /></>
                                    )}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>

            {!success && (
                <p className="text-center text-xs text-slate-400 mt-5">
                    Already have a password?{" "}
                    <a href="/sign-in" className="text-teal-600 hover:underline font-medium">
                        Sign in here
                    </a>
                </p>
            )}
        </div>
    );
};

// ── Fallback shown while useSearchParams resolves ─────────
const LoadingFallback = () => (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    className="w-2 h-2 rounded-full bg-teal-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                />
            ))}
        </div>
    </div>
);

// ── Default export wraps in Suspense ──────────────────────
const SetPasswordPage = () => (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-4 py-12">
        <div
            className="fixed inset-0 opacity-[0.025] pointer-events-none"
            style={{
                backgroundImage: `radial-gradient(circle, #0d9488 1px, transparent 1px)`,
                backgroundSize: "32px 32px",
            }}
        />
        <Suspense fallback={<LoadingFallback />}>
            <SetPasswordForm />
        </Suspense>
    </div>
);

export default SetPasswordPage;