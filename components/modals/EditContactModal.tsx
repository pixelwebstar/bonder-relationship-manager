"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save } from "lucide-react";
import { Contact, useStore } from "@/lib/store";
import { AvatarGradient } from "@/components/ui/AvatarGradient";

interface EditContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    contact: Contact;
}

export function EditContactModal({ isOpen, onClose, contact }: EditContactModalProps) {
    const { updateContact, availableTags, addTag } = useStore();
    const [name, setName] = useState(contact.name);
    const [phone, setPhone] = useState(contact.phoneNumber || "");
    const [email, setEmail] = useState(contact.email || "");
    const [tags, setTags] = useState(contact.tags.join(", "));
    const [frequency, setFrequency] = useState(contact.targetFrequencyDays);
    const [avatar, setAvatar] = useState(contact.avatar || "");
    const [showCustomInput, setShowCustomInput] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                setName(contact.name);
                setPhone(contact.phoneNumber || "");
                setEmail(contact.email || "");
                setTags(contact.tags.join(", "));
                setFrequency(contact.targetFrequencyDays);
            }, 0);
        }
    }, [isOpen, contact]);

    const handleSave = () => {
        updateContact(contact.id, {
            name,
            phoneNumber: phone || undefined,
            email: email || undefined,
            avatar: avatar || undefined,
            tags: tags.split(",").map(t => t.trim()).filter(Boolean),
            targetFrequencyDays: frequency
        });
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
                        className="relative w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <h2 className="text-lg font-bold text-foreground">Edit Contact</h2>
                            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                            {/* Avatar & Name */}
                            <div className="flex gap-4 items-start">
                                <div className="shrink-0 relative group">
                                    <AvatarGradient name={name} src={avatar} size="lg" />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <span className="text-xs text-white font-bold">Edit</span>
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground mb-1 block">Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-4 py-3 bg-secondary rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                                            placeholder="Contact name"
                                        />
                                    </div>

                                </div>
                            </div>

                            {/* Drift Settings */}
                            <div>
                                <label className="text-sm font-medium text-muted-foreground mb-1 block">Reconnect Frequency</label>
                                <select
                                    value={frequency}
                                    onChange={(e) => setFrequency(Number(e.target.value))}
                                    className="w-full px-4 py-3 bg-secondary rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/30 text-foreground appearance-none"
                                >
                                    <option value={7}>Every 7 Days</option>
                                    <option value={14}>Every 14 Days</option>
                                    <option value={30}>Every 30 Days</option>
                                    <option value={90}>Every 90 Days</option>
                                    <option value={180}>Every 6 Months</option>
                                    <option value={0}>Never</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground mb-1 block">Phone</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full px-4 py-3 bg-secondary rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                                    placeholder="Phone number"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground mb-1 block">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-secondary rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                                    placeholder="Email address"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground mb-2 block">Tags</label>

                                {/* Active Tags */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {tags.split(",").map(t => t.trim()).filter(Boolean).map((tag) => (
                                        <div
                                            key={tag}
                                            className="px-3 py-1 bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 rounded-full text-xs font-bold flex items-center gap-1 group"
                                        >
                                            {tag}
                                            <button
                                                onClick={() => {
                                                    const currentTags = tags.split(",").map(t => t.trim()).filter(Boolean);
                                                    setTags(currentTags.filter(t => t !== tag).join(", "));
                                                }}
                                                className="p-0.5 rounded-full hover:bg-violet-200 dark:hover:bg-violet-800 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Defaults & Actions */}
                                <div className="space-y-3">
                                    <div className="flex flex-wrap gap-2">
                                        {['Family', 'Friends', 'Colleagues', 'Other'].map(option => {
                                            const isActive = tags.includes(option);
                                            return (
                                                <button
                                                    key={option}
                                                    onClick={() => {
                                                        const currentTags = tags.split(",").map(t => t.trim()).filter(Boolean);
                                                        if (!currentTags.includes(option)) {
                                                            setTags([...currentTags, option].join(", "));
                                                        }
                                                    }}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${isActive
                                                        ? 'bg-slate-200 text-slate-600 border-slate-300 cursor-default opacity-50'
                                                        : 'bg-secondary text-muted-foreground border-transparent hover:border-violet-200 dark:hover:border-violet-800'
                                                        }`}
                                                    disabled={isActive}
                                                >
                                                    {option}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
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
                                onClick={handleSave}
                                disabled={!name.trim()}
                                className="flex-1 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Save
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
