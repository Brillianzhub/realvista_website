"use client"
import React, { useState, useEffect } from 'react';
import { Check, ArrowRight, Star, Info, Zap } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import api from '@/config/apiClient';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// TypeScript interfaces
interface Duration {
  id: number;
  duration_type: 'monthly' | 'six_months' | 'yearly';
  price: string;
  currency: string;
  discount_percentage: number;
  is_active: boolean;
  discounted_price: number;
}

interface Plan {
  id: number;
  name: string;
  features: string[];
  created_at: string;
  color: string;
  popular: boolean;
  image: string;
  durations: Duration[];
}

const PricingPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'six_months' | 'yearly'>('monthly');
  const [showBoostOptions, setShowBoostOptions] = useState<boolean>(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [boostOptions, setBoostOptions] = useState<any>(null)
  const [isBoostSubmitting, setIsBoostSubmitting] = useState<Record<number, boolean>>({});
  const router = useRouter()
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await api.get("/subscriptions/plans/");
        setPlans(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching subscription plans:", err);
        setError("Failed to load subscription plans. Please try again later.");
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  useEffect(() => {
    const getBoost = async () => {
      try {
        setLoading(true);
        const response = await api.get("/boost/boost-packages/");
        console.log(response)
        setBoostOptions(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching boost:", err);
        setError("Failed to load subscription plans. Please try again later.");
        setLoading(false);
      }
    };

    getBoost();
  }, []);

  const handleBoost = async (boostId: number, packageName: string, durationDays: number, price: number) => {
    if (!token) {
      router.push("/sign-in")
    }
    try {
      setIsBoostSubmitting(prev => ({ ...prev, [boostId]: true }));

      // Include auth token in headers
      const response = await api.post("/boost/boost-packages/", {
        id: boostId,
        name: packageName,
        duration_days: durationDays,
        price: price
      }, {
        headers: {
          Authorization: `Token ${token}` // Adjust based on your auth setup
        }
      });

      console.log("Boost package purchased:", response.data);
      // Handle success - maybe show a success message

      return response.data;
    } catch (error) {
      console.error("Error purchasing boost package:", error);
      // Handle error - maybe show an error notification
    } finally {
      setIsBoostSubmitting(prev => ({ ...prev, [boostId]: false }));
    }
  };

  const handlePlans = async (planId: number) => {
    if (!token) {
      router.push("/sign-in");
      return;
    }

    try {
      setIsSubmitting(prev => ({ ...prev, [planId]: true }));

      // Include auth token in headers
      const response = await api.post("/subscriptions/create-subscription/", {
        plan_id: planId
      }, {
        headers: {
          Authorization: `Token ${token}`
        }
      });

      toast.success("subscription added successfully!")

      // Handle the response
      const data = response.data;

      if (data.authorization_url) {
        // Redirect the user to the Paystack payment page
        window.location.href = data.authorization_url;
      } else {
        // Handle other response types if needed
        console.log("Subscription response:", data);
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(prev => ({ ...prev, [planId]: false }));
    }
  };

  // Descriptions for each plan
  const planDescriptions: Record<string, string> = {
    free: "Perfect for new agents",
    basic: "Perfect for individual agents",
    premium: "Advanced features for serious agents",
    enterprise: "Complete solution for teams and agencies"
  };

  // CTA text for each plan
  const planCTAs: Record<string, string> = {
    free: "Get Started Free",
    basic: "Choose Basic",
    premium: "Go Premium",
    enterprise: "Contact Sales"
  };

  // Format price for display
  const formatPrice = (price: string): React.ReactNode => {
    const priceNum = parseFloat(price);

    if (priceNum === 0) {
      return (
        <span className="text-5xl font-extrabold">Free</span>
      );
    }

    const formattedPrice = priceNum.toLocaleString();

    return (
      <span className="text-5xl font-extrabold">₦{formattedPrice}</span>
    );
  };

  // Get the current price based on billing cycle
  const getCurrentPrice = (plan: Plan): string => {
    const duration = plan.durations.find(d => d.duration_type === billingCycle);
    return duration ? duration.price : plan.durations[0].price;
  };

  // Get the current discounted price based on billing cycle
  const getCurrentDiscountedPrice = (plan: Plan): number => {
    const duration = plan.durations.find(d => d.duration_type === billingCycle);
    return duration ? duration.discounted_price : plan.durations[0].discounted_price;
  };

  // Get discount badge for the billing cycle
  const getDiscountBadge = (cycle: string) => {
    if (cycle === 'six_months') {
      return <Badge className="ml-2 bg-[#348b8b]">Save 10%</Badge>;
    } else if (cycle === 'yearly') {
      return <Badge className="ml-2 bg-[#348b8b]">Save 30%</Badge>;
    }
    return null;
  };

  // Calculate total price for the billing period
  const getTotalPrice = (plan: Plan): string => {
    const discountedPrice = getCurrentDiscountedPrice(plan);
    if (discountedPrice === 0) return "Free";

    let multiplier = 1;
    if (billingCycle === 'six_months') multiplier = 6;
    if (billingCycle === 'yearly') multiplier = 12;

    return `₦${(discountedPrice * multiplier).toLocaleString()} billed ${billingCycle === 'monthly' ? 'monthly' : billingCycle === 'six_months' ? 'every 6 months' : 'annually'}`;
  };

  // Get plan badge color
  const getPlanBadgeColor = (planName: string): string => {
    switch (planName.toLowerCase()) {
      case 'free': return 'bg-gray-50 text-gray-700';
      case 'basic': return 'bg-blue-50 text-blue-700';
      case 'premium': return 'bg-purple-50 text-purple-700';
      case 'enterprise': return 'bg-green-50 text-green-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  // Get CTA button color
  const getCTAButtonColor = (planName: string, isPopular: boolean): string => {
    if (isPopular) return 'bg-[#348b8b] text-white hover:bg-[#297979]';

    switch (planName.toLowerCase()) {
      case 'free': return 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200';
      case 'basic': return 'bg-[#348b8b] text-white hover:bg-[#297979]';
      case 'premium': return 'bg-[#FB902D] text-white hover:bg-[#ea8519]';
      case 'enterprise': return 'bg-[#348b8b] text-white hover:bg-[#297979]';
      default: return 'bg-[#348b8b] text-white hover:bg-[#297979]';
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#348b8b] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#348b8b] text-white rounded-lg hover:bg-[#297979]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Realvista Subscription Plans</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the perfect plan for your real estate needs. No hidden fees, transparent pricing.
            </p>
          </div>

          {/* Billing Cycle Selector */}
          <div className="flex justify-center mb-16">
            <div className="flex items-center space-x-4 bg-white p-2 rounded-full shadow-md">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-300
                  ${billingCycle === 'monthly'
                    ? 'bg-[#348b8b] text-white'
                    : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Monthly
              </button>

              <button
                onClick={() => setBillingCycle('six_months')}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 flex items-center
                  ${billingCycle === 'six_months'
                    ? 'bg-[#348b8b] text-white'
                    : 'text-gray-600 hover:bg-gray-100'}`}
              >
                6 Months {getDiscountBadge('six_months')}
              </button>

              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 flex items-center
                  ${billingCycle === 'yearly'
                    ? 'bg-[#348b8b] text-white'
                    : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Yearly {getDiscountBadge('yearly')}
              </button>
            </div>
          </div>

          {/* Pricing Plans */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mt-8">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`
                  overflow-hidden h-max transition-all duration-300 border
                  ${plan.popular ? 'border-[#348b8b] shadow-xl shadow-[#348b8b]/10 ring-1 ring-[#348b8b]' : 'border-gray-200 shadow-lg'}
                  hover:shadow-2xl hover:transform hover:-translate-y-1
                  relative
                `}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-[#348b8b] text-white text-center py-1.5 text-sm font-semibold">
                    Most Popular
                  </div>
                )}

                <CardHeader className={`${plan.popular ? 'pt-10' : 'pt-6'} text-center`}>
                  <div className="flex justify-center mb-2">
                    <Badge variant="outline" className={`${getPlanBadgeColor(plan.name)} border-gray-200`}>
                      {plan.name.charAt(0).toUpperCase() + plan.name.slice(1)}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name.charAt(0).toUpperCase() + plan.name.slice(1)}</CardTitle>
                  <CardDescription className="text-gray-600 min-h-12">
                    {planDescriptions[plan.name] || `${plan.name.charAt(0).toUpperCase() + plan.name.slice(1)} subscription plan`}
                  </CardDescription>
                </CardHeader>

                <CardContent className="text-center pb-0">
                  <div className="mb-6 flex items-center justify-center">
                    <div className="flex items-baseline">
                      {formatPrice(getCurrentPrice(plan))}
                      {parseFloat(getCurrentPrice(plan)) !== 0 && <span className="text-gray-600 text-xs">/ month</span>}
                    </div>
                  </div>

                  {parseFloat(getCurrentPrice(plan)) !== 0 && billingCycle !== 'monthly' && (
                    <div className="-mt-4 mb-6 text-sm text-gray-600">
                      {getTotalPrice(plan)}
                    </div>
                  )}

                  <button
                    onClick={() => handlePlans(plan.id)}
                    disabled={isSubmitting[plan.id] || parseFloat(getCurrentPrice(plan)) === 0}
                    className={`
                        w-full py-3 px-4 rounded-lg font-bold transition-all duration-300 flex items-center justify-center
                        ${getCTAButtonColor(plan.name, plan.popular)}
                        ${(isSubmitting[plan.id] || parseFloat(getCurrentPrice(plan)) === 0) ? 'opacity-70 cursor-not-allowed' : ''}
                      `}
                  >
                    {isSubmitting[plan.id] ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        {parseFloat(getCurrentPrice(plan)) === 0 ? 'Already Free' : planCTAs[plan.name] || 'Get Started'}
                        {parseFloat(getCurrentPrice(plan)) !== 0 && <ArrowRight className="ml-2 w-5 h-5" />}
                      </>
                    )}
                  </button>

                  <div className="mt-8 text-left">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      {/* <Check className="w-5 h-5 mr-2 text-[#348b8b]" /> */}
                      Features Included
                    </h3>
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start text-gray-700">
                          <div className="w-5 h-5 mr-3 flex-shrink-0 text-[#348b8b] mt-1">
                            <Check className="w-full h-full" />
                          </div>
                          <div className="flex items-center">
                            {feature}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>

                <CardFooter className="px-6 py-4 mt-6 bg-gray-50 border-t border-gray-100">
                  <p className="text-sm text-gray-600 w-full text-center">
                    {plan.popular ? 'Most popular choice for real estate professionals' : 'Cancel or change plans anytime'}
                  </p>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Boosting Options Section */}
          <div className="mt-20">
            <div className="text-center mb-10">
              <button
                onClick={() => setShowBoostOptions(!showBoostOptions)}
                className="inline-flex items-center px-6 py-3 bg-white border border-gray-200 rounded-lg font-semibold text-gray-800 hover:bg-gray-50 transition-colors shadow-md"
              >
                {showBoostOptions ? 'Hide Boosting Options' : 'View Boosting Options'}
                <Zap className="ml-2 w-5 h-5" />
              </button>
            </div>

            {showBoostOptions && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900">Optional Boosting Packages</h2>
                  <p className="text-gray-600 mt-2">Increase your visibility and leads with our flexible boosting options</p>
                </div>

                <div className="mb-16 last:mb-0">
                  <h3 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
                    <Zap className="w-6 h-6 mr-2 text-[#348b8b]" />
                    Boost Your Visibility
                  </h3>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {boostOptions.map((option:any) => (
                      <Card key={option.id} className="border border-gray-200 transition-all duration-300 hover:shadow-lg">
                        <CardHeader>
                          <div className="flex justify-between items-center mb-2">
                            <Badge variant="outline" className="bg-blue-50 text-teal-700">{option.name}</Badge>
                            <span className="text-2xl font-bold text-gray-900">₦{parseFloat(option.price).toLocaleString()}</span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700">
                            {option.name === "24 Hours" && "Quick boost for immediate visibility"}
                            {option.name === "48 Hours" && "Extended visibility for two full days"}
                            {option.name === "1 Week" && "Weekly promotion for sustained engagement"}
                            {option.name === "1 Month" && "Premium month-long promotion for maximum exposure"}
                          </p>
                        </CardContent>
                        <CardFooter>
                          <button
                            onClick={() => handleBoost(option.id, option.name, option.duration_days, parseFloat(option.price))}
                            disabled={isBoostSubmitting[option.id]}
                            className={`
                  w-full text-white cursor-pointer py-3 rounded-lg font-medium transition-colors
                  ${isBoostSubmitting[option.id]
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-[#348b8b] hover:bg-[#2a7070] text-white'}
                `}
                          >
                            {isBoostSubmitting[option.id] ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mx-auto"></div>
                            ) : (
                              'Add Boost'
                            )}
                          </button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Custom Plan CTA */}
          <div className="mt-16 bg-white rounded-2xl shadow-lg p-8 text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Need a Custom Enterprise Solution?</h2>
            <p className="text-gray-600 mb-6">
              Our team can create a tailored plan to meet your specific business requirements and goals.
            </p>
            <Link href="/contact" className="inline-flex items-center px-6 py-3 rounded-lg bg-[#348b8b] text-white hover:bg-[#297979] transition-colors font-semibold">
              Contact our sales team <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>

          {/* Testimonials */}
          <div className="mt-20 text-center">
            <h2 className="text-2xl font-bold mb-12">Trusted by Real Estate Professionals</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  quote: "RealVista has transformed my business. The leads I get from featured listings have tripled my sales.",
                  name: "Adebayo Johnson",
                  title: "Premium Agent, Lagos"
                },
                {
                  quote: "The analytics tools help me understand what my clients want. I couldn't run my business without it now.",
                  name: "Ngozi Okafor",
                  title: "Real Estate Consultant, Abuja"
                },
                {
                  quote: "Our team's productivity doubled after switching to RealVista's Enterprise plan. Worth every naira.",
                  name: "Emmanuel Nwosu",
                  title: "Team Lead, Horizon Properties"
                }
              ].map((testimonial, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-md">
                  <div className="flex justify-center mb-4 text-[#348b8b]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 italic mb-4">&quot;{testimonial.quote}&quot;</p>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default PricingPage;