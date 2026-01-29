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
    userId: number; // Sequential user ID (e.g., 1, 2, 3...)
    displayName: string; // User's display name, starts as "User #XX"
    timezone: string; // IANA timezone string (e.g., "America/Denver")
    createdAt: string; // ISO Date when user first visited
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

const MAX_DAILY_POINTS = 150; // Cap daily earnings

interface AppState {
    contacts: Contact[];
    availableTags: string[]; // Global list of available tags
    stats: UserStats;
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

    // Note Actions
    deleteNote: (contactId: string, noteId: string) => void;

    // Favorite Actions
    toggleFavorite: (id: string) => void;
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
            availableTags: ['Family', 'Friends', 'Colleagues', 'Others'], // Defaults
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

                const reward = 10;
                set((state) => ({
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
                        points: state.stats.points + reward,
                        totalInteractions: state.stats.totalInteractions + 1,
                        pointHistory: [{
                            id: uuidv4(),
                            date: now,
                            points: reward,
                            reason: 'Logged generic interaction',
                            source: 'interaction'
                        }, ...state.stats.pointHistory]
                    }
                }));

                checkStreak();
            },

            logInteractionDetailed: (contactId, type, vibe, notes) => {
                const now = new Date().toISOString();
                const { checkStreak } = get();

                const reward = 15;
                set((state) => ({
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
                        points: state.stats.points + reward,
                        totalInteractions: state.stats.totalInteractions + 1,
                        pointHistory: [{
                            id: uuidv4(),
                            date: now,
                            points: reward,
                            reason: `Logged ${type}`,
                            source: 'interaction'
                        }, ...state.stats.pointHistory]
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
                // Check cap
                if (state.stats.dailyPointsEarned >= MAX_DAILY_POINTS) {
                    return state; // No more points today
                }

                const reward = method === 'pay' ? 100 : 50;
                // Ensure we don't go over cap too crazily, but standard tasks are fine to hit it.
                // Actually, if they are at 140 and get 50, let them have 190. 
                // Strict hard cap would be: Math.min(state.stats.points + reward, state.stats.points + (MAX - earned))

                return {
                    stats: {
                        ...state.stats,
                        points: state.stats.points + reward,
                        dailyPointsEarned: state.stats.dailyPointsEarned + reward,
                        dailyTaskCompleted: true,
                        lastDailyTaskDate: new Date().toISOString(),
                        pointHistory: [{
                            id: uuidv4(),
                            date: new Date().toISOString(),
                            points: reward,
                            reason: 'Completed Daily Quest',
                            source: 'daily_task'
                        }, ...state.stats.pointHistory]
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
                                dailyTaskCompleted: false,
                                dailyPointsEarned: 0 // Reset daily cap
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
                    pointHistory: []
                },
                userProfile: null
            })),

            // Initialize User Profile
            initializeProfile: () => set((state) => {
                // If profile already exists, don't reinitialize
                if (state.userProfile) return state;

                // Generate sequential user ID based on timestamp (simulating unique sequential ID)
                // In production, this would come from a backend counter
                const storedCounter = localStorage.getItem('bonder-user-counter');
                const userCounter = storedCounter ? parseInt(storedCounter, 10) + 1 : 1;
                localStorage.setItem('bonder-user-counter', userCounter.toString());

                // Detect timezone
                const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

                return {
                    userProfile: {
                        userId: userCounter,
                        displayName: `User #${userCounter.toString().padStart(2, '0')}`,
                        timezone,
                        createdAt: new Date().toISOString()
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
                ),
            })),

            getLeaderboard: (type) => {
                const state = get();
                const userXP = state.stats.points;
                const userLevel = Math.floor(userXP / 100) + 1;

                // MOCK DATA - In real app, fetch from backend
                const globalEntries: LeaderboardEntry[] = [
                    { id: '1', name: "Sarah K.", points: userXP + 2500, rank: 1, level: Math.floor((userXP + 2500) / 100) + 1, isFriend: false },
                    { id: '2', name: "Mike R.", points: userXP + 1200, rank: 2, level: Math.floor((userXP + 1200) / 100) + 1, isFriend: false },
                    { id: '3', name: "Alex T.", points: userXP + 800, rank: 3, level: Math.floor((userXP + 800) / 100) + 1, isFriend: true },
                    { id: '4', name: "Jessica P.", points: userXP + 400, rank: 4, level: Math.floor((userXP + 400) / 100) + 1, isFriend: false },
                    // User
                    { id: 'user', name: state.userProfile?.displayName || "You", points: userXP, rank: 5, level: userLevel, isFriend: false, isUser: true },
                    { id: '5', name: "David L.", points: Math.max(0, userXP - 200), rank: 6, level: Math.max(1, Math.floor((userXP - 200) / 100) + 1), isFriend: true },
                ];

                const friendsEntries: LeaderboardEntry[] = globalEntries.filter(e => e.isFriend || e.isUser)
                    .sort((a, b) => b.points - a.points)
                    .map((e, index) => ({ ...e, rank: index + 1 }));

                return type === 'global' ? globalEntries : friendsEntries;
            },
        }),
        {
            name: 'bonder-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
