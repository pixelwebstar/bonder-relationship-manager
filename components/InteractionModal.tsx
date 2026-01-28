import { motion, AnimatePresence } from "framer-motion";
import { Phone, MessageCircle, Coffee, Video, ThumbsUp, Meh, Frown, Sparkles, X, Shield, BrainCircuit } from "lucide-react";
import { useState } from "react";
import { InteractionType, InteractionVibe } from "@/lib/store";
import { AnxietyGrounding } from "./cbt/AnxietyGrounding";
import { IcebreakerGenerator } from "./cbt/IcebreakerGenerator";

interface InteractionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLog: (type: InteractionType, vibe: InteractionVibe, notes: string) => void;
    contactName: string;
}

export function InteractionModal({ isOpen, onClose, onLog, contactName }: InteractionModalProps) {
    const [step, setStep] = useState(1);
    const [selectedType, setSelectedType] = useState<InteractionType | null>(null);
    const [selectedVibe, setSelectedVibe] = useState<InteractionVibe | null>(null);
    const [notes, setNotes] = useState("");

    // Tools State
    const [showAnxiety, setShowAnxiety] = useState(false);
    const [showIcebreaker, setShowIcebreaker] = useState(false);

    const handleTypeSelect = (type: InteractionType) => {
        setSelectedType(type);
        setStep(2);
    };

    const handleVibeSelect = (vibe: InteractionVibe) => {
        setSelectedVibe(vibe);
        setStep(3);
    };

    const handleFinish = () => {
        if (selectedType && selectedVibe) {
            onLog(selectedType, selectedVibe, notes);
            reset();
        }
    };

    const reset = () => {
        setStep(1);
        setSelectedType(null);
        setSelectedVibe(null);
        setNotes("");
        setShowAnxiety(false);
        setShowIcebreaker(false);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={reset}
                    />

                    {/* Anxiety Fullscreen Overlay */}
                    <AnxietyGrounding
                        isOpen={showAnxiety}
                        onClose={() => setShowAnxiety(false)}
                        onReady={() => setShowAnxiety(false)}
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="glass-card w-full max-w-sm rounded-[2rem] p-6 relative z-10 overflow-hidden"
                    >
                        <button onClick={reset} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 z-20">
                            <X className="w-4 h-4 text-slate-500" />
                        </button>

                        {step === 1 && (
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-slate-800 mb-2">Did you connect?</h2>
                                <p className="text-slate-500 mb-6">How did you reach out to {contactName}?</p>

                                {/* Social Anxiety Tools */}
                                <div className="flex justify-center gap-4 mb-8">
                                    <button
                                        onClick={() => setShowAnxiety(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold hover:bg-indigo-100 transition-colors"
                                    >
                                        <Shield className="w-3 h-3" />
                                        Anxiety Shield
                                    </button>
                                    <button
                                        onClick={() => setShowIcebreaker(!showIcebreaker)}
                                        className="flex items-center gap-2 px-4 py-2 bg-violet-50 text-violet-600 rounded-full text-xs font-bold hover:bg-violet-100 transition-colors"
                                    >
                                        <BrainCircuit className="w-3 h-3" />
                                        {showIcebreaker ? 'Hide AI' : 'Icebreaker AI'}
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {showIcebreaker && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden mb-6"
                                        >
                                            <IcebreakerGenerator contactName={contactName} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="grid grid-cols-2 gap-3">
                                    <OptionButton icon={Phone} label="Voice Call" onClick={() => handleTypeSelect('call')} color="bg-violet-100 text-violet-600" />
                                    <OptionButton icon={MessageCircle} label="Message" onClick={() => handleTypeSelect('message')} color="bg-blue-100 text-blue-600" />
                                    <OptionButton icon={Video} label="Video Chat" onClick={() => handleTypeSelect('video')} color="bg-pink-100 text-pink-600" />
                                    <OptionButton icon={Coffee} label="Meetup" onClick={() => handleTypeSelect('meetup')} color="bg-amber-100 text-amber-600" />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-slate-800 mb-2">How was it?</h2>
                                <p className="text-slate-500 mb-6">Rate the vibe of the conversation.</p>

                                <div className="space-y-3">
                                    <VibeOption icon={Sparkles} label="Awesome!" sub="Deep, meaningful connection" onClick={() => handleVibeSelect('awesome')} color="border-emerald-200 bg-emerald-50 text-emerald-600" />
                                    <VibeOption icon={ThumbsUp} label="Good" sub="Standard catch-up" onClick={() => handleVibeSelect('good')} color="border-blue-200 bg-blue-50 text-blue-600" />
                                    <VibeOption icon={Meh} label="Just Okay" sub="Short or distracted" onClick={() => handleVibeSelect('meh')} color="border-slate-200 bg-slate-50 text-slate-600" />
                                    <VibeOption icon={Frown} label="Not Great" sub="Awkward or bad timing" onClick={() => handleVibeSelect('bad')} color="border-orange-200 bg-orange-50 text-orange-600" />
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="text-center">
                                <h2 className="text-xl font-bold text-slate-800 mb-2">Any thoughts?</h2>
                                <p className="text-slate-500 text-sm mb-4">Add a quick private note to remember details.</p>

                                <textarea
                                    className="w-full h-24 bg-slate-50 border-none rounded-2xl p-4 text-slate-700 outline-none focus:ring-2 focus:ring-violet-500/20 mb-4 resize-none"
                                    placeholder="e.g. They are moving to a new apartment..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />

                                <button
                                    onClick={handleFinish}
                                    className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-lg hover:scale-[1.02] transition-transform"
                                >
                                    Log Interaction
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function OptionButton({ icon: Icon, label, onClick, color }: { icon: React.ElementType, label: string, onClick: () => void, color: string }) {
    return (
        <button onClick={onClick} className={`${color} p-4 rounded-2xl flex flex-col items-center gap-2 hover:opacity-80 transition-opacity`}>
            <Icon className="w-8 h-8" />
            <span className="font-semibold text-sm">{label}</span>
        </button>
    );
}

function VibeOption({ icon: Icon, label, sub, onClick, color }: { icon: React.ElementType, label: string, sub: string, onClick: () => void, color: string }) {
    return (
        <button onClick={onClick} className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 hover:scale-[1.02] transition-transform ${color}`}>
            <div className="p-2 bg-white rounded-full shadow-sm">
                <Icon className="w-5 h-5" />
            </div>
            <div className="text-left">
                <div className="font-bold">{label}</div>
                <div className="text-xs opacity-70 font-medium">{sub}</div>
            </div>
        </button>
    );
}
