import { useRef, useEffect, useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore, OrbitLayer } from '@/lib/store';
import { OrbitNode } from './OrbitNode';

export function OrbitView() {
    const { contacts, setOrbit } = useStore();
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Group contacts by orbit
    const innerContacts = contacts.filter(c => c.orbit === 'inner');
    const middleContacts = contacts.filter(c => c.orbit === 'middle');
    const outerContacts = contacts.filter(c => c.orbit === 'outer' || !c.orbit);

    // Responsive Radii Calculation
    const minDim = Math.min(dimensions.width, dimensions.height);
    const scale = minDim > 0 ? minDim / 800 : 1; // Base scale on 800px standard

    const innerRadius = Math.max(80, minDim * 0.15);
    const middleRadius = Math.max(140, minDim * 0.28);
    const outerRadius = Math.max(200, minDim * 0.42);

    // Resize Observer
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

    // Node Sizing based on density and screen size
    const totalContacts = contacts.length;
    const baseNodeSize = minDim < 400 ? 36 : 48; // Smaller nodes on mobile
    const nodeSize = totalContacts > 50 ? baseNodeSize * 0.6 : baseNodeSize;

    const handleDragEnd = (contactId: string, point: { x: number; y: number }) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const containerCenterX = rect.left + rect.width / 2;
        const containerCenterY = rect.top + rect.height / 2;

        const dropX = point.x;
        const dropY = point.y;

        const dist = Math.sqrt(Math.pow(dropX - containerCenterX, 2) + Math.pow(dropY - containerCenterY, 2));

        let newOrbit: OrbitLayer = 'outer';
        const midpointInnerMiddle = (innerRadius + middleRadius) / 2;
        const midpointMiddleOuter = (middleRadius + outerRadius) / 2;

        if (dist < midpointInnerMiddle) newOrbit = 'inner';
        else if (dist < midpointMiddleOuter) newOrbit = 'middle';
        else newOrbit = 'outer';

        setOrbit(contactId, newOrbit);
    };

    // Starry Background (Memoized)
    const stars = useMemo(() => {
        return Array.from({ length: 50 }).map((_, i) => ({
            id: i,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            size: Math.random() * 2 + 1,
            delay: Math.random() * 5
        }));
    }, []);

    return (
        <div ref={containerRef} className="w-full h-[600px] md:h-[700px] relative overflow-hidden flex items-center justify-center bg-[#0B0A1A] rounded-[2.5rem] border border-white/10 shadow-2xl">
            {/* Ambient Galaxy Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-violet-900/20 via-[#0B0A1A] to-[#0B0A1A] pointer-events-none" />

            {/* Stars */}
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

            {/* SVG Orbit Rings - Crisp & Scalable */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <g transform={`translate(${dimensions.width / 2}, ${dimensions.height / 2})`}>
                    {/* Inner Orbit */}
                    <circle r={innerRadius} fill="none" stroke="url(#innerGradient)" strokeWidth="1.5" strokeDasharray="4 4" className="opacity-30" />
                    {/* Middle Orbit */}
                    <circle r={middleRadius} fill="none" stroke="url(#middleGradient)" strokeWidth="1" strokeDasharray="8 8" className="opacity-20" />
                    {/* Outer Orbit */}
                    <circle r={outerRadius} fill="none" stroke="white" strokeWidth="0.5" className="opacity-10" />

                    {/* Gradients */}
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

            {/* Solar System Center - "ME" */}
            <div className="absolute z-20 flex items-center justify-center pointer-events-none">
                {/* Gravity Well Glow */}
                <div className="absolute w-32 h-32 bg-violet-600/20 rounded-full blur-2xl animate-pulse" />
                {/* Core */}
                <div className="relative w-16 h-16 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-indigo-600 rounded-full shadow-[0_0_30px_rgba(139,92,246,0.6)] flex items-center justify-center text-white border-2 border-white/20 z-30">
                    <span className="font-bold text-sm tracking-widest">ME</span>
                </div>
            </div>

            {/* Nodes */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <AnimatePresence>
                    {innerContacts.map((contact, i) => (
                        <OrbitNode
                            key={contact.id}
                            contact={contact}
                            index={i}
                            totalInOrbit={innerContacts.length}
                            radius={innerRadius}
                            onDragEnd={handleDragEnd}
                            size={nodeSize}
                        />
                    ))}

                    {middleContacts.map((contact, i) => (
                        <OrbitNode
                            key={contact.id}
                            contact={contact}
                            index={i}
                            totalInOrbit={middleContacts.length}
                            radius={middleRadius}
                            onDragEnd={handleDragEnd}
                            size={nodeSize}
                        />
                    ))}

                    {outerContacts.map((contact, i) => (
                        <OrbitNode
                            key={contact.id}
                            contact={contact}
                            index={i}
                            totalInOrbit={outerContacts.length}
                            radius={outerRadius}
                            onDragEnd={handleDragEnd}
                            size={totalContacts > 50 ? 8 : nodeSize}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {/* Legend - Glassmorphism */}
            <div className="absolute bottom-6 left-6 p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg">
                <div className="text-[10px] uppercase tracking-wider font-bold text-white/50 mb-2">My Universe</div>
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]"></div>
                        <span className="text-xs text-white/80">Inner Circle</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-400 to-blue-400 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                        <span className="text-xs text-white/80">Friends</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                        <span className="text-xs text-white/80">Network</span>
                    </div>
                </div>
            </div>

            {/* Quick Add Button */}
            <button
                onClick={() => window.location.href = '/add'}
                className="absolute bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:scale-105 hover:shadow-[0_0_30px_rgba(139,92,246,0.8)] active:scale-95 transition-all z-30"
            >
                <span className="text-3xl font-light mb-1">+</span>
            </button>

            {contacts.length === 0 && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[80px] text-center pointer-events-none z-10">
                    <p className="text-white/40 text-sm font-medium tracking-wide">The universe is empty.</p>
                    <p className="text-white/20 text-xs mt-1">Add someone to start your orbit.</p>
                </div>
            )}
        </div>
    );
}
