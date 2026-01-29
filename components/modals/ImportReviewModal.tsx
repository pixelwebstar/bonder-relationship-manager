"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Search, Upload } from "lucide-react";
import { useState, useMemo } from "react";

export interface ParsedContact {
    name: string;
    phone: string;
    email?: string;
    included: boolean;
}

interface ImportReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    contacts: ParsedContact[];
    onConfirm: (selectedContacts: ParsedContact[]) => void;
}

export function ImportReviewModal({ isOpen, onClose, contacts, onConfirm }: ImportReviewModalProps) {
    const [localContacts, setLocalContacts] = useState<ParsedContact[]>(contacts);
    const [searchTerm, setSearchTerm] = useState("");

    // Update local state when props change
    useMemo(() => {
        setLocalContacts(contacts);
    }, [contacts]);

    const filteredContacts = localContacts.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    const toggleContact = (index: number) => {
        const newContacts = [...localContacts];
        // Find the contact in the full list corresponding to the filtered index is tricky if we just use index
        // So we should map properly. Let's toggle by finding in localContacts.
        // Simplified: just toggle based on name/phone match or passed index if we map carefully.
        // Better: filteredContacts is derived.
        // Let's just update the specific item in localContacts.
    };

    const handleToggle = (contact: ParsedContact) => {
        setLocalContacts(prev => prev.map(c =>
            (c.name === contact.name && c.phone === contact.phone)
                ? { ...c, included: !c.included }
                : c
        ));
    };

    const handleToggleAll = () => {
        const allIncluded = filteredContacts.every(c => c.included);
        setLocalContacts(prev => prev.map(c => {
            // Only toggle those visible in filter to match user expectation?
            // Or just simple toggle all.
            // Simple: If all filtered are checked, uncheck them. Else check them.
            const isVisible = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm);
            if (isVisible) {
                return { ...c, included: !allIncluded };
            }
            return c;
        }));
    };

    const handleConfirm = () => {
        const selected = localContacts.filter(c => c.included);
        onConfirm(selected);
        onClose();
    };

    const selectedCount = localContacts.filter(c => c.included).length;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-background border border-border rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-border flex justify-between items-center bg-secondary/30">
                            <div>
                                <h2 className="text-xl font-bold text-foreground">Import Contacts</h2>
                                <p className="text-sm text-muted-foreground">Review and select contacts to add</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        {/* Search & Actions */}
                        <div className="p-4 border-b border-border flex gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-secondary rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <button
                                onClick={handleToggleAll}
                                className="px-4 py-2 text-sm font-medium bg-secondary hover:bg-secondary/80 rounded-xl transition-colors whitespace-nowrap"
                            >
                                {filteredContacts.every(c => c.included) ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {filteredContacts.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground">
                                    No contacts found
                                </div>
                            ) : (
                                filteredContacts.map((contact, idx) => (
                                    <div
                                        key={`${contact.name}-${idx}`}
                                        onClick={() => handleToggle(contact)}
                                        className={`p-3 rounded-2xl flex items-center justify-between cursor-pointer transition-colors border ${contact.included ? 'bg-primary/5 border-primary/20' : 'hover:bg-secondary/50 border-transparent'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${contact.included ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                                                {contact.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className={`font-semibold text-sm ${contact.included ? 'text-foreground' : 'text-muted-foreground'}`}>{contact.name}</h4>
                                                <p className="text-xs text-muted-foreground">{contact.phone}</p>
                                            </div>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${contact.included ? 'bg-primary border-primary' : 'border-slate-300'}`}>
                                            {contact.included && <Check className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-border bg-secondary/30">
                            <button
                                onClick={handleConfirm}
                                disabled={selectedCount === 0}
                                className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transform hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Import {selectedCount} Contacts
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
