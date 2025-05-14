"use client";

import api from "@/config/apiClient";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PasswordResetForm() {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const router = useRouter()

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        if (!email) {
            setMessage({ type: "error", text: "Please enter your email address" });
            return;
        }

        try {
            setIsSubmitting(true);
            setMessage({ type: "", text: "" });

            const response = await api.post("/accounts/request-password-reset/", { email });

            setMessage({
                type: "success",
                text: "Password reset instructions have been sent to your email"
            });

            setTimeout(() => {
                router.push(`/verify-otp?email=${email}`);
            }, 2000);
            setEmail("");
        } catch (error: any) {
            setMessage({
                type: "error",
                text: error.message || "Something went wrong. Please try again."
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex justify-center items-center py-20">
            <div className="w-[450px] mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Reset Your Password</h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    {message.text && (
                        <div
                            className={`p-3 rounded-md mb-4 ${message.type === "error"
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                                }`}
                        >
                            {message.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-2 cursor-pointer px-4 rounded-md text-white font-medium ${isSubmitting
                            ? "bg-teal-700 cursor-not-allowed"
                            : "bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                            }`}
                    >
                        {isSubmitting ? "Sending..." : "Reset Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}