"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Zap, Check, Mail, Smartphone } from "lucide-react"; // Smartphone as placeholder for Apple? Or just Apple icon if available
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTheme } from "next-themes";

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentName: string;
    currentAvatar: string | null;
    onSaveName: (newName: string) => void;
    onAvatarUpload: (file: File) => void;
    onUpgrade: () => void;
    isPro: boolean;
    isConnected: boolean;
}

import { useRef } from "react";

export function ProfileModal({ isOpen, onClose, currentName, currentAvatar, onSaveName, onAvatarUpload, onUpgrade, isPro, isConnected }: ProfileModalProps) {
    const [name, setName] = useState(currentName);
    const { resolvedTheme } = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset name when modal opens
    useEffect(() => {
        if (isOpen) setName(currentName);
    }, [isOpen, currentName]);

    const handleSave = () => {
        if (!name.trim()) {
            toast.error("Name cannot be empty");
            return;
        }
        onSaveName(name);
        onClose();
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onAvatarUpload(file);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 50 }}
                        className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[2rem] relative z-10 p-6 md:p-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-foreground">Edit Profile</h2>
                            <button onClick={onClose} className="p-2 bg-secondary rounded-full hover:bg-secondary/80 transition-colors">
                                <X className="w-5 h-5 text-foreground" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-5">
                            {/* Profile Picture Section */}
                            <div className="flex flex-col items-center gap-3">
                                <div className="relative cursor-pointer group" onClick={handleAvatarClick}>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    <div className="relative">
                                        {currentAvatar ? (
                                            <div className="w-20 h-20 rounded-full overflow-hidden shadow-[0_0_20px_rgba(139,92,246,0.3)] border-4 border-white dark:border-[#030014] transition-all group-hover:scale-105 active:scale-95">
                                                <img src={currentAvatar} alt="Profile" className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 text-2xl font-bold text-white overflow-hidden transition-all group-hover:scale-105 active:scale-95">
                                                {name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.25em] opacity-40">Update photo</p>
                            </div>

                            <div className="flex flex-col gap-3">
                                {/* Name Input */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 opacity-50">Display Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-secondary/30 border border-border/50 rounded-2xl px-5 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-lg shadow-inner"
                                        placeholder="Your Name"
                                    />
                                </div>

                                {/* Plan Section */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 opacity-50">Your Plan</label>
                                    <div className={`px-5 py-3.5 rounded-2xl border ${isPro ? 'border-violet-500/30 bg-violet-500/5' : 'border-border/50 bg-secondary/20'} flex items-center justify-between shadow-sm`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-xl ${isPro ? 'bg-violet-500 text-white' : 'bg-secondary/40 text-muted-foreground shadow-inner'} flex items-center justify-center`}>
                                                <Zap className="w-5 h-5 fill-current" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground text-base leading-none">{isPro ? "Bonder Pro" : "Free Plan"}</p>
                                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 mt-1">{isPro ? "Active & Renewing" : "Basic features"}</p>
                                            </div>
                                        </div>
                                        {!isPro && (
                                            <button
                                                onClick={onUpgrade}
                                                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-violet-500/20 hover:scale-105 transition-transform active:scale-95"
                                            >
                                                Upgrade
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Linked Accounts */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 opacity-50">Linked Accounts</label>
                                    <div className="flex flex-col gap-3">
                                        <button className="w-full px-5 py-3.5 rounded-2xl border border-border/50 bg-secondary/10 hover:bg-white/5 transition-colors flex items-center justify-between group shadow-sm active:scale-[0.99]">
                                            <div className="flex items-center gap-4">
                                                <div className="w-9 h-9 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110">
                                                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                                                </div>
                                                <span className="font-bold text-foreground text-base">Google Account</span>
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary group-hover:translate-x-1 transition-transform">
                                                {isConnected ? "Connected" : "Connect"}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="mt-6">
                            <button
                                onClick={handleSave}
                                className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.1em] rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                <Check className="w-5 h-5 stroke-[3]" />
                                Save Changes
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
