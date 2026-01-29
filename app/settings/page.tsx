"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { BottomNav } from "@/components/layout/BottomNav";
import { Moon, Bell, Trash2, Download, Shield, X, Zap, Mail, Lock } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { SubscriptionModal } from "@/components/monetization/SubscriptionModal";
import { ProfileModal } from "@/components/modals/ProfileModal";
import { ResetModal } from "@/components/modals/ResetModal";
import { ImportReviewModal, ParsedContact } from "@/components/modals/ImportReviewModal";
import { parseVCF } from "@/lib/vcf-parser";
import { useRef } from "react";

export default function SettingsPage() {
    const router = useRouter();
    const store = useStore();
    const { userProfile, updateDisplayName, initializeProfile } = useStore();
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Local State for settings
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showReset, setShowReset] = useState(false);
    const [showSubscription, setShowSubscription] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [userAvatar, setUserAvatar] = useState<string | null>(null);
    const [isPro] = useState(false);

    // Import state
    const [showImportModal, setShowImportModal] = useState(false);
    const [parsedContacts, setParsedContacts] = useState<ParsedContact[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setTimeout(() => setMounted(true), 0);
        // Initialize profile if not exists
        initializeProfile();
        // Load settings from local storage if available
        const savedNotifs = localStorage.getItem('bonder_notifications');
        if (savedNotifs !== null) {
            setTimeout(() => setNotificationsEnabled(JSON.parse(savedNotifs)), 0);
        }
    }, [initializeProfile]);

    const toggleTheme = () => {
        // If current is dark (either set explicitly or by system), switch to light
        // If current is light, switch to dark
        // Setting specific value overrides system
        if (resolvedTheme === 'dark') {
            setTheme('light');
        } else {
            setTheme('dark');
        }
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

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const parsed = await parseVCF(file);
            // Transform to shape needed for modal
            const contactsForReview: ParsedContact[] = parsed.map(p => ({
                name: p.name,
                phone: p.phone || "",
                email: p.email,
                included: true
            }));
            setParsedContacts(contactsForReview);
            setShowImportModal(true);
            // Reset input so same file can be selected again if cancelled
            e.target.value = '';
        } catch (error) {
            console.error(error);
            toast.error("Failed to parse VCF file.");
        }
    };

    const handleImportConfig = (selected: ParsedContact[]) => {
        let count = 0;
        selected.forEach(p => {
            // Check for duplicates
            if (!store.contacts.find(c => c.name === p.name)) {
                store.addContact({
                    name: p.name,
                    phoneNumber: p.phone,
                    email: p.email,
                    tags: ['imported'],
                    targetFrequencyDays: 14
                });
                count++;
            }
        });
        toast.success(`Imported ${count} contacts successfully!`);
    };

    // const saveProfile = () => { ... } // Removed

    if (!mounted) return <div className="p-6">Loading...</div>;

    const getToggleColor = () => {
        if (!notificationsEnabled) return 'bg-secondary';
        return resolvedTheme === 'dark' ? 'bg-indigo-500' : 'bg-green-500';
    };

    // Get display name from profile
    const displayName = userProfile?.displayName || "User";
    const userId = userProfile?.userId || 1;

    return (
        <MobileFrame>
            <div className="p-6 pb-28 min-h-screen">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500 mb-2">Settings</h1>
                    <p className="text-muted-foreground text-sm">Manage your preferences and data.</p>
                </header>

                <div className="space-y-8">
                    {/* Account Section - Fully Clickable */}
                    <section>
                        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 px-1">Account</h2>
                        <div
                            onClick={() => setShowProfileModal(true)}
                            className="glass-card rounded-[1.5rem] p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all active:scale-[0.98] group relative overflow-hidden"
                        >
                            <div className="flex items-center gap-4 relative z-10">
                                {userAvatar ? (
                                    <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg shadow-violet-500/20 border-2 border-white/20">
                                        <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 text-2xl font-bold text-white border-2 border-white/20">
                                        {displayName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <p className="font-bold text-foreground text-xl leading-tight group-hover:text-primary transition-colors">{displayName}</p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className="text-[10px] text-muted-foreground">ID: #{userId.toString().padStart(4, '0')}</span>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${isPro ? 'bg-violet-500/10 border-violet-500/20 text-violet-500' : 'bg-secondary/50 border-border text-muted-foreground'}`}>
                                            {isPro ? "Bonder Pro" : "Free Plan"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-2 text-muted-foreground group-hover:text-primary transition-colors">
                                {/* Chevron or simple indicator usually better than gear here if it opens detail view, but user asked to remove settings button. Maybe just an arrow? */}
                                {/* Keeping it clean as requested, maybe just the clickable area implies playfulness */}
                            </div>

                            {/* Decorative background glow for 'Pro' feel */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        </div>
                    </section>

                    {/* Security Section */}
                    <section>
                        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 px-1">Security</h2>
                        <div className="glass-card rounded-[1.5rem] overflow-hidden divide-y divide-border/30">
                            <button
                                onClick={() => {
                                    toast.info("Google Sign-in coming soon!");
                                }}
                                className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors text-left group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center shadow-sm">
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="font-medium text-foreground group-hover:text-primary transition-colors">Connect Google</span>
                                        <p className="text-xs text-muted-foreground">Sync across devices</p>
                                    </div>
                                </div>
                                <span className="text-xs px-2 py-1 rounded-lg bg-amber-500/10 text-amber-600 font-medium">Soon</span>
                            </button>

                            <button
                                onClick={() => {
                                    toast.info("Email Sign-in coming soon!");
                                }}
                                className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors text-left group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500"><Mail className="w-5 h-5" /></div>
                                    <div>
                                        <span className="font-medium text-foreground group-hover:text-blue-500 transition-colors">Connect Email</span>
                                        <p className="text-xs text-muted-foreground">Backup with email</p>
                                    </div>
                                </div>
                                <span className="text-xs px-2 py-1 rounded-lg bg-amber-500/10 text-amber-600 font-medium">Soon</span>
                            </button>

                            <div className="p-4 flex items-center gap-3 bg-emerald-500/5">
                                <Lock className="w-4 h-4 text-emerald-500" />
                                <span className="text-xs text-emerald-600 dark:text-emerald-400">Your data is stored locally on your device</span>
                            </div>
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
                                <div className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${resolvedTheme === 'dark' ? 'bg-indigo-500' : 'bg-secondary'}`}>
                                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${resolvedTheme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`} />
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

                            <button onClick={() => fileInputRef.current?.click()} className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors text-left group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-fuchsia-500/10 rounded-xl text-fuchsia-500"><Download className="w-5 h-5 rotate-180" /></div>
                                    <span className="font-medium text-foreground group-hover:text-fuchsia-500 transition-colors">Import Contacts</span>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".vcf"
                                    onChange={handleFileSelect}
                                />
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

                {/* Profile Edit Modal */}
                <ProfileModal
                    isOpen={showProfileModal}
                    onClose={() => setShowProfileModal(false)}
                    currentName={displayName}
                    currentAvatar={userAvatar}
                    onSaveName={(name) => {
                        updateDisplayName(name);
                        toast.success("Profile updated!");
                    }}
                    onAvatarUpload={(file) => {
                        // Create a local URL for the file to show immediately
                        const imageUrl = URL.createObjectURL(file);
                        setUserAvatar(imageUrl);
                        toast.success("Profile picture updated!");
                    }}
                    onUpgrade={() => {
                        setShowProfileModal(false);
                        setTimeout(() => setShowSubscription(true), 200);
                    }}
                    isPro={isPro}
                />

                {/* Import Review Modal */}
                <ImportReviewModal
                    isOpen={showImportModal}
                    onClose={() => setShowImportModal(false)}
                    contacts={parsedContacts}
                    onConfirm={handleImportConfig}
                />
            </div>
            <BottomNav />
        </MobileFrame>
    );
}
