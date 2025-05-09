"use client";

import React, { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import {
    getAuth,
    signInWithPhoneNumber,
    RecaptchaVerifier
} from "firebase/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const VerifyPhoneNumber = () => {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [confirmResult, setConfirmResult] = useState(null);
    const [verificationCode, setVerificationCode] = useState("");
    const [error, setError] = useState("");
    const [isSend, setIsSend] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter()
    const recaptchaVerifier = useRef(null);

    useEffect(() => {
        recaptchaVerifier.current = new RecaptchaVerifier(
            auth,
            "recaptcha-container",
            {
                size: "invisible",
                callback: (response) => {
                    console.log("reCAPTCHA solved:", response);
                },
                "expired-callback": () => {
                    console.log("reCAPTCHA expired");
                    resetRecaptcha();
                }
            }
        );

        return () => {
            if (recaptchaVerifier.current) {
                recaptchaVerifier.current.clear();
            }
        };
    }, [auth]);

    const resetRecaptcha = () => {
        if (recaptchaVerifier.current) {
            recaptchaVerifier.current.clear();
            recaptchaVerifier.current = new RecaptchaVerifier(
                auth,
                "recaptcha-container",
                {
                    size: "invisible",
                    callback: (response) => {
                        console.log("reCAPTCHA re-initialized:", response);
                    }
                }
            );
        }
    };

    const validatePhoneNumber = (number) => {
        const regex = /^\+[1-9]\d{1,14}$/;
        return regex.test(number);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (!validatePhoneNumber(phoneNumber)) {
            setError("Please enter a valid phone number (e.g., +23470789012)");
            setLoading(false);
            return;
        }

        try {
            const result = await signInWithPhoneNumber(
                auth,
                phoneNumber,
                recaptchaVerifier.current
            );
            setConfirmResult(result);
            setIsSend(true);
        } catch (err) {
            console.error("Error sending code:", err);
            setError(err.message || "Failed to send verification code. Please try again.");
            resetRecaptcha();
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (!verificationCode || verificationCode.length !== 6) {
            setError("Please enter a 6-digit OTP code.");
            setLoading(false);
            return;
        }

        try {
            const userCredential = await confirmResult.confirm(verificationCode);
            const user = userCredential.user;
            const idToken = await user.getIdToken();

            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("User not authenticated with Django.");
            }

            const response = await fetch("https://realvistamanagement.com/accounts/verify-phone/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${token}`,
                },
                body: JSON.stringify({
                    phone: phoneNumber,
                    firebase_id_token: idToken,
                }),
            });

            const result = await response.json();
            if (response.ok) {
                toast("Phone verified successfully!");
                router.push("/profile")
            } else {
                toast(result.detail || "Verification failed.");
            }
        } catch (err) {
            console.error("Error verifying code:", err);
            setError(err.message || "Invalid verification code. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Phone Verification</h2>
                    <p className="text-gray-600 mt-2">
                        {isSend ? "Enter the verification code" : "Enter your phone number"}
                    </p>
                </div>

                <div id="recaptcha-container" className="hidden"></div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                        {error}
                    </div>
                )}

                {!isSend ? (
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="+23470789012"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                required
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Include country code (e.g., +234 for Nigeria)
                            </p>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? "Sending..." : "Send Verification Code"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyCode} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Verification Code
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                placeholder="123456"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? "Verifying..." : "Verify Code"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsSend(false)}
                            disabled={loading}
                            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            Change Number
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default VerifyPhoneNumber;