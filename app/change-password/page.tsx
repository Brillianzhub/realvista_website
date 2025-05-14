"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/config/apiClient";

const ChangePassword = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        feedback: ""
    });

    useEffect(() => {
        if (!email) {
            router.push("/forgot-password");
        }
    }, [email, router]);

    const checkPasswordStrength = (password: any) => {
        // Basic password strength check
        let score = 0;
        let feedback = "";

        if (password.length >= 8) score += 1;
        if (password.match(/[A-Z]/)) score += 1;
        if (password.match(/[0-9]/)) score += 1;
        if (password.match(/[^A-Za-z0-9]/)) score += 1;

        if (score === 0) {
            feedback = "Very weak";
        } else if (score === 1) {
            feedback = "Weak";
        } else if (score === 2) {
            feedback = "Fair";
        } else if (score === 3) {
            feedback = "Good";
        } else {
            feedback = "Strong";
        }

        return { score, feedback };
    };

    const handlePasswordChange = (e: any) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        setPasswordStrength(checkPasswordStrength(newPassword));
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        // Form validation
        if (!password) {
            setMessage({ type: "error", text: "Please enter a password" });
            return;
        }

        if (password.length < 8) {
            setMessage({ type: "error", text: "Password must be at least 8 characters long" });
            return;
        }

        if (password !== confirmPassword) {
            setMessage({ type: "error", text: "Passwords do not match" });
            return;
        }

        try {
            setIsSubmitting(true);
            setMessage({ type: "", text: "" });

            const response = await api.post("/accounts/password-reset/", {
                email,
                password
            });

            setMessage({
                type: "success",
                text: "Password has been successfully changed!"
            });

            // Clear form
            setPassword("");
            setConfirmPassword("");

            // Redirect to login page after a short delay
            setTimeout(() => {
                router.push("/sign-in");
            }, 2000);

        } catch (error: any) {
            setMessage({
                type: "error",
                text: error.response?.data?.message || "Failed to change password. Please try again."
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStrengthColor = (score: any) => {
        switch (score) {
            case 0: return "bg-red-500";
            case 1: return "bg-red-400";
            case 2: return "bg-yellow-500";
            case 3: return "bg-green-400";
            case 4: return "bg-green-600";
            default: return "bg-gray-200";
        }
    };

    if (!email) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="py-20">
            <div className="w-[450px] mx-auto mt-10 p-8 bg-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-center text-teal-700 mb-2">Change Your Password</h2>
                <p className="text-center text-gray-600 mb-6">
                    Create a new password for <span className="font-medium text-teal-600">{email}</span>
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-5">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={handlePasswordChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="Enter your new password"
                        />

                        {password && (
                            <div className="mt-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${getStrengthColor(passwordStrength.score)}`}
                                            style={{ width: `${(passwordStrength.score + 1) * 20}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-gray-500">{passwordStrength.feedback}</span>
                                </div>
                                <ul className="text-xs text-gray-500 mt-1 pl-4 list-disc">
                                    <li className={password.length >= 8 ? "text-green-600" : ""}>
                                        At least 8 characters
                                    </li>
                                    <li className={password.match(/[A-Z]/) ? "text-green-600" : ""}>
                                        Uppercase letter
                                    </li>
                                    <li className={password.match(/[0-9]/) ? "text-green-600" : ""}>
                                        Number
                                    </li>
                                    <li className={password.match(/[^A-Za-z0-9]/) ? "text-green-600" : ""}>
                                        Special character
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="mb-6">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="Confirm your new password"
                        />

                        {password && confirmPassword && (
                            <p className={`text-xs mt-1 ${password === confirmPassword ? "text-green-600" : "text-red-500"
                                }`}>
                                {password === confirmPassword
                                    ? "Passwords match"
                                    : "Passwords do not match"}
                            </p>
                        )}
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
                        className={`w-full py-3 px-4 cursor-pointer rounded-md text-white font-medium ${isSubmitting
                            ? "bg-teal-700 cursor-not-allowed"
                            : "bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                            }`}
                    >
                        {isSubmitting ? "Changing Password..." : "Change Password"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Remember your password? {" "}
                        <a href="/sign-in" className="text-teal-600 hover:text-teal-800 font-medium">
                            Sign in
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
export default ChangePassword