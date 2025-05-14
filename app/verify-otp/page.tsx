"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import api from "@/config/apiClient";

export default function VerifyOTP() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email");

    const [otp, setOtp] = useState(["", "", "", "", ""]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [countdown, setCountdown] = useState(120);
    const [isResending, setIsResending] = useState(false);

    // Focus handling for OTP input
    // const inputRefs = Array(5).fill(0).map(() => useState<any>(null)[0]);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (!email) {
            router.push("/forgot-password");
            return;
        }

        // Focus on first input upon component mount
        if (inputRefs.current[0]) {
            inputRefs.current[0]?.focus();
        }

        // Start countdown
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [email, router]);


    const handleOTPChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newOTP = [...otp];
        newOTP[index] = value;
        setOtp(newOTP);

        if (value && index < 5 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").trim();

        if (/^\d+$/.test(pastedData)) {
            const digits = pastedData.slice(0, 6).split("");
            const newOTP = [...otp];

            digits.forEach((digit, index) => {
                newOTP[index] = digit;
            });

            setOtp(newOTP);

            if (digits.length < 6 && inputRefs.current[digits.length]) {
                inputRefs.current[digits.length]?.focus();
            }
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        const otpValue = otp.join("");
        if (otpValue.length !== 5) {
            setMessage({ type: "error", text: "Please enter all 5 digits of the OTP" });
            return;
        }

        try {
            setIsSubmitting(true);
            setMessage({ type: "", text: "" });

            await api.post("/accounts/verify-otp/", {
                email,
                otp: otpValue
            });

            setMessage({
                type: "success",
                text: "Email verification successfully!"
            });

            // Redirect after successful verification (after a short delay)
            setTimeout(() => {
                router.push(`/change-password?email=${email}`);
            }, 2000);

        } catch (error: any) {
            setMessage({
                type: "error",
                text: error.response?.data?.message || "Invalid OTP. Please try again."
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendOTP = async () => {
        if (countdown > 0) return;

        try {
            setIsResending(true);

            await api.post("/accounts/request-password-reset/", { email });

            setMessage({
                type: "success",
                text: "A new OTP has been sent to your email"
            });

            // Reset countdown
            setCountdown(120);

            // Start countdown again
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

        } catch (error: any) {
            setMessage({
                type: "error",
                text: error.response?.data?.message || "Failed to resend OTP. Please try again."
            });
        } finally {
            setIsResending(false);
        }
    };

    const formatTime = (seconds: any) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (!email) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="py-20">
            <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-center text-teal-700 mb-2">Verify Your Email</h2>
                <p className="text-center text-gray-600 mb-6">
                    We've sent a 6-digit code to <span className="font-medium text-teal-600">{email}</span>
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Enter Verification Code
                        </label>

                        <div className="flex justify-between gap-2">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el: any) => (inputRefs.current[index] = el)}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOTPChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={index === 0 ? handlePaste : undefined}
                                    className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                />
                            ))}
                        </div>
                    </div>

                    {message.text && (
                        <div
                            className={`p-3 rounded-md mb-5 ${message.type === "error"
                                ? "bg-red-100 text-red-700"
                                : "bg-teal-100 text-teal-700"
                                }`}
                        >
                            {message.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-3 px-4 rounded-md text-white font-medium ${isSubmitting
                            ? "bg-teal-400 cursor-not-allowed"
                            : "bg-teal-600 hover:bg-teal-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                            }`}
                    >
                        {isSubmitting ? "Verifying..." : "Verify Email"}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-600 mb-2">Didn't receive the code?</p>
                    <button
                        onClick={handleResendOTP}
                        disabled={countdown > 0 || isResending}
                        className={`text-sm cursor-pointer font-medium ${countdown > 0 || isResending
                            ? "text-teal-700 cursor-not-allowed"
                            : "text-teal-600 hover:text-teal-800"
                            }`}
                    >
                        {isResending
                            ? "Resending..."
                            : countdown > 0
                                ? `Resend code in ${formatTime(countdown)}`
                                : "Resend Code"
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}