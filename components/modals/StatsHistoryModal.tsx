"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, History, Activity, Info, Calendar, Clock } from "lucide-react";
import { Contact } from "@/lib/store";
import { format, differenceInDays, formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";

interface StatsHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    contact: Contact;
    initialTab?: 'health' | 'timeline';
}

export function StatsHistoryModal({ isOpen, onClose, contact, initialTab = 'health' }: StatsHistoryModalProps) {
    const [activeTab, setActiveTab] = useState<'health' | 'timeline'>(initialTab);

    // Update tab if initialTab changes while open (though usually it's set on open)
    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="glass-card w-full max-w-md rounded-[2rem] p-6 relative z-10 max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>

                        <h2 className="text-xl font-bold text-foreground mb-4">Detailed Insights</h2>

                        {/* Tabs */}
                        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
                            <button
                                onClick={() => setActiveTab('health')}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'health'
                                    ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-400 shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                    }`}
                            >
                                <Activity className="w-4 h-4" />
                                Health History
                            </button>
                            <button
                                onClick={() => setActiveTab('timeline')}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'timeline'
                                    ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-400 shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                    }`}
                            >
                                <History className="w-4 h-4" />
                                Timeline
                            </button>
                        </div>

                        {activeTab === 'health' && (
                            <div className="space-y-6">
                                {/* Guide Section */}
                                <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 p-5 rounded-2xl border border-violet-100 dark:border-white/5">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                                            <Info className="w-6 h-6 text-violet-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-foreground mb-1">How Scores Work</h3>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                Your Relationship Health Score starts at 100%. It drops automatically over time if you don&apos;t interact within your target timeframe ({contact.targetFrequencyDays} days).
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white/60 dark:bg-slate-800/60 p-3 rounded-xl">
                                            <div className="text-xs font-bold text-slate-500 mb-1">Decay Rate</div>
                                            <div className="text-sm font-bold text-rose-500">
                                                ~{Math.round(100 / (contact.targetFrequencyDays * 2))}% / day
                                            </div>
                                        </div>
                                        <div className="bg-white/60 dark:bg-slate-800/60 p-3 rounded-xl">
                                            <div className="text-xs font-bold text-slate-500 mb-1">Boost</div>
                                            <div className="text-sm font-bold text-emerald-500">
                                                To 100% on Log
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Health History Log */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <TrendingUp className="w-4 h-4 text-slate-400" />
                                        <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider">Score History</h3>
                                    </div>

                                    {(contact.healthHistory && contact.healthHistory.length > 0) ? (
                                        <div className="space-y-3 relative">
                                            {/* Vertical Line */}
                                            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800" />

                                            {contact.healthHistory.map((item) => (
                                                <div key={item.id} className="relative flex items-center gap-3">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center relative z-10 border-2 border-white dark:border-slate-900 ${item.change > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                                        }`}>
                                                        {item.change > 0 ? '↑' : '↓'}
                                                    </div>
                                                    <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-800 p-3 rounded-xl shadow-sm flex justify-between items-center">
                                                        <div>
                                                            <div className="text-sm font-bold text-foreground">
                                                                {item.score}% <span className={`text-xs ${item.change > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>({item.change > 0 ? '+' : ''}{item.change}%)</span>
                                                            </div>
                                                            <div className="text-xs text-muted-foreground capitalize">{item.reason}</div>
                                                        </div>
                                                        <div className="text-xs text-slate-400 font-medium">
                                                            {format(new Date(item.date), 'MMM d, h:mm a')}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-slate-400 text-sm bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                            No history recorded yet.
                                            <br />
                                            Changes will appear here over time.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'timeline' && (
                            <div className="space-y-6">
                                {/* Interaction Guide */}
                                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-5 rounded-2xl border border-emerald-100 dark:border-white/5">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                                            <Calendar className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-foreground mb-1">Consistency Matters</h3>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                Regular check-ins keep the relationship &quot;High Mass&quot;. The Timeline tracks your actual consistency versus your target of every {contact.targetFrequencyDays} days.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white/60 dark:bg-slate-800/60 p-3 rounded-xl">
                                            <div className="text-xs font-bold text-slate-500 mb-1">XP Reward</div>
                                            <div className="text-sm font-bold text-emerald-600">+10 to +15 XP</div>
                                        </div>
                                        <div className="bg-white/60 dark:bg-slate-800/60 p-3 rounded-xl">
                                            <div className="text-xs font-bold text-slate-500 mb-1">Health Impact</div>
                                            <div className="text-sm font-bold text-emerald-600">Instantly 100%</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Last Seen Stats */}
                                <div className="bg-slate-50 dark:bg-slate-800 shadow-inner p-4 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Interaction Gap</div>
                                        <div className="text-lg font-bold text-foreground">
                                            {formatDistanceToNow(new Date(contact.lastContacted), { addSuffix: true })}
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-violet-500" />
                                    </div>
                                </div>

                                {/* Interaction Timeline (Same as existing but focused) */}
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <History className="w-4 h-4 text-slate-400" />
                                        <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider">Interaction Log</h3>
                                    </div>

                                    {contact.notes.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-8">
                                            No interactions logged yet.
                                        </p>
                                    ) : (
                                        <div className="space-y-4">
                                            {[...contact.notes]
                                                .filter(n => !n.isPinned) // Optional: maybe show all? stick to full history
                                                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                                .map((note, index, arr) => (
                                                    <div key={note.id} className="relative pl-4 border-l-2 border-slate-100 dark:border-slate-800 py-1">
                                                        <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 ring-4 ring-white dark:ring-slate-900" />
                                                        <p className="text-sm text-foreground mb-1">{note.content}</p>
                                                        <p className="text-xs text-slate-400">
                                                            {format(new Date(note.createdAt), 'MMM d, yyyy • h:mm a')}
                                                        </p>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
