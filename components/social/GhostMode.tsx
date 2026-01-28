import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { Ghost, RefreshCw, Archive } from 'lucide-react';

export function GhostMode() {
    const { contacts, logInteraction, deleteContact } = useStore();

    // Ghost or Fading contacts
    const ghostContacts = contacts.filter(c => c.driftStatus === 'ghost' || c.driftStatus === 'fading');

    if (ghostContacts.length === 0) return null;

    return (
        <div className="mt-8 mb-4">
            <div className="flex items-center gap-2 mb-4 px-2">
                <Ghost className="w-5 h-5 text-slate-300" />
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">The Void ({ghostContacts.length})</h3>
            </div>

            <div className="grid gap-3">
                {ghostContacts.map((contact) => (
                    <motion.div
                        key={contact.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.7 }}
                        whileHover={{ opacity: 1 }}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 dashed-border"
                    >
                        <div className="flex items-center gap-3 grayscale">
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 font-bold">
                                {contact.name.charAt(0)}
                            </div>
                            <div>
                                <p className="font-semibold text-slate-500">{contact.name}</p>
                                <p className="text-xs text-slate-400">Drifted away</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => logInteraction(contact.id)}
                                className="p-2 rounded-full bg-indigo-50 text-indigo-400 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                                title="Resurrect (Reconnect)"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm("Archive this contact? They will be removed.")) deleteContact(contact.id);
                                }}
                                className="p-2 rounded-full bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                                title="Release (Delete)"
                            >
                                <Archive className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
