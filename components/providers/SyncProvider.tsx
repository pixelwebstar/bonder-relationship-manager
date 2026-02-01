"use client";

import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export function SyncProvider() {
    const isConnected = useStore((state) => state.userProfile?.isConnected);
    const userId = useStore((state) => state.userProfile?.userId);
    const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Subscribe to store changes
        const unsubscribe = useStore.subscribe((state, prevState) => {
            // Only sync if connected and we have a valid userId
            if (!state.userProfile?.isConnected || !state.userProfile?.userId) return;

            // Simple check to see if relevant data changed
            const dataChanged =
                state.contacts !== prevState.contacts ||
                state.stats !== prevState.stats ||
                state.userProfile !== prevState.userProfile ||
                state.availableTags !== prevState.availableTags;

            if (dataChanged) {
                // Debounce sync
                if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

                syncTimeoutRef.current = setTimeout(async () => {
                    const currentUser = auth.currentUser;
                    if (!currentUser || currentUser.uid !== state.userProfile?.userId) return;

                    try {
                        console.log("🔄 Auto-syncing to cloud...");
                        const docRef = doc(db, "users", currentUser.uid);
                        const dataToSave = {
                            contacts: state.contacts,
                            stats: state.stats,
                            userProfile: state.userProfile,
                            availableTags: state.availableTags,
                            accountNumber: state.userProfile?.accountNumber || 0,
                            lastUpdated: new Date().toISOString()
                        };

                        await setDoc(docRef, dataToSave);
                        console.log("✅ Cloud sync complete");
                    } catch (error) {
                        console.error("❌ Auto-sync failed:", error);
                    }
                }, 3000); // 3 second debounce to avoid rapid writes
            }
        });

        return () => {
            unsubscribe();
            if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        };
    }, []);

    return null; // This is a logic-only provider
}
