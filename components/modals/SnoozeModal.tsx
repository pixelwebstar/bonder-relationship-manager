"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, BellOff, Clock } from "lucide-react";

interface SnoozeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSnooze: (days: number) => void;
    onClearSnooze?: () => void;
    isSnoozed?: boolean;
    contactName: string;
}

export function SnoozeModal({ isOpen, onClose, onSnooze, onClearSnooze, isSnoozed, contactName }: SnoozeModalProps) {
    const snoozeOptions = [
        { days: 7, label: "7 days" },
        { days: 14, label: "14 days" },
        { days: 30, label: "30 days" },
        { days: 90, label: "90 days" },
        { days: 180, label: "6 month" },
        { days: 36500, label: "never" },
    ];

    const handleSnooze = (days: number) => {
        onSnooze(days);
        onClose();
    };

    const handleUnsnooze = () => {
        if (onClearSnooze) {
            onClearSnooze();
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-sm bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                                    <BellOff className="w-5 h-5 text-amber-500" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-foreground">Snooze Reminders</h2>
                                    <p className="text-xs text-muted-foreground">{contactName}</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-4 space-y-2">
                            <p className="text-sm text-muted-foreground mb-4">
                                Pause drift alerts for this contact. They won&apos;t appear in your &quot;Priority Reach-outs&quot; during this time.
                            </p>

                            {snoozeOptions.map((option) => (
                                <button
                                    key={option.days}
                                    onClick={() => handleSnooze(option.days)}
                                    className="w-full flex items-center justify-between px-4 py-3 bg-secondary hover:bg-secondary/80 rounded-xl transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                                        <span className="font-medium text-foreground">{option.label}</span>
                                    </div>

                                </button>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-border">
                            {isSnoozed && (
                                <button
                                    onClick={handleUnsnooze}
                                    className="w-full mb-3 py-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 font-semibold rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                                >
                                    Turn Off Snooze
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="w-full py-3 bg-secondary text-foreground font-semibold rounded-xl hover:bg-secondary/80 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
