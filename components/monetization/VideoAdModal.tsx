import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, CheckCircle } from 'lucide-react';
// standard HTML button used instead

interface VideoAdModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
}

export function VideoAdModal({ isOpen, onClose, onComplete }: VideoAdModalProps) {
    const [timeLeft, setTimeLeft] = useState(15); // Shorter for demo, feels punchier
    const [isCompleted, setIsCompleted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    // Progress calculation
    const progress = Math.min(100, ((15 - timeLeft) / 15) * 100);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                setTimeLeft(15);
                setIsCompleted(false);
                setIsPlaying(true);
            }, 0);
        } else {
            setTimeout(() => {
                setIsPlaying(false);
            }, 0);
        }
    }, [isOpen]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isOpen && isPlaying && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setTimeout(() => {
                setIsCompleted(true);
                setIsPlaying(false);
            }, 0);
        }
        return () => clearInterval(interval);
    }, [isOpen, isPlaying, timeLeft]);

    const handleClose = () => {
        if (!isCompleted) {
            if (confirm("End advertisement? You will lose your reward.")) {
                onClose();
            }
        } else {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] bg-black text-white font-sans">
                    {/* Video Container */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center overflow-hidden"
                    >
                        {/* Abstract "Video" Content */}
                        <div className="absolute inset-0 bg-neutral-900">
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-900/40 via-black to-blue-900/40 animate-pulse" />
                            {/* Abstract Shapes simulating video motion */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.1),transparent_50%)] animate-slow-spin" />
                        </div>

                        {/* Central Play/Status Icon */}
                        <div className="relative z-10 flex flex-col items-center">
                            {!isCompleted ? (
                                <div className="text-center space-y-4">
                                    <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl">
                                        <div className="w-3 h-3 bg-red-500 rounded-full animate-ping absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2" />
                                        <Play className="w-8 h-8 text-white fill-white ml-1 opacity-90" />
                                    </div>
                                    <p className="text-white/50 text-xs tracking-[0.2em] uppercase font-medium">Advertisement</p>
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="flex flex-col items-center"
                                >
                                    <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.5)] mb-6">
                                        <CheckCircle className="w-12 h-12 text-black" strokeWidth={3} />
                                    </div>
                                    <h2 className="text-4xl font-bold tracking-tight mb-2">Reward Unlocked</h2>
                                    <p className="text-emerald-400 font-medium text-lg">+50 XP Added</p>

                                    <motion.button
                                        onClick={onComplete}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="mt-8 px-10 py-4 bg-white text-black rounded-full font-bold text-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all"
                                    >
                                        Return to App
                                    </motion.button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>

                    {/* UI Overlay Controls */}
                    {!isCompleted && (
                        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 md:p-12">
                            {/* Top Bar */}
                            <div className="flex justify-between items-start pointer-events-auto">
                                <button
                                    onClick={handleClose}
                                    className="p-4 rounded-full hover:bg-white/10 transition-colors group"
                                >
                                    <X className="w-6 h-6 text-white/70 group-hover:text-white" />
                                </button>
                                <div className="px-4 py-2 bg-black/50 backdrop-blur-md rounded-lg text-xs font-mono text-white/70 border border-white/10">
                                    Ad 1 of 1
                                </div>
                            </div>

                            {/* Bottom Bar items */}
                            <div className="space-y-4 pointer-events-auto">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-xl">Bonder Premium</h3>
                                        <p className="text-white/60 text-sm">Support the relationship revolution</p>
                                    </div>
                                    <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-lg border border-white/10 text-sm font-bold min-w-[140px] text-center">
                                        {timeLeft > 0 ? `Skip in ${timeLeft}s` : 'Reward Ready'}
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)]"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ ease: "linear", duration: 0.5 }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </AnimatePresence>
    );
}
