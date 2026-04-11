"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
    Bell, LayoutDashboard, DollarSign,
    TrendingUp, Coins, Users, PanelLeftClose,
    PanelLeftOpen, LogOut
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LucideIcon } from "lucide-react";

interface NavigationItem {
    name: string;
    href: string;
    icon: LucideIcon;
    exact?: boolean;
}

const navigationItems: NavigationItem[] = [
    { name: "Email Campaign",      href: "/dashboard/email-notification",  icon: Bell,           exact: true  },
    { name: "Push Notifications",  href: "/dashboard/push-notifications",  icon: LayoutDashboard                },
    { name: "Manage Leads",        href: "/dashboard/manage-leads",        icon: Users                          },
    { name: "Manage Agents",       href: "/dashboard/manage-agents",       icon: Users                          },
    { name: "Currency Rates",      href: "/dashboard/currency-management", icon: DollarSign                     },
    { name: "Trends",              href: "/dashboard/trends",              icon: TrendingUp                     },
    { name: "Payout",              href: "/dashboard/payout",              icon: Coins                          },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        try {
            const stored = localStorage.getItem("userData");
            if (stored) setUserData(JSON.parse(stored));
            else router.push("/dashboard/auth");
        } catch (e) {
            console.error(e);
        }

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
    }, [router]);

    const isActive = (item: NavigationItem) =>
        item.exact ? pathname === item.href : pathname.startsWith(item.href);

    const handleLogout = () => {
        localStorage.removeItem("userData");
        localStorage.removeItem("token");
        setUserData(null);
        window.dispatchEvent(new Event("userLogout"));
        router.push("/dashboard/auth");
    };

    return (
        <aside
            className={`hidden lg:flex flex-col h-screen bg-white border-r border-slate-100 transition-all duration-300 shrink-0 ${
                collapsed ? "w-[72px]" : "w-60"
            }`}
            style={{ boxShadow: "2px 0 12px 0 rgba(15,23,42,0.04)" }}
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 shrink-0">
                {!collapsed && (
                    <Link href="/" className="flex items-center">
                        <Image src="/logo.webp" width={130} height={28} alt="Realvista" />
                    </Link>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={`p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors ${collapsed ? "mx-auto" : "ml-auto"}`}
                    title={collapsed ? "Expand" : "Collapse"}
                >
                    {collapsed
                        ? <PanelLeftOpen className="w-5 h-5" />
                        : <PanelLeftClose className="w-5 h-5" />}
                </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
                {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={collapsed ? item.name : undefined}
                            className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                                collapsed ? "justify-center" : ""
                            } ${
                                active
                                    ? "bg-teal-50 text-teal-700"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                            }`}
                        >
                            <Icon className={`w-[18px] h-[18px] shrink-0 transition-colors ${active ? "text-teal-600" : "text-slate-400 group-hover:text-slate-600"}`} />
                            {!collapsed && <span className="truncate">{item.name}</span>}
                            {/* Active pill */}
                            {active && !collapsed && (
                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Profile */}
            <div className="border-t border-slate-100 p-3 shrink-0">
                <div className={`flex items-center gap-3 px-2 py-2 rounded-xl ${collapsed ? "justify-center" : ""}`}>
                    <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src="/avatar.png" />
                        <AvatarFallback className="bg-teal-600 text-white text-xs font-semibold">
                            {userData?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                    </Avatar>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{userData?.name || "User"}</p>
                            <p className="text-xs text-slate-400 truncate">{userData?.email || "user@example.com"}</p>
                        </div>
                    )}
                    {!collapsed && (
                        <button
                            onClick={handleLogout}
                            title="Log out"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    )}
                </div>
                {collapsed && (
                    <button
                        onClick={handleLogout}
                        title="Log out"
                        className="w-full flex justify-center mt-1 p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                )}
            </div>
        </aside>
    );
}