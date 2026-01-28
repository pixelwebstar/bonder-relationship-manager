import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

// --- Types ---

export interface Note {
    id: string;
    content: string;
    createdAt: string; // ISO Date
}

export type InteractionType = 'call' | 'video' | 'message' | 'meetup' | 'orbit_move';
export type InteractionVibe = 'awesome' | 'good' | 'meh' | 'bad';

export interface InteractionLog {
    id: string;
    contactId: string;
    type: InteractionType;
    vibe: InteractionVibe;
    notes?: string;
    date: string;
}

// Social OS Types
export type OrbitLayer = 'inner' | 'middle' | 'outer' | 'extended'; // 5, 15, 50, 150
export type DriftState = 'stable' | 'drifting' | 'fading' | 'ghost';

export interface SocialPhysics {
    mass: number; // Importance (0.1-2.0), affects gravity/decay speed. 1.0 is standard.
    velocity: number; // Current interaction rate/momentum
    lastOrbitChange: string; // Date
}

export interface CBTContext {
    socialAnxietyLevel: number; // 0-10, self-reported or inferred
    completedChallenges: string[]; // IDs of "exposure therapy" tasks
}

export interface Contact {
    id: string;
    name: string;
    phoneNumber?: string;
    email?: string;
    avatar?: string;
    tags: string[];

    // Relationship Health
    lastContacted: string; // ISO Date
    targetFrequencyDays: number; // e.g., 7 for weekly, 30 for monthly
    healthScore: number; // 0-100, calculated

    // Social OS Core
    orbit: OrbitLayer;
    driftStatus: DriftState; // Replacing simple 'connected'|'drifting'|'fading' from before, or mapping it.
    physics: SocialPhysics;
    maxDriftVelocity: number; // How fast they seemingly drift away

    // Content
    notes: Note[];

    createdAt: string;
}

export interface UserStats {
    points: number;
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string; // To calculate streak
    totalInteractions: number;
    // New: Privacy Settings
    privacyMode?: boolean; // If true, hides sensitive details in UI if we wanted, or just as a flag

    // Monetization / Daily Task
    dailyTaskCompleted: boolean;
    lastDailyTaskDate: string; // ISO Date of last completed task (or check reset)

    // CBT Global Stats
    cbtContext?: CBTContext;
}

interface AppState {
    contacts: Contact[];
    stats: UserStats;

    // Actions
    addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'healthScore' | 'notes' | 'lastContacted' | 'orbit' | 'driftStatus' | 'physics' | 'maxDriftVelocity'>) => void;
    updateContact: (id: string, updates: Partial<Contact>) => void;
    deleteContact: (id: string) => void;
    addNote: (contactId: string, content: string) => void;
    logInteraction: (contactId: string) => void;
    // New: Detailed Logging
    logInteractionDetailed: (contactId: string, type: InteractionType, vibe: InteractionVibe, notes?: string) => void;
    calculateHealth: () => void; // Call periodically or on load

    // Gamification
    checkStreak: () => void;

    // Monetization
    completeDailyTask: (method: 'ad' | 'pay') => void;
    checkDailyTaskReset: () => void;

    // Social OS Actions
    setOrbit: (contactId: string, newOrbit: OrbitLayer) => void;
    applyDriftPhysics: () => void; // Run physics simulation
    // generateIcebreaker: (contactId: string, context: string) => string; // Actually helper, maybe clear of store logic? No, let's keep it simple for now or usage in components.
}

// --- Utils ---

const calculateHealthScore = (lastContacted: string, targetDays: number): number => {
    const now = new Date();
    const last = new Date(lastContacted);
    const diffTime = Math.abs(now.getTime() - last.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) return 100;

    const decayRate = 100 / (targetDays * 2);
    const score = 100 - (diffDays * decayRate);

    return Math.max(0, Math.min(100, Math.round(score)));
};

// Updated Logic with Orbit Awareness
const calculateDriftStatus = (lastContacted: string, targetDays: number, orbit: OrbitLayer): DriftState => {
    const now = new Date();
    const last = new Date(lastContacted);
    const diffTime = Math.abs(now.getTime() - last.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Orbit multipliers: Inner circle decays faster (needs high maintenance)
    let toleranceMultiplier = 1;
    if (orbit === 'inner') toleranceMultiplier = 1.0;
    if (orbit === 'middle') toleranceMultiplier = 2.0;
    if (orbit === 'outer') toleranceMultiplier = 4.0;

    const adjustedTarget = targetDays * toleranceMultiplier;

    if (diffDays <= adjustedTarget) return 'stable';
    if (diffDays <= adjustedTarget * 2) return 'drifting';
    if (diffDays <= adjustedTarget * 4) return 'fading';
    return 'ghost';
};

// --- Store ---

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            contacts: [],
            stats: {
                points: 0,
                currentStreak: 0,
                longestStreak: 0,
                lastActiveDate: new Date().toISOString(),
                totalInteractions: 0,
                dailyTaskCompleted: false,
                lastDailyTaskDate: new Date(0).toISOString(),
                cbtContext: {
                    socialAnxietyLevel: 3, // Default low-mid
                    completedChallenges: []
                }
            },

            addContact: (contactData) => set((state) => {
                const newContact: Contact = {
                    id: uuidv4(),
                    createdAt: new Date().toISOString(),
                    lastContacted: new Date().toISOString(),
                    healthScore: 100,
                    notes: [],
                    // Social OS Defaults
                    orbit: 'outer', // Default to outer
                    driftStatus: 'stable',
                    physics: {
                        mass: 1.0,
                        velocity: 0,
                        lastOrbitChange: new Date().toISOString()
                    },
                    maxDriftVelocity: 1.0,
                    ...contactData,
                };
                return { contacts: [...state.contacts, newContact] };
            }),

            updateContact: (id, updates) => set((state) => ({
                contacts: state.contacts.map((c) =>
                    c.id === id ? { ...c, ...updates } : c
                ),
            })),

            deleteContact: (id) => set((state) => ({
                contacts: state.contacts.filter((c) => c.id !== id),
            })),

            addNote: (contactId, content) => set((state) => ({
                contacts: state.contacts.map((c) => {
                    if (c.id === contactId) {
                        return {
                            ...c,
                            notes: [{ id: uuidv4(), content, createdAt: new Date().toISOString() }, ...c.notes]
                        };
                    }
                    return c;
                }),
            })),

            logInteraction: (contactId) => {
                const now = new Date().toISOString();
                const { checkStreak } = get();

                set((state) => ({
                    contacts: state.contacts.map((c) =>
                        c.id === contactId ? { ...c, lastContacted: now, healthScore: 100, driftStatus: 'stable' } : c
                    ),
                    stats: {
                        ...state.stats,
                        points: state.stats.points + 10,
                        totalInteractions: state.stats.totalInteractions + 1
                    }
                }));

                checkStreak();
            },

            logInteractionDetailed: (contactId, type, vibe, notes) => {
                const now = new Date().toISOString();
                const { checkStreak } = get();

                let xp = 10;
                if (type === 'call' || type === 'meetup') xp += 20;
                if (vibe === 'awesome') xp += 10;

                set((state) => ({
                    contacts: state.contacts.map((c) => {
                        if (c.id === contactId) {
                            const newNotes = notes ? [{ id: uuidv4(), content: `[${type.toUpperCase()}] ${notes}`, createdAt: now }, ...c.notes] : c.notes;
                            return {
                                ...c,
                                lastContacted: now,
                                healthScore: 100,
                                driftStatus: 'stable',
                                notes: newNotes
                            };
                        }
                        return c;
                    }),
                    stats: {
                        ...state.stats,
                        points: state.stats.points + xp,
                        totalInteractions: state.stats.totalInteractions + 1
                    }
                }));

                checkStreak();
            },

            calculateHealth: () => set((state) => ({
                contacts: state.contacts.map((c) => ({
                    ...c,
                    healthScore: calculateHealthScore(c.lastContacted, c.targetFrequencyDays),
                    // Check if old data has orbit/driftStatus, if not provide defaults (migration handled by ...c spread mostly, but types might be optional initially if strict)
                    // Since we updated types, we assume data fits. If localstorage has old data, we might need a migration check.
                    // For now, we trust the defaults or partial updates. 
                    // Actually, let's play safe and ensure orbit exists if undefined.
                    orbit: c.orbit || 'outer',
                    driftStatus: calculateDriftStatus(c.lastContacted, c.targetFrequencyDays, c.orbit || 'outer')
                }))
            })),

            checkStreak: () => set((state) => {
                const now = new Date();
                const lastActive = new Date(state.stats.lastActiveDate);
                const isFirstLaunch = state.stats.lastActiveDate === new Date(0).toISOString();

                // If first ever launch, set streak to 1
                if (isFirstLaunch) {
                    return {
                        stats: {
                            ...state.stats,
                            currentStreak: 1,
                            longestStreak: 1,
                            lastActiveDate: now.toISOString()
                        }
                    };
                }

                if (now.toDateString() === lastActive.toDateString()) {
                    return { stats: state.stats };
                }

                const diffTime = Math.abs(now.getTime() - lastActive.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                let newStreak = state.stats.currentStreak;

                if (diffDays <= 2) {
                    newStreak += 1;
                } else {
                    newStreak = 1; // Reset to 1 if broken, because today counts
                }

                return {
                    stats: {
                        ...state.stats,
                        currentStreak: newStreak,
                        longestStreak: Math.max(newStreak, state.stats.longestStreak),
                        lastActiveDate: now.toISOString()
                    }
                };
            }),

            completeDailyTask: (method) => set((state) => {
                const reward = method === 'pay' ? 100 : 50;
                return {
                    stats: {
                        ...state.stats,
                        points: state.stats.points + reward,
                        dailyTaskCompleted: true,
                        lastDailyTaskDate: new Date().toISOString()
                    }
                };
            }),

            checkDailyTaskReset: () => set((state) => {
                const now = new Date();
                const lastTask = new Date(state.stats.lastDailyTaskDate);

                if (now.toDateString() !== lastTask.toDateString()) {
                    if (state.stats.dailyTaskCompleted) {
                        return {
                            stats: {
                                ...state.stats,
                                dailyTaskCompleted: false
                            }
                        };
                    }
                }
                return { stats: state.stats };
            }),

            setOrbit: (contactId, newOrbit) => set((state) => ({
                contacts: state.contacts.map((c) =>
                    c.id === contactId ? {
                        ...c,
                        orbit: newOrbit,
                        physics: { ...c.physics, lastOrbitChange: new Date().toISOString() }
                    } : c
                )
            })),

            applyDriftPhysics: () => set((state) => ({
                contacts: state.contacts.map((c) => {
                    // Placeholder for more complex physics
                    // Currently just updating status based on time
                    // Real physics might change 'mass' or 'velocity'
                    const newStatus = calculateDriftStatus(c.lastContacted, c.targetFrequencyDays, c.orbit);
                    return {
                        ...c,
                        driftStatus: newStatus
                    };
                })
            })),
        }),
        {
            name: 'bonder-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
