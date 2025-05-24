"use client";

import { useState, useEffect, ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
    DollarSign,
    LucideIcon
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
import Image from "next/image";

// Navigation item type
interface NavigationItem {
    name: string;
    href: string;
    icon: LucideIcon;
    exact?: boolean;
}

// Define navigation items
const navigationItems: NavigationItem[] = [
    {
        name: "Email Notifications",
        href: "/dashboard/email-notification",
        icon: Bell,
        exact: true,
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

];

// Props for the DashboardLayout component
interface DashboardLayoutProps {
    children: ReactNode;
    title?: string;
    description?: string;
}

export default function DashboardLayout({ children, title, description }: DashboardLayoutProps) {
    // Get current pathname for active state
    const pathname = usePathname();
    const router = useRouter();

    // Layout state
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userData, setUserData] = useState<any>();

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
    }, [router]);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const toggleMobile = () => {
        setMobileOpen(!mobileOpen);
    };

    // Function to check if a navigation item is active
    const isActive = (item: NavigationItem) => {
        if (item.exact) {
            return pathname === item.href;
        }
        return pathname.startsWith(item.href);
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

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Mobile sidebar overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile sidebar */}
            <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"
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
                                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${active
                                        ? "bg-teal-50 text-teal-700 border-r-2 border-teal-700"
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
                                <AvatarFallback>{userData?.name?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="ml-3">
                                <p className="text-sm font-medium">{userData?.name || 'User'}</p>
                                <p className="text-xs text-gray-500">{userData?.email || 'user@example.com'}</p>
                                <button onClick={handleLogout} className="text-xs text-red-500 cursor-pointer hover:text-red-700">
                                    Log Out
                                </button>
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
                                <AvatarFallback>{userData?.name?.charAt(0) || 'U'}</AvatarFallback>
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
            <div className={`hidden lg:block sticky top-0 h-screen ${sidebarOpen ? "w-64" : "w-20"} transition-all duration-300`}>
                <div className="flex flex-col h-full bg-white border-r">
                    {/* Logo section */}
                    <div className="flex items-center h-16 px-4 border-b">
                        {sidebarOpen ? (
                            <Link href="/" className='cursor-pointer'>
                                <Image src="/logo.webp" width={200} height={30} alt="logo" />
                            </Link>
                        ) : (
                            <span className="text-xl font-bold">R</span>
                        )}
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
                                    className={`flex items-center ${sidebarOpen ? "px-4 justify-start" : "justify-center"
                                        } py-3 rounded-lg transition-colors ${active
                                            ? "bg-teal-50 text-teal-700 border-r-2 border-teal-700"
                                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                        }`}
                                    title={!sidebarOpen ? item.name : undefined}
                                >
                                    <Icon className={`${sidebarOpen ? "mr-3" : ""} h-5 w-5 ${active ? "text-teal-600" : ""}`} />
                                    {sidebarOpen && <span>{item.name}</span>}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Sidebar toggle button */}
                    <div className="border-t p-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleSidebar}
                            className={`${sidebarOpen ? "w-full justify-start" : "w-full justify-center"} mb-2`}
                        >
                            <Menu className="h-4 w-4" />
                            {sidebarOpen && <span className="ml-2">Collapse</span>}
                        </Button>
                    </div>

                    {/* Profile */}
                    <div className="border-t p-4">
                        <div className={`flex ${sidebarOpen ? "items-center" : "flex-col items-center justify-center"}`}>
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="/avatar.png" />
                                <AvatarFallback>{userData?.name?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>

                            {sidebarOpen && (
                                <div className="ml-3 min-w-0 flex-1">
                                    <p className="text-sm font-medium truncate">{userData?.name || 'User'}</p>
                                    <p className="text-xs text-gray-500 truncate">{userData?.email || 'user@example.com'}</p>
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
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile spacer */}
                <div className="lg:hidden h-16">
                    {/* Spacer for mobile header */}
                </div>

                {/* Header with optional title */}
                {(title || description) && (
                    <header className="hidden lg:block bg-white shadow-sm border-b sticky top-0 z-10">
                        <div className="px-4 sm:px-6 lg:px-8 py-4">
                            {title && <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>}
                            {description && <p className="text-gray-500 mt-1">{description}</p>}
                        </div>
                    </header>
                )}

                {/* Page content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}