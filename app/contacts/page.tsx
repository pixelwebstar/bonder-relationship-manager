"use client";

import { useState, useRef } from "react";
import { useStore } from "@/lib/store";
import { parseVCF } from "@/lib/vcf-parser";
import { motion, AnimatePresence } from "framer-motion";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { BottomNav } from "@/components/layout/BottomNav";
import { Search, Upload, UserPlus, Phone } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ContactsPage() {
    const router = useRouter();
    const { contacts, addContact } = useStore();
    const [searchTerm, setSearchTerm] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    // const [isImporting, setIsImporting] = useState(false);

    const filteredContacts = contacts.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a, b) => a.healthScore - b.healthScore); // Lowest health first (needs attention)

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;


        try {
            const parsed = await parseVCF(file);
            let count = 0;
            parsed.forEach(p => {
                // Simple duplicate check by name
                if (!contacts.find(c => c.name === p.name)) {
                    addContact({
                        name: p.name,
                        phoneNumber: p.phone,
                        email: p.email,
                        tags: ['imported'],
                        targetFrequencyDays: 14 // Default to 2 weeks
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

    return (
        <MobileFrame>
            <div className="p-6 pb-28 min-h-screen">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">My Network</h1>
                        <p className="text-muted-foreground text-sm">{contacts.length} connections</p>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 bg-secondary rounded-full hover:bg-secondary/80 transition-colors"
                    >
                        <Upload className="w-5 h-5 text-foreground" />
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".vcf"
                            onChange={handleFileUpload}
                        />
                    </motion.button>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search friends..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white pl-10 pr-4 py-3 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-violet-500/20 outline-none placeholder:text-slate-400 font-medium"
                    />
                </div>

                {/* List */}
                <div className="space-y-3">
                    <AnimatePresence>
                        {filteredContacts.map((contact, i) => (
                            <motion.div
                                key={contact.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => router.push(`/contacts/${contact.id}`)}
                                className="glass-card p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/90 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Avatar Placeholder */}
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-100 to-fuchsia-100 flex items-center justify-center text-violet-600 font-bold text-lg">
                                        {contact.name.charAt(0)}
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-foreground">{contact.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <HealthBar score={contact.healthScore} />
                                            <span className="text-xs text-slate-400">
                                                {contact.healthScore < 50 ? "Needs attention" : "Healthy"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button className="p-2 text-slate-300 hover:text-violet-500 transition-colors">
                                        <Phone className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredContacts.length === 0 && (
                        <div className="text-center py-10">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <UserPlus className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="text-slate-500 font-medium">No contacts found</p>
                            <p className="text-sm text-slate-400 mb-4">Import a VCF file or add manually</p>
                        </div>
                    )}
                </div>
            </div>
            <BottomNav />
        </MobileFrame>
    );
}

function HealthBar({ score }: { score: number }) {
    let color = "bg-emerald-500";
    if (score < 70) color = "bg-amber-500";
    if (score < 40) color = "bg-rose-500";

    return (
        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
                className={`h-full ${color} transition-all duration-500`}
                style={{ width: `${score}%` }}
            />
        </div>
    );
}
