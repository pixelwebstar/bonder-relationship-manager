"use client";

import { useState, useRef } from "react";
import { useStore } from "@/lib/store";
import { parseVCF } from "@/lib/vcf-parser";
import { motion, AnimatePresence } from "framer-motion";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { BottomNav } from "@/components/layout/BottomNav";
import { Search, Upload, UserPlus, Phone, Trash2, X, CheckSquare, Square, Star, SlidersHorizontal, Plus, BellOff } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import Link from "next/link";
import { AvatarGradient } from "@/components/ui/AvatarGradient";
import { HealthBar } from "@/components/ui/HealthBar";

type SortOption = 'health' | 'name' | 'lastContacted' | 'favorites';

export default function ContactsPage() {
    const router = useRouter();
    const { contacts, addContact, deleteContacts, toggleFavorite } = useStore();
    const [searchTerm, setSearchTerm] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Multi-select state
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Sorting and filtering
    const [sortBy, setSortBy] = useState<SortOption>('health');
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [hideSnoozed, setHideSnoozed] = useState(true);

    // Filter and sort contacts
    const filteredContacts = contacts
        .filter(c => {
            // Search filter
            const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

            // Favorites filter
            const matchesFavorites = !showFavoritesOnly || c.isFavorite;

            // Snooze filter
            const isSnoozed = c.snoozedUntil && new Date(c.snoozedUntil) > new Date();
            const matchesSnooze = !hideSnoozed || !isSnoozed;

            return matchesSearch && matchesFavorites && matchesSnooze;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'lastContacted':
                    return new Date(b.lastContacted).getTime() - new Date(a.lastContacted).getTime();
                case 'favorites':
                    if (a.isFavorite && !b.isFavorite) return -1;
                    if (!a.isFavorite && b.isFavorite) return 1;
                    return a.healthScore - b.healthScore;
                case 'health':
                default:
                    return a.healthScore - b.healthScore;
            }
        });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const parsed = await parseVCF(file);
            let count = 0;
            parsed.forEach(p => {
                if (!contacts.find(c => c.name === p.name)) {
                    addContact({
                        name: p.name,
                        phoneNumber: p.phone,
                        email: p.email,
                        tags: ['imported'],
                        targetFrequencyDays: 14
                    });
                    count++;
                }
            });
            toast.success(`Imported ${count} contacts successfully!`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to parse VCF file.");
        }
    };

    // Selection handlers
    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        setSelectedIds(filteredContacts.map(c => c.id));
    };

    const clearSelection = () => {
        setSelectedIds([]);
        setSelectionMode(false);
    };

    const handleBulkDelete = () => {
        deleteContacts(selectedIds);
        toast.success(`Deleted ${selectedIds.length} contacts`);
        clearSelection();
    };

    const handleCardClick = (contactId: string) => {
        if (selectionMode) {
            toggleSelection(contactId);
        } else {
            router.push(`/contacts/${contactId}`);
        }
    };

    const handleCardLongPress = (contactId: string) => {
        if (!selectionMode) {
            setSelectionMode(true);
            setSelectedIds([contactId]);
        }
    };

    const handleToggleFavorite = (e: React.MouseEvent, contactId: string) => {
        e.stopPropagation();
        toggleFavorite(contactId);
    };

    const sortLabels: Record<SortOption, string> = {
        health: 'Needs Attention',
        name: 'A-Z',
        lastContacted: 'Recently Contacted',
        favorites: 'Favorites First'
    };

    return (
        <MobileFrame>
            <div className="p-6 pb-28 min-h-screen">
                {/* Header */}
                <AnimatePresence mode="wait">
                    {selectionMode ? (
                        <motion.div
                            key="selection-header"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex justify-between items-center mb-6"
                        >
                            <div className="flex items-center gap-3">
                                <button onClick={clearSelection} className="p-2 hover:bg-secondary rounded-full">
                                    <X className="w-5 h-5 text-foreground" />
                                </button>
                                <span className="font-bold text-foreground">{selectedIds.length} selected</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={selectAll}
                                    className="px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-xl transition-colors"
                                >
                                    Select All
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    disabled={selectedIds.length === 0}
                                    className="p-2 bg-rose-500 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="normal-header"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex justify-between items-center mb-6"
                        >
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">My Network</h1>
                                <p className="text-muted-foreground text-sm">{contacts.length} connections</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Actions moved to settings */}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Search and Sort Row */}
                <div className="flex gap-2 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search friends..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white dark:bg-slate-800/50 pl-10 pr-4 py-3 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-violet-500/20 outline-none placeholder:text-slate-400 font-medium text-foreground"
                        />
                    </div>
                    <button
                        onClick={() => setShowSortMenu(!showSortMenu)}
                        className="p-3 bg-white dark:bg-slate-800/50 rounded-2xl shadow-sm hover:bg-secondary/80 transition-colors"
                    >
                        <SlidersHorizontal className="w-5 h-5 text-foreground" />
                    </button>
                </div>

                {/* Sort/Filter Menu */}
                <AnimatePresence>
                    {showSortMenu && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-4 overflow-hidden"
                        >
                            <div className="glass-card p-4 rounded-2xl space-y-4">
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Sort By</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(Object.keys(sortLabels) as SortOption[]).map((option) => (
                                            <button
                                                key={option}
                                                onClick={() => setSortBy(option)}
                                                className={`px-3 py-1.5 text-sm font-medium rounded-xl transition-colors ${sortBy === option
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                                                    }`}
                                            >
                                                {sortLabels[option]}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={showFavoritesOnly}
                                            onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                                            className="w-4 h-4 rounded accent-primary"
                                        />
                                        <span className="text-sm text-foreground">Favorites Only</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={hideSnoozed}
                                            onChange={(e) => setHideSnoozed(e.target.checked)}
                                            className="w-4 h-4 rounded accent-primary"
                                        />
                                        <span className="text-sm text-foreground">Hide Snoozed</span>
                                    </label>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Hint for selection mode */}
                {!selectionMode && contacts.length > 0 && (
                    <p className="text-xs text-muted-foreground mb-4 text-center">
                        Tap and hold to select • Tap ⭐ to favorite
                    </p>
                )}

                {/* List */}
                <div className="space-y-6">
                    <AnimatePresence>
                        {filteredContacts.map((contact, i) => {
                            const isSelected = selectedIds.includes(contact.id);
                            const isSnoozed = contact.snoozedUntil && new Date(contact.snoozedUntil) > new Date();
                            return (
                                <motion.div
                                    key={contact.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    onClick={() => handleCardClick(contact.id)}
                                    onContextMenu={(e) => { e.preventDefault(); handleCardLongPress(contact.id); }}
                                    onTouchStart={() => {
                                        const timer = setTimeout(() => handleCardLongPress(contact.id), 500);
                                        const clear = () => clearTimeout(timer);
                                        window.addEventListener('touchend', clear, { once: true });
                                        window.addEventListener('touchmove', clear, { once: true });
                                    }}
                                    className={`glass-card p-5 rounded-[2rem] flex items-center justify-between cursor-pointer transition-all border border-transparent ${isSelected
                                        ? 'bg-primary/10 border-primary/50 dark:bg-primary/20'
                                        : isSnoozed
                                            ? 'opacity-50 grayscale hover:opacity-70'
                                            : 'hover:bg-white/90 dark:hover:bg-slate-800/80 hover:border-violet-500/20'
                                        }`}
                                >
                                    <div className="flex items-center gap-5 w-full">
                                        {/* Selection Checkbox */}
                                        {selectionMode && (
                                            <div className="flex-shrink-0">
                                                {isSelected ? (
                                                    <CheckSquare className="w-5 h-5 text-primary" />
                                                ) : (
                                                    <Square className="w-5 h-5 text-muted-foreground" />
                                                )}
                                            </div>
                                        )}

                                        {/* Avatar */}
                                        <div className="flex-shrink-0">
                                            <AvatarGradient name={contact.name} src={contact.avatar} size="md" />
                                        </div>

                                        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-lg text-slate-800 dark:text-white dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] truncate">{contact.name}</h3>
                                                {isSnoozed && <BellOff className="w-4 h-4 text-muted-foreground" />}
                                            </div>

                                            {/* Stacked Bar & Status */}
                                            <div className="w-full max-w-[180px]">
                                                <HealthBar score={contact.healthScore} className="w-full h-2 shadow-[0_0_8px_rgba(139,92,246,0.2)]" />
                                            </div>

                                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 tracking-wide">
                                                {contact.healthScore < 50 ? "Needs attention" : "Healthy Connection"}
                                            </span>
                                        </div>
                                    </div>

                                    {!selectionMode && (
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={(e) => handleToggleFavorite(e, contact.id)}
                                                className="p-2 transition-colors"
                                            >
                                                <Star className={`w-5 h-5 ${contact.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-slate-300 hover:text-amber-400'}`} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.location.href = `tel:${contact.phoneNumber}`;
                                                }}
                                                className="p-2 text-slate-300 hover:text-green-500 transition-colors"
                                            >
                                                <Phone className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {filteredContacts.length === 0 && (
                        <div className="text-center py-10">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <UserPlus className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="text-slate-500 font-medium">No contacts found</p>
                            <p className="text-sm text-slate-400 mb-4">
                                {showFavoritesOnly ? "No favorites yet" : hideSnoozed ? "Try showing snoozed contacts" : "Import a VCF file or add manually"}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleBulkDelete}
                title="Delete Contacts"
                message={`Are you sure you want to delete ${selectedIds.length} contact${selectedIds.length > 1 ? 's' : ''}? This action cannot be undone.`}
                confirmText="Delete"
                confirmVariant="danger"
            />

            <BottomNav />
        </MobileFrame >
    );
}


