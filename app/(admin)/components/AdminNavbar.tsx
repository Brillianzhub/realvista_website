"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Menu, Search, ChevronDown, LogOut } from "lucide-react";
import Image from "next/image";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// Page title map
const pageTitles: Record<string, string> = {
    "/dashboard/email-notification": "Email Campaign",
    "/dashboard/push-notifications": "Push Notifications",
    "/dashboard/manage-leads": "Manage Leads",
    "/dashboard/manage-agents": "Manage Agents",
    "/dashboard/currency-management": "Currency Rates",
    "/dashboard/trends": "Trends",
    "/dashboard/payout": "Payout",
};

interface AdminNavbarProps {
    onMobileMenuOpen: () => void;
}

export default function AdminNavbar({ onMobileMenuOpen }: AdminNavbarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        try {
            const stored = localStorage.getItem("userData");
            if (stored) setUserData(JSON.parse(stored));
        } catch (e) { console.error(e); }

        const onLogin = () => {
            const s = localStorage.getItem("userData");
            if (s) setUserData(JSON.parse(s));
        };
        const onLogout = () => setUserData(null);
        window.addEventListener("userLogin", onLogin);
        window.addEventListener("userLogout", onLogout);
        return () => {
            window.removeEventListener("userLogin", onLogin);
            window.removeEventListener("userLogout", onLogout);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("userData");
        localStorage.removeItem("token");
        setUserData(null);
        window.dispatchEvent(new Event("userLogout"));
        router.push("/dashboard/auth");
    };

    const pageTitle = Object.entries(pageTitles).find(([key]) =>
        pathname.startsWith(key)
    )?.[1] ?? "Dashboard";

    return (
        <header className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between shrink-0 sticky top-0 z-30"
            style={{ boxShadow: "0 1px 0 0 rgba(15,23,42,0.06)" }}>

            {/* Left — mobile hamburger + page title */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden text-slate-500"
                    onClick={onMobileMenuOpen}
                >
                    <Menu className="w-5 h-5" />
                </Button>

                {/* Mobile logo */}
                <div className="lg:hidden">
                    <Image src="/logo.webp" width={110} height={24} alt="Realvista" />
                </div>

                <h1 className="hidden lg:block text-[15px] font-semibold text-slate-800 tracking-tight">
                    {pageTitle}
                </h1>
            </div>

            {/* Center — search (desktop) */}
            <div className="hidden lg:flex flex-1 max-w-sm mx-8">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search…"
                        className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 focus:bg-white transition-all text-slate-700 placeholder:text-slate-400"
                    />
                </div>
            </div>

            {/* Right — bell + profile */}
            <div className="flex items-center gap-2">
                {/* Notification bell */}
                <button className="relative p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                </button>

                <div className="w-px h-7 bg-slate-100 mx-1" />

                {/* Profile dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="/avatar.png" />
                                <AvatarFallback className="bg-teal-600 text-white text-xs font-semibold">
                                    {userData?.name?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden sm:block text-left">
                                <p className="text-sm font-semibold text-slate-800 leading-tight">
                                    {userData?.name || "User"}
                                </p>
                                <p className="text-xs text-slate-400 leading-tight">
                                    {userData?.email || "user@example.com"}
                                </p>
                            </div>
                            <ChevronDown className="hidden sm:block w-4 h-4 text-slate-400" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel className="text-xs text-slate-400 font-normal">My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuItem>Settings</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="text-red-500 focus:text-red-600 focus:bg-red-50"
                        >
                            <LogOut className="w-4 h-4 mr-2" /> Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}