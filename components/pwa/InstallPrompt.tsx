"use client";

import { useState, useEffect } from "react";
import { Share, MoreVertical, PlusSquare, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function InstallPrompt() {
    const [isIOS, setIsIOS] = useState(false);
    const [isAndroid, setIsAndroid] = useState(false);
    const [isStandalone, setIsStandalone] = useState(true); // Default to true to avoid flash
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        // Check if running in standalone mode (PWA installed and running)
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;

        // Detect OS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const ios = /iphone|ipad|ipod/.test(userAgent);
        const android = /android/.test(userAgent);
        const isMobile = /iphone|ipad|ipod|android/.test(userAgent);

        if (isMobile) {
            setIsIOS(ios);
            setIsAndroid(android);
        }

        // Determine if we should show the prompt (i.e., is NOT standalone)
        // We only want to show the prompt (isStandalone = false) if it IS mobile AND NOT standalone.
        // For desktop, we treat it as standalone (hidden) to avoid blocking.
        let shouldHidePrompt = true;

        if (isMobile && !isStandaloneMode) {
            shouldHidePrompt = false;
        }

        setIsStandalone(shouldHidePrompt);


        // Capture Android install prompt
        window.addEventListener("beforeinstallprompt", (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        });

    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
            }
        }
    };

    // If it's standalone or not mobile, render nothing
    if (isStandalone) return null;

    return (
        <div className="fixed inset-0 z-[99999] bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-card border border-border rounded-[2rem] p-8 shadow-2xl"
            >
                <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-violet-500/30">
                    {/* App Logo Placeholder */}
                    <span className="text-4xl font-bold text-white">B</span>
                </div>

                <h2 className="text-2xl font-bold mb-3">Install Bond</h2>
                <p className="text-muted-foreground mb-8">
                    To use Bond, you need to add it to your home screen. It takes less than 5 seconds!
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
                    <div className="space-y-6">
                        {deferredPrompt ? (
                            <button
                                onClick={handleInstallClick}
                                className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 transition-all active:scale-95"
                            >
                                <Download className="w-5 h-5" />
                                Install App
                            </button>
                        ) : (
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
