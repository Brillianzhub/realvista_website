// LoginPage.jsx
"use client"
import { useState, useEffect } from 'react';
import { Eye, EyeOff, LogIn, Home } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import api from '@/config/apiClient';
import { toast } from 'sonner';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await api.post('/accounts/signin/', {
                email,
                password
            });

            const userData = {
                id: response.data.id || 'user-id',
                email: response.data.email,
                name: response.data.name || email.split('@')[0],
                avatar: response.data.avatar || null,
                token: response.data.token || 'sample-token',
                isLoggedIn: true
            };

            localStorage.setItem('userData', JSON.stringify(userData));

            console.log("token--->", response.data.token)
            window.dispatchEvent(new Event('userLogin'));

            localStorage.setItem('token', response.data.token);

            if (response.data.is_staff === false) {
                toast("Access denied!")
            }

            if (response.data.is_staff) {
                router.push('/dashboard');
            }

        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Left panel with background image - hidden on mobile */}
            <div
                className="hidden md:flex md:w-1/2 relative overflow-hidden"
                style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                {/* Teal overlay to maintain brand color while showing image */}
                <div
                    className="absolute inset-0"
                    style={{ backgroundColor: 'rgba(52, 139, 139, 0.72)' }}
                />

                <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
                    <Home size={64} className="mb-6 drop-shadow-lg" />
                    <h1 className="text-4xl font-bold mb-4 drop-shadow-md">Sign In to Admin</h1>
                    <p className="text-lg text-center max-w-md drop-shadow">
                        Access insights and manage operations.
                    </p>
                </div>
            </div>

            {/* Right panel with login form */}
            <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-6">
                <div className="w-full max-w-md">
                    {/* Logo for mobile */}
                    <div className="md:hidden flex justify-center mb-8">
                        <div className="p-4 rounded-full" style={{ backgroundColor: '#348b8b' }}>
                            <Home size={32} className="text-white" />
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold mb-2 text-gray-800">Sign in</h2>
                    <p className="text-gray-600 mb-8">Please enter your credentials to continue</p>

                    {error && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <a
                                    href="/forgot-password"
                                    className="text-sm font-medium hover:underline"
                                    style={{ color: '#348b8b' }}
                                >
                                    Forgot password?
                                </a>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-600"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 cursor-pointer px-4 flex justify-center items-center text-white rounded-lg font-medium transition-colors"
                            style={{ backgroundColor: '#348b8b' }}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <>
                                    <LogIn size={20} className="mr-2" />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}