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
import { auth, db, googleProvider } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc, runTransaction, increment } from "firebase/firestore";
import { CloudSyncModal } from "@/components/modals/CloudSyncModal";

export default function SettingsPage() {
    const router = useRouter();
    const userProfile = useStore((state) => state.userProfile);
    const updateDisplayName = useStore((state) => state.updateDisplayName);
    const initializeProfile = useStore((state) => state.initializeProfile);
    const toggleNotifications = useStore((state) => state.toggleNotifications);
    const storeNotificationsEnabled = useStore((state) => state.notificationsEnabled);
    const updateProfile = useStore((state) => state.updateProfile);
    const connectToCloud = useStore((state) => state.connectToCloud);
    const contacts = useStore((state) => state.contacts);
    const addContact = useStore((state) => state.addContact);

    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Local State for UI
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showReset, setShowReset] = useState(false);
    const [showSubscription, setShowSubscription] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    const { userId, displayName, avatar: userAvatar, isPro, isConnected } = userProfile || { userId: '', displayName: '', avatar: null, isPro: false, isConnected: false };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user && !isConnected) {
                updateProfile({
                    isConnected: true,
                    userId: user.uid,
                    displayName: user.displayName || displayName,
                    avatar: user.photoURL || userAvatar
                });
            } else if (!user && isConnected) {
                updateProfile({ isConnected: false, userId: '' });
            }
        });
        return () => unsubscribe();
    }, [isConnected, updateProfile, displayName, userAvatar]);

    // Import state
    const [showImportModal, setShowImportModal] = useState(false);
    const [parsedContacts, setParsedContacts] = useState<ParsedContact[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    // Cloud Sync State
    const [showCloudSyncModal, setShowCloudSyncModal] = useState(false);
    const [pendingCloudData, setPendingCloudData] = useState<any>(null);
    const [pendingUser, setPendingUser] = useState<any>(null);
    const [isConnecting, setIsConnecting] = useState(false);


    useEffect(() => {
        setTimeout(() => setMounted(true), 0);
        // Initialize profile if not exists
        initializeProfile();
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

    const handleToggleNotifications = () => {
        toggleNotifications();
        toast.info(!storeNotificationsEnabled ? "Notifications Enabled" : "Notifications Disabled");
    };

    const handleResetConfirm = () => {
        localStorage.clear();
        router.push("/");
        setTimeout(() => {
            window.location.reload();
        }, 100);
    };

    const handleExportData = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ ...useStore.getState() }, null, 2));
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
            if (!contacts.find(c => c.name === p.name)) {
                addContact({
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

    const getToggleColor = () => {
        if (storeNotificationsEnabled) return "bg-indigo-500";
        return "bg-secondary";
    };

    if (!mounted) return null;

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
                        <div className="glass-card rounded-[1.5rem] overflow-hidden">
                            <div
                                onClick={() => setShowProfileModal(true)}
                                className="p-4 w-full flex items-center justify-between cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-[0.98] group relative"
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    {userProfile?.avatar ? (
                                        <div className="w-14 h-14 rounded-full overflow-hidden shadow-lg shadow-violet-500/20 border-2 border-white/20">
                                            <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 text-xl font-bold text-white border-2 border-white/10">
                                            {userProfile?.displayName.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-bold text-foreground text-lg leading-tight transition-colors">{userProfile?.displayName}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] text-muted-foreground/60 transition-colors uppercase tracking-wider font-bold">ID: {userProfile?.userId}</span>
                                            <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded-md border ${userProfile?.isPro ? 'bg-violet-500 text-white border-transparent' : 'bg-secondary/50 border-border text-muted-foreground'}`}>
                                                {userProfile?.isPro ? "Pro" : "Free"}
                                            </span>
                                            {userProfile?.accountNumber && userProfile.accountNumber > 0 && (
                                                <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary">
                                                    Account #{userProfile.accountNumber}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Decorative background glow for 'Pro' feel */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                            </div>
                        </div>
                    </section>

                    {/* Cloud Synchronization Section */}
                    <section>
                        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 px-1">Cloud Synchronization</h2>
                        <div className="glass-card rounded-[1.5rem] overflow-hidden border border-black/5 dark:border-white/10">
                            <div className="flex flex-col">
                                <button
                                    disabled={isConnecting}
                                    onClick={async () => {
                                        if (isConnecting) return;

                                        // Handle Disconnect
                                        if (isConnected) {
                                            try {
                                                await auth.signOut();
                                                updateProfile({ isConnected: false, userId: '' });
                                                toast.success("Disconnected from Cloud");
                                            } catch (err) {
                                                // Fallback reset
                                                updateProfile({ isConnected: false, userId: '' });
                                                toast.info("Connection reset");
                                            }
                                            return;
                                        }

                                        // Handle Connect
                                        setIsConnecting(true);
                                        try {
                                            console.log("Starting Google Login...");
                                            const result = await signInWithPopup(auth, googleProvider);
                                            const user = result.user;
                                            console.log("Login Successful:", user.uid);
                                            const docRef = doc(db, "users", user.uid);

                                            // Use Transaction to assign sequential account number
                                            try {
                                                await runTransaction(db, async (transaction) => {
                                                    const userDoc = await transaction.get(docRef);
                                                    const counterRef = doc(db, "metadata", "global_stats");
                                                    const counterDoc = await transaction.get(counterRef);

                                                    let cloudAccountNumber = 0;
                                                    const localAccountNumber = useStore.getState().userProfile?.accountNumber || 0;

                                                    if (userDoc.exists() && userDoc.data().accountNumber > 0) {
                                                        cloudAccountNumber = userDoc.data().accountNumber;
                                                        console.log("Found existing account number in cloud:", cloudAccountNumber);
                                                    }

                                                    // Account Mismatch Check
                                                    if (localAccountNumber > 0 && cloudAccountNumber > 0 && localAccountNumber !== cloudAccountNumber) {
                                                        throw new Error("ACCOUNT_MISMATCH");
                                                    }

                                                    let finalAccountNumber = cloudAccountNumber || localAccountNumber;

                                                    if (finalAccountNumber === 0) {
                                                        console.log("Assigning new sequential account number...");
                                                        const currentCount = counterDoc.exists() ? (counterDoc.data().totalAccounts || 0) : 0;
                                                        finalAccountNumber = currentCount + 1;

                                                        // Update Counter
                                                        transaction.set(counterRef, { totalAccounts: increment(1) }, { merge: true });
                                                    }

                                                    const state = useStore.getState();

                                                    // Handle Conflict Resolution Modal if data exists but it's a new connection
                                                    if (userDoc.exists() && !state.userProfile?.isConnected) {
                                                        console.log("Data exists in cloud, showing conflict modal...");
                                                        setPendingCloudData(userDoc.data());
                                                        setShowCloudSyncModal(true);
                                                        // We don't finish the connection here, the modal will handle it
                                                        return;
                                                    }

                                                    const dataToSave = {
                                                        contacts: state.contacts,
                                                        stats: state.stats,
                                                        userProfile: {
                                                            ...state.userProfile,
                                                            userId: user.uid,
                                                            isConnected: true,
                                                            displayName: user.displayName || state.userProfile?.displayName,
                                                            avatar: user.photoURL || state.userProfile?.avatar,
                                                            accountNumber: finalAccountNumber
                                                        },
                                                        availableTags: state.availableTags,
                                                        accountNumber: finalAccountNumber,
                                                        lastUpdated: new Date().toISOString()
                                                    };

                                                    transaction.set(docRef, dataToSave, { merge: true });

                                                    updateProfile({
                                                        userId: user.uid,
                                                        isConnected: true,
                                                        displayName: user.displayName || state.userProfile?.displayName,
                                                        avatar: user.photoURL || state.userProfile?.avatar,
                                                        accountNumber: finalAccountNumber
                                                    });

                                                    toast.success("Connected & Synchronized!");
                                                });
                                            } catch (err: any) {
                                                if (err.message === "ACCOUNT_MISMATCH") {
                                                    toast.error("Account number mismatch. Please use the original Google account or clear your local data.");
                                                } else {
                                                    throw err;
                                                }
                                            }
                                        } catch (error: any) {
                                            if (error?.code === 'auth/popup-closed-by-user') {
                                                toast.info("Sign-in cancelled");
                                            } else if (error?.code === 'auth/cancelled-popup-request') {
                                                // Ignore multiple rapid clicks
                                            } else {
                                                console.error("Firebase Login Error:", error);
                                                toast.error("Connection failed: " + (error?.code || error?.message));
                                            }
                                        } finally {
                                            setIsConnecting(false);
                                        }
                                    }}
                                    className={`w-full p-5 flex items-center justify-between transition-all active:scale-[0.98] text-left group hover:bg-black/5 dark:hover:bg-white/5 ${isConnecting ? 'opacity-70 pointer-events-none' : ''}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center shadow-sm relative">
                                            {isConnecting ? (
                                                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                                </svg>
                                            )}
                                        </div>
                                        <div>
                                            <span className="font-medium text-foreground">{isConnecting ? "Authenticating..." : isConnected ? "Sync Database" : "Connect Google"}</span>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <p className="text-xs text-muted-foreground">{isConnected ? "Cloud storage active" : "Sync across all your devices"}</p>
                                                {isConnected && userProfile?.accountNumber && (
                                                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-1 rounded-sm">#{userProfile.accountNumber}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {isConnected ? (
                                        <span className="text-[10px] px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 font-bold uppercase tracking-wider group-hover:bg-rose-500 group-hover:text-white transition-colors">Disconnect</span>
                                    ) : (
                                        <span className="text-[10px] px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-bold uppercase tracking-wider group-hover:bg-primary group-hover:text-black transition-colors">{isConnecting ? "..." : "Connect"}</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </section>


                    {/* Cloud Sync Modal */}
                    <CloudSyncModal
                        isOpen={showCloudSyncModal}
                        onClose={() => setShowCloudSyncModal(false)}
                        cloudDate={pendingCloudData?.lastUpdated}
                        localDate={useStore.getState().stats.lastActiveDate}
                        accountNumber={pendingCloudData?.accountNumber}
                        onRestore={() => {
                            if (pendingCloudData) {
                                // Restore data from cloud
                                useStore.setState({
                                    contacts: pendingCloudData.contacts || [],
                                    stats: pendingCloudData.stats || useStore.getState().stats,
                                    userProfile: {
                                        ...pendingCloudData.userProfile,
                                        isConnected: true // Ensure connected state
                                    },
                                    availableTags: pendingCloudData.availableTags || useStore.getState().availableTags
                                });
                                toast.success("Account restored from cloud!");
                                setShowCloudSyncModal(false);
                                setTimeout(() => window.location.reload(), 500);
                            }
                        }}
                        onOverwrite={async () => {
                            if (pendingUser) {
                                // Save local data to cloud
                                const state = useStore.getState();
                                const dataToSave = {
                                    contacts: state.contacts,
                                    stats: state.stats,
                                    userProfile: { ...state.userProfile, userId: pendingUser.uid, isConnected: true },
                                    availableTags: state.availableTags,
                                    lastUpdated: new Date().toISOString()
                                };

                                try {
                                    await setDoc(doc(db, "users", pendingUser.uid), dataToSave);

                                    // Update local state to reflect connection
                                    updateProfile({
                                        userId: pendingUser.uid,
                                        isConnected: true,
                                        displayName: pendingUser.displayName || state.userProfile?.displayName,
                                        avatar: pendingUser.photoURL || state.userProfile?.avatar
                                    });

                                    toast.success("Local data saved to cloud!");
                                    setShowCloudSyncModal(false);
                                } catch (error) {
                                    console.error(error);
                                    toast.error("Failed to save to cloud.");
                                }
                            }
                        }}
                    />

                    {/* Preferences */}
                    <section>
                        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 px-1">Experience</h2>
                        <div className="glass-card rounded-[1.5rem] overflow-hidden divide-y divide-black/5 dark:divide-white/5 border border-black/5 dark:border-white/10">

                            {/* Dark Mode */}
                            <div
                                onClick={toggleTheme}
                                className="p-5 flex items-center justify-between cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-[0.98]"
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
                                onClick={handleToggleNotifications}
                                className="p-5 flex items-center justify-between cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-pink-500/10 rounded-xl text-pink-500"><Bell className="w-5 h-5" /></div>
                                    <span className="font-medium text-foreground">Notifications</span>
                                </div>
                                {/* Use different active color for distinct look */}
                                <div className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${getToggleColor()}`}>
                                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${storeNotificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Data */}
                    <section>
                        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 px-1">Data & Privacy</h2>
                        <div className="glass-card rounded-[1.5rem] overflow-hidden divide-y divide-black/5 dark:divide-white/5 border border-black/5 dark:border-white/10">
                            <button onClick={handleExportData} className="w-full p-5 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-[0.98] text-left">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500"><Download className="w-5 h-5" /></div>
                                    <span className="font-medium text-foreground">Export Data</span>
                                </div>
                            </button>

                            <button onClick={() => fileInputRef.current?.click()} className="w-full p-5 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-[0.98] text-left">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-fuchsia-500/10 rounded-xl text-fuchsia-500"><Download className="w-5 h-5 rotate-180" /></div>
                                    <span className="font-medium text-foreground">Import Contacts</span>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".vcf"
                                    onChange={handleFileSelect}
                                />
                            </button>

                            <button onClick={() => setShowPrivacy(true)} className="w-full p-5 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-[0.98] text-left">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-violet-500/10 rounded-xl text-violet-500"><Shield className="w-5 h-5" /></div>
                                    <span className="font-medium text-foreground">Privacy Policy</span>
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
                    currentAvatar={userAvatar as string | null}
                    onSaveName={(name) => {
                        updateDisplayName(name);
                        toast.success("Profile updated!");
                    }}
                    onAvatarUpload={(file) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            updateProfile({ avatar: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                    }}
                    onUpgrade={() => {
                        setShowProfileModal(false);
                        setTimeout(() => setShowSubscription(true), 200);
                    }}
                    isPro={isPro}
                    isConnected={isConnected}
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
