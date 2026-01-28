import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { PlayCircle, DollarSign, CheckCircle2, Gift } from 'lucide-react';
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
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />

                <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <Gift className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground">Daily Reward</h3>
                            <p className="text-xs text-muted-foreground">Complete one task to boost your stats</p>
                        </div>
                    </div>
                    <div className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                        +50 XP
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 relative z-10">
                    <button
                        onClick={() => setIsAdOpen(true)}
                        className="flex flex-col items-center justify-center p-4 rounded-2xl bg-secondary/50 border-2 border-transparent hover:border-primary/30 hover:bg-secondary transition-all group"
                    >
                        <PlayCircle className="w-8 h-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-bold text-foreground">Watch Ad</span>
                        <span className="text-[10px] text-muted-foreground">1 minute</span>
                    </button>

                    <button
                        onClick={() => setIsPayOpen(true)}
                        className="flex flex-col items-center justify-center p-4 rounded-2xl bg-secondary/50 border-2 border-transparent hover:border-emerald-500/30 hover:bg-secondary transition-all group"
                    >
                        <DollarSign className="w-8 h-8 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-bold text-foreground">Micro-pay</span>
                        <span className="text-[10px] text-muted-foreground">From $0.05</span>
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
