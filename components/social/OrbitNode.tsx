import { motion } from 'framer-motion';
import { Contact } from '@/lib/store';
import { useRouter } from 'next/navigation';

interface OrbitNodeProps {
    contact: Contact;
    index: number;
    totalInOrbit: number;
    radius: number;
    onDragEnd: (contactId: string, point: { x: number; y: number }) => void;
    size?: number;
}

export function OrbitNode({ contact, index, totalInOrbit, radius, onDragEnd, size = 56 }: OrbitNodeProps) {
    // Calculate position on the circle
    const angle = (2 * Math.PI * index) / totalInOrbit;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    const router = useRouter();

    // Consistent Premium Gradient based on name char for subtle variety, but keeping within theme
    const gradients = [
        ['#8B5CF6', '#EC4899'], // Violet -> Pink
        ['#6366F1', '#A855F7'], // Indigo -> Purple
        ['#EC4899', '#F43F5E'], // Pink -> Rose
        ['#3B82F6', '#8B5CF6'], // Blue -> Violet
    ];
    const gradientIndex = (contact.name.charCodeAt(0) || 0) % gradients.length;
    const [from, to] = gradients[gradientIndex];

    return (
        <motion.div
            drag
            dragMomentum={false} // Stop sliding after drag release for better control
            onDragEnd={(e, info) => onDragEnd(contact.id, info.point)}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1, x, y }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            style={{ width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 }}
            className="absolute rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.3)] cursor-grab active:cursor-grabbing z-10 group"
            onClick={() => router.push(`/contacts/${contact.id}`)}
            whileHover={{ scale: 1.15, zIndex: 50, boxShadow: "0 0 20px rgba(139, 92, 246, 0.6)" }}
            whileTap={{ scale: 0.95 }}
        >
            {/* Gradient Avatar */}
            <div
                className="w-full h-full rounded-full flex items-center justify-center font-bold text-white relative z-20 overflow-hidden border border-white/20"
                style={{ background: `linear-gradient(135deg, ${from}, ${to})`, fontSize: size > 20 ? size * 0.4 : 0 }}
            >
                {size > 30 && contact.name.charAt(0).toUpperCase()}

                {/* Shine effect */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
            </div>

            {/* Selection/Active Ring */}
            <div className={`absolute -inset-1 rounded-full border border-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${size < 15 ? 'hidden' : ''}`} />

            {/* Premium Tooltip */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/80 backdrop-blur-md border border-white/10 text-white text-[10px] font-medium tracking-wide rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 whitespace-nowrap z-50 pointer-events-none shadow-xl">
                {contact.name}
                {/* Tiny Arrow */}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/80 rotate-45 border-t border-l border-white/10" />
            </div>
        </motion.div>
    );
}
