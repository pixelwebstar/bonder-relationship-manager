"use client";

import { useState, useEffect, useRef } from "react";
import { Share, PlusSquare, Download, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/ui/Logo";

export function InstallPrompt() {
    const [isIOS, setIsIOS] = useState(false);
    const [isAndroid, setIsAndroid] = useState(false);
    const [isStandalone, setIsStandalone] = useState(true);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [installStatus, setInstallStatus] = useState<'idle' | 'installing' | 'installed'>('idle');
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);
    const [progress, setProgress] = useState(0);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;

        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
        const isAndroidDevice = /android/.test(userAgent);
        const isMobile = isIOSDevice || isAndroidDevice;

        if (isMobile) {
            setIsIOS(isIOSDevice);
            setIsAndroid(isAndroidDevice);
        }

        let shouldHidePrompt = true;
        if (isMobile && !isStandaloneMode) {
            shouldHidePrompt = false;
        }

        setIsStandalone(shouldHidePrompt);

        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        const handleAppInstalled = () => {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            setProgress(100);
            setInstallStatus('installed');
            setDeferredPrompt(null);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.addEventListener("appinstalled", handleAppInstalled);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
            window.removeEventListener("appinstalled", handleAppInstalled);
        };

    }, []);

    const handleInstallClick = async () => {
        // iOS Flow: Open Instructions
        if (isIOS) {
            setShowIOSInstructions(true);
            return;
        }

        // Android Flow: Trigger Prompt
        if (deferredPrompt) {
            setInstallStatus('installing');
            setProgress(0);

            // Simulated progress for 10 seconds (approx)
            let currentProgress = 0;
            // 25 ticks * 400ms = 10000ms
            progressIntervalRef.current = setInterval(() => {
                currentProgress += 100 / 25; // Increment to reach 100 in 25 ticks

                if (currentProgress >= 100) {
                    currentProgress = 100;
                    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
                    // For non-trigger flow (desktop/iOS simulation)
                    if (!deferredPrompt) setInstallStatus('installed');
                }
                setProgress(Math.round(currentProgress));
            }, 400);

            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    // Wait for appinstalled
                } else {
                    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
                    setInstallStatus('idle');
                    setProgress(0);
                }
            } else {
                // If testing on desktop without install prompt availability, simulate success
                setTimeout(() => {
                    setInstallStatus('installed');
                }, 10000);
            }
        }
    };

    const handleOpenApp = () => {
        window.open('/?source=pwa', '_blank');
    };

    if (isStandalone) return null;

    return (
        <AnimatePresence>
            {!isStandalone && (
                <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center pointer-events-none">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" />

                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.95 }}
                        className="relative w-full max-w-sm m-4 mb-8 sm:mb-auto bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl p-6 pointer-events-auto overflow-hidden"
                    >
                        {/* Glow Effects */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-violet-500/20 blur-[60px] rounded-full pointer-events-none" />

                        {/* Content */}
                        <div className="relative z-10 flex flex-col items-center text-center">

                            {/* Logo */}
                            <div className="mb-6">
                                <Logo showText={false} className="w-16 h-16" />
                            </div>

                            {/* Text */}
                            <h2 className="text-xl font-bold text-white mb-1">
                                {installStatus === 'installed' ? 'Welcome to Bond' : 'Install Bond'}
                            </h2>
                            <p className="text-slate-400 text-sm mb-6 leading-relaxed px-4">
                                {installStatus === 'installed'
                                    ? 'Bonder is ready. Open the app to continue.'
                                    : 'Manage relationships effectively. Add the app to your home screen for the best experience.'}
                            </p>

                            {/* Actions */}
                            {installStatus === 'installed' ? (
                                <button
                                    onClick={handleOpenApp}
                                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    Open App <ChevronRight className="w-4 h-4" />
                                </button>
                            ) : (
                                !showIOSInstructions ? (
                                    <button
                                        onClick={handleInstallClick}
                                        disabled={installStatus === 'installing'}
                                        className="w-full py-3.5 bg-white text-slate-900 font-bold rounded-xl shadow-lg shadow-white/10 hover:bg-slate-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {installStatus === 'installing' ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                                                <span className="tabular-nums font-mono">{progress}%</span>
                                                Installing...
                                            </>
                                        ) : (
                                            <>
                                                <Download className="w-4 h-4" />
                                                Install App
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="w-full space-y-4"
                                    >
                                        <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-left space-y-3">
                                            <div className="flex items-center gap-3 text-slate-200 animate-pulse">
                                                <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                                                <p className="text-sm font-medium">Tap the <Share className="inline w-4 h-4 mx-1 text-blue-400" /> Share button</p>
                                            </div>
                                            <div className="w-full h-px bg-white/5" />
                                            <div className="flex items-center gap-3 text-slate-200">
                                                <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                                                <p className="text-sm font-medium">Select <span className="font-bold text-white">Add to Home Screen</span> <PlusSquare className="inline w-4 h-4 mx-1" /></p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setShowIOSInstructions(false)}
                                            className="text-xs text-slate-500 hover:text-white transition-colors"
                                        >
                                            Cancel or go back
                                        </button>
                                    </motion.div>
                                )
                            )}

                            {/* Testing Utilities */}
                            {process.env.NODE_ENV === 'development' && installStatus === 'installed' && (
                                <button
                                    onClick={() => {
                                        setInstallStatus('idle');
                                        setProgress(0);
                                        // Force UI reset for testing
                                    }}
                                    className="mt-4 text-xs text-slate-500 hover:text-rose-400 transition-colors uppercase tracking-wider font-bold"
                                >
                                    [DEV] Reset Install State
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
