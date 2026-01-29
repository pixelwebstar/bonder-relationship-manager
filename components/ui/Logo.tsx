import React from 'react';

export const Logo = ({ className = "w-10 h-10", showText = true }: { className?: string, showText?: boolean }) => {
    return (
        <div className="flex items-center gap-3 select-none">
            <div className={`relative ${className} group`}>
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-600 rounded-xl skew-y-3 group-hover:skew-y-0 transition-all duration-500 blur opacity-60 group-hover:opacity-100" />
                <div className="relative w-full h-full bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-950 rounded-xl border border-white/20 shadow-xl flex items-center justify-center skew-y-3 group-hover:skew-y-0 transition-all duration-500 overflow-hidden">
                    {/* B Shape Construction */}
                    <svg viewBox="0 0 24 24" fill="none" className="w-[60%] h-[60%] text-transparent bg-clip-text bg-gradient-to-br from-violet-600 to-indigo-600">
                        {/* Shield-like B */}
                        <path d="M7 4H14.5C16.9853 4 19 6.01472 19 8.5C19 9.7739 18.4697 10.9238 17.6163 11.7291C18.8258 12.3995 19.5 13.7915 19.5 15.5C19.5 18.5376 17.0376 21 14 21H7V4Z" stroke="url(#logo_gradient)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                        <defs>
                            <linearGradient id="logo_gradient" x1="7" y1="4" x2="19.5" y2="21" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#7C3AED" />{/* violet-600 */}
                                <stop offset="1" stopColor="#4F46E5" />{/* indigo-600 */}
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
