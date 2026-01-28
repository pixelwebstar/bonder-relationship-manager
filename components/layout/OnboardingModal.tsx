import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Zap, Shield, ChevronRight } from 'lucide-react';

interface OnboardingModalProps {
    onComplete: () => void;
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
    const [step, setStep] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // slight delay for dramatic effect on load
        const timer = setTimeout(() => setIsOpen(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    const steps = [
        {
            title: "Welcome to Bonder",
            desc: "Your new Social Operating System. Manage relationships like a pro, not a user.",
            icon: Heart,
            color: "text-rose-500",
            bg: "bg-rose-500/10"
        },
        {
            title: "Social Orbits",
            desc: "Don't get overwhelmed. Organize friends into Inner, Middle, and Outer orbits to manage your energy.",
            icon: Zap,
            color: "text-amber-500",
            bg: "bg-amber-500/10"
        },
        {
            title: "Privacy First",
            desc: "Your data lives on your device. No servers, no tracking. Total control.",
            icon: Shield,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        }
    ];

    const currentStep = steps[step];

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(prev => prev + 1);
        } else {
            setIsOpen(false);
            setTimeout(onComplete, 500); // Wait for exit animation
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-3xl"
                    />

                    <motion.div
                        key={step}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        transition={{ type: "spring", bounce: 0.3 }}
                        className="w-full max-w-md bg-zinc-900 border border-white/10 p-8 rounded-[2.5rem] relative z-10 shadow-2xl"
                    >
                        <div className="flex flex-col items-center text-center space-y-6">
                            <motion.div
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", delay: 0.2 }}
                                className={`w-24 h-24 rounded-full ${currentStep.bg} flex items-center justify-center mb-2`}
                            >
                                <currentStep.icon className={`w-10 h-10 ${currentStep.color}`} />
                            </motion.div>

                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold text-white">{currentStep.title}</h2>
                                <p className="text-zinc-400 text-lg leading-relaxed">{currentStep.desc}</p>
                            </div>

                            <div className="flex gap-1 pt-4">
                                {steps.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-white' : 'w-2 bg-white/20'}`}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={handleNext}
                                className="w-full py-4 bg-white text-black font-bold rounded-xl text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 mt-4"
                            >
                                {step === steps.length - 1 ? "Get Started" : "Next"}
                                {step < steps.length - 1 && <ChevronRight className="w-5 h-5" />}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
