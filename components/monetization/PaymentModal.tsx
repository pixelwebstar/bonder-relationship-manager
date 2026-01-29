import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Check, Coffee, Zap, Star, Shield } from 'lucide-react';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (amount: number) => void;
}

export function PaymentModal({ isOpen, onClose, onComplete }: PaymentModalProps) {
    const [step, setStep] = useState<'select' | 'processing' | 'success'>('select');
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

    const amounts = [
        { value: 0.25, label: 'System Spark', icon: Zap, color: 'from-amber-400 to-orange-500', desc: "+250 XP (Instant Boost)" },
        { value: 0.99, label: 'Clean Energy', icon: Star, color: 'from-emerald-400 to-teal-500', desc: "+1,500 XP + No Ads (24h)" },
        { value: 4.99, label: 'Star Core', icon: Shield, color: 'from-violet-500 to-fuchsia-600', desc: "+10,000 XP + No Ads (30d)" },
    ];

    const handlePay = () => {
        if (!selectedAmount) return;
        setStep('processing');

        // Simulate processing time
        setTimeout(() => {
            setStep('success');
            setTimeout(() => {
                onComplete(selectedAmount);
                setTimeout(() => setStep('select'), 500);
            }, 2500); // Slightly longer for realism
        }, 2000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Detailed Mesh Gradient Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        // Use glass-card utility here for consistency
                        className="w-full max-w-lg glass-card rounded-[2.5rem] relative z-10"
                    >
                        {/* Decorative Top Gradient */}
                        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-violet-500/10 to-transparent pointer-events-none" />

                        <div className="p-8 pb-0 relative">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-3xl font-black text-foreground tracking-tight">Fuel System</h3>
                                    <p className="text-muted-foreground mt-1 font-medium">Recharge your social battery & remove ads.</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 bg-secondary/50 hover:bg-secondary rounded-full text-foreground/70 hover:text-foreground transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-8 pt-2">
                            {step === 'select' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    <div className="grid gap-3">
                                        {amounts.map((opt) => {
                                            const isSelected = selectedAmount === opt.value;
                                            return (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => setSelectedAmount(opt.value)}
                                                    className={`w-full group relative overflow-hidden p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 text-left ${isSelected
                                                        ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                                                        : 'border-black/5 dark:border-white/10 hover:border-emerald-500/30 hover:bg-black/5 dark:hover:bg-white/5'
                                                        }`}
                                                >
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${opt.color} text-white shadow-md transform group-hover:scale-110 transition-transform duration-300`}>
                                                        <opt.icon className="w-6 h-6" />
                                                    </div>

                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="font-bold text-lg text-foreground">{opt.label}</span>
                                                            <span className="font-bold text-xl text-primary">${opt.value.toFixed(2)}</span>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">{opt.desc}</p>
                                                    </div>


                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={handlePay}
                                        disabled={!selectedAmount}
                                        className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform ${selectedAmount
                                            ? "bg-primary text-primary-foreground shadow-xl shadow-primary/25 hover:translate-y-[-2px] active:scale-95"
                                            : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                                            }`}
                                    >
                                        <CreditCard className="w-5 h-5" />
                                        {selectedAmount ? `Confirm Payment of $${selectedAmount.toFixed(2)}` : 'Select an Amount'}
                                    </button>
                                </motion.div>
                            )}

                            {step === 'processing' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="py-12 flex flex-col items-center justify-center text-center"
                                >
                                    <div className="relative w-24 h-24 mb-8">
                                        <div className="absolute inset-0 border-4 border-muted/20 rounded-full" />
                                        <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Shield className="w-8 h-8 text-primary animate-pulse" />
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-2xl text-foreground mb-3">Processing...</h4>
                                    <p className="text-muted-foreground">Securely verifying your transaction</p>
                                </motion.div>
                            )}

                            {step === 'success' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="py-12 flex flex-col items-center justify-center text-center"
                                >
                                    <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", delay: 0.2 }}
                                        >
                                            <Check className="w-12 h-12 text-black" strokeWidth={3} />
                                        </motion.div>
                                    </div>
                                    <h4 className="font-bold text-3xl text-foreground mb-3">All Set!</h4>
                                    <p className="text-muted-foreground mb-6">Your support means the world to us.</p>
                                    <div className="px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                        <p className="text-emerald-500 font-bold">+100 XP Added</p>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
