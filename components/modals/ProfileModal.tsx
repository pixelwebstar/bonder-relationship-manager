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
}

import { useRef } from "react";

export function ProfileModal({ isOpen, onClose, currentName, currentAvatar, onSaveName, onAvatarUpload, onUpgrade, isPro }: ProfileModalProps) {
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

                        <div className="space-y-8">
                            {/* Profile Picture Section */}
                            <div className="flex flex-col items-center">
                                <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    {currentAvatar ? (
                                        <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg shadow-violet-500/20 border-2 border-white/10">
                                            <img src={currentAvatar} alt="Profile" className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 text-3xl font-bold text-white overflow-hidden">
                                            {name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="absolute bottom-0 right-0 p-2 bg-primary rounded-full text-white shadow-md border-2 border-white dark:border-black">
                                        <Camera className="w-4 h-4" />
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-3 font-medium uppercase tracking-wider">Tap to change photo</p>
                            </div>

                            {/* Name Input */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Display Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-lg"
                                    placeholder="Your Name"
                                />
                            </div>

                            {/* Plan Section */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Your Plan</label>
                                <div className={`p-4 rounded-xl border ${isPro ? 'border-violet-500/30 bg-violet-500/5' : 'border-border bg-secondary/30'} flex items-center justify-between`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${isPro ? 'bg-violet-500 text-white' : 'bg-secondary text-muted-foreground'}`}>
                                            <Zap className="w-5 h-5 fill-current" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground">{isPro ? "Bonder Pro" : "Free Plan"}</p>
                                            <p className="text-xs text-muted-foreground">{isPro ? "Active & Renewing" : "Basic features"}</p>
                                        </div>
                                    </div>
                                    {!isPro && (
                                        <button
                                            onClick={onUpgrade}
                                            className="px-3 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-violet-500/20 hover:scale-105 transition-transform"
                                        >
                                            Upgrade
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Linked Accounts */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Linked Accounts</label>
                                <div className="space-y-2">
                                    <button className="w-full p-4 rounded-xl border border-border bg-secondary/20 hover:bg-secondary/40 transition-colors flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all opacity-70 group-hover:opacity-100" />
                                            <span className="font-medium text-foreground">Google</span>
                                        </div>
                                        <span className="text-xs font-bold text-primary">Connect</span>
                                    </button>
                                    <button className="w-full p-4 rounded-xl border border-border bg-secondary/20 hover:bg-secondary/40 transition-colors flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <Smartphone className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                                            <span className="font-medium text-foreground">Apple</span>
                                        </div>
                                        <span className="text-xs font-bold text-primary">Connect</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="mt-8">
                            <button
                                onClick={handleSave}
                                className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Check className="w-5 h-5" />
                                Save Changes
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
