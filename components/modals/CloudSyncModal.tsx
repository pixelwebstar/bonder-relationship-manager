
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Smartphone, AlertTriangle, ArrowRight, X } from 'lucide-react';
import { format } from 'date-fns';

interface CloudSyncModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRestore: () => void;
    onOverwrite: () => void;
    cloudDate: string | null;
    localDate: string | null;
    accountNumber?: number;
}

export function CloudSyncModal({ isOpen, onClose, onRestore, onOverwrite, cloudDate, localDate, accountNumber }: CloudSyncModalProps) {
    if (!isOpen) return null;

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Unknown';
        try {
            return format(new Date(dateString), 'PP p');
        } catch (e) {
            return 'Invalid Date';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="glass-card w-full max-w-md overflow-hidden rounded-[2rem] relative z-10"
                    >
                        <div className="p-6 space-y-6">
                            <div className="text-center space-y-2">
                                <div className="mx-auto w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 mb-4">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-bold text-foreground">Sync Conflict</h2>
                                <p className="text-sm text-muted-foreground">
                                    We found existing data in the cloud. How would you like to proceed?
                                </p>
                            </div>

                            <div className="grid gap-3">
                                {/* Option 1: Restore from Cloud */}
                                <button
                                    onClick={onRestore}
                                    className="relative flex items-center p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 transition-all group text-left"
                                >
                                    <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-500 mr-4">
                                        <Cloud className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-blue-500">Restore Account</div>
                                        <div className="text-xs text-muted-foreground mt-0.5">
                                            Use data from cloud
                                        </div>
                                        <div className="text-[10px] uppercase font-bold text-blue-500/60 mt-1">
                                            Last Save: {formatDate(cloudDate)}
                                            {accountNumber ? ` • Account #${accountNumber}` : ''}
                                        </div>
                                    </div>
                                    <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </button>

                                {/* Option 2: Overwrite Cloud (Save Local) */}
                                <button
                                    onClick={onOverwrite}
                                    className="relative flex items-center p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all group text-left"
                                >
                                    <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-500 mr-4">
                                        <Smartphone className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-emerald-500">Save This Account</div>
                                        <div className="text-xs text-muted-foreground mt-0.5">
                                            Overwrite cloud with this device
                                        </div>
                                        <div className="text-[10px] uppercase font-bold text-emerald-500/60 mt-1">
                                            Last Active: {formatDate(localDate)}
                                        </div>
                                    </div>
                                    <div className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </button>
                            </div>

                            <p className="text-xs text-center text-muted-foreground/60 italic">
                                Note: This action cannot be undone.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
