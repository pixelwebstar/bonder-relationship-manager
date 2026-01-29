"use client";

import { cn } from "@/lib/utils";

interface AvatarGradientProps {
    name: string;
    src?: string | null;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

export function AvatarGradient({ name, src, size = "md", className }: AvatarGradientProps) {
    // Theme-aligned gradients (Violet, Fuchsia, Indigo, Pink)
    const gradients = [
        "from-violet-500 to-fuchsia-500",
        "from-indigo-500 to-purple-500",
        "from-fuchsia-500 to-pink-500",
        "from-purple-500 to-violet-500",
        "from-pink-500 to-rose-500",
    ];

    const colorIndex = (name.charCodeAt(0) || 0) % gradients.length;
    const gradient = gradients[colorIndex];

    const sizeClasses = {
        sm: "w-8 h-8 text-xs",
        md: "w-12 h-12 text-base",
        lg: "w-16 h-16 text-xl",
        xl: "w-24 h-24 text-3xl",
    };

    if (src) {
        return (
            <div
                className={cn(
                    sizeClasses[size],
                    "rounded-full border-2 border-white/20 shadow-lg overflow-hidden bg-slate-100 dark:bg-slate-800",
                    className
                )}
            >
                <img src={src} alt={name} className="w-full h-full object-cover" />
            </div>
        );
    }

    return (
        <div
            className={cn(
                sizeClasses[size],
                "rounded-full flex items-center justify-center font-bold text-white shadow-lg bg-gradient-to-br",
                gradient,
                "border-2 border-white/20",
                className
            )}
        >
            {name.charAt(0).toUpperCase()}
        </div>
    );
}
