"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Trash2 } from "lucide-react";

interface ResetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function ResetModal({ isOpen, onClose, onConfirm }: ResetModalProps) {
    const [confirmText, setConfirmText] = useState("");
    const isConfirmed = confirmText.toLowerCase() === "confirm reset";

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="glass-card w-full max-w-sm rounded-[2rem] relative z-10 p-6 border-red-500/30 shadow-[0_0_50px_rgba(220,38,38,0.2)]"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-red-500/10 rounded-2xl">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <button onClick={onClose} className="p-2 bg-secondary rounded-full hover:bg-secondary/80 text-foreground transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <h2 className="text-2xl font-bold text-foreground mb-2">Nuclear Reset</h2>
                    <p className="text-muted-foreground text-sm mb-6">
                        This will permanently delete all contacts, streaks, and local data. This action cannot be undone.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 block">
                                Type &quot;confirm reset&quot; to continue
                            </label>
                            <input
                                type="text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder="confirm reset"
                                className="w-full bg-secondary/50 border border-red-500/20 focus:border-red-500 rounded-xl px-4 py-3 text-foreground focus:outline-none transition-colors font-mono text-sm"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 px-4 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={!isConfirmed}
                                onClick={() => {
                                    if (isConfirmed) {
                                        // 1. Explicitly remove the specific store key
                                        localStorage.removeItem('bonder-storage');

                                        // 2. Clear everything else just in case
                                        localStorage.clear();
                                        sessionStorage.clear();

                                        // 3. Force redirect to home to reset route state, then reload
                                        // internal routing might hold state, so full reload is best.
                                        window.location.href = '/';
                                    }
                                }}
                                className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all shadow-lg ${isConfirmed
                                    ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/30"
                                    : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                                    }`}
                            >
                                Nuke Everything
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
