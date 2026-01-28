"use client";

import { useState, useEffect } from "react";
import { Share, MoreVertical, PlusSquare, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function InstallPrompt() {
    const [isIOS, setIsIOS] = useState(false);
    const [isAndroid, setIsAndroid] = useState(false);
    const [isStandalone, setIsStandalone] = useState(true);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [installStatus, setInstallStatus] = useState<'idle' | 'installing' | 'installed'>('idle');

    useEffect(() => {
        // Check if running in standalone mode (PWA installed and running)
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;

        // Detect OS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
        const isAndroidDevice = /android/.test(userAgent);
        const isMobile = isIOSDevice || isAndroidDevice;

        if (isMobile) {
            setIsIOS(isIOSDevice);
            setIsAndroid(isAndroidDevice);
        }

        // Determine if we should show the prompt (i.e., is NOT standalone)
        let shouldHidePrompt = true;
        if (isMobile && !isStandaloneMode) {
            shouldHidePrompt = false;
        }

        // If app is already installed but opened in browser (heuristic for Android sometimes), 
        // we might want to show "Open App" immediately? 
        // For now, respect the standard "not standalone = prompt" logic.
        setIsStandalone(shouldHidePrompt);

        // Capture Android install prompt
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        // Capture successful install
        const handleAppInstalled = () => {
            setInstallStatus('installed');
            setDeferredPrompt(null);
            // Optionally close the prompt after a delay or keep "Open App" visible
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.addEventListener("appinstalled", handleAppInstalled);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
            window.removeEventListener("appinstalled", handleAppInstalled);
        };

    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            setInstallStatus('installing');
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                // Wait for appinstalled event
            } else {
                setInstallStatus('idle'); // Revert if cancelled
            }
        }
    };

    const handleOpenApp = () => {
        // Attempts to launch the app or just closes the modal essentially
        // On Android, clicking the specific "Open" link in standard prompts works, 
        // but custom button behaviors are limited. 
        // We will try opening the manifest start_url.
        window.open('/?source=pwa', '_blank');
    };

    // If it's standalone, render nothing
    if (isStandalone) return null;

    return (
        <div className="fixed inset-0 z-[99999] bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-card border border-border rounded-[2rem] p-8 shadow-2xl"
            >
                <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-violet-500/30">
                    <span className="text-4xl font-bold text-white">B</span>
                </div>

                <h2 className="text-2xl font-bold mb-3">
                    {installStatus === 'installed' ? 'App Installed!' : 'Install Bond'}
                </h2>
                <p className="text-muted-foreground mb-8">
                    {installStatus === 'installed'
                        ? 'Bonder has been successfully installed to your home screen.'
                        : 'To use Bond, you need to add it to your home screen.'}
                </p>

                {isIOS && (
                    <div className="space-y-6 text-left bg-secondary/50 p-6 rounded-2xl">
                        <div className="flex items-center gap-4">
                            <span className="w-8 h-8 flex items-center justify-center bg-background rounded-full font-bold text-primary shadow-sm">1</span>
                            <p className="font-medium">Tap the <Share className="inline w-5 h-5 mx-1" /> Share button</p>
                        </div>
                        <div className="w-px h-4 bg-border ml-4 my-1 opacity-50" />
                        <div className="flex items-center gap-4">
                            <span className="w-8 h-8 flex items-center justify-center bg-background rounded-full font-bold text-primary shadow-sm">2</span>
                            <p className="font-medium">Select <span className="font-bold">Add to Home Screen</span> <PlusSquare className="inline w-5 h-5 mx-1" /></p>
                        </div>
                    </div>
                )}

                {isAndroid && (
                    <div className="space-y-4">
                        {installStatus === 'installed' ? (
                            <button
                                onClick={handleOpenApp}
                                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-500/25 transition-all active:scale-95"
                            >
                                Open App
                            </button>
                        ) : deferredPrompt ? (
                            <button
                                onClick={handleInstallClick}
                                disabled={installStatus === 'installing'}
                                className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {installStatus === 'installing' ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Installing...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-5 h-5" />
                                        Install App
                                    </>
                                )}
                            </button>
                        ) : (
                            // Fallback instructions if automated prompt fails or is ignored
                            <div className="space-y-6 text-left bg-secondary/50 p-6 rounded-2xl">
                                <div className="flex items-center gap-4">
                                    <span className="w-8 h-8 flex items-center justify-center bg-background rounded-full font-bold text-primary shadow-sm">1</span>
                                    <p className="font-medium">Tap the menu <MoreVertical className="inline w-5 h-5 mx-1" /></p>
                                </div>
                                <div className="w-px h-4 bg-border ml-4 my-1 opacity-50" />
                                <div className="flex items-center gap-4">
                                    <span className="w-8 h-8 flex items-center justify-center bg-background rounded-full font-bold text-primary shadow-sm">2</span>
                                    <p className="font-medium">Select <span className="font-bold">Install App</span></p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
