import React from 'react';

export const Logo = ({ className = "w-10 h-10", showText = true }: { className?: string, showText?: boolean }) => {
    return (
        <div className="flex items-center gap-3 select-none">
            <div className={`relative ${className} group`}>
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-600 rounded-xl skew-y-3 group-hover:skew-y-0 transition-all duration-500 blur opacity-60 group-hover:opacity-100" />
                <div className="relative w-full h-full bg-[#0B0C1E] border border-white/5 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-500 overflow-hidden">
                    {/* Final Branding B */}
                    <div className="absolute inset-0 bg-violet-600/20 blur-xl rounded-full scale-75" />
                    <svg viewBox="0 0 24 24" fill="none" className="w-[60%] h-[60%] relative z-10">
                        <path
                            d="M6 4H13.5C16.5 4 18 5.5 18 8C18 10 17 11.5 15.5 12C17.5 12.5 19 14 19 16.5C19 19 17.5 20.5 14.5 20.5H6V4Z"
                            fill="url(#final_b_gradient)"
                        />
                        <defs>
                            <linearGradient id="final_b_gradient" x1="6" y1="4" x2="19" y2="20.5" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#9D50FF" />
                                <stop offset="1" stopColor="#6E2CFF" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            </div>
            {showText && (
                <div className="flex flex-col">
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 tracking-tight">
                        Bonder
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                        Relationship AI
                    </span>
                </div>
            )}
        </div>
    );
};
