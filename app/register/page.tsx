"use client"
import React, { Suspense, useState } from 'react';
import {
    User,
    UserPlus,
    Mail,
    Lock,
    Briefcase,
    Phone,
    MapPin,
    CheckCircle2,
    ArrowLeft,
    AlertCircle
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios'; // Make sure to install axios if not already installed
import api from '@/config/apiClient';

type formDataProps = {
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    confirmPassword: string,
    phoneNumber: string,
    companyName: string,
    licenseNumber: string,
    agencyAddress: string,
    whatsappNumber: string,
    experienceYears: string,
    preferredContactMode: string,
    bios: string
    acceptTerms: boolean
}

const SignUpPage = () => {
    const router = useRouter()
    const [userType, setUserType] = useState<string | null>(null);
    const [formData, setFormData] = useState<formDataProps>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        companyName: '',
        licenseNumber: '',
        agencyAddress: '',
        whatsappNumber: '',
        experienceYears: '0',
        preferredContactMode: 'whatsapp',
        bios: '',
        acceptTerms: false // Add this new field
    });
    const [formStage, setFormStage] = useState<any>('type-selection');
    const [formErrors, setFormErrors] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const params = useSearchParams()
    const ref = params.get("ref")

    const handleBack = () => {
        if (formStage === 'details') {
            setFormStage('type-selection');
            setUserType(null);
        } else if (formStage === 'success') {
            setFormStage('details');
        }
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: checked
        }));
    };


    const handleUserTypeSelect = (type: string) => {
        setUserType(type);
        setFormStage('details');
    };

    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        const errors = {} as any;

        if (!formData.firstName.trim()) errors.firstName = "First name is required";
        if (!formData.lastName.trim()) errors.lastName = "Last name is required";

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            errors.email = "Email is required";
        } else if (!emailRegex.test(formData.email)) {
            errors.email = "Invalid email format";
        }

        if (!formData.password) errors.password = "Password is required";
        if (formData.password.length < 8) {
            errors.password = "Password must be at least 8 characters";
        }

        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
        }

        if (userType === 'agent') {
            if (!formData.phoneNumber.trim()) errors.phoneNumber = "Phone number is required";
            if (!formData.whatsappNumber.trim()) errors.whatsappNumber = "WhatsApp number is required";
            if (!formData.experienceYears.trim()) errors.experienceYears = "Experience years is required";
            if (!formData.bios.trim()) errors.bios = "Bio is required";
        }
        if (!formData.acceptTerms) {
            errors.acceptTerms = "You must accept the Terms and Conditions";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError(null);

        if (validateForm()) {
            setIsSubmitting(true);

            try {
                // Prepare the payload based on user type
                const payload = userType === 'agent'
                    ? {
                        name: `${formData.firstName} ${formData.lastName}`,
                        first_name: formData.firstName,
                        email: formData.email,
                        password: formData.password,
                        auth_provider: "email",
                        is_agent: true,
                        bios: formData.bios || "Real estate professional",
                        agency_name: formData.companyName,
                        agency_address: formData.agencyAddress,
                        phone_number: formData.phoneNumber,
                        whatsapp_number: formData.whatsappNumber,
                        experience_years: formData.experienceYears,
                        preferred_contact_mode: formData.preferredContactMode
                    }
                    : {
                        name: `${formData.firstName} ${formData.lastName}`,
                        first_name: formData.firstName,
                        email: formData.email,
                        password: formData.password,
                        auth_provider: "email"
                    };

                // Make API call
                const response = await api.post(`/accounts/register_user/?ref=${ref}`, payload);
                console.log('API Response:', response.data);
                router.push(`verify-email?id=${response.data.id}`)
            } catch (error: any) {
                console.error('Registration error:', error);
                setApiError(error.response?.data?.message || 'An error occurred during registration. Please try again.');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const renderTypeSelection = () => (
        <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#348b8b] to-[#FB902D] bg-clip-text text-transparent mb-3">
                Welcome to Realvista
            </h1>
            <p className="text-gray-600 mb-8 text-lg">Join thousands of users finding their perfect property match</p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-8">
                Choose Your Account Type
            </h2>

            <div className="flex flex-col md:flex-row justify-center space-y-6 md:space-y-0 md:space-x-8">
                <button
                    onClick={() => handleUserTypeSelect('customer')}
                    className="
                        bg-white 
                        rounded-2xl 
                        p-6 md:p-8
                        shadow-lg 
                        hover:shadow-xl 
                        cursor-pointer
                        transition-all 
                        duration-300
                        transform 
                        hover:scale-105
                        flex 
                        flex-col 
                        items-center
                        border-2 border-transparent
                        hover:border-[#348b8b]/20
                        w-full md:w-64
                        group
                    "
                >
                    <div className="w-20 h-20 rounded-full bg-[#348b8b]/10 flex items-center justify-center mb-4 group-hover:bg-[#348b8b]/20 transition-colors">
                        <User className="w-10 h-10 text-[#348b8b] group-hover:text-[#348b8b]" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                        Customer
                    </h3>
                    <p className="text-gray-600 text-center">
                        Looking to buy or rent your dream property
                    </p>
                </button>

                <button
                    onClick={() => handleUserTypeSelect('agent')}
                    className="
                        bg-white 
                        rounded-2xl 
                        p-6 md:p-8
                        shadow-lg 
                        cursor-pointer
                        hover:shadow-xl 
                        transition-all 
                        duration-300
                        transform 
                        hover:scale-105
                        flex 
                        flex-col 
                        items-center
                        border-2 border-transparent
                        hover:border-[#FB902D]/20
                        w-full md:w-64
                        group
                    "
                >
                    <div className="w-20 h-20 rounded-full bg-[#FB902D]/10 flex items-center justify-center mb-4 group-hover:bg-[#FB902D]/20 transition-colors">
                        <Briefcase className="w-10 h-10 text-[#FB902D] group-hover:text-[#FB902D]" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                        Agent
                    </h3>
                    <p className="text-gray-600 text-center">
                        List properties and connect with clients
                    </p>
                </button>
            </div>
            <p className='mt-8'>Already have an account? <Link href="/sign-in" className='text-blue-500 font-semibold underline'>Sign in</Link></p>
        </div>
    );

    const renderDetailsForm = () => (
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-2">
                <span className="bg-gradient-to-r from-[#348b8b] to-[#FB902D] bg-clip-text text-transparent">
                    Create Your {userType === 'agent' ? 'Agent' : 'Customer'} Account
                </span>
            </h2>
            <p className="text-center text-gray-600 mb-8">Fill in your details to get started</p>

            {apiError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                    <AlertCircle className="text-red-500 mr-3 mt-0.5 flex-shrink-0" size={20} />
                    <p className="text-red-700">{apiError}</p>
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="firstName" className="block mb-2 text-gray-700 font-medium">
                        First Name
                    </label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#348b8b]">
                            <User size={18} />
                        </div>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className={`
                                w-full pl-10 pr-4 py-3
                                border rounded-xl focus:outline-none 
                                focus:ring-2 focus:ring-[#348b8b]
                                transition-all duration-200
                                ${formErrors.firstName ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                            `}
                            placeholder="First Name"
                        />
                        {formErrors.firstName && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>
                        )}
                    </div>
                </div>

                <div>
                    <label htmlFor="lastName" className="block mb-2 text-gray-700 font-medium">
                        Last Name
                    </label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#348b8b]">
                            <User size={18} />
                        </div>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className={`
                                w-full pl-10 pr-4 py-3
                                border rounded-xl focus:outline-none 
                                focus:ring-2 focus:ring-[#348b8b]
                                transition-all duration-200
                                ${formErrors.lastName ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                            `}
                            placeholder="Last Name"
                        />
                        {formErrors.lastName && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <label htmlFor="email" className="block mb-2 text-gray-700 font-medium">
                    Email Address
                </label>
                <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#348b8b]">
                        <Mail size={18} />
                    </div>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`
                            w-full pl-10 pr-4 py-3
                            border rounded-xl focus:outline-none 
                            focus:ring-2 focus:ring-[#348b8b]
                            transition-all duration-200
                            ${formErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                        `}
                        placeholder="your.email@example.com"
                    />
                    {formErrors.email && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                    )}
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                    <label htmlFor="password" className="block mb-2 text-gray-700 font-medium">
                        Password
                    </label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#348b8b]">
                            <Lock size={18} />
                        </div>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className={`
                                w-full pl-10 pr-4 py-3
                                border rounded-xl focus:outline-none 
                                focus:ring-2 focus:ring-[#348b8b]
                                transition-all duration-200
                                ${formErrors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                            `}
                            placeholder="Password"
                        />
                        {formErrors.password && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
                        )}
                    </div>
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block mb-2 text-gray-700 font-medium">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#348b8b]">
                            <Lock size={18} />
                        </div>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className={`
                                w-full pl-10 pr-4 py-3
                                border rounded-xl focus:outline-none 
                                focus:ring-2 focus:ring-[#348b8b]
                                transition-all duration-200
                                ${formErrors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                            `}
                            placeholder="Confirm Password"
                        />
                        {formErrors.confirmPassword && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.confirmPassword}</p>
                        )}
                    </div>
                </div>
            </div>

            {userType === 'agent' && (
                <div className="mt-8 p-6 bg-gradient-to-r from-[#348b8b]/5 to-[#FB902D]/5 rounded-xl border border-[#348b8b]/20">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Agent Information</h3>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="phoneNumber" className="block mb-2 text-gray-700 font-medium">
                                Phone Number
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#348b8b]">
                                    <Phone size={18} />
                                </div>
                                <input
                                    type="tel"
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    className={`
                                        w-full pl-10 pr-4 py-3
                                        border rounded-xl focus:outline-none 
                                        focus:ring-2 focus:ring-[#348b8b]
                                        transition-all duration-200
                                        ${formErrors.phoneNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                                    `}
                                    placeholder="Enter number"
                                />
                                {formErrors.phoneNumber && (
                                    <p className="text-red-500 text-sm mt-1">{formErrors.phoneNumber}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="whatsappNumber" className="block mb-2 text-gray-700 font-medium">
                                WhatsApp Number
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#348b8b]">
                                    <Phone size={18} />
                                </div>
                                <input
                                    type="tel"
                                    id="whatsappNumber"
                                    name="whatsappNumber"
                                    value={formData.whatsappNumber}
                                    onChange={handleInputChange}
                                    className={`
                                        w-full pl-10 pr-4 py-3
                                        border rounded-xl focus:outline-none 
                                        focus:ring-2 focus:ring-[#348b8b]
                                        transition-all duration-200
                                        ${formErrors.whatsappNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                                    `}
                                    placeholder="WhatsApp Number"
                                />
                                {formErrors.whatsappNumber && (
                                    <p className="text-red-500 text-sm mt-1">{formErrors.whatsappNumber}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                        <div>
                            <label htmlFor="companyName" className="block mb-2 text-gray-700 font-medium">
                                Company/Agency Name (optional)
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#348b8b]">
                                    <Briefcase size={18} />
                                </div>
                                <input
                                    type="text"
                                    id="companyName"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleInputChange}
                                    className={`
                                        w-full pl-10 pr-4 py-3
                                        border rounded-xl focus:outline-none 
                                        focus:ring-2 focus:ring-[#348b8b]
                                        transition-all duration-200
                                        ${formErrors.companyName ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                                    `}
                                    placeholder="Real Estate Company"
                                />
                                {formErrors.companyName && (
                                    <p className="text-red-500 text-sm mt-1">{formErrors.companyName}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="licenseNumber" className="block mb-2 text-gray-700 font-medium">
                                License Number (optional)
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#348b8b]">
                                    <MapPin size={18} />
                                </div>
                                <input
                                    type="text"
                                    id="licenseNumber"
                                    name="licenseNumber"
                                    value={formData.licenseNumber}
                                    onChange={handleInputChange}
                                    className={`
                                        w-full pl-10 pr-4 py-3
                                        border rounded-xl focus:outline-none 
                                        focus:ring-2 focus:ring-[#348b8b]
                                        transition-all duration-200
                                        ${formErrors.licenseNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                                    `}
                                    placeholder="RE License Number"
                                />
                                {formErrors.licenseNumber && (
                                    <p className="text-red-500 text-sm mt-1">{formErrors.licenseNumber}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <label htmlFor="agencyAddress" className="block mb-2 text-gray-700 font-medium">
                            Agency Address (optional)
                        </label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#348b8b]">
                                <MapPin size={18} />
                            </div>
                            <input
                                type="text"
                                id="agencyAddress"
                                name="agencyAddress"
                                value={formData.agencyAddress}
                                onChange={handleInputChange}
                                className={`
                                    w-full pl-10 pr-4 py-3
                                    border rounded-xl focus:outline-none 
                                    focus:ring-2 focus:ring-[#348b8b]
                                    transition-all duration-200
                                `}
                                placeholder="Agency Full Address"
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                        <div>
                            <label htmlFor="experienceYears" className="block mb-2 text-gray-700 font-medium">
                                Years of Experience
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#348b8b]">
                                    <Briefcase size={18} />
                                </div>
                                <input
                                    type="number"
                                    id="experienceYears"
                                    name="experienceYears"
                                    value={formData.experienceYears}
                                    onChange={handleInputChange}
                                    min="0"
                                    className={`
                                        w-full pl-10 pr-4 py-3
                                        border rounded-xl focus:outline-none 
                                        focus:ring-2 focus:ring-[#348b8b]
                                        transition-all duration-200
                                        ${formErrors.experienceYears ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                                    `}
                                    placeholder="Years in Real Estate"
                                />
                                {formErrors.experienceYears && (
                                    <p className="text-red-500 text-sm mt-1">{formErrors.experienceYears}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="preferredContactMode" className="block mb-2 text-gray-700 font-medium">
                                Preferred Contact Method
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#348b8b]">
                                    <Phone size={18} />
                                </div>
                                <select
                                    id="preferredContactMode"
                                    name="preferredContactMode"
                                    value={formData.preferredContactMode}
                                    onChange={handleInputChange}
                                    className={`
                                        w-full pl-10 pr-4 py-3
                                        border rounded-xl focus:outline-none 
                                        focus:ring-2 focus:ring-[#348b8b]
                                        transition-all duration-200
                                        ${formErrors.preferredContactMode ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                                    `}
                                >
                                    <option value="whatsapp">WhatsApp</option>
                                    <option value="phone">Phone Call</option>
                                    <option value="email">Email</option>
                                </select>
                                {formErrors.preferredContactMode && (
                                    <p className="text-red-500 text-sm mt-1">{formErrors.preferredContactMode}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <label htmlFor="bios" className="block mb-2 text-gray-700 font-medium">
                            Professional Bio
                        </label>
                        <textarea
                            id="bios"
                            name="bios"
                            value={formData.bios}
                            onChange={handleInputChange}
                            rows={4}
                            className={`
                                w-full px-4 py-3
                                border rounded-xl focus:outline-none 
                                focus:ring-2 focus:ring-[#348b8b]
                                transition-all duration-200
                                ${formErrors.bios ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                            `}
                            placeholder="Tell clients about your experience and expertise..."
                        />
                        {formErrors.bios && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.bios}</p>
                        )}
                    </div>
                </div>
            )}
            <div className="mt-6">
                <div className="flex items-start">
                    <div className="flex items-center h-5">
                        <input
                            id="acceptTerms"
                            name="acceptTerms"
                            type="checkbox"
                            checked={formData.acceptTerms}
                            onChange={handleCheckboxChange}
                            className={`
                    h-5 w-5 rounded 
                    border-gray-300 text-[#348b8b] 
                    focus:ring-[#348b8b]
                    ${formErrors.acceptTerms ? 'border-red-500 bg-red-50' : ''}
                `}
                        />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="acceptTerms" className="font-medium text-gray-700">
                            I agree to the <Link href="/terms" className="text-[#348b8b] hover:underline">Terms and Conditions</Link> and <Link href="/privacy-policy" className="text-[#348b8b] hover:underline">Privacy Policy</Link>
                        </label>
                        {formErrors.acceptTerms && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.acceptTerms}</p>
                        )}
                    </div>
                </div>
            </div>


            <div className="mt-8 text-center">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="
                        bg-gradient-to-r from-[#348b8b] cursor-pointer to-[#FB902D]
                        text-white 
                        px-8 py-4
                        rounded-xl
                        font-semibold 
                        hover:from-[#2d7a7a] hover:to-[#e5821f]
                        transition-all
                        duration-300
                        shadow-md
                        hover:shadow-lg
                        flex
                        items-center
                        justify-center
                        mx-auto
                        w-full md:w-auto
                        min-w-48
                        disabled:opacity-70
                        disabled:cursor-not-allowed
                    "
                >
                    {isSubmitting ? (
                        <>
                            <span className="animate-spin mr-2">⟳</span>
                            Processing...
                        </>
                    ) : (
                        <>
                            <UserPlus className="mr-2" size={20} />
                            Create Account
                        </>
                    )}
                </button>

                <div className="mt-6 text-gray-600">
                    Already have an account?
                    <Link
                        href="/sign-in"
                        className="text-[#348b8b] font-medium ml-2 hover:underline focus:outline-none"
                    >
                        Sign in
                    </Link>
                </div>
            </div>
        </form>
    );

    const renderSuccessPage = () => (
        <div className="text-center max-w-md mx-auto py-6">
            <div className="w-24 h-24 rounded-full bg-[#348b8b]/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-16 h-16 text-[#348b8b]" />
            </div>

            <h2 className="text-3xl font-bold mb-2">
                <span className="bg-gradient-to-r from-[#348b8b] to-[#FB902D] bg-clip-text text-transparent">
                    Account Created Successfully!
                </span>
            </h2>

            <p className="text-gray-600 mb-8">
                Welcome to Realvista. You can now log in and start
                {userType === 'agent' ? ' listing properties' : ' exploring available properties'}.
            </p>

            <button
                onClick={() => {
                    router.push('/sign-in')
                }}
                className="
                    bg-gradient-to-r from-[#348b8b] to-[#FB902D]
                    text-white 
                    px-8 py-3
                    rounded-xl
                    font-semibold 
                    hover:from-[#2d7a7a] hover:to-[#e5821f]
                    transition-all
                    duration-300
                    shadow-md
                    hover:shadow-lg
                    w-full md:w-auto
                "
            >
                Go to Login
            </button>
        </div>
    );

    return (
        <div className="bg-gradient-to-br from-[#348b8b]/5 via-white to-[#FB902D]/5 min-h-screen flex flex-col md:flex-row">
            {/* Left side illustration for desktop */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#348b8b] items-center justify-center p-12">
                <div className="max-w-md text-white">
                    <h2 className="text-4xl font-bold mb-6">Find Your Dream Property</h2>
                    <p className="text-lg mb-8">Join thousands of satisfied customers who have found their perfect home using Realvista.</p>

                    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                        <div className="flex items-start mb-4">
                            <div className="bg-[#FB902D]/50 rounded-full p-2 mr-4">
                                <CheckCircle2 size={16} className="text-white" />
                            </div>
                            <p>Access to thousands of premium listings</p>
                        </div>
                        <div className="flex items-start mb-4">
                            <div className="bg-[#FB902D]/50 rounded-full p-2 mr-4">
                                <CheckCircle2 size={16} className="text-white" />
                            </div>
                            <p>Connect directly with verified agents</p>
                        </div>
                        <div className="flex items-start">
                            <div className="bg-[#FB902D]/50 rounded-full p-2 mr-4">
                                <CheckCircle2 size={16} className="text-white" />
                            </div>
                            <p>Schedule viewings with a single click</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8 lg:p-12">
                <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 w-full max-w-2xl">
                    {formStage !== "type-selection" && (
                        <button
                            onClick={handleBack}
                            className="inline-flex items-center mb-6 text-[#348b8b] hover:text-[#2d7a7a] font-medium transition-colors"
                        >
                            <ArrowLeft size={18} className="mr-2" />
                            <span>Back</span>
                        </button>
                    )}

                    {formStage === 'type-selection' && renderTypeSelection()}
                    {formStage === 'details' && renderDetailsForm()}
                    {formStage === 'success' && renderSuccessPage()}
                </div>
            </div>
        </div>
    );
};

export default function SignUpPageComponent() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SignUpPage />
        </Suspense>
    );
}