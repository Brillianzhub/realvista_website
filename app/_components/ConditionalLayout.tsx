'use client';

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function ConditionalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isDashboard = pathname?.startsWith('/dashboard');
    const isAuthPage = pathname === '/sign-in' || pathname === '/register' || pathname === '/accounts/set-password';
    const hideLayout = isDashboard || isAuthPage;

    return (
        <>
            {!hideLayout && <Navbar />}
            {children}
            {!hideLayout && <Footer />}
        </>
    );
}