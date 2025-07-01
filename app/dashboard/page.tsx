"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import axios from "axios";
import {
  LayoutDashboard,
  Bell,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Send,
  RefreshCw,
  DollarSign,
  TrendingUp,
  Coins
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import api from "@/config/apiClient";
import { useRouter } from "next/navigation";

// Define the form schema with Zod
const notificationFormSchema = z.object({
  subject: z.string().min(3, {
    message: "Subject must be at least 3 characters.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
});

// TypeScript type for our form
type NotificationFormValues = z.infer<typeof notificationFormSchema>;

// Default values for the form
const defaultValues: Partial<NotificationFormValues> = {
  subject: "Realvista Weekly Update",
  message: "Check out the latest properties and market news this week!",
};

// Define navigation items
const navigationItems = [
  {
    name: "Email Notifications",
    href: "/dashboard",
    icon: Bell,
    exact: true, // This will match exactly /dashboard
  },
  {
    name: "Push Notifications", 
    href: "/dashboard/push-notifications",
    icon: LayoutDashboard,
    exact: false,
  },
  {
    name: "Currency Rates",
    href: "/dashboard/currency-management", 
    icon: DollarSign,
    exact: false,
  },
  {
    name: "Trends",
    href: "/dashboard/trends", 
    icon: TrendingUp,
    exact: false,
  },
  {
    name: "Payout",
    href: "/dashboard/payout",
    icon: Coins,
    exact: false,
},
];

export default function DashboardWithNotifications() {
  // Get current pathname for active state
  const pathname = usePathname();
  
  // Layout state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Notification state
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [userData, setUserData] = useState<any>();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const loadUserData = () => {
      try {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          setUserData(JSON.parse(storedUserData));
        } else {
          router.push("/dashboard/auth")
        }
      } catch (error) {
        console.error('Error loading user data from localStorage:', error);
      }
    };

    // Load user data initially
    loadUserData();

    // Set up event listener for login/logout events
    const handleUserLogin = () => loadUserData();
    const handleUserLogout = () => setUserData(null);

    window.addEventListener('userLogin', handleUserLogin);
    window.addEventListener('userLogout', handleUserLogout);

    // Clean up event listeners
    return () => {
      window.removeEventListener('userLogin', handleUserLogin);
      window.removeEventListener('userLogout', handleUserLogout);
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMobile = () => {
    setMobileOpen(!mobileOpen);
  };

  // Function to check if a navigation item is active
  const isActive = (item: typeof navigationItems[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  // Initialize the form with React Hook Form
  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues,
  });

  const handleSendEmail = async (values: NotificationFormValues) => {
    setLoading(true);
    setStatus(null);

    try {
      // Send the POST request to the API endpoint using axios
      const response = await api.post('/notifications/email-notifications/send/',
        { subject: values.subject, message: values.message },
        {
          headers: {
            Authorization: `Token ${token}`
          }
        }
      );

      console.log("API response:", response.data);

      // Handle successful response
      setStatus({ success: true, message: "Email notification sent successfully!" });
    } catch (error: any) {
      // Handle error
      setStatus({
        success: false,
        message: error.response?.data?.message || "Failed to send email notification. Please try again."
      });
      console.error("Error sending email:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Remove user data from localStorage
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
    // Update state
    setUserData(null);

    router.push("/dashboard/auth");
    // Dispatch logout event
    window.dispatchEvent(new Event('userLogout'));
  };

  // Email notifications content component
  const NotificationsContent = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Email Notifications</h1>
            <p className="text-gray-500">Send updates and news to your users</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Send Email Notification</CardTitle>
            <CardDescription>
              Create and send email notifications to your users
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSendEmail)} className="space-y-4">
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }: any) => (
                    <FormItem>
                      <FormLabel>Subject Line</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter email subject" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }: any) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter your message here"
                          rows={6}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading} className="ml-auto cursor-pointer">
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Email
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        {/* Display status message if present */}
        {status && (
          <Alert variant={status.success ? "default" : "destructive"}>
            <AlertTitle>{status.success ? "Success" : "Error"}</AlertTitle>
            <AlertDescription>{status.message}</AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-300 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex flex-col h-full">
          {/* Mobile logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <span className="text-xl font-bold">Realvista</span>
            <Button variant="ghost" size="icon" onClick={toggleMobile}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Mobile nav */}
          <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    active 
                      ? "bg-blue-50 text-teal-700 border-r-2 border-teal-700" 
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile profile */}
          <div className="border-t p-4">
            <div className="flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatar.png" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium">{userData?.name}</p>
                <p className="text-xs text-gray-500">{userData?.email}</p>
                <button onClick={handleLogout} className="text-xs text-red-500 cursor-pointer">Log Out</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={toggleMobile}>
            <Menu className="h-6 w-6" />
          </Button>
          <span className="ml-3 text-xl font-bold">Realvista</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatar.png" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop sidebar */}
      <div className={`hidden lg:flex lg:flex-col fixed inset-y-0 z-10 ${sidebarOpen ? "lg:w-64" : "lg:w-20"
        } transition-all duration-300`}>
        <div className="flex flex-col h-full bg-white border-r">
          {/* Logo */}
          <div className={`flex items-center ${sidebarOpen ? "justify-between" : "justify-center"} h-16 px-4 border-b`}>
            {sidebarOpen && <span className="text-xl font-bold">Realvista</span>}
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <ChevronDown className={`h-5 w-5 transform transition-transform ${sidebarOpen ? "rotate-0" : "rotate-180"}`} />
            </Button>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center ${
                    sidebarOpen ? "px-4 justify-start" : "justify-center"
                  } py-3 rounded-lg transition-colors ${
                    active 
                      ? "bg-teal-50 text-teal-700 border-r-2 border-teal-700" 
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  title={!sidebarOpen ? item.name : undefined}
                >
                  <Icon className={`${sidebarOpen ? "mr-3" : ""} h-5 w-5`} />
                  {sidebarOpen && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Profile */}
          <div className="border-t p-4">
            <div className={`flex ${sidebarOpen ? "items-center" : "flex-col items-center justify-center"}`}>
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatar.png" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>

              {sidebarOpen && (
                <div className="ml-3">
                  <p className="text-sm font-medium">{userData?.name}</p>
                  <p className="text-xs text-gray-500">{userData?.email}</p>
                  <button onClick={handleLogout} className="text-xs text-red-500 cursor-pointer hover:text-red-700">
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`${sidebarOpen ? "lg:pl-64" : "lg:pl-20"
        } transition-all duration-300 pt-0 lg:pt-0`}>
        <div className="lg:hidden h-16">
          {/* Spacer for mobile header */}
        </div>

        {/* Header */}
        <header className="hidden lg:block bg-white shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Header content if needed */}
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <NotificationsContent />
        </main>
      </div>
    </div>
  );
}