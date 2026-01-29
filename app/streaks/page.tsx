"use client";

import { useStore } from "@/lib/store";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { BottomNav } from "@/components/layout/BottomNav";
import { motion } from "framer-motion";
import { Flame, Trophy, Star, Zap, Globe, Crown, Users, History, TrendingUp } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

export default function StreaksPage() {
    const { stats, getLeaderboard } = useStore();
    const [activeTab, setActiveTab] = useState<'global' | 'friends'>('global');

    // Levels logic
    const level = Math.floor(stats.points / 100) + 1;
    const progress = stats.points % 100;

    const leaderboard = getLeaderboard(activeTab);
    const history = stats.pointHistory || []; // Fallback for safety

    return (
        <MobileFrame>
            <div className="p-6 pb-28 min-h-screen">
                <h1 className="text-2xl font-bold text-foreground mb-6">Your Journey</h1>

                {/* Main Streak Display */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-orange-400 via-red-500 to-rose-600 p-8 text-white shadow-xl shadow-orange-500/30 mb-8">
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 border border-white/30 shadow-inner">
                            <Flame className="w-10 h-10 text-white fill-white animate-pulse" />
                        </div>
                        <h2 className="text-7xl font-black tracking-tighter">{stats.currentStreak}</h2>
                        <p className="text-lg font-medium opacity-90">Day Streak</p>
                        <div className="mt-6 flex items-center gap-2 text-sm bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                            <Trophy className="w-4 h-4 text-yellow-300" />
                            <span className="font-semibold">Best: {stats.longestStreak} days</span>
                        </div>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
                </div>

                {/* Level Progress */}
                <div className="glass-card p-6 rounded-3xl mb-8 relative overflow-hidden">
                    <div className="flex justify-between items-end mb-3">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Current Level</p>
                            <h3 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                {level} <span className="text-lg text-slate-400 dark:text-slate-500 font-normal">Socialite</span>
                            </h3>
                        </div>
                        <div className="text-right">
                            <p className="text-violet-600 dark:text-violet-400 font-black text-xl">{stats.points} <span className="text-sm font-medium text-slate-400">XP</span></p>
                        </div>
                    </div>

                    <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative shadow-inner">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full relative"
                        >
                            <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]" />
                        </motion.div>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-right font-medium">
                        {100 - progress} XP to next level
                    </p>
                </div>

                {/* Leaderboard Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-amber-500" /> Leaderboard
                        </h3>
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                            <button
                                onClick={() => setActiveTab('global')}
                                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${activeTab === 'global' ? 'bg-white dark:bg-slate-700 shadow-sm text-foreground' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Global
                            </button>
                            <button
                                onClick={() => setActiveTab('friends')}
                                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${activeTab === 'friends' ? 'bg-white dark:bg-slate-700 shadow-sm text-foreground' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Friends
                            </button>
                        </div>
                    </div>

                    <div className="glass-card rounded-3xl overflow-hidden divide-y divide-border/50">
                        {leaderboard.map((entry) => (
                            <LeaderboardItem
                                key={entry.id}
                                rank={entry.rank}
                                name={entry.name}
                                xp={entry.points}
                                isUser={entry.isUser}
                            />
                        ))}
                        {leaderboard.length === 0 && (
                            <div className="p-8 text-center text-slate-400 text-sm">
                                <Users className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p>No friends found in ranking yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Daily Quests */}
                {stats.dailyCountedXP < 100 ? (
                    <>
                        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-500" /> Daily Quests
                        </h3>
                        <div className="space-y-3 mb-8">
                            <QuestItem completed={true} title="Daily Check-in" xp={5} />
                            <QuestItem completed={stats.currentStreak > 0} title="Keep streak alive" xp={10} />
                            <QuestItem completed={stats.totalInteractions >= 3} title="Log 3 interactions" xp={50} />
                        </div>
                    </>
                ) : (
                    <div className="glass-card p-6 rounded-3xl mb-8 border-emerald-500/20 bg-emerald-50/10 text-center">
                        <Trophy className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <h3 className="font-bold text-emerald-600 dark:text-emerald-400">Daily Leveling Cap Reached!</h3>
                        <p className="text-xs text-muted-foreground mt-1">You've reached your 100 XP counted limit for today. You can still earn more "Feel Good" XP, but your level will increase again tomorrow!</p>
                    </div>
                )}

                {/* Points History */}
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <History className="w-5 h-5 text-violet-500" /> Recent Gains
                </h3>
                <div className="glass-card rounded-3xl p-2 max-h-[300px] overflow-y-auto">
                    {history.length > 0 ? (
                        <div className="space-y-1">
                            {history.slice(0, 20).map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center text-violet-500">
                                            {item.source === 'daily_task' ? <Zap className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-foreground">{item.reason}</p>
                                            <p className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(item.date), { addSuffix: true })}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">+{item.points} XP</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-slate-400 text-sm">
                            <History className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            <p>No history yet. Start bonding!</p>
                        </div>
                    )}
                </div>

            </div>
            <BottomNav />
        </MobileFrame>
    );
}

function LeaderboardItem({ rank, name, xp, isUser }: { rank: number; name: string; xp: number; isUser?: boolean }) {
    return (
        <div className={`flex items-center justify-between p-4 ${isUser ? 'bg-violet-50/80 dark:bg-violet-500/20' : 'hover:bg-slate-50/50 dark:hover:bg-white/5'} transition-colors`}>
            <div className="flex items-center gap-4">
                <div className={`w-8 h-8 flex items-center justify-center font-bold rounded-full ${rank === 1 ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400' : rank === 2 ? 'bg-slate-200 text-slate-600' : rank === 3 ? 'bg-orange-100 text-orange-600' : 'text-slate-400'}`}>
                    {rank <= 3 ? <Crown className="w-4 h-4" /> : rank}
                </div>
                <span className={`font-semibold ${isUser ? 'text-violet-700 dark:text-violet-300' : 'text-slate-700 dark:text-slate-200'}`}>{name} (Lvl {Math.floor(xp / 100) + 1})</span>
            </div>
            <span className="font-bold text-sm text-slate-500 dark:text-slate-400">{xp} XP</span>
        </div>
    );
}

function QuestItem({ completed, title, xp }: { completed: boolean; title: string; xp: number }) {
    return (
        <div className={`p-4 rounded-2xl border flex items-center justify-between transition-colors ${completed ? "bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20" : "glass-card border-white/40 dark:border-white/5"}`}>
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${completed ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600"}`}>
                    {completed ? <Star className="w-4 h-4 fill-white" /> : <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600" />}
                </div>
                <div className="flex flex-col">
                    <span className={`font-semibold ${completed ? "text-emerald-800 dark:text-emerald-400 line-through decoration-emerald-500/50" : "text-slate-700 dark:text-slate-200"}`}>
                        {title}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-lg">
                <Zap className="w-3 h-3 fill-amber-500" /> +{xp}
            </div>
        </div>
    );
}
