"use client";

import { motion } from "framer-motion";

interface HealthBarProps {
    score: number;
    className?: string;
    height?: string;
}

export function HealthBar({ score, className = "", height = "h-1.5" }: HealthBarProps) {
    // Theme-aligned Psychology Colors
    // High Health (75-100): Violet/Indigo (Calm, secure)
    // Drift (40-74): Fuchsia (Noticeable shift)
    // Low (15-39): Rose/Pink (Urgent contrast)
    // Critical (0-14): Slate/Desaturated (Fading away)

    let colorClass = "bg-gradient-to-r from-violet-500 to-indigo-500"; // Default/Safe

    if (score < 15) {
        colorClass = "bg-slate-400 dark:bg-slate-600"; // Critical/Ghost
    } else if (score < 40) {
        colorClass = "bg-gradient-to-r from-pink-500 to-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]"; // Urgent
    } else if (score < 75) {
        colorClass = "bg-gradient-to-r from-fuchsia-500 to-pink-500"; // Warning
    }

    return (
        <div className={`w-full ${height} bg-slate-100/50 dark:bg-slate-800/50 rounded-full overflow-hidden ${className}`}>
            <div
                className={`h-full ${colorClass} rounded-full transition-all duration-300`}
                style={{ width: `${score}%` }}
            />
        </div>
    );
}
