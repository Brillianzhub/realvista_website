"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
    Bell, LayoutDashboard, DollarSign,
    TrendingUp, Coins, Users, X
} from "lucide-react";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import AdminNavbar from "../components/AdminNavbar";
import AdminSidebar from "../components/AdminSidebar";

interface NavigationItem {
    name: string;
    href: string;
    icon: LucideIcon;
    exact?: boolean;
}

const navigationItems: NavigationItem[] = [
    { name: "Email Campaign",      href: "/dashboard/email-notification",  icon: Bell,           exact: true },
    { name: "Push Notifications",  href: "/dashboard/push-notifications",  icon: LayoutDashboard              },
    { name: "Manage Leads",        href: "/dashboard/manage-leads",        icon: Users                        },
    { name: "Manage Agents",       href: "/dashboard/manage-agents",       icon: Users                        },
    { name: "Currency Rates",      href: "/dashboard/currency-management", icon: DollarSign                   },
    { name: "Trends",              href: "/dashboard/trends",              icon: TrendingUp                   },
    { name: "Payout",              href: "/dashboard/payout",              icon: Coins                        },
];

interface DashboardLayoutProps {
    children: ReactNode;
    title?: string;
    description?: string;
}

export default function DashboardLayout({ children, title, description }: DashboardLayoutProps) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (item: NavigationItem) =>
        item.exact ? pathname === item.href : pathname.startsWith(item.href);

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">

            {/* ── Desktop sidebar ── */}
            <AdminSidebar />

            {/* ── Mobile drawer overlay ── */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* ── Mobile drawer ── */}
            <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white flex flex-col border-r border-slate-100 shadow-xl transition-transform duration-300 ${
                mobileOpen ? "translate-x-0" : "-translate-x-full"
            }`}>
                {/* Drawer header */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
                    <Image src="/logo.webp" width={120} height={26} alt="Realvista" />
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Drawer nav */}
                <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
                    {navigationItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                    active
                                        ? "bg-teal-50 text-teal-700"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                                }`}
                            >
                                <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? "text-teal-600" : "text-slate-400"}`} />
                                <span className="truncate">{item.name}</span>
                                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* ── Main content column ── */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <AdminNavbar onMobileMenuOpen={() => setMobileOpen(true)} />

                {/* Optional page header (desktop) */}
                {(title || description) && (
                    <div className="hidden lg:block px-8 pt-6 pb-0">
                        {title && <h2 className="text-xl font-bold text-slate-900">{title}</h2>}
                        {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
                    </div>
                )}

                <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}