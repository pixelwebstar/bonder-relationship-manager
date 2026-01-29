import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Contact } from '@/lib/store';
import { useRouter } from 'next/navigation';

interface OrbitNodeProps {
    contact: Contact;
    index: number;
    totalInOrbit: number;
    radius: number;
    onDragEnd: (contactId: string, point: { x: number; y: number }) => void;
    size?: number;
    isSelected?: boolean;
    onSelect?: (contact: Contact) => void;
}

export function OrbitNode({
    contact,
    index,
    totalInOrbit,
    radius,
    onDragEnd,
    size = 56,
    isSelected = false,
    onSelect
}: OrbitNodeProps) {
    const router = useRouter();

    const getAngleForIndex = (i: number) => {
        const cardinals = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];
        if (i < 4) return cardinals[i];

        const diagonals = [-Math.PI / 4, Math.PI / 4, 3 * Math.PI / 4, -3 * Math.PI / 4];
        if (i < 8) return diagonals[i - 4];

        const subDiagonals = [
            -3 * Math.PI / 8, -Math.PI / 8, Math.PI / 8, 3 * Math.PI / 8,
            5 * Math.PI / 8, 7 * Math.PI / 8, -7 * Math.PI / 8, -5 * Math.PI / 8
        ];
        if (i < 16) return subDiagonals[i - 8];

        return (2 * Math.PI * i) / totalInOrbit - (Math.PI / 2);
    };

    const angle = getAngleForIndex(index);
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);

    const gradients = [
        ['#8B5CF6', '#EC4899'],
        ['#6366F1', '#A855F7'],
        ['#EC4899', '#F43F5E'],
        ['#3B82F6', '#8B5CF6'],
    ];
    const gradientIndex = (contact.name.charCodeAt(0) || 0) % gradients.length;
    const [from, to] = gradients[gradientIndex];

    return (
        <motion.div
            drag
            dragMomentum={false}
            onDragEnd={(e, info) => onDragEnd(contact.id, info.point)}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
                opacity: 1,
                scale: isSelected ? 1.2 : 1,
                x,
                y
            }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            style={{
                top: "50%",
                left: "50%",
                width: size,
                height: size,
                marginLeft: -size / 2,
                marginTop: -size / 2,
                zIndex: isSelected ? 100 : 10
            }}
            className="absolute rounded-full cursor-grab active:cursor-grabbing group pointer-events-auto"
            onClick={(e) => {
                e.stopPropagation();
                onSelect?.(contact);
            }}
            whileHover={{ scale: isSelected ? 1.25 : 1.15 }}
            whileTap={{ scale: 0.95 }}
        >
            {/* Selection Glow */}
            <AnimatePresence>
                {isSelected && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.4, 1] }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-[-15px] bg-violet-500/30 rounded-full blur-xl z-10"
                    />
                )}
            </AnimatePresence>

            {/* Main Node Content */}
            <div
                className={`w-full h-full rounded-full flex items-center justify-center font-black text-white relative z-20 overflow-hidden border-2 transition-all duration-300 ${isSelected ? 'border-violet-400 shadow-[0_0_20px_rgba(139,92,246,0.6)]' : 'border-white/20'
                    }`}
                style={{
                    background: contact.avatar ? '#0F172A' : `linear-gradient(135deg, ${from}, ${to})`,
                    fontSize: size > 20 ? size * 0.45 : 0
                }}
            >
                {contact.avatar ? (
                    <img src={contact.avatar} className="w-full h-full object-cover" alt="" />
                ) : (
                    size > 20 && (
                        <span className="drop-shadow-lg scale-110">
                            {contact.name.charAt(0).toUpperCase()}
                        </span>
                    )
                )}

                {/* Shine effect */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
            </div>

            {/* Selection/Hover Ring */}
            <div className={`absolute -inset-1.5 rounded-full border border-violet-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isSelected ? 'opacity-100 border-violet-400 scale-110' : ''} ${size < 15 ? 'hidden' : ''}`} />
        </motion.div>
    );
}
