"use client";

import { motion } from "framer-motion";
import { Home, Users, Plus, Settings, Trophy } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { icon: Home, label: "Home", id: "home", href: "/" },
    { icon: Users, label: "Contacts", id: "contacts", href: "/contacts" },
    { icon: Plus, label: "Add", id: "add", href: "/add", isMain: true },
    { icon: Trophy, label: "Streaks", id: "streaks", href: "/streaks" },
    { icon: Settings, label: "Settings", id: "settings", href: "/settings" },
];

interface BottomNavProps {
    // Props are less relevant now as routing handles state, but kept for compatibility if needed.
    activeTab?: string;
    onTabChange?: (tab: string) => void;
}

export function BottomNav({ }: BottomNavProps) {
    const pathname = usePathname() || "/";

    // Determine active tabs based on pathname
    const isActive = (href: string) => {
        if (href === "/" && pathname === "/") return true;
        if (href !== "/" && pathname.startsWith(href)) return true;
        return false;
    };

    const mainItem = navItems.find(item => item.isMain);
    const otherItems = navItems.filter(item => !item.isMain);

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pointer-events-none overflow-visible h-24 flex items-end justify-center">
            <div className="relative w-full max-w-md mx-auto flex items-center justify-center">

                {/* Main Floating Action Button (Add) - Rendered OUTSIDE the glass card */}
                {mainItem && (
                    <Link href={mainItem.href} key={mainItem.id} passHref className="absolute bottom-6 z-50 pointer-events-auto">
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.5, type: "spring", stiffness: 400, damping: 20 }}
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 dark:from-violet-500 dark:to-cyan-500 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.5)] cursor-pointer border-4 border-white dark:border-[#030014]"
                        >
                            <mainItem.icon className="w-8 h-8 text-white" strokeWidth={2.5} />
                        </motion.div>
                    </Link>
                )}

                {/* Glass Card Navigation Bar - Left items */}
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 30 }}
                    className="glass-card shadow-lg shadow-violet-500/5 dark:shadow-black/50 rounded-[2rem] px-6 py-3 flex items-center justify-between pointer-events-auto w-full"
                >
                    {/* Render first half */}
                    {otherItems.slice(0, 2).map((item) => (
                        <NavItem key={item.id} item={item} active={isActive(item.href)} />
                    ))}

                    {/* Spacer for the center button */}
                    <div className="w-12" />

                    {/* Render second half */}
                    {otherItems.slice(2, 4).map((item) => (
                        <NavItem key={item.id} item={item} active={isActive(item.href)} />
                    ))}
                </motion.div>
            </div>
        </nav>
    );
}

// Define the interface locally or import if available
interface NavItemProps {
    item: {
        id: string;
        label: string;
        href: string;
        icon: React.ElementType;
    };
    active: boolean;
}

function NavItem({ item, active }: NavItemProps) {
    const Icon = item.icon;
    return (
        <Link href={item.href} className="relative flex flex-col items-center gap-1 px-2 py-1 cursor-pointer group">
            <motion.div
                animate={{
                    scale: active ? 1 : 0.9,
                }}
                className={`transition-colors duration-300 ${active ? 'text-primary' : 'text-muted-foreground group-hover:text-primary/70'}`}
            >
                <Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 2} />
            </motion.div>
            {active && (
                <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-2 w-1 h-1 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
            )}
        </Link>
    );
}
