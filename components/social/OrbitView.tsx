import { useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useStore, OrbitLayer } from '@/lib/store';
import { OrbitNode } from './OrbitNode';

export function OrbitView() {
    const { contacts, setOrbit } = useStore();
    const containerRef = useRef<HTMLDivElement>(null);

    // Dimensions
    // const [center, setCenter] = useState({ x: 0, y: 0 });


    // Group contacts by orbit
    const innerContacts = contacts.filter(c => c.orbit === 'inner');
    const middleContacts = contacts.filter(c => c.orbit === 'middle');
    const outerContacts = contacts.filter(c => c.orbit === 'outer' || !c.orbit); // Default to outer

    // Ring Radii
    const innerRadius = 80;
    const middleRadius = 160;
    const outerRadius = 240;

    const handleDragEnd = (contactId: string, point: { x: number; y: number }) => {
        // point is relative to the node's starting position (which is on the ring).
        // Wait, framer-motion drag returns info.point which is page/client coordinates usually, 
        // BUT if we use layout animations it might be tricky.
        // Let's rely on simple distance calculation from the center of the container.

        if (!containerRef.current) return;

        // Get container center
        const rect = containerRef.current.getBoundingClientRect();
        const containerCenterX = rect.left + rect.width / 2;
        const containerCenterY = rect.top + rect.height / 2;

        // Calculate distance from center
        // info.point is client coordinates
        const dropX = point.x;
        const dropY = point.y;

        const dist = Math.sqrt(Math.pow(dropX - containerCenterX, 2) + Math.pow(dropY - containerCenterY, 2));

        let newOrbit: OrbitLayer = 'outer';
        if (dist < 120) newOrbit = 'inner';
        else if (dist < 200) newOrbit = 'middle';
        else newOrbit = 'outer';

        setOrbit(contactId, newOrbit);
    };

    return (
        <div ref={containerRef} className="w-full h-[550px] relative overflow-hidden flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100/50 dark:from-[#0B0A1A] dark:to-[#151425] rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-inner">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-gradient-radial from-violet-500/5 via-transparent to-transparent opacity-50 pointer-events-none" />

            {/* The Solar System Container */}
            <div className="relative w-0 h-0">

                {/* Sun / User Avatar */}
                <div className="absolute -ml-10 -mt-10 w-20 h-20 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-600 rounded-full z-20 shadow-2xl shadow-violet-500/50 flex items-center justify-center text-white border-4 border-white dark:border-[#0B0A1A] relative">
                    <span className="font-bold text-2xl">ME</span>
                    {/* Glowing effect */}
                    <div className="absolute inset-0 rounded-full bg-violet-400/40 blur-xl -z-10 animate-pulse" />
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-violet-500/20 to-transparent blur-sm -z-10" />
                </div>

                {/* Orbit Rings */}
                {/* Inner Ring */}
                <div className="absolute rounded-full border-2 border-violet-300/60 dark:border-violet-500/40 shadow-[0_0_15px_rgba(139,92,246,0.1)]" style={{ width: innerRadius * 2, height: innerRadius * 2, marginLeft: -innerRadius, marginTop: -innerRadius }} />

                {/* Middle Ring */}
                <div className="absolute rounded-full border-2 border-indigo-200/50 dark:border-indigo-400/30 shadow-[0_0_20px_rgba(99,102,241,0.05)]" style={{ width: middleRadius * 2, height: middleRadius * 2, marginLeft: -middleRadius, marginTop: -middleRadius }} />

                {/* Outer Ring */}
                <div className="absolute rounded-full border-2 border-slate-200/40 dark:border-slate-700/50 dashed-border" style={{ width: outerRadius * 2, height: outerRadius * 2, marginLeft: -outerRadius, marginTop: -outerRadius }} />

                {/* Nodes */}
                <AnimatePresence>
                    {/* Inner Orbit */}
                    {innerContacts.map((contact, i) => (
                        <OrbitNode
                            key={contact.id}
                            contact={contact}
                            index={i}
                            totalInOrbit={innerContacts.length}
                            radius={innerRadius}
                            onDragEnd={handleDragEnd}
                        />
                    ))}

                    {/* Middle Orbit */}
                    {middleContacts.map((contact, i) => (
                        <OrbitNode
                            key={contact.id}
                            contact={contact}
                            index={i}
                            totalInOrbit={middleContacts.length}
                            radius={middleRadius}
                            onDragEnd={handleDragEnd}
                        />
                    ))}

                    {/* Outer Orbit */}
                    {outerContacts.map((contact, i) => (
                        <OrbitNode
                            key={contact.id}
                            contact={contact}
                            index={i}
                            totalInOrbit={outerContacts.length}
                            radius={outerRadius}
                            onDragEnd={handleDragEnd}
                        />
                    ))}
                </AnimatePresence>

            </div>

            {/* Legend / Info */}
            <div className="absolute bottom-6 left-6 p-4 bg-white/80 dark:bg-black/60 backdrop-blur-xl rounded-2xl text-xs text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-white/5 shadow-lg">
                <div className="font-bold text-slate-700 dark:text-slate-200 mb-2">Orbit Layers</div>
                <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-violet-400"></span> Inner (Intimate)</div>
                <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-indigo-300"></span> Middle (Friends)</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-600"></span> Outer (Network)</div>
                <div className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-white/5">Drag to move orbits.</div>
            </div>

            {/* Quick Add Button */}
            {/* Quick Add Button */}
            <button
                onClick={() => window.location.href = '/add'}
                className="absolute bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all z-30"
            >
                <span className="text-3xl font-light mb-1">+</span>
            </button>

            {contacts.length === 0 && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <p className="text-slate-400 dark:text-slate-600 text-sm font-medium">No contacts in orbit.</p>
                </div>
            )}
        </div>
    );
}
