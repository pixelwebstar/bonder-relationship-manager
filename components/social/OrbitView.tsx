import { useRef, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore, OrbitLayer, Contact } from '@/lib/store';
import { OrbitNode } from './OrbitNode';
import { useRouter } from 'next/navigation';

export function OrbitView() {
    const { contacts, setOrbit } = useStore();
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

    // Sort contacts by priority (Inner First, High Health First)
    const sortedContacts = [...contacts].sort((a, b) => {
        const orbitOrder: Record<string, number> = { inner: 0, middle: 1, outer: 2, extended: 2 };
        const orbitDiff = (orbitOrder[a.orbit || 'outer'] || 2) - (orbitOrder[b.orbit || 'outer'] || 2);
        if (orbitDiff !== 0) return orbitDiff;
        return b.healthScore - a.healthScore;
    });

    const innerContacts = sortedContacts.slice(0, 8);
    const middleContacts = sortedContacts.slice(8, 24);
    const outerContacts = sortedContacts.slice(24);

    const minDim = Math.min(dimensions.width, dimensions.height);
    const innerRadius = minDim * 0.15;
    const middleRadius = minDim * 0.28;
    const outerRadius = minDim * 0.42;

    // Shift Y-axis down significantly (approx 65% down)
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height * 0.65;

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setDimensions({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height
                });
            }
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const baseNodeSize = minDim < 400 ? 34 : 48;

    const renderOrbitRing = (ringContacts: typeof contacts, radius: number, maxCapacity: number) => {
        return ringContacts.map((contact, i) => (
            <OrbitNode
                key={contact.id}
                contact={contact}
                index={i}
                totalInOrbit={Math.max(ringContacts.length, 1)}
                radius={radius}
                onDragEnd={handleDragEnd}
                size={baseNodeSize}
                isSelected={selectedContact?.id === contact.id}
                onSelect={(c) => setSelectedContact(selectedContact?.id === c.id ? null : c)}
            />
        ));
    };

    const handleDragEnd = (contactId: string, point: { x: number; y: number }) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();

        // Use the shifted center for distance checks
        const containerCenterX = rect.left + centerX;
        const containerCenterY = rect.top + centerY;
        const dist = Math.sqrt(Math.pow(point.x - containerCenterX, 2) + Math.pow(point.y - containerCenterY, 2));

        const midpointInnerMiddle = (innerRadius + middleRadius) / 2;
        const midpointMiddleOuter = (middleRadius + outerRadius) / 2;

        let newOrbit: OrbitLayer = 'outer';
        if (dist < midpointInnerMiddle) newOrbit = 'inner';
        else if (dist < midpointMiddleOuter) newOrbit = 'middle';

        setOrbit(contactId, newOrbit);
    };

    const [stars, setStars] = useState<{ id: number; top: string; left: string; size: number; delay: number }[]>([]);

    useEffect(() => {
        const generatedStars = Array.from({ length: 50 }).map((_, i) => ({
            id: i,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            size: Math.random() * 2 + 1,
            delay: Math.random() * 5
        }));
        setStars(generatedStars);
    }, []);

    const getHealthColor = (score: number) => {
        if (score > 70) return 'text-emerald-400';
        if (score > 30) return 'text-amber-400';
        return 'text-rose-400';
    };

    const getDriftLabel = (status: string) => {
        switch (status) {
            case 'stable': return { label: 'Stable', color: 'bg-emerald-500/20 text-emerald-400' };
            case 'drifting': return { label: 'Drifting', color: 'bg-amber-500/20 text-amber-400' };
            case 'fading': return { label: 'Fading', color: 'bg-rose-500/20 text-rose-400' };
            case 'ghost': return { label: 'Ghost', color: 'bg-slate-500/20 text-slate-400' };
            default: return { label: 'Stable', color: 'bg-emerald-500/20 text-emerald-400' };
        }
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-[600px] md:h-[750px] relative overflow-hidden flex items-center justify-center bg-[#0B0A1A] rounded-[2.5rem] border border-white/10 shadow-2xl cursor-default"
            onClick={() => setSelectedContact(null)}
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-violet-900/20 via-[#0B0A1A] to-[#0B0A1A] pointer-events-none" />

            {stars.map((star) => (
                <div
                    key={star.id}
                    className="absolute rounded-full bg-white/20 animate-pulse"
                    style={{
                        top: star.top,
                        left: star.left,
                        width: star.size,
                        height: star.size,
                        animationDelay: `${star.delay}s`
                    }}
                />
            ))}

            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <g transform={`translate(${centerX}, ${centerY})`}>
                    <circle r={innerRadius} fill="none" stroke="url(#innerGradient)" strokeWidth="1.5" strokeDasharray="4 4" className="opacity-30" />
                    <circle r={middleRadius} fill="none" stroke="url(#middleGradient)" strokeWidth="1" strokeDasharray="8 8" className="opacity-20" />
                    <circle r={outerRadius} fill="none" stroke="white" strokeWidth="0.5" className="opacity-10" />

                    <defs>
                        <linearGradient id="innerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#8B5CF6" />
                            <stop offset="100%" stopColor="#EC4899" />
                        </linearGradient>
                        <linearGradient id="middleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#6366F1" />
                            <stop offset="100%" stopColor="#3B82F6" />
                        </linearGradient>
                    </defs>
                </g>
            </svg>

            {/* STICKY PROFILE CARD - TOP LEFT */}
            <AnimatePresence>
                {selectedContact && (
                    <motion.div
                        initial={{ opacity: 0, x: -20, y: -10 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, x: -20, y: -10 }}
                        className="absolute top-6 left-6 w-56 md:w-64 bg-[#16172B]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-4 shadow-2xl z-[100] pointer-events-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-4 mb-4">
                            {selectedContact.avatar ? (
                                <img src={selectedContact.avatar} className="w-14 h-14 rounded-2xl object-cover border-2 border-white/10" alt="" />
                            ) : (
                                <div
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white border-2 border-white/10 text-xl"
                                    style={{ background: `linear-gradient(135deg, #8B5CF6, #EC4899)` }}
                                >
                                    {selectedContact.name.charAt(0)}
                                </div>
                            )}
                            <div className="flex flex-col min-w-0">
                                <span className="text-white font-black text-lg truncate leading-tight">{selectedContact.name}</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-xs font-black ${getHealthColor(selectedContact.healthScore)}`}>
                                        {selectedContact.healthScore}% HEALTH
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className={`text-[10px] px-2 py-1 rounded-lg font-black uppercase tracking-wider ${getDriftLabel(selectedContact.driftStatus || 'stable').color}`}>
                                {getDriftLabel(selectedContact.driftStatus || 'stable').label}
                            </span>
                            {selectedContact.tags && selectedContact.tags.length > 0 && (
                                <span className="text-[10px] px-2 py-1 bg-white/5 text-white/50 rounded-lg font-black uppercase tracking-wider border border-white/5">
                                    {selectedContact.tags[0]}
                                </span>
                            )}
                        </div>

                        <button
                            onClick={() => router.push(`/contacts/${selectedContact.id}`)}
                            className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                        >
                            Open Profile
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Solar System Center - "ME" */}
            <div
                className="absolute z-60 flex items-center justify-center pointer-events-none transition-all duration-500"
                style={{
                    left: `${centerX}px`,
                    top: `${centerY}px`,
                    transform: 'translate(-50%, -50%)'
                }}
            >
                <div className="absolute w-24 h-24 bg-violet-600/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-indigo-600 rounded-full shadow-[0_0_30px_rgba(139,92,246,0.6)] flex items-center justify-center text-white border-2 border-white/20 z-70">
                    <span className="font-black text-xs tracking-widest">ME</span>
                </div>
            </div>

            {/* Nodes Container */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    transform: `translate(${centerX - dimensions.width / 2}px, ${centerY - dimensions.height / 2}px)`
                }}
            >
                <div className="relative w-full h-full">
                    <AnimatePresence>
                        {renderOrbitRing(innerContacts, innerRadius, 8)}
                        {renderOrbitRing(middleContacts, middleRadius, 16)}
                        {renderOrbitRing(outerContacts, outerRadius, 999)}
                    </AnimatePresence>
                </div>
            </div>


            {contacts.length === 0 && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-10">
                    <p className="text-white/40 text-sm font-medium tracking-wide">The universe is empty.</p>
                    <p className="text-white/20 text-xs mt-1">Add someone to start your orbit.</p>
                </div>
            )}
        </div>
    );
}
