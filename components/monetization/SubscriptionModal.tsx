import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Star, Zap, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
    const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro'>('pro');

    const handleSubscribe = () => {
        toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
            loading: 'Processing upgrade...',
            success: 'Upgrade Successful! Welcome to Bonder Pro.',
            error: 'Payment failed'
        });
        setTimeout(onClose, 1500);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center sm:p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="w-full max-w-md bg-[#0f0f13] border-t sm:border border-white/10 sm:rounded-[2.5rem] rounded-t-[2.5rem] relative z-10 overflow-hidden max-h-[90vh] overflow-y-auto"
                    >
                        {/* Header Image Area */}
                        <div className="h-40 bg-gradient-to-br from-violet-600 to-indigo-900 relative overflow-hidden flex items-center justify-center">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/20 blur-[100px] rounded-full pointer-events-none" />
                            <div className="relative z-10 text-center">
                                <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-white mb-2 border border-white/20">
                                    MOST POPULAR
                                </span>
                                <h2 className="text-3xl font-bold text-white">Bonder Pro</h2>
                            </div>

                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Plans Toggle */}
                            <div className="flex bg-zinc-900 p-1 rounded-2xl border border-white/5">
                                <button
                                    onClick={() => setSelectedPlan('free')}
                                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${selectedPlan === 'free' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    Free
                                </button>
                                <button
                                    onClick={() => setSelectedPlan('pro')}
                                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${selectedPlan === 'pro' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    Pro
                                </button>
                            </div>

                            {/* Features List */}
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 p-1 rounded-full ${selectedPlan === 'pro' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-zinc-800 text-zinc-500'}`}>
                                        <Check className="w-3 h-3" />
                                    </div>
                                    <div>
                                        <h4 className={`font-medium ${selectedPlan === 'pro' ? 'text-white' : 'text-zinc-400'}`}>Unlimited Contacts</h4>
                                        <p className="text-xs text-zinc-500">Manage as many relationships as you want.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 p-1 rounded-full ${selectedPlan === 'pro' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-zinc-800 text-zinc-500'}`}>
                                        <Zap className="w-3 h-3" />
                                    </div>
                                    <div>
                                        <h4 className={`font-medium ${selectedPlan === 'pro' ? 'text-white' : 'text-zinc-400'}`}>Advanced AI Insights</h4>
                                        <p className="text-xs text-zinc-500">Get deep psychological analysis of your chats.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 p-1 rounded-full ${selectedPlan === 'pro' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-zinc-800 text-zinc-500'}`}>
                                        <Shield className="w-3 h-3" />
                                    </div>
                                    <div>
                                        <h4 className={`font-medium ${selectedPlan === 'pro' ? 'text-white' : 'text-zinc-400'}`}>Cloud Sync & Backup</h4>
                                        <p className="text-xs text-zinc-500">Never lose your relationship data.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 p-1 rounded-full ${selectedPlan === 'pro' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-zinc-800 text-zinc-500'}`}>
                                        <Star className="w-3 h-3" />
                                    </div>
                                    <div>
                                        <h4 className={`font-medium ${selectedPlan === 'pro' ? 'text-white' : 'text-zinc-400'}`}>Dark Mode & Custom Themes</h4>
                                        <p className="text-xs text-zinc-500">Unlock the full premium aesthetic.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Price & Action */}
                            <div className="pt-4 border-t border-white/5">
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <p className="text-zinc-400 text-sm">Total</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-bold text-white">
                                                {selectedPlan === 'free' ? '$0' : '$4.99'}
                                            </span>
                                            <span className="text-zinc-500 text-sm">/month</span>
                                        </div>
                                    </div>
                                    {selectedPlan === 'pro' && (
                                        <div className="text-right">
                                            <span className="text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2 py-1 rounded-lg">SAVE 20% YEARLY</span>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleSubscribe}
                                    disabled={selectedPlan === 'free'}
                                    className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all
                                        ${selectedPlan === 'pro'
                                            ? 'bg-white text-black hover:scale-[1.02] shadow-xl shadow-white/10'
                                            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                        }`}
                                >
                                    {selectedPlan === 'free' ? 'Current Plan' : 'Unlock Pro Access'}
                                    {selectedPlan === 'pro' && <Zap className="w-5 h-5 fill-current" />}
                                </button>
                                <p className="text-center text-xs text-zinc-600 mt-3">
                                    Cancel anytime. Secure payment via Stripe.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
