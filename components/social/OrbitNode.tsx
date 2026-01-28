import { motion } from 'framer-motion';
import { Contact } from '@/lib/store';

interface OrbitNodeProps {
    contact: Contact;
    index: number;
    totalInOrbit: number;
    radius: number;
    onDragEnd: (contactId: string, point: { x: number; y: number }) => void;
}

export function OrbitNode({ contact, index, totalInOrbit, radius, onDragEnd }: OrbitNodeProps) {
    // Calculate position on the circle
    // Distribute evenly
    const angle = (2 * Math.PI * index) / totalInOrbit;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);

    // Colors based on drift status
    // const statusColors = {
    //     stable: 'border-emerald-500 bg-emerald-100 text-emerald-700',
    //     drifting: 'border-amber-400 bg-amber-100 text-amber-700',
    //     fading: 'border-rose-400 bg-rose-100 text-rose-700',
    //     ghost: 'border-slate-300 bg-slate-100 text-slate-400 opacity-60',
    // };

    // Avatar gradient colors based on name
    const colors = [
        ['#8B5CF6', '#3B82F6'],
        ['#EC4899', '#F97316'],
        ['#10B981', '#3B82F6'],
        ['#F59E0B', '#EF4444'],
        ['#6366F1', '#EC4899'],
    ];
    const colorIndex = (contact.name.charCodeAt(0) || 0) % colors.length;
    const [from, to] = colors[colorIndex];

    // const statusColor = statusColors[contact.driftStatus || 'stable'] || statusColors.stable;

    return (
        <motion.div
            drag
            dragElastic={0.2}
            dragMomentum={false}
            onDragEnd={(e, info) => onDragEnd(contact.id, info.point)}
            initial={{ x: 0, y: 0, scale: 0 }}
            animate={{ x, y, scale: 1 }}
            className="absolute w-14 h-14 -ml-7 -mt-7 rounded-full shadow-lg cursor-pointer z-10"
            whileDrag={{ scale: 1.2, zIndex: 50 }}
            whileTap={{ scale: 1.1 }}
            whileHover={{ scale: 1.15 }}
        >
            {/* Gradient Avatar */}
            <div
                className="w-full h-full rounded-full flex items-center justify-center font-bold text-white shadow-inner"
                style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
            >
                {contact.name.charAt(0).toUpperCase()}
            </div>

            {/* Status Ring */}
            <div className={`absolute inset-0 rounded-full border-2 ${contact.driftStatus === 'drifting' ? 'border-amber-400 animate-pulse' : contact.driftStatus === 'fading' ? 'border-rose-400' : 'border-transparent'}`} />

            {/* Tooltip on Hover */}
            <div className="opacity-0 hover:opacity-100 absolute -bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-3 py-1.5 rounded-lg whitespace-nowrap pointer-events-none transition-opacity shadow-lg z-50">
                <span className="font-semibold">{contact.name}</span>
                <span className="text-slate-400 ml-1">({contact.healthScore}%)</span>
            </div>
        </motion.div>
    );
}
