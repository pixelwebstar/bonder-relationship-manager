import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

// --- Types ---

export interface Note {
    id: string;
    content: string;
    createdAt: string; // ISO Date
    isPinned?: boolean;
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

export interface HealthHistoryItem {
    id: string;
    date: string;
    score: number;
    change: number;
    reason: 'interaction' | 'decay' | 'snooze' | 'manual';
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

export interface UserProfile {
    userId: string;
    displayName: string;
    timezone: string;
    createdAt: string;
    avatar: string | null;
    isPro: boolean;
    isConnected: boolean;
    accountNumber: number; // 0 if disconnected, sequential integer if connected
}

export interface Contact {
    id: string;
    name: string;
    phoneNumber?: string;
    email?: string;
    avatar?: string;
    context?: string; // "Who they are" / Origin story
    tags: string[];

    // Relationship Health
    lastContacted: string; // ISO Date
    targetFrequencyDays: number; // e.g., 7 for weekly, 30 for monthly
    healthScore: number; // 0-100, calculated
    healthHistory: HealthHistoryItem[];

    // Social OS Core
    orbit: OrbitLayer;
    driftStatus: DriftState; // Replacing simple 'connected'|'drifting'|'fading' from before, or mapping it.
    physics: SocialPhysics;
    maxDriftVelocity: number; // How fast they seemingly drift away

    // Content
    notes: Note[];

    // Snooze
    snoozedUntil?: string; // ISO Date - if set, pause drift alerts until this date

    // Favorites
    isFavorite?: boolean;

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

    // Anti-Abuse
    dailyPointsEarned: number;
    dailyInteractionXP: number; // Tracks XP from interactions (cap at 90)
    dailyCountedXP: number; // Tracks XP that actually increased the level (cap at 100)

    // History
    pointHistory: PointHistoryItem[];
}

export interface PointHistoryItem {
    id: string;
    date: string;
    points: number;
    reason: string;
    source: 'interaction' | 'daily_task' | 'bonus' | 'streak';
}

export interface LeaderboardEntry {
    id: string;
    name: string;
    avatar?: string;
    points: number;
    rank: number;
    level: number;
    isFriend: boolean;
    isUser?: boolean;
}

const MAX_COUNTED_DAILY_POINTS = 100; // Only 100 XP counts towards leveling per day
const MAX_INTERACTION_DAILY_XP = 90; // All interactions combined cap at 90 XP
const DAILY_BOOST_XP = 50; // Daily reward (ad/pay) is 50 XP

interface AppState {
    contacts: Contact[];
    availableTags: string[]; // Global list of available tags
    stats: UserStats;
    notificationsEnabled: boolean;
    userProfile: UserProfile | null;

    // Actions
    addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'healthScore' | 'notes' | 'lastContacted' | 'orbit' | 'driftStatus' | 'physics' | 'maxDriftVelocity' | 'healthHistory'>) => void;
    updateContact: (id: string, updates: Partial<Contact>) => void;
    deleteContact: (id: string) => void;
    addTag: (tag: string) => void; // Add new custom tag
    addNote: (contactId: string, content: string) => void;
    togglePinNote: (contactId: string, noteId: string) => void; // NEW
    logInteraction: (contactId: string) => void;
    // New: Detailed Logging
    logInteractionDetailed: (contactId: string, type: InteractionType, vibe: InteractionVibe, notes?: string) => void;
    calculateHealth: () => void; // Call periodically or on load

    // Gamification
    checkStreak: () => void;
    getLeaderboard: (type: 'global' | 'friends') => LeaderboardEntry[];

    // Monetization
    completeDailyTask: (method: 'ad' | 'pay') => void;
    checkDailyTaskReset: () => void;

    // Social OS Actions
    setOrbit: (contactId: string, newOrbit: OrbitLayer) => void;
    applyDriftPhysics: () => void; // Run physics simulation

    // Bulk / Management Actions
    deleteContacts: (ids: string[]) => void;
    snoozeContact: (id: string, days: number) => void;
    clearSnooze: (id: string) => void;
    clearAllData: () => void;

    // User Profile Actions
    initializeProfile: () => void;
    updateDisplayName: (name: string) => void;
    updateProfile: (updates: Partial<UserProfile>) => void;
    connectToCloud: () => void; // New action to set permanent ID

    // Note Actions
    deleteNote: (contactId: string, noteId: string) => void;

    // Favorite Actions
    toggleFavorite: (id: string) => void;
    toggleNotifications: () => void;
}

// --- Utils ---

const calculateHealthScore = (lastContacted: string, targetDays: number): number => {
    // If target is 0 ("Never"), health never decays
    if (targetDays === 0) return 100;

    const now = new Date();
    const last = new Date(lastContacted);
    const diffTime = Math.abs(now.getTime() - last.getTime());
    // Use float days for smoother minute-by-minute decay if needed, but Math.ceil implies "day started = damage done"
    // Users prefer "exact", so let's use exact fractional days for the linear formula
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays <= 0.1) return 100; // Grace period of a few hours

    // Linear Decay: 0% at exactly targetDays
    // Rate = 100 / targetDays per day
    const decayPerDay = 100 / targetDays;
    const score = 100 - (diffDays * decayPerDay);

    return Math.max(0, Math.min(100, Math.round(score)));
};

// Updated Logic with Orbit Awareness & Linear Thresholds
const calculateDriftStatus = (lastContacted: string, targetDays: number, orbit: OrbitLayer): DriftState => {
    if (targetDays === 0) return 'stable';

    const now = new Date();
    const last = new Date(lastContacted);
    const diffTime = Math.abs(now.getTime() - last.getTime());
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    // Linear Thresholds based on % health
    // > 75% = Stable
    // 40% - 75% = Drifting
    // 15% - 40% = Fading
    // < 15% = Ghost

    const decayPerDay = 100 / targetDays;
    const health = 100 - (diffDays * decayPerDay);

    if (health > 75) return 'stable';
    if (health > 40) return 'drifting';
    if (health > 15) return 'fading';
    return 'ghost';
};

// --- Store ---

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            contacts: [],
            availableTags: ['Family', 'Friends', 'Colleagues', 'Others'], // Defaults
            notificationsEnabled: true,
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
                },
                dailyPointsEarned: 0,
                dailyInteractionXP: 0,
                dailyCountedXP: 0,
                pointHistory: []
            },

            userProfile: null,

            addContact: (contactData) => set((state) => {
                const newContact: Contact = {
                    id: uuidv4(),
                    createdAt: new Date().toISOString(),
                    lastContacted: new Date().toISOString(),
                    healthScore: 100,
                    notes: [],
                    healthHistory: [],
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

            addTag: (tag) => set((state) => {
                const normalizedTag = tag.trim();
                if (state.availableTags.includes(normalizedTag)) return state;
                return { availableTags: [...state.availableTags, normalizedTag] };
            }),

            addNote: (contactId, content) => set((state) => ({
                contacts: state.contacts.map((c) => {
                    if (c.id === contactId) {
                        return {
                            ...c,
                            notes: [{ id: uuidv4(), content, createdAt: new Date().toISOString(), isPinned: false }, ...c.notes]
                        };
                    }
                    return c;
                }),
            })),

            togglePinNote: (contactId, noteId) => set((state) => ({
                contacts: state.contacts.map((c) =>
                    c.id === contactId
                        ? {
                            ...c,
                            notes: c.notes.map(n => n.id === noteId ? { ...n, isPinned: !n.isPinned } : n)
                        }
                        : c
                ),
            })),

            logInteraction: (contactId) => {
                const now = new Date().toISOString();
                const { checkStreak } = get();
                const potentialReward = 5; // Reduced from 10

                set((state) => {
                    // 1. Calculate how much interaction XP remains
                    const interactionXPRemaining = Math.max(0, MAX_INTERACTION_DAILY_XP - state.stats.dailyInteractionXP);
                    const interactionPointsToAdd = Math.min(potentialReward, interactionXPRemaining);

                    // 2. Calculate how much leveling XP remains
                    const levelingXPRemaining = Math.max(0, MAX_COUNTED_DAILY_POINTS - state.stats.dailyCountedXP);
                    const pointsToCount = Math.min(interactionPointsToAdd, levelingXPRemaining);

                    const effectiveXPAdded = pointsToCount;

                    return {
                        contacts: state.contacts.map((c) => {
                            if (c.id === contactId) {
                                const oldScore = c.healthScore;
                                const newScore = 100;
                                const historyItem: HealthHistoryItem = {
                                    id: uuidv4(),
                                    date: now,
                                    score: newScore,
                                    change: newScore - oldScore,
                                    reason: 'interaction'
                                };

                                return {
                                    ...c,
                                    lastContacted: now,
                                    healthScore: newScore,
                                    driftStatus: 'stable',
                                    healthHistory: [historyItem, ...(c.healthHistory || [])]
                                };
                            }
                            return c;
                        }),
                        stats: {
                            ...state.stats,
                            points: state.stats.points + effectiveXPAdded,
                            currentStreak: 0, // Will be updated by checkStreak
                            totalInteractions: state.stats.totalInteractions + 1,
                            dailyPointsEarned: state.stats.dailyPointsEarned + interactionPointsToAdd,
                            dailyInteractionXP: state.stats.dailyInteractionXP + interactionPointsToAdd,
                            dailyCountedXP: state.stats.dailyCountedXP + effectiveXPAdded,
                            pointHistory: effectiveXPAdded > 0 ? [{
                                id: uuidv4(),
                                date: now,
                                points: effectiveXPAdded,
                                reason: 'Logged generic interaction',
                                source: 'interaction'
                            }, ...state.stats.pointHistory] : state.stats.pointHistory
                        }
                    };
                });

                checkStreak();
            },

            logInteractionDetailed: (contactId, type, vibe, notes) => {
                const now = new Date().toISOString();
                const { checkStreak } = get();
                const potentialReward = 10; // Reduced from 15

                set((state) => {
                    const interactionXPRemaining = Math.max(0, MAX_INTERACTION_DAILY_XP - state.stats.dailyInteractionXP);
                    const interactionPointsToAdd = Math.min(potentialReward, interactionXPRemaining);

                    const levelingXPRemaining = Math.max(0, MAX_COUNTED_DAILY_POINTS - state.stats.dailyCountedXP);
                    const pointsToCount = Math.min(interactionPointsToAdd, levelingXPRemaining);

                    const effectiveXPAdded = pointsToCount;

                    return {
                        contacts: state.contacts.map((c) => {
                            if (c.id === contactId) {
                                // Always create a note for the timeline
                                const noteContent = notes ? `[${type.toUpperCase()}] ${notes}` : `Logged ${type === 'orbit_move' ? 'orbit change' : type}`;
                                const newNotes = [{ id: uuidv4(), content: noteContent, createdAt: now }, ...c.notes];
                                return {
                                    ...c,
                                    lastContacted: now,
                                    healthScore: 100,
                                    driftStatus: 'stable',
                                    notes: newNotes,
                                    healthHistory: [{
                                        id: uuidv4(),
                                        date: now,
                                        score: 100,
                                        change: 100 - c.healthScore,
                                        reason: 'interaction'
                                    }, ...(c.healthHistory || [])]
                                };
                            }
                            return c;
                        }),
                        stats: {
                            ...state.stats,
                            points: state.stats.points + effectiveXPAdded,
                            currentStreak: 0, // Will be updated by checkStreak
                            totalInteractions: state.stats.totalInteractions + 1,
                            dailyPointsEarned: state.stats.dailyPointsEarned + interactionPointsToAdd,
                            dailyInteractionXP: state.stats.dailyInteractionXP + interactionPointsToAdd,
                            dailyCountedXP: state.stats.dailyCountedXP + effectiveXPAdded,
                            pointHistory: interactionPointsToAdd > 0 ? [{
                                id: uuidv4(),
                                date: now,
                                points: interactionPointsToAdd,
                                reason: `Logged ${type}`,
                                source: 'interaction'
                            }, ...state.stats.pointHistory] : state.stats.pointHistory
                        }
                    };
                });

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
                })).map(c => {
                    // Logic to detect meaningful decay and log it
                    // This is tricky because calculateHealth might be called often.
                    // We only want to log if the score CHANGED significantly or it's a new day?
                    // For now, let's just log if it went down. 
                    // To avoid spam, we can check the last history item.

                    const oldScore = state.contacts.find(old => old.id === c.id)?.healthScore || c.healthScore;
                    if (c.healthScore < oldScore) {
                        const lastHistory = c.healthHistory?.[0];
                        const isSameDay = lastHistory && new Date(lastHistory.date).toDateString() === new Date().toDateString();

                        // If we already logged a decay today, maybe update it or skip?
                        // Let's skip to avoid spamming "decay" every second if the app re-renders or something calls this loop.
                        if (!isSameDay || lastHistory?.reason !== 'decay') {
                            const historyItem: HealthHistoryItem = {
                                id: uuidv4(),
                                date: new Date().toISOString(),
                                score: c.healthScore,
                                change: c.healthScore - oldScore,
                                reason: 'decay'
                            };
                            return { ...c, healthHistory: [historyItem, ...(c.healthHistory || [])] };
                        }
                    }
                    return c;
                })
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
                if (state.stats.dailyTaskCompleted) return state;

                // Daily Reward follows the same counting rule
                const potentialXP = DAILY_BOOST_XP;
                const levelingXPRemaining = Math.max(0, MAX_COUNTED_DAILY_POINTS - state.stats.dailyCountedXP);
                const pointsToCount = Math.min(potentialXP, levelingXPRemaining);

                return {
                    stats: {
                        ...state.stats,
                        points: state.stats.points + pointsToCount,
                        dailyPointsEarned: state.stats.dailyPointsEarned + potentialXP,
                        dailyCountedXP: state.stats.dailyCountedXP + pointsToCount,
                        dailyTaskCompleted: true, // Lock it
                        lastDailyTaskDate: new Date().toISOString(),
                        pointHistory: [{
                            id: uuidv4(),
                            date: new Date().toISOString(),
                            points: potentialXP,
                            reason: 'Daily Boost',
                            source: 'daily_task'
                        }, ...state.stats.pointHistory]
                    }
                };
            }),

            checkDailyTaskReset: () => set((state) => {
                const now = new Date();
                const lastTask = new Date(state.stats.lastDailyTaskDate);

                if (now.toDateString() !== lastTask.toDateString()) {
                    return {
                        stats: {
                            ...state.stats,
                            dailyTaskCompleted: false,
                            dailyPointsEarned: 0,
                            dailyInteractionXP: 0,
                            dailyCountedXP: 0 // Reset daily cap
                        }
                    };
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
                    // Skip drift calculation if snoozed
                    if (c.snoozedUntil && new Date(c.snoozedUntil) > new Date()) {
                        return { ...c, driftStatus: 'stable' };
                    }
                    const newStatus = calculateDriftStatus(c.lastContacted, c.targetFrequencyDays, c.orbit);
                    return {
                        ...c,
                        driftStatus: newStatus
                    };
                })
            })),

            // Bulk Delete
            deleteContacts: (ids) => set((state) => ({
                contacts: state.contacts.filter((c) => !ids.includes(c.id)),
            })),

            // Snooze Contact
            snoozeContact: (id, days) => set((state) => {
                const snoozedUntil = new Date();
                snoozedUntil.setDate(snoozedUntil.getDate() + days);
                return {
                    contacts: state.contacts.map((c) =>
                        c.id === id ? { ...c, snoozedUntil: snoozedUntil.toISOString() } : c
                    ),
                };
            }),

            // Clear Snooze
            clearSnooze: (id) => set((state) => ({
                contacts: state.contacts.map((c) =>
                    c.id === id ? { ...c, snoozedUntil: undefined } : c
                ),
            })),

            // Clear All Data
            clearAllData: () => set(() => ({
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
                        socialAnxietyLevel: 3,
                        completedChallenges: []
                    },
                    dailyPointsEarned: 0,
                    dailyInteractionXP: 0,
                    dailyCountedXP: 0,
                    pointHistory: []
                },
                userProfile: null
            })),

            // Initialize User Profile
            initializeProfile: () => set((state) => {
                // If profile already exists, don't reinitialize
                if (state.userProfile) return state;

                // Default placeholder ID (10 zeros)
                const userId = "U-0000000000";
                const displayName = "Valentine";

                // Detect timezone
                const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

                return {
                    userProfile: {
                        userId: userId,
                        displayName: displayName,
                        timezone,
                        createdAt: new Date().toISOString(),
                        avatar: null,
                        isPro: false,
                        isConnected: false,
                        accountNumber: 0
                    }
                };
            }),

            updateProfile: (updates) => set((state) => {
                if (!state.userProfile) return state;
                return {
                    userProfile: {
                        ...state.userProfile,
                        ...updates
                    }
                };
            }),

            // Update Display Name
            updateDisplayName: (name) => set((state) => {
                if (!state.userProfile) return state;
                return {
                    userProfile: {
                        ...state.userProfile,
                        displayName: name
                    }
                };
            }),

            // Connect to Cloud (assign permanent ID)
            connectToCloud: () => set((state) => {
                if (!state.userProfile || state.userProfile.isConnected) return state;

                // Get next sequential ID from local counter
                const storedCounter = localStorage.getItem('bonder-user-global-counter');
                const nextCounter = storedCounter ? parseInt(storedCounter, 10) + 1 : 1;
                localStorage.setItem('bonder-user-global-counter', nextCounter.toString());

                // Format: U-0000000001 (10 digits total)
                const permanentId = `U-${nextCounter.toString().padStart(10, '0')}`;

                return {
                    userProfile: {
                        ...state.userProfile,
                        userId: permanentId,
                        isConnected: true
                    }
                };
            }),

            // Delete Note
            deleteNote: (contactId, noteId) => set((state) => ({
                contacts: state.contacts.map((c) =>
                    c.id === contactId
                        ? { ...c, notes: c.notes.filter((n) => n.id !== noteId) }
                        : c
                ),
            })),

            // Toggle Favorite
            toggleFavorite: (id) => set((state) => ({
                contacts: state.contacts.map((c) =>
                    c.id === id ? { ...c, isFavorite: !c.isFavorite } : c
                )
            })),

            toggleNotifications: () => set((state) => ({
                notificationsEnabled: !state.notificationsEnabled
            })),

            getLeaderboard: (type) => {
                // Return empty for now as requested earlier
                return [];
            },
        }),
        {
            name: 'bonder-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
