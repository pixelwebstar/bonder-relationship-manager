import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface AnxietyGroundingProps {
    isOpen: boolean;
    onClose: () => void;
    onReady: () => void;
}

export function AnxietyGrounding({ isOpen, onClose, onReady }: AnxietyGroundingProps) {
    const [step, setStep] = useState<'breathe' | 'rationalize' | 'ready'>('breathe');
    const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');

    // Rationalization inputs
    const [reasons, setReasons] = useState(['', '', '']);

    // Breathing Loop
    useEffect(() => {
        if (isOpen && step === 'breathe') {
            const breatheLoop = async () => {
                setBreathPhase('inhale');
                await new Promise(r => setTimeout(r, 4000)); // 4s
                setBreathPhase('hold');
                await new Promise(r => setTimeout(r, 7000)); // 7s
                setBreathPhase('exhale');
                await new Promise(r => setTimeout(r, 8000)); // 8s
            };

            breatheLoop();
            const interval = setInterval(breatheLoop, 19000); // 4+7+8 = 19s
            return () => clearInterval(interval);
        }
    }, [isOpen, step]);

    const handleReasonChange = (index: number, val: string) => {
        const newReasons = [...reasons];
        newReasons[index] = val;
        setReasons(newReasons);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl relative min-h-[500px] flex flex-col"
                    >
                        {/* Close Button */}
                        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 z-10">
                            <X className="w-6 h-6" />
                        </button>

                        {step === 'breathe' && (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-sky-50 to-white">
                                <h3 className="text-2xl font-bold text-sky-900 mb-2">Center Yourself</h3>
                                <p className="text-sky-600 mb-8">Follow the breathing rhythm (4-7-8)</p>

                                <div className="relative w-64 h-64 flex items-center justify-center mb-8">
                                    <motion.div
                                        animate={{
                                            scale: breathPhase === 'inhale' ? 1.5 : breathPhase === 'hold' ? 1.5 : 1,
                                            opacity: breathPhase === 'exhale' ? 0.6 : 1
                                        }}
                                        transition={{ duration: breathPhase === 'inhale' ? 4 : breathPhase === 'hold' ? 0 : 8, ease: "easeInOut" }}
                                        className="w-32 h-32 bg-sky-200 rounded-full blur-xl absolute"
                                    />
                                    <motion.div
                                        animate={{
                                            scale: breathPhase === 'inhale' ? 1.2 : breathPhase === 'hold' ? 1.2 : 1,
                                        }}
                                        transition={{ duration: breathPhase === 'inhale' ? 4 : breathPhase === 'hold' ? 0 : 8, ease: "easeInOut" }}
                                        className="w-32 h-32 bg-sky-400 rounded-full flex items-center justify-center relative z-10 shadow-lg text-white font-bold text-xl"
                                    >
                                        {breathPhase.toUpperCase()}
                                    </motion.div>
                                </div>

                                <button
                                    onClick={() => setStep('rationalize')}
                                    className="px-6 py-3 bg-sky-500 text-white rounded-full font-bold shadow-lg hover:bg-sky-600 transition-colors"
                                >
                                    I feel calmer
                                </button>
                            </div>
                        )}

                        {step === 'rationalize' && (
                            <div className="flex-1 flex flex-col p-8 bg-white">
                                <div className="text-center mb-6">
                                    <h3 className="text-xl font-bold text-slate-800">Rationalize the Anxiety</h3>
                                    <p className="text-slate-500 text-sm">Write 3 reasons why this interaction will be okay.</p>
                                </div>

                                <div className="space-y-4 mb-8 flex-1">
                                    {reasons.map((reason, i) => (
                                        <div key={i} className="relative">
                                            <div className="absolute left-3 top-3 text-slate-300 font-bold">{i + 1}.</div>
                                            <input
                                                type="text"
                                                value={reason}
                                                onChange={(e) => handleReasonChange(i, e.target.value)}
                                                placeholder="e.g., They are my friend..."
                                                className="w-full pl-8 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setStep('ready')}
                                    disabled={reasons.some(r => r.length < 3)}
                                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${reasons.some(r => r.length < 3) ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                        }`}
                                >
                                    Continue
                                </button>
                            </div>
                        )}

                        {step === 'ready' && (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-emerald-50">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 text-emerald-600"
                                >
                                    <Check className="w-12 h-12" />
                                </motion.div>
                                <h3 className="text-3xl font-bold text-emerald-900 mb-2">You&apos;re Ready.</h3>
                                <p className="text-emerald-700 mb-8 max-w-xs mx-auto">You&apos;ve grounded yourself and rationalized your fears. Go connect.</p>

                                <button
                                    onClick={onReady}
                                    className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-colors"
                                >
                                    Let&apos;s do this
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
