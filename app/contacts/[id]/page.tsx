"use client";

import { useStore } from "@/lib/store";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { BottomNav } from "@/components/layout/BottomNav";
import { motion } from "framer-motion";
import { ArrowLeft, Phone, Calendar, MessageSquare, Send, Award } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, use } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { InteractionModal } from "@/components/InteractionModal";
import { InteractionType, InteractionVibe } from "@/lib/store";

export default function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const { contacts, logInteraction, addNote } = useStore();
    const contact = contacts.find(c => c.id === id);
    const [noteText, setNoteText] = useState("");
    const [isLogging, setIsLogging] = useState(false);

    const handleLogComplete = (type: InteractionType, vibe: InteractionVibe, notes: string) => {
        if (!contact) return;
        useStore.getState().logInteractionDetailed(contact.id, type, vibe, notes);
        toast.success(`Interaction logged! (+${vibe === 'awesome' ? 30 : 20} XP)`);
        setIsLogging(false);
    };

    // Helper to simulate 'catching' the return from an external app
    const handleExternalLink = (href: string) => {
        window.location.href = href;
        // In a real PWA we'd detect app focus return, but here we just show the modal after a short delay
        // assuming they might want to log it.
        setTimeout(() => setIsLogging(true), 1000);
    };

    if (!contact) {
        return (
            <MobileFrame>
                <div className="p-8 flex flex-col items-center justify-center text-center h-[60vh]">
                    <h2 className="text-xl font-bold text-foreground">Contact not found</h2>
                    <button onClick={() => router.back()} className="mt-4 text-violet-500 font-medium">
                        Go back
                    </button>
                </div>
                <BottomNav />
            </MobileFrame>
        );
    }



    const handleAddNote = (e: React.FormEvent) => {
        e.preventDefault();
        if (!noteText.trim()) return;
        addNote(contact.id, noteText);
        setNoteText("");
        toast.success("Note added");
    };

    return (
        <MobileFrame>
            <div className="relative pb-28">
                {/* Header / Cover */}
                <div className={`h-40 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-b-[2.5rem] relative ${contact.driftStatus === 'fading' ? 'grayscale opacity-75' : ''}`}>
                    <div className="absolute top-6 left-6">
                        <button onClick={() => router.back()} className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Profile Info */}
                <div className="px-6 -mt-16 relative z-10">
                    <div className="flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center text-4xl font-bold text-violet-600">
                            {contact.name.charAt(0)}
                        </div>

                        <h1 className="mt-4 text-2xl font-bold text-foreground">{contact.name}</h1>

                        {contact.driftStatus === 'fading' && (
                            <span className="mt-1 px-3 py-1 bg-slate-800 text-white text-xs font-bold rounded-full animate-pulse">
                                Fading Away
                            </span>
                        )}

                        <div className="flex gap-2 mt-2">
                            {contact.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 text-xs font-bold uppercase rounded-full tracking-wider">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsLogging(true)}
                            className="py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                        >
                            <Award className="w-5 h-5" /> Log Touchpoint
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleExternalLink(`tel:${contact.phoneNumber}`)}
                            className="py-3 px-4 bg-white text-slate-700 border border-slate-100 rounded-2xl font-bold shadow-sm flex items-center justify-center gap-2"
                        >
                            <Phone className="w-5 h-5 text-violet-500" /> Call Now
                        </motion.button>
                    </div>

                    {/* Stats */}
                    <div className="mt-8 grid grid-cols-2 gap-4">
                        <div className="glass-card p-4 rounded-2xl">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Last Seen</p>
                            <p className="font-semibold text-foreground flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-violet-400" />
                                {formatDistanceToNow(new Date(contact.lastContacted))} ago
                            </p>
                        </div>
                        <div className="glass-card p-4 rounded-2xl">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Health Support</p>
                            <div className="w-full bg-secondary h-2 rounded-full mt-2 overflow-hidden">
                                <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-full" style={{ width: `${contact.healthScore}%` }} />
                            </div>
                            <p className="text-right text-xs text-muted-foreground mt-1">{contact.healthScore}%</p>
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="mt-8">
                        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-violet-500" /> Notes & Memories
                        </h3>

                        <form onSubmit={handleAddNote} className="relative mb-6">
                            <input
                                type="text"
                                value={noteText}
                                onChange={e => setNoteText(e.target.value)}
                                className="w-full glass-card pl-4 pr-12 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-violet-500/20"
                                placeholder="Jotted down something..."
                            />
                            <button
                                type="submit"
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-violet-100 text-violet-600 rounded-xl hover:bg-violet-200 transition-colors"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>

                        <div className="space-y-4">
                            {contact.notes.map(note => (
                                <div key={note.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                    <p className="text-slate-600 leading-relaxed">{note.content}</p>
                                    <p className="text-[10px] text-slate-400 mt-2 text-right">
                                        {new Date(note.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                            {contact.notes.length === 0 && (
                                <p className="text-center text-slate-400 text-sm italic py-4">No notes yet. Memories fade, ink them down.</p>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            <InteractionModal
                isOpen={isLogging}
                onClose={() => setIsLogging(false)}
                onLog={handleLogComplete}
                contactName={contact.name}
            />
        </MobileFrame>
    );
}
