import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { PlayCircle, CircleDollarSign, CheckCircle2, Gift } from 'lucide-react';
import { VideoAdModal } from './VideoAdModal';
import { PaymentModal } from './PaymentModal';
import { toast } from 'sonner';

export function DailyTaskWidget() {
    const { stats, completeDailyTask, checkDailyTaskReset } = useStore();
    const [isAdOpen, setIsAdOpen] = useState(false);
    const [isPayOpen, setIsPayOpen] = useState(false);

    // Check for day reset on mount
    useEffect(() => {
        checkDailyTaskReset();
    }, [checkDailyTaskReset]);

    const handleAdSuccess = () => {
        completeDailyTask('ad');
        setIsAdOpen(false);
        toast.success("Daily task completed! +50 XP");
    };

    const handlePaySuccess = (amount: number) => {
        completeDailyTask('pay');
        setIsPayOpen(false);
        toast.success(`Thank you! Support of $${amount} received. +100 XP`);
    };

    if (stats.dailyTaskCompleted) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-3xl p-6 soft-shadow flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 mb-6"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-emerald-900">Daily Task Completed</h3>
                        <p className="text-sm text-emerald-600">You&apos;ve earned your XP for today!</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-xs font-bold text-emerald-400 block uppercase tracking-wider">Reset in</span>
                    <span className="text-emerald-700 font-mono">24h</span>
                </div>
            </motion.div>
        );
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-3xl p-6 soft-shadow mb-6 relative overflow-hidden"
            >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />

                <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <Gift className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Daily Reward</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Complete one task to boost your stats</p>
                        </div>
                    </div>
                    <div className="px-3 py-1 bg-primary/10 dark:bg-violet-500/20 text-primary dark:text-violet-300 text-xs font-bold rounded-full border border-primary/20 dark:border-violet-500/30">
                        +50 XP
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 relative z-10">
                    <button
                        onClick={() => setIsAdOpen(true)}
                        className="flex flex-col items-center justify-center p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:border-violet-500/50 hover:bg-black/10 dark:hover:bg-white/10 transition-all group"
                    >
                        <PlayCircle className="w-8 h-8 text-violet-600 dark:text-violet-400 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-bold text-slate-700 dark:text-white">Watch Ad</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">1 minute</span>
                    </button>

                    <button
                        onClick={() => setIsPayOpen(true)}
                        className="flex flex-col items-center justify-center p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:border-emerald-500/50 hover:bg-black/10 dark:hover:bg-white/10 transition-all group"
                    >
                        <CircleDollarSign className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-bold text-slate-700 dark:text-white">Fuel System</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">From $0.25</span>
                    </button>
                </div>
            </motion.div>

            {/* Modals rendered outside overflow-hidden container */}
            <VideoAdModal
                isOpen={isAdOpen}
                onClose={() => setIsAdOpen(false)}
                onComplete={handleAdSuccess}
            />

            <PaymentModal
                isOpen={isPayOpen}
                onClose={() => setIsPayOpen(false)}
                onComplete={handlePaySuccess}
            />
        </>
    );
}
