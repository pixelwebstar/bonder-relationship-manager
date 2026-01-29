"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    confirmVariant?: "danger" | "primary";
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    confirmVariant = "danger"
}: ConfirmModalProps) {
    const handleConfirm = () => {
        onConfirm();
        onClose();
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
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${confirmVariant === "danger" ? "bg-rose-500/10" : "bg-primary/10"}`}>
                                    <AlertTriangle className={`w-5 h-5 ${confirmVariant === "danger" ? "text-rose-500" : "text-primary"}`} />
                                </div>
                                <h2 className="text-lg font-bold text-foreground">{title}</h2>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-4">
                            <p className="text-muted-foreground text-sm">{message}</p>
                        </div>

                        {/* Footer */}
                        <div className="flex gap-3 p-4 border-t border-border">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 bg-secondary text-foreground font-semibold rounded-xl hover:bg-secondary/80 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                className={`flex-1 py-3 font-semibold rounded-xl transition-colors ${confirmVariant === "danger"
                                        ? "bg-rose-500 text-white hover:bg-rose-600"
                                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                                    }`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
