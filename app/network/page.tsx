"use client";

import { motion } from "framer-motion";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { BottomNav } from "@/components/layout/BottomNav";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, BellOff } from "lucide-react";
import { OrbitView } from "@/components/social/OrbitView";
import { AvatarGradient } from "@/components/ui/AvatarGradient";
import { HealthBar } from "@/components/ui/HealthBar";
import { formatDistanceToNow } from "date-fns";

export default function NetworkPage() {
    const router = useRouter();
    const { contacts } = useStore();

    // Filter contacts that are drifting (health < 75%)
    const driftingContacts = contacts
        .filter(c => c.healthScore < 75 && (!c.snoozedUntil || new Date(c.snoozedUntil) <= new Date()))
        .sort((a, b) => a.healthScore - b.healthScore);

    return (
        <MobileFrame>
            <div className="p-6 pb-28 min-h-screen relative overflow-hidden">
                {/* Background Ambient Glow */}
                <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[80%] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />

                {/* Header */}
                <div className="relative z-10 flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="p-3 bg-secondary/50 hover:bg-secondary rounded-full backdrop-blur-md transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6 text-foreground" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">My Orbit</h1>
                        <p className="text-muted-foreground text-sm">Visualizing {contacts.length} connections</p>
                    </div>
                </div>

                {/* Orbit Visualization */}
                <div className="relative z-10 mb-8 aspect-square w-full max-w-md mx-auto">
                    <OrbitView />
                </div>

                {/* Drifting List */}
                <div className="relative z-10">
                    <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        Drifting Away
                    </h2>

                    <div className="space-y-3">
                        {driftingContacts.length === 0 ? (
                            <div className="glass-card p-6 rounded-2xl text-center border-dashed border-2 border-slate-500/20">
                                <p className="text-foreground font-medium">Your orbit is stable! 🪐</p>
                                <p className="text-sm text-muted-foreground">No one is currently drifting away.</p>
                            </div>
                        ) : (
                            driftingContacts.map((contact, i) => (
                                <motion.div
                                    key={contact.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    onClick={() => router.push(`/contacts/${contact.id}`)}
                                    className="glass-card p-4 rounded-2xl flex items-center justify-between cursor-pointer group hover:bg-secondary/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <AvatarGradient name={contact.name} src={contact.avatar} />
                                            {/* Orbit Badge */}
                                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-background text-[10px] font-bold text-white
                                                ${contact.orbit === 'inner' ? 'bg-fuchsia-500' : contact.orbit === 'middle' ? 'bg-violet-500' : 'bg-slate-400'}`}
                                            >
                                                {contact.orbit === 'inner' ? '1' : contact.orbit === 'middle' ? '2' : '3'}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                                {contact.name}
                                            </h3>
                                            <div className="flex items-center gap-3">
                                                <HealthBar score={contact.healthScore} className="w-24" />
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(contact.lastContacted))} ago
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <BottomNav />
        </MobileFrame>
    );
}
