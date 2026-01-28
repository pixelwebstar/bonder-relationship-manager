"use client";

import { ReactNode } from "react";

interface MobileFrameProps {
    children: ReactNode;
}

export function MobileFrame({ children }: MobileFrameProps) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
            {/* Desktop: Show as centered mobile frame */}
            <div className="w-full max-w-md mx-auto md:shadow-2xl md:shadow-violet-500/10 md:rounded-[2.5rem] md:border md:border-white/50 md:bg-white/30 md:backdrop-blur-xl overflow-hidden">
                <div className="min-h-[85vh] md:min-h-[700px] relative">
                    {children}
                </div>
            </div>
        </div>
    );
}
