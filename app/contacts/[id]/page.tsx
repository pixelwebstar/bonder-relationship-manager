"use client";

import { Contact, useStore, InteractionType, InteractionVibe } from "@/lib/store";
import { generateHeuristicSummary } from "@/lib/summaryGenerator";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { BottomNav } from "@/components/layout/BottomNav";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Calendar, MessageSquare, Send, Edit2, Trash2, BellOff, X, Clock, TrendingUp, ChevronLeft, MoreVertical, Pin, Sparkles, BookOpen, Activity } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, use, useRef } from "react";
import { toast } from "sonner";
import { formatDistanceToNow, format, differenceInDays } from "date-fns";
import { InteractionModal } from "@/components/InteractionModal";
import { EditContactModal } from "@/components/modals/EditContactModal";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { SnoozeModal } from "@/components/modals/SnoozeModal";
import { StatsHistoryModal } from "@/components/modals/StatsHistoryModal";

export default function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const id = resolvedParams.id;
    const router = useRouter();
    const { contacts, updateContact, deleteContact, addNote, togglePinNote, deleteNote, snoozeContact, clearSnooze } = useStore();

    const contact = contacts.find(c => c.id === resolvedParams.id);

    const [noteText, setNoteText] = useState("");
    const [contextText, setContextText] = useState(contact?.context || "");
    const [isEditingContext, setIsEditingContext] = useState(false);
    const [isLogging, setIsLogging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSnoozeModal, setShowSnoozeModal] = useState(false);
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiSummary, setAiSummary] = useState<string | null>(null);

    if (!contact) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
            </div>
        );
    }

    const sortedNotes = [...contact.notes].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const handleAddNote = (e: React.FormEvent) => {
        e.preventDefault();
        if (!noteText.trim()) return;
        addNote(id, noteText);
        setNoteText("");
        toast.success("Note added");
    };

    const handleLogComplete = (type: InteractionType, vibe: InteractionVibe, notes: string) => {
        useStore.getState().logInteractionDetailed(contact.id, type, vibe, notes);
        toast.success(`Interaction logged!`);
        setIsLogging(false);
    };

    const handleDelete = () => {
        deleteContact(id);
        toast.success("Contact deleted");
        router.push("/contacts");
    };

    const handleSnooze = (days: number) => {
        snoozeContact(id, days);
        toast.success(`Snoozed for ${days} days`);
    };

    const handleGenerateSummary = async () => {
        setIsGenerating(true);
        setAiSummary(null);
        await new Promise(resolve => setTimeout(resolve, 800));
        const summary = generateHeuristicSummary(contact);
        setAiSummary(summary);
        setIsGenerating(false);
        toast.success("Summary generated!");
    };

    const handleSaveContext = () => {
        updateContact(contact.id, { context: contextText });
        setIsEditingContext(false);
        toast.success("Memory updated");
    };

    return (
        <>
            <MobileFrame>
                <div className="pb-24 min-h-screen bg-background relative">
                    {/* Header / Banner */}
                    <div className="relative h-48 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-indigo-500 rounded-b-[3rem] shadow-lg mb-16">
                        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                            <button
                                onClick={() => router.push('/')}
                                className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <div className="relative">
                                <button
                                    onClick={() => setShowActionsMenu(!showActionsMenu)}
                                    className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
                                >
                                    <MoreVertical className="w-6 h-6" />
                                </button>
                                {/* Dropdown Menu - Outside button */}
                                {showActionsMenu && (
                                    <>
                                        {/* Backdrop to close menu */}
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setShowActionsMenu(false)}
                                        />
                                        <div className="absolute right-0 top-12 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 w-48 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right overflow-hidden">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowActionsMenu(false);
                                                    setShowEditModal(true);
                                                }}
                                                className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-foreground"
                                            >
                                                <Edit2 className="w-4 h-4 text-slate-400" />
                                                Edit Details
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowActionsMenu(false);
                                                    setTimeout(() => setShowSnoozeModal(true), 50);
                                                }}
                                                className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-foreground"
                                            >
                                                <BellOff className="w-4 h-4 text-slate-400" />
                                                {contact.snoozedUntil ? 'Manage Snooze' : 'Snooze Drift'}
                                            </button>
                                            <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowActionsMenu(false);
                                                    setTimeout(() => setShowDeleteModal(true), 50);
                                                }}
                                                className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-500 flex items-center gap-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete Contact
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Profile Image */}
                        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                            <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-900 shadow-xl overflow-hidden bg-white dark:bg-slate-800 flex items-center justify-center">
                                {contact.avatar ? (
                                    <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                                        {contact.name.charAt(0)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="px-4">
                        <h1 className="text-2xl font-bold text-foreground text-center mb-1">{contact.name}</h1>

                        {contact.tags && contact.tags.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-1.5 mb-4 mt-1">
                                {contact.tags.map(tag => (
                                    <span key={tag} className="px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 w-full mt-2 mb-8">
                            <button
                                onClick={() => setIsLogging(true)}
                                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <MessageSquare className="w-5 h-5" />
                                Check In
                            </button>
                            <a
                                href={`tel:${contact.phoneNumber}`}
                                className="flex-1 py-3 bg-white dark:bg-slate-800 text-foreground hover:bg-slate-50 dark:hover:bg-slate-700 rounded-2xl font-bold shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <Phone className="w-5 h-5 text-violet-500" />
                                Call Now
                            </a>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3 mb-8">
                            <div
                                onClick={() => setShowStatsModal(true)}
                                className="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/80 p-3.5 rounded-2xl shadow-sm border border-violet-100/50 dark:border-slate-700 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                <div className="flex items-center gap-1.5 mb-2">
                                    <Calendar className="w-3.5 h-3.5 text-violet-400" />
                                    <span className="text-[10px] font-semibold text-violet-400 uppercase tracking-wider">Last Seen</span>
                                </div>
                                <div className="w-full h-2 bg-white/60 dark:bg-slate-900 rounded-full overflow-hidden mb-1">
                                    <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all" style={{ width: `${Math.max(0, 100 - Math.floor((Date.now() - new Date(contact.lastContacted).getTime()) / (1000 * 60 * 60 * 24) / contact.targetFrequencyDays * 100))}%` }} />
                                </div>
                                <div className="text-right text-[11px] text-violet-400">
                                    {formatDistanceToNow(new Date(contact.lastContacted), { addSuffix: true })}
                                </div>
                            </div>
                            <div
                                onClick={() => setShowStatsModal(true)}
                                className="bg-gradient-to-br from-fuchsia-50 to-pink-50 dark:from-slate-800 dark:to-slate-800/80 p-3.5 rounded-2xl shadow-sm border border-fuchsia-100/50 dark:border-slate-700 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                <div className="flex items-center gap-1.5 mb-2">
                                    <TrendingUp className="w-3.5 h-3.5 text-fuchsia-400" />
                                    <span className="text-[10px] font-semibold text-fuchsia-400 uppercase tracking-wider">Health</span>
                                </div>
                                <div className="w-full h-2 bg-white/60 dark:bg-slate-900 rounded-full overflow-hidden mb-1">
                                    <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all" style={{ width: `${contact.healthScore}%` }} />
                                </div>
                                <div className="text-right text-[11px] text-fuchsia-400">{contact.healthScore}%</div>
                            </div>
                        </div>

                        {/* Context Section */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-violet-500" />
                                    Memory & Context
                                </h2>
                                <button
                                    onClick={handleGenerateSummary}
                                    disabled={isGenerating}
                                    className="text-xs px-3 py-1.5 bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 font-bold rounded-full flex items-center gap-1.5 hover:bg-violet-100 dark:hover:bg-violet-500/20 transition-all disabled:opacity-50"
                                >
                                    <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-pulse' : ''}`} />
                                    {isGenerating ? "Reasoning..." : "AI Summary"}
                                </button>
                            </div>

                            <AnimatePresence>
                                {(isGenerating || aiSummary) && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                        animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="glass-card p-5 rounded-3xl relative bg-violet-50/50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-800">
                                            {isGenerating ? (
                                                <div className="space-y-4 animate-pulse">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Sparkles className="w-4 h-4 text-violet-500 animate-[spin_3s_linear_infinite]" />
                                                        <span className="text-xs font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">Generating...</span>
                                                    </div>
                                                    <div className="h-4 bg-gradient-to-r from-violet-200/50 via-fuchsia-200/50 to-violet-200/50 rounded-full w-3/4" />
                                                    <div className="h-4 bg-gradient-to-r from-violet-100/50 via-fuchsia-100/50 to-violet-100/50 rounded-full w-full" />
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <Sparkles className="w-4 h-4 text-violet-500" />
                                                            <span className="text-xs font-bold text-violet-600 dark:text-violet-400">AI Insight</span>
                                                        </div>
                                                        <button onClick={() => setAiSummary(null)} className="text-muted-foreground hover:text-foreground">
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <p className="text-sm text-foreground leading-relaxed italic">"{aiSummary}"</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="glass-card p-4 rounded-2xl relative group">
                                {isEditingContext ? (
                                    <div>
                                        <textarea
                                            value={contextText}
                                            onChange={(e) => setContextText(e.target.value)}
                                            placeholder="How did you meet? What defines them?"
                                            className="w-full bg-transparent border-none outline-none resize-none text-foreground placeholder:text-muted-foreground min-h-[80px]"
                                            autoFocus
                                        />
                                        <div className="flex justify-end gap-2 mt-2">
                                            <button onClick={() => setIsEditingContext(false)} className="text-xs font-medium text-muted-foreground px-3 py-1.5 rounded-lg hover:bg-secondary">Cancel</button>
                                            <button onClick={handleSaveContext} className="text-xs font-bold text-white bg-primary px-3 py-1.5 rounded-lg">Save</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div onClick={() => { setContextText(contact.context || ""); setIsEditingContext(true); }} className="cursor-text min-h-[60px]">
                                        {contact.context ? (
                                            <p className="text-foreground leading-relaxed">{contact.context}</p>
                                        ) : (
                                            <p className="text-muted-foreground italic">Add context about how you know {contact.name.split(' ')[0]}...</p>
                                        )}
                                        <button className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notes & Logs */}
                        <div className="mb-8">
                            <h2 className="text-lg font-bold text-foreground mb-4">Notes & Logs</h2>
                            <form onSubmit={handleAddNote} className="flex gap-2 mb-6">
                                <div className="relative flex-1">
                                    <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-violet-400" />
                                    <input
                                        type="text"
                                        value={noteText}
                                        onChange={(e) => setNoteText(e.target.value)}
                                        placeholder="Jotted down something..."
                                        className="w-full bg-violet-50/50 dark:bg-violet-900/10 pl-10 pr-4 py-4 rounded-[1.5rem] border-none outline-none focus:ring-2 focus:ring-violet-500/20 text-foreground placeholder:text-slate-400 placeholder:italic"
                                    />
                                </div>
                                <button type="submit" disabled={!noteText.trim()} className="p-3 bg-violet-600 text-white rounded-2xl shadow-lg shadow-violet-500/30 disabled:opacity-50 disabled:shadow-none">
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                            <div className="space-y-3">
                                {sortedNotes.map((note) => (
                                    <motion.div
                                        layout
                                        key={note.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`p-4 rounded-2xl border transition-all ${note.isPinned ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="text-xs text-slate-400 font-medium flex items-center gap-2">
                                                {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                                                {note.isPinned && <span className="text-amber-500 flex items-center gap-1"><Pin className="w-3 h-3 fill-current" /> Pinned</span>}
                                            </div>
                                            <div className="flex gap-1">
                                                <button onClick={() => togglePinNote(contact.id, note.id)} className={`p-1.5 rounded-lg transition-colors ${note.isPinned ? 'text-amber-500 bg-amber-100 dark:bg-amber-900/30' : 'text-slate-300 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                                                    <Pin className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => deleteNote(contact.id, note.id)} className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{note.content}</p>
                                    </motion.div>
                                ))}
                                {contact.notes.length === 0 && <p className="text-center text-slate-400 text-sm mt-8">No memories recorded yet.</p>}
                            </div>
                        </div>
                    </div>
                </div>

                <BottomNav />

                <InteractionModal isOpen={isLogging} onClose={() => setIsLogging(false)} onLog={handleLogComplete} contactName={contact.name} />
                <StatsHistoryModal isOpen={showStatsModal} onClose={() => setShowStatsModal(false)} contact={contact} />

                {/* History Modal */}
                <AnimatePresence>
                    {showHistoryModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowHistoryModal(false)} />
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-card w-full max-w-md rounded-[2rem] p-6 relative z-10 max-h-[80vh] overflow-y-auto">
                                <button onClick={() => setShowHistoryModal(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                                <h2 className="text-xl font-bold text-foreground mb-6">Relationship Stats</h2>
                                <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 p-4 rounded-2xl mb-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <TrendingUp className="w-5 h-5 text-violet-500" />
                                        <h3 className="font-bold text-foreground">Health Score: {contact.healthScore}%</h3>
                                    </div>
                                    <div className="w-full bg-white/50 dark:bg-slate-800/50 h-3 rounded-full overflow-hidden mb-3">
                                        <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-full transition-all" style={{ width: `${contact.healthScore}%` }} />
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        <strong>How it works:</strong> Health decays daily based on your target contact frequency ({contact.targetFrequencyDays} days). Logging interactions boosts it back up!
                                    </p>
                                </div>
                                <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Clock className="w-5 h-5 text-violet-500" />
                                        <h3 className="font-bold text-foreground">Activity Timeline</h3>
                                    </div>
                                    {contact.notes.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-8">No interactions logged yet.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {[...contact.notes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((note, index, arr) => {
                                                const prevNote = arr[index + 1];
                                                const daysBetween = prevNote ? differenceInDays(new Date(note.createdAt), new Date(prevNote.createdAt)) : null;
                                                return (
                                                    <div key={note.id}>
                                                        <div className="flex gap-3">
                                                            <div className="flex flex-col items-center">
                                                                <div className="w-3 h-3 bg-violet-500 rounded-full" />
                                                                {index < arr.length - 1 && <div className="w-0.5 flex-1 bg-violet-200 dark:bg-violet-800 mt-1" />}
                                                            </div>
                                                            <div className="flex-1 pb-4">
                                                                <p className="text-sm text-foreground">{note.content}</p>
                                                                <p className="text-xs text-muted-foreground mt-1">{format(new Date(note.createdAt), 'MMM d, yyyy')} • {formatDistanceToNow(new Date(note.createdAt))} ago</p>
                                                            </div>
                                                        </div>
                                                        {daysBetween !== null && daysBetween > 0 && (
                                                            <div className="ml-6 mb-3 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full inline-block">↑ {daysBetween} day{daysBetween > 1 ? 's' : ''} gap</div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                <div className="text-center pt-4 border-t border-border/30">
                                    <p className="text-xs text-muted-foreground">Added to Bonder on {format(new Date(contact.createdAt), 'MMMM d, yyyy')}</p>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </MobileFrame>

            {/* Modals - Outside MobileFrame to prevent clipping */}
            <EditContactModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                contact={contact}
            />
            <SnoozeModal
                isOpen={showSnoozeModal}
                onClose={() => setShowSnoozeModal(false)}
                contactName={contact.name}
                isSnoozed={!!contact.snoozedUntil}
                onSnooze={(days: number) => snoozeContact(contact.id, days)}
                onClearSnooze={() => clearSnooze(contact.id)}
            />
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={() => {
                    deleteContact(contact.id);
                    router.push('/');
                    toast.success('Contact deleted');
                }}
                title="Delete Contact"
                message={`Are you sure you want to delete ${contact.name}? This action cannot be undone.`}
                confirmText="Delete"
                confirmVariant="danger"
            />
        </>
    );
}
