"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
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
  RefreshCw
} from "lucide-react";

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
import api from "@/config/apiClient";

export default function DashboardWithNotifications() {
  // Layout state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Notification state
  const [subject, setSubject] = useState<any>("Realvista Weekly Update");
  const [message, setMessage] = useState("Check out the latest properties and market news this week!");
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMobile = () => {
    setMobileOpen(!mobileOpen);
  };

  // Create stable input handlers with useCallback
  const handleInputChange = useCallback((setter:any) => (e:any) => {
    setter(e.target.value);
  }, []);

  const handleSendEmail = async () => {
    setLoading(true);
    setStatus(null);
    
    try {
      // Send the POST request to the API endpoint using axios
      const response = await api.post('/notifications/email-notifications/send/', 
        { subject, message },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      console.log("API response:", response.data);
      
      // Handle successful response
      setStatus({ success: true, message: "Email notification sent successfully!" });
    } catch (error:any) {
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
          <CardContent className="space-y-4">
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSendEmail();
            }} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject Line</label>
                <Input
                  id="subject"
                  placeholder="Enter email subject"
                  value={subject}
                  onChange={handleInputChange(setSubject)}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                <Textarea
                  id="message"
                  placeholder="Enter your message here"
                  rows={6}
                  value={message}
                  onChange={handleInputChange(setMessage)}
                  className="w-full"
                />
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSendEmail} disabled={loading} className="ml-auto">
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
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={toggleMobile}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile sidebar */}
      <div className={`lg:hidden fixed inset-0 z-20 transform ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-in-out`}>
        <div className="relative flex flex-col h-full max-w-xs w-full bg-white border-r shadow-lg pt-16">
          <div className="flex-1 flex flex-col p-4 overflow-y-auto">
            <nav className="flex-1 space-y-2">
              <Link href="/dashboard" className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100">
                <LayoutDashboard className="mr-3 h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              <Link href="/dashboard/notifications" className="flex items-center px-4 py-3 bg-gray-100 text-gray-900 rounded-lg">
                <Bell className="mr-3 h-5 w-5" />
                <span>Notifications</span>
              </Link>
              <Link href="/dashboard/users" className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100">
                <Users className="mr-3 h-5 w-5" />
                <span>Users</span>
              </Link>
              <Link href="/dashboard/settings" className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100">
                <Settings className="mr-3 h-5 w-5" />
                <span>Settings</span>
              </Link>
              <Link href="/dashboard/help" className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100">
                <HelpCircle className="mr-3 h-5 w-5" />
                <span>Help & Support</span>
              </Link>
            </nav>
            
            <div className="mt-6 pt-6 border-t">
              <Button variant="ghost" className="w-full justify-start" onClick={() => {}}>
                <LogOut className="mr-3 h-5 w-5" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-gray-600 bg-opacity-50" 
          onClick={toggleMobile}
        ></div>
      </div>

      {/* Desktop sidebar */}
      <div className={`hidden lg:flex lg:flex-col fixed inset-y-0 z-10 ${
        sidebarOpen ? "lg:w-64" : "lg:w-20"
      } transition-all duration-300`}>
        <div className="flex flex-col h-full bg-white border-r">
          {/* Logo */}
          <div className={`flex items-center ${sidebarOpen ? "justify-between" : "justify-center"} h-16 px-4`}>
            {sidebarOpen && <span className="text-xl font-bold">Realvista</span>}
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <ChevronDown className={`h-5 w-5 transform ${sidebarOpen ? "rotate-0" : "rotate-180"}`} />
            </Button>
          </div>
          
          {/* Nav Links */}
          <nav className="flex-1 px-2 py-4 pt-10 space-y-2 overflow-y-auto">
            <Link
              href="/dashboard/notifications"
              className={`flex items-center ${
                sidebarOpen ? "px-4 justify-start" : "justify-center"
              } py-3 bg-gray-100 text-gray-900 rounded-lg`}
            >
              <Bell className={`${sidebarOpen ? "mr-3" : ""} h-5 w-5`} />
              {sidebarOpen && <span>Email Notifications</span>}
            </Link>
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
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-xs text-gray-500">Admin</p>
                  <button className="text-xs text-red-500 cursor-pointer">Log Out</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`${
        sidebarOpen ? "lg:pl-64" : "lg:pl-20"
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