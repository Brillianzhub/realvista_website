"use client"

import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Check,
  Clock,
  ArrowRight,
  AlertCircle,
  X
} from 'lucide-react';

// Import validation library
import * as Yup from 'yup';
import api from '@/config/apiClient';

// Define validation schema using Yup
const contactSchema = Yup.object().shape({
  name: Yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  phone: Yup.string()
    .matches(/^[0-9()\-\s+]*$/, "Please enter a valid phone number"),
  message: Yup.string()
    .required("Message is required")
    .min(10, "Message should be at least 10 characters")
});

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showModal, setShowModal] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = async () => {
    try {
      await contactSchema.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors: Record<string, string> = {};
        error.inner.forEach(err => {
          if (err.path) {
            validationErrors[err.path] = err.message;
          }
        });
        setErrors(validationErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset error states
    setApiError('');

    // Validate form
    const isValid = await validateForm();
    if (!isValid) return;

    setFormStatus('sending');

    try {
      // Prepare payload for API
      const payload = {
        fullname: formData.name,
        email: formData.email,
        phone_number: formData.phone,
        message: formData.message
      };

      // Send data to API
      await api.post('/contact-us/', payload);

      // Update form status and show success modal
      setFormStatus('success');
      setShowModal(true);

      // Reset form after success
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
    } catch (error: any) {
      setFormStatus('error');

      // Handle different error cases
      if (error.response) {
        // Server responded with an error status
        setApiError(error.response.data?.message || "Server error. Please try again later.");
      } else if (error.request) {
        // Request was made but no response received
        setApiError("No response from server. Please check your connection and try again.");
      } else {
        // Something happened in setting up the request
        setApiError("Error sending message. Please try again.");
      }
    }
  };

  // Success Modal Component
  const SuccessModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative animate-fadeIn">
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent Successfully!</h3>
          <p className="text-gray-600 mb-6">
            Thank you for reaching out. We&apos;ll get back to you as soon as possible.
          </p>
          <button
            onClick={() => setShowModal(false)}
            className="w-full py-3 px-6 rounded-lg text-white font-medium bg-[#348b8b] hover:bg-[#2a7070] transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Success Modal */}
      {showModal && <SuccessModal />}

      {/* Hero Section with Accent Background */}
      <div className="bg-[#348b8b] text-white py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Let&apos;s Connect
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8">
              Have questions about your real estate journey? We&apos;re here to provide expert guidance every step of the way.
            </p>
            <div className="inline-flex items-center bg-white text-[#348b8b] rounded-full px-6 py-3 shadow-lg font-medium">
              <Phone className="mr-2 w-5 h-5" />
              <span>+2347043065222
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 max-w-6xl -mt-12">
        <div className="bg-white rounded-xl shadow-xl p-6 md:p-10 mb-16">
          <div className="grid md:grid-cols-5 gap-10">
            {/* Contact Info Column */}
            <div className="md:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="block w-8 h-1 bg-[#348b8b] mr-3"></span>
                  Contact Details
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-[#348b8b]/10 p-3 rounded-lg mr-4">
                      <MapPin className="w-5 h-5 text-[#348b8b]" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Our Office</p>
                      <p className="text-gray-600">No 7 MCC Road Owerri, Imo State, Nigeria.</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-[#348b8b]/10 p-3 rounded-lg mr-4">
                      <Mail className="w-5 h-5 text-[#348b8b]" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Email</p>
                      <p className="text-[#348b8b] hover:underline cursor-pointer">contact@realvistaproperties.com</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-[#348b8b]/10 p-3 rounded-lg mr-4">
                      <Clock className="w-5 h-5 text-[#348b8b]" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Business Hours</p>
                      <p className="text-gray-600">Mon-Fri: 9am - 6pm</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              {/* <div className="rounded-xl overflow-hidden h-48 md:h-64 bg-gray-200 relative group">
                <div className="absolute inset-0 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-[#348b8b]" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-[#348b8b] text-white p-3 text-center font-medium">
                  Our Location
                </div>
              </div> */}
            </div>

            {/* Form Column */}
            <div className="md:col-span-3">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="block w-8 h-1 bg-[#348b8b] mr-3"></span>
                Send Your Message
              </h2>

              {/* API Error Message */}
              {apiError && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                  <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Error submitting form</p>
                    <p className="text-sm">{apiError}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block mb-2 text-gray-700 font-medium">
                      Full Name <span className="text-[#348b8b]">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#348b8b]'
                        }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-red-500 text-sm">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block mb-2 text-gray-700 font-medium">
                      Email <span className="text-[#348b8b]">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#348b8b]'
                        }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-red-500 text-sm">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block mb-2 text-gray-700 font-medium">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your number"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#348b8b]'
                      }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-red-500 text-sm">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="block mb-2 text-gray-700 font-medium">
                    Your Message <span className="text-[#348b8b]">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="How can we help you today?"
                    rows={5}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all ${errors.message ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#348b8b]'
                      }`}
                  />
                  {errors.message && (
                    <p className="mt-1 text-red-500 text-sm">{errors.message}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={formStatus === 'sending'}
                    className={`
                      py-3 px-6 cursor-pointer rounded-lg text-white font-medium 
                      transition-all bg-[#348b8b] 
                      hover:bg-[#2a7070] hover:shadow-lg
                      flex items-center justify-center space-x-2
                      ${formStatus === 'sending' ? 'opacity-80 cursor-not-allowed' : ''}
                    `}
                  >
                    {formStatus === 'idle' && (
                      <>
                        <span>Send Message</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                    {formStatus === 'sending' && (
                      <>
                        <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                        <span>Sending...</span>
                      </>
                    )}
                    {formStatus === 'success' && (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        <span>Message Sent!</span>
                      </>
                    )}
                    {formStatus === 'error' && (
                      <>
                        <span>Try Again</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;