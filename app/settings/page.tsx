"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { BottomNav } from "@/components/layout/BottomNav";
import { Settings, Moon, Bell, Trash2, Download, Shield, Check, X, Zap } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { SubscriptionModal } from "@/components/monetization/SubscriptionModal";
import { ResetModal } from "@/components/modals/ResetModal";

export default function SettingsPage() {
    const router = useRouter();
    const store = useStore();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Local State for settings
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showReset, setShowReset] = useState(false);
    const [showSubscription, setShowSubscription] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [userName, setUserName] = useState("Valentine"); // Would come from store ideally
    const [isPro] = useState(false); // Mock subscription state

    useEffect(() => {
        setTimeout(() => setMounted(true), 0);
        // Load settings from local storage if available
        const savedNotifs = localStorage.getItem('bonder_notifications');
        if (savedNotifs !== null) {
            setTimeout(() => setNotificationsEnabled(JSON.parse(savedNotifs)), 0);
        }
    }, []);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const toggleNotifications = () => {
        const newState = !notificationsEnabled;
        setNotificationsEnabled(newState);
        localStorage.setItem('bonder_notifications', JSON.stringify(newState));
        toast.info(newState ? "Notifications Enabled" : "Notifications Disabled");
    };

    const handleResetConfirm = () => {
        localStorage.clear();
        router.push("/");
        setTimeout(() => {
            window.location.reload();
        }, 100);
    };

    const handleExportData = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(store, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `bonder_backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        toast.success("Data exported successfully!");
    };

    const saveProfile = () => {
        setIsEditingProfile(false);
        toast.success("Profile updated!");
        // Here you would update the store if the store had a user name field
    };

    if (!mounted) return <div className="p-6">Loading...</div>;

    const getToggleColor = () => {
        if (!notificationsEnabled) return 'bg-secondary';
        return theme === 'dark' ? 'bg-indigo-500' : 'bg-green-500';
    };

    return (
        <MobileFrame>
            <div className="p-6 pb-28 min-h-screen">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500 mb-2">Settings</h1>
                    <p className="text-muted-foreground text-sm">Manage your preferences and data.</p>
                </header>

                <div className="space-y-8">
                    {/* Account Section */}
                    <section>
                        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 px-1">Account</h2>
                        <div className="glass-card rounded-[1.5rem] p-1">
                            {isEditingProfile ? (
                                <div className="p-5">
                                    <label className="text-xs text-muted-foreground font-bold mb-2 block uppercase">Display Name</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={userName}
                                            onChange={(e) => setUserName(e.target.value)}
                                            className="flex-1 bg-secondary/50 border border-border rounded-xl px-4 py-2 text-foreground focus:outline-none focus:border-primary transition-colors"
                                        />
                                        <button onClick={saveProfile} className="p-2 bg-primary text-white rounded-xl">
                                            <Check className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 flex items-center justify-between group rounded-[1.2rem] transition-colors relative">
                                    <div className="flex items-center gap-4">
                                        <div onClick={() => setIsEditingProfile(true)} className="w-14 h-14 cursor-pointer rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 text-xl font-bold text-white relative">
                                            {userName.charAt(0)}
                                            <div className="absolute inset-0 border-2 border-white/20 rounded-full" />
                                        </div>
                                        <div>
                                            <p onClick={() => setIsEditingProfile(true)} className="font-bold text-foreground text-lg cursor-pointer hover:text-primary transition-colors">{userName}</p>

                                            {/* Subscription Trigger */}
                                            <button
                                                onClick={() => setShowSubscription(true)}
                                                className={`text-xs font-bold px-2 py-0.5 rounded-md mt-1 flex items-center gap-1 transition-transform active:scale-95 ${isPro ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`}
                                            >
                                                {isPro ? <Zap className="w-3 h-3 fill-white" /> : null}
                                                {isPro ? "Bonder Pro Active" : "Free Plan • Upgrade"}
                                            </button>
                                        </div>
                                    </div>
                                    <div onClick={() => setIsEditingProfile(true)} className="p-2 cursor-pointer text-muted-foreground hover:text-primary transition-colors">
                                        <Settings className="w-5 h-5" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Preferences */}
                    <section>
                        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 px-1">Experience</h2>
                        <div className="glass-card rounded-[1.5rem] overflow-hidden divide-y divide-border/30">

                            {/* Dark Mode */}
                            <div
                                onClick={toggleTheme}
                                className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-500"><Moon className="w-5 h-5" /></div>
                                    <span className="font-medium text-foreground">Dark Mode</span>
                                </div>
                                <div className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${theme === 'dark' ? 'bg-indigo-500' : 'bg-secondary'}`}>
                                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`} />
                                </div>
                            </div>

                            {/* Notifications */}
                            <div
                                onClick={toggleNotifications}
                                className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-pink-500/10 rounded-xl text-pink-500"><Bell className="w-5 h-5" /></div>
                                    <span className="font-medium text-foreground">Notifications</span>
                                </div>
                                {/* Use different active color for distinct look */}
                                <div className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${getToggleColor()}`}>
                                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Data */}
                    <section>
                        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 px-1">Data & Privacy</h2>
                        <div className="glass-card rounded-[1.5rem] overflow-hidden divide-y divide-border/30">
                            <button onClick={handleExportData} className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors text-left group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500"><Download className="w-5 h-5" /></div>
                                    <span className="font-medium text-foreground group-hover:text-blue-500 transition-colors">Export Data</span>
                                </div>
                            </button>

                            <button onClick={() => setShowPrivacy(true)} className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors text-left group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-violet-500/10 rounded-xl text-violet-500"><Shield className="w-5 h-5" /></div>
                                    <span className="font-medium text-foreground group-hover:text-violet-500 transition-colors">Privacy Policy</span>
                                </div>
                            </button>

                            <button onClick={() => setShowReset(true)} className="w-full p-5 flex items-center justify-between hover:bg-rose-500/5 transition-colors text-left group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-500"><Trash2 className="w-5 h-5" /></div>
                                    <span className="font-medium text-foreground group-hover:text-rose-500 transition-colors">Reset App</span>
                                </div>
                            </button>
                        </div>
                    </section>
                </div>

                {/* Privacy Policy Modal */}
                <AnimatePresence>
                    {showPrivacy && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowPrivacy(false)}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 50 }}
                                className="glass-card w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-[2rem] relative z-10 p-8"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-foreground">Privacy Policy</h2>
                                    <button onClick={() => setShowPrivacy(false)} className="p-2 bg-secondary rounded-full hover:bg-secondary/80">
                                        <X className="w-5 h-5 text-foreground" />
                                    </button>
                                </div>
                                <div className="prose dark:prose-invert text-sm text-muted-foreground space-y-4">
                                    <p><strong>Last Updated:</strong> 2026</p>
                                    <p>Your privacy is non-negotiable. Bonder is designed to be a local-first personal CRM.</p>

                                    <h3 className="text-foreground font-bold text-lg">1. Data Storage</h3>
                                    <p>All contact data is stored <strong>locally on your device</strong> via standard LocalStorage APIs. We do not have servers that store your personal relationship data.</p>

                                    <h3 className="text-foreground font-bold text-lg">2. Analytics</h3>
                                    <p>We collect anonymous usage statistics (e.g., number of contacts added) to improve the gamification algorithms. No personally identifiable information is transmitted.</p>

                                    <h3 className="text-foreground font-bold text-lg">3. Security</h3>
                                    <p>Because data lives on your device, it is as secure as your phone/computer. We recommend keeping your device password protected.</p>
                                </div>
                                <button onClick={() => setShowPrivacy(false)} className="w-full mt-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl">
                                    I Understand
                                </button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Reset Confirmation Modal */}
                <ResetModal
                    isOpen={showReset}
                    onClose={() => setShowReset(false)}
                    onConfirm={handleResetConfirm}
                />

                {/* Subscription Modal */}
                <SubscriptionModal isOpen={showSubscription} onClose={() => setShowSubscription(false)} />
            </div>
            <BottomNav />
        </MobileFrame>
    );
}
