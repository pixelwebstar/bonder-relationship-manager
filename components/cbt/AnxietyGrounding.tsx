import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Timer, Shield } from 'lucide-react';

interface AnxietyGroundingProps {
    isOpen: boolean;
    onClose: () => void;
    onReady: () => void;
}

// Proven 4-7-8 breathing technique (Dr. Andrew Weil)
const INHALE_DURATION = 4;
const HOLD_DURATION = 7;
const EXHALE_DURATION = 8;
const TOTAL_CYCLES = 3; // Exercise ends after 3 cycles

const EXAMPLE_PLACEHOLDERS = [
    "They like me and want to hear from me",
    "I've done this before and it went fine",
    "Most people are friendly and understanding"
];

export function AnxietyGrounding({ isOpen, onClose, onReady }: AnxietyGroundingProps) {
    const [step, setStep] = useState<'intro' | 'countdown' | 'breathe' | 'rationalize' | 'ready'>('intro');
    const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
    const [countdown, setCountdown] = useState(INHALE_DURATION);
    const [startCountdown, setStartCountdown] = useState(3);
    const [currentCycle, setCurrentCycle] = useState(1);
    const [isBreathingComplete, setIsBreathingComplete] = useState(false);

    // Rationalization inputs
    const [reasons, setReasons] = useState(['', '', '']);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                setStep('intro');
                setStartCountdown(3);
                setBreathPhase('inhale');
                setCountdown(INHALE_DURATION);
                setCurrentCycle(1);
                setIsBreathingComplete(false);
                setReasons(['', '', '']);
            }, 0);
        }
    }, [isOpen]);

    // Initial 3-second countdown before breathing starts
    useEffect(() => {
        if (!isOpen || step !== 'countdown') return;

        const timer = setInterval(() => {
            setStartCountdown(prev => {
                if (prev <= 1) {
                    setStep('breathe');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen, step]);

    // Breathing Timer with Countdown
    useEffect(() => {
        if (!isOpen || step !== 'breathe' || isBreathingComplete) return;

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    // Move to next phase
                    if (breathPhase === 'inhale') {
                        setBreathPhase('hold');
                        return HOLD_DURATION;
                    } else if (breathPhase === 'hold') {
                        setBreathPhase('exhale');
                        return EXHALE_DURATION;
                    } else {
                        // Exhale complete - check if we're done
                        if (currentCycle >= TOTAL_CYCLES) {
                            setIsBreathingComplete(true);
                            return 0;
                        }
                        // Start new cycle
                        setCurrentCycle(c => c + 1);
                        setBreathPhase('inhale');
                        return INHALE_DURATION;
                    }
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen, step, breathPhase, currentCycle, isBreathingComplete]);

    const handleReasonChange = (index: number, val: string) => {
        const newReasons = [...reasons];
        newReasons[index] = val;
        setReasons(newReasons);
    };

    // Get phase-specific colors
    const getPhaseColor = () => {
        switch (breathPhase) {
            case 'inhale':
                return { bg: 'bg-sky-400', blur: 'bg-sky-200', text: 'text-sky-600', gradient: 'from-sky-50' };
            case 'hold':
                return { bg: 'bg-amber-400', blur: 'bg-amber-200', text: 'text-amber-600', gradient: 'from-amber-50' };
            case 'exhale':
                return { bg: 'bg-violet-400', blur: 'bg-violet-200', text: 'text-violet-600', gradient: 'from-violet-50' };
        }
    };

    const getPhaseInstruction = () => {
        switch (breathPhase) {
            case 'inhale':
                return 'Breathe in slowly through your nose...';
            case 'hold':
                return 'Hold your breath gently...';
            case 'exhale':
                return 'Release slowly through your mouth...';
        }
    };

    const colors = getPhaseColor();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-2xl relative min-h-[500px] flex flex-col"
                    >
                        {/* Close Button */}
                        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 z-10">
                            <X className="w-6 h-6" />
                        </button>

                        {/* Intro - Choose or Skip */}
                        {step === 'intro' && (
                            <motion.div
                                key="intro"
                                className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-indigo-50 to-white dark:from-slate-700 dark:to-slate-800"
                            >
                                <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-6">
                                    <Shield className="w-10 h-10 text-indigo-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Anxiety Shield</h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm max-w-xs">
                                    A quick breathing exercise to calm your nerves before reaching out
                                </p>

                                <div className="flex flex-col gap-3 w-full max-w-xs">
                                    <button
                                        onClick={() => setStep('countdown')}
                                        className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        Start Breathing Exercise
                                    </button>
                                    <button
                                        onClick={() => setStep('rationalize')}
                                        className="w-full py-3 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium transition-colors"
                                    >
                                        Skip to Reframing
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* 3-second countdown before starting */}
                        {step === 'countdown' && (
                            <motion.div
                                key="countdown"
                                className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-indigo-50 to-white dark:from-slate-700 dark:to-slate-800"
                            >
                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Get Ready</h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">Find a comfortable position</p>

                                <motion.div
                                    key={startCountdown}
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="w-32 h-32 bg-indigo-500 rounded-full flex items-center justify-center text-white text-6xl font-bold shadow-lg"
                                >
                                    {startCountdown}
                                </motion.div>
                            </motion.div>
                        )}

                        {step === 'breathe' && (
                            <motion.div
                                key="breathe"
                                className={`flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b ${colors.gradient} to-white dark:to-slate-800`}
                            >
                                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">4-7-8 Breathing</h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-2 text-sm">Clinically proven relaxation technique</p>

                                {/* Cycle Progress */}
                                <div className="flex items-center gap-2 mb-6">
                                    <Timer className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm font-medium text-slate-500">
                                        Cycle {currentCycle} of {TOTAL_CYCLES}
                                    </span>
                                    <div className="flex gap-1">
                                        {Array.from({ length: TOTAL_CYCLES }).map((_, i) => (
                                            <div
                                                key={i}
                                                className={`w-2 h-2 rounded-full transition-colors ${i < currentCycle ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-600'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="relative w-64 h-64 flex items-center justify-center mb-4">
                                    {/* Blur glow effect */}
                                    <motion.div
                                        animate={{
                                            scale: breathPhase === 'inhale' ? 1.5 : breathPhase === 'hold' ? 1.5 : 1,
                                            opacity: breathPhase === 'exhale' ? 0.4 : 0.8
                                        }}
                                        transition={{
                                            duration: breathPhase === 'inhale' ? 4 : breathPhase === 'hold' ? 0.3 : 8,
                                            ease: "easeInOut"
                                        }}
                                        className={`w-32 h-32 ${colors.blur} rounded-full blur-xl absolute`}
                                    />
                                    {/* Main circle */}
                                    <motion.div
                                        animate={{
                                            scale: breathPhase === 'inhale' ? 1.3 : breathPhase === 'hold' ? 1.3 : 1,
                                        }}
                                        transition={{
                                            duration: breathPhase === 'inhale' ? 4 : breathPhase === 'hold' ? 0.3 : 8,
                                            ease: "easeInOut"
                                        }}
                                        className={`w-36 h-36 ${colors.bg} rounded-full flex flex-col items-center justify-center relative z-10 shadow-lg text-white`}
                                    >
                                        <span className="text-4xl font-bold">{countdown}</span>
                                        <span className="text-sm font-medium uppercase tracking-wider opacity-90">
                                            {breathPhase}
                                        </span>
                                    </motion.div>
                                </div>

                                {/* Phase instruction */}
                                <motion.p
                                    key={breathPhase}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`${colors.text} font-medium mb-6 h-6`}
                                >
                                    {isBreathingComplete ? "✓ Breathing complete!" : getPhaseInstruction()}
                                </motion.p>

                                {/* Legend */}
                                <div className="flex gap-4 text-xs text-slate-400 mb-6">
                                    <span className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-sky-400" /> Inhale 4s
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-amber-400" /> Hold 7s
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-violet-400" /> Exhale 8s
                                    </span>
                                </div>

                                <button
                                    onClick={() => setStep('rationalize')}
                                    disabled={!isBreathingComplete}
                                    className={`px-8 py-3 rounded-full font-bold shadow-lg transition-all ${isBreathingComplete
                                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                                        }`}
                                >
                                    {isBreathingComplete ? "I feel calmer →" : `Complete ${TOTAL_CYCLES - currentCycle + 1} more cycle${TOTAL_CYCLES - currentCycle > 0 ? 's' : ''}`}
                                </button>
                            </motion.div>
                        )}

                        {step === 'rationalize' && (
                            <motion.div
                                key="rationalize"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex-1 flex flex-col p-8 bg-white dark:bg-slate-800"
                            >
                                <div className="text-center mb-6">
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Reframe Your Thoughts</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Write 3 reasons why this will go well</p>
                                </div>

                                <div className="space-y-4 mb-8 flex-1">
                                    {reasons.map((reason, i) => (
                                        <div key={i} className="relative">
                                            <div className={`absolute left-3 top-3 font-bold ${reason.length >= 3 ? 'text-emerald-500' : 'text-slate-300'
                                                }`}>
                                                {i + 1}.
                                            </div>
                                            <input
                                                type="text"
                                                value={reason}
                                                onChange={(e) => handleReasonChange(i, e.target.value)}
                                                placeholder={EXAMPLE_PLACEHOLDERS[i]}
                                                className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 focus:outline-none focus:border-indigo-500 transition-colors text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                                            />
                                            {reason.length >= 3 && (
                                                <div className="absolute right-3 top-3 text-emerald-500">
                                                    <Check className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Tip */}
                                <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-xl mb-4">
                                    <p className="text-xs text-indigo-600 dark:text-indigo-300 text-center">
                                        💡 <strong>CBT Tip:</strong> Writing down positive outcomes helps rewire anxious thought patterns
                                    </p>
                                </div>

                                <button
                                    onClick={() => setStep('ready')}
                                    disabled={reasons.some(r => r.length < 3)}
                                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${reasons.some(r => r.length < 3)
                                        ? 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                        }`}
                                >
                                    Continue
                                </button>
                            </motion.div>
                        )}

                        {step === 'ready' && (
                            <motion.div
                                key="ready"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-emerald-50 dark:bg-emerald-900/20"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-24 h-24 bg-emerald-100 dark:bg-emerald-800/50 rounded-full flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400"
                                >
                                    <Check className="w-12 h-12" />
                                </motion.div>
                                <h3 className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mb-2">You&apos;re Ready!</h3>
                                <p className="text-emerald-700 dark:text-emerald-300 mb-8 max-w-xs mx-auto">
                                    You&apos;ve calmed your nervous system and reframed your thoughts. Time to connect!
                                </p>

                                <button
                                    onClick={onReady}
                                    className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-colors"
                                >
                                    Let&apos;s do this 💪
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
