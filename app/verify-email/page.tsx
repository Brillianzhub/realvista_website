"use client"
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle, RefreshCw, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/config/apiClient';

// This is the main component that uses useSearchParams
function EmailVerificationContent() {
    const searchParams = useSearchParams();
    const [verificationStatus, setVerificationStatus] = useState('waiting'); // waiting, pending, success, error
    const [message, setMessage] = useState('Please enter the verification code sent to your email.');
    const [isLoading, setIsLoading] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter()

    const userId = searchParams.get('id');
    const email = searchParams.get("email")
    console.log("email--->", email)

    // Auto-verify if both userId and code are provided in the URL
    useEffect(() => {
        const codeFromURL = searchParams.get('code');

        if (userId && codeFromURL) {
            // If both parameters are in the URL, auto-verify
            setVerificationCode(codeFromURL);
            handleVerification(codeFromURL);
        }
    }, [searchParams]);

    const handleVerification = async (code: any) => {
        setIsLoading(true);
        setVerificationStatus('pending');
        setMessage('Verifying your email...');
        setErrorMessage('');

        if (!userId) {
            setVerificationStatus('error');
            setMessage('Missing user information.');
            setIsLoading(false);
            return;
        }

        if (!code) {
            setVerificationStatus('error');
            setMessage('Please enter the verification code sent to your email.');
            setIsLoading(false);
            return;
        }

        try {
            // Using axios instead of fetch
            const response = await api.post(`/accounts/verify-email/${userId}/?code=${code}`);

            if (response.data) {
                setVerificationStatus('success');
                setMessage('Your email has been successfully verified!');
            } else {
                setVerificationStatus('error');
                setMessage(response.data.message || 'Invalid verification code. Please try again.');
            }
        } catch (error) {
            setVerificationStatus('error');
            setErrorMessage('An error occurred during verification.');
            setMessage('Email verification failed.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();
        handleVerification(verificationCode);
    };

    const retryVerification = async () => {
        // Reset to waiting state
        setVerificationStatus('waiting');
        setMessage('Please enter the verification code sent to your email.');
        setVerificationCode('');
        setErrorMessage('');
    };

    const resendVerificationCode = async () => {
        if (!userId) {
            setErrorMessage('Missing user information.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post('/accounts/resend_token/', { email });

            if (response.data) {
                setMessage('A new verification code has been sent to your email.');
            } else {
                setErrorMessage(response.data.message || 'Failed to resend verification code.');
            }
        } catch (error) {
            setErrorMessage('An error occurred while resending the code.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderStatusIcon = () => {
        switch (verificationStatus) {
            case 'waiting':
                return <Mail className="h-16 w-16 text-teal-500" />;
            case 'pending':
                return <Loader2 className="h-16 w-16 text-teal-500 animate-spin" />;
            case 'success':
                return <CheckCircle className="h-16 w-16 text-teal-500" />;
            case 'error':
                return <XCircle className="h-16 w-16 text-red-500" />;
            default:
                return null;
        }
    };

    const getCardBorderColor = () => {
        switch (verificationStatus) {
            case 'waiting':
                return 'border-blue-200';
            case 'pending':
                return 'border-blue-200';
            case 'success':
                return 'border-teal-200';
            case 'error':
                return 'border-red-200';
            default:
                return 'border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-lg w-full">

                <Card className={`overflow-hidden shadow-lg ${getCardBorderColor()}`}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl text-center">Email Verification</CardTitle>
                    </CardHeader>

                    <CardContent className="pt-2 pb-6">
                        <div className="flex flex-col items-center justify-center space-y-4">
                            {renderStatusIcon()}

                            <div className="text-center mt-4">
                                <h3 className={`font-medium text-lg ${verificationStatus === 'success' ? 'text-green-700' :
                                    verificationStatus === 'error' ? 'text-red-700' : 'text-teal-700'
                                    }`}>
                                    {verificationStatus === 'success' ? 'Verification Successful' :
                                        verificationStatus === 'error' ? 'Verification Failed' :
                                            verificationStatus === 'pending' ? 'Verifying Email' : 'Verify Your Email'}
                                </h3>
                                <p className="text-gray-600 mt-2">{message}</p>
                                {errorMessage && <p className="text-red-500 text-sm mt-1">{errorMessage}</p>}
                            </div>

                            {verificationStatus === 'waiting' && (
                                <form onSubmit={handleSubmit} className="w-full max-w-xs mt-4">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="verificationCode">Verification Code</Label>
                                            <Input
                                                id="verificationCode"
                                                placeholder="Enter code from your email"
                                                value={verificationCode}
                                                onChange={(e) => setVerificationCode(e.target.value)}
                                                className="text-lg letter-spacing-wide"
                                                maxLength={6}
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full bg-teal-600 cursor-pointer hover:bg-teal-700"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Verifying...
                                                </>
                                            ) : (
                                                'Verify Email'
                                            )}
                                        </Button>

                                        <div className="text-center mt-2">
                                            <Button
                                                variant="link"
                                                type="button"
                                                onClick={resendVerificationCode}
                                                disabled={isLoading}
                                                className="text-sm text-teal-600 hover:text-teal-800"
                                            >
                                                Didn't receive a code? Resend
                                            </Button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    </CardContent>

                    <CardFooter className="flex justify-center border-t bg-gray-50 py-4">
                        {verificationStatus === 'success' ? (
                            <Button
                                variant="default"
                                className="bg-teal-600 cursor-pointer hover:bg-teal-700"
                                onClick={() => router.push("/sign-in")}
                            >
                                Continue to Login
                            </Button>
                        ) : verificationStatus === 'error' ? (
                            <Button
                                variant="outline"
                                className="border-red-500 text-red-600 hover:bg-red-50"
                                onClick={retryVerification}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Retrying...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Try Again
                                    </>
                                )}
                            </Button>
                        ) : verificationStatus === 'pending' ? (
                            <Button disabled className="bg-blue-600 opacity-50">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Please Wait...
                            </Button>
                        ) : null}
                    </CardFooter>
                </Card>

                {verificationStatus === 'success' && (
                    <Alert className="mt-4 bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertTitle>Success!</AlertTitle>
                        <AlertDescription>
                            Your email has been verified. You can now login to your account.
                        </AlertDescription>
                    </Alert>
                )}

                {verificationStatus === 'error' && (
                    <Alert className="mt-4 bg-red-50 border-red-200">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <AlertTitle>Verification Failed</AlertTitle>
                        <AlertDescription>
                            There was a problem verifying your email. Please try again or contact support.
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        </div>
    );
}

// Loading fallback component
function LoadingVerification() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-lg w-full">
                <Card className="overflow-hidden shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl text-center">Email Verification</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2 pb-6">
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <Loader2 className="h-16 w-16 text-teal-500 animate-spin" />
                            <div className="text-center mt-4">
                                <h3 className="font-medium text-lg text-teal-700">Loading...</h3>
                                <p className="text-gray-600 mt-2">Please wait while we load your verification details.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Main component wrapped with Suspense
export default function EmailVerificationPage() {
    return (
        <Suspense fallback={<LoadingVerification />}>
            <EmailVerificationContent />
        </Suspense>
    );
}