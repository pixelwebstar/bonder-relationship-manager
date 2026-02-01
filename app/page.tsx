"use client";

import { motion } from "framer-motion";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { BottomNav } from "@/components/layout/BottomNav";
import { Flame, TrendingUp, Heart, ChevronRight, UserPlus, Users, Network, Star, Phone } from "lucide-react";
import { useStore } from "@/lib/store";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { DailyTaskWidget } from "@/components/monetization/DailyTaskWidget";
import { OrbitView } from "@/components/social/OrbitView";
import { GhostMode } from "@/components/social/GhostMode";
import { OnboardingModal } from "@/components/layout/OnboardingModal";
import { LayoutGrid, CircleDot } from "lucide-react";
import { getTimeBasedGreeting } from "@/lib/greeting";
import { useRouter } from "next/navigation";
import { AvatarGradient } from "@/components/ui/AvatarGradient";
import { HealthBar } from "@/components/ui/HealthBar";



export default function Home() {
  const router = useRouter();
  const { contacts, stats, userProfile, calculateHealth, checkStreak, applyDriftPhysics, initializeProfile, toggleFavorite } = useStore();
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'orbit'>('list');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [greeting, setGreeting] = useState("Good Morning");

  useEffect(() => {
    // Set initial greeting
    setGreeting(getTimeBasedGreeting());

    // Update greeting every minute
    const greetingInterval = setInterval(() => {
      setGreeting(getTimeBasedGreeting());
    }, 60000);

    return () => clearInterval(greetingInterval);
  }, []);

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
    calculateHealth();
    checkStreak();
    applyDriftPhysics();

    // Initialize user profile if not exists
    initializeProfile();

    // Check onboarding status
    const hasOnboarded = localStorage.getItem("bonder_has_onboarded");
    if (!hasOnboarded) {
      setTimeout(() => setShowOnboarding(true), 0);
    }
  }, [calculateHealth, checkStreak, applyDriftPhysics, initializeProfile]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem("bonder_has_onboarded", "true");
  };

  const urgentContacts = [...contacts]
    .filter(c => !c.snoozedUntil || new Date(c.snoozedUntil) <= new Date())
    .sort((a, b) => a.healthScore - b.healthScore)
    .slice(0, 3);

  // Get display name from profile
  const displayName = userProfile?.displayName || "User";

  if (!mounted) return null; // Or a loading spinner

  return (
    <MobileFrame>
      <div className="p-6 pb-28">
        {/* Onboarding Modal */}
        {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <p className="text-sm text-muted-foreground font-medium tracking-wide">{greeting},</p>
            <h1 className="text-3xl font-bold text-gradient">{displayName}</h1>
          </div>
          <Link href="/streaks">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full glass-card hover:bg-white/10 cursor-pointer"
            >
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
              <span className="font-bold text-foreground">{stats.currentStreak}</span>
            </motion.div>
          </Link>
        </motion.header>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          <Link href="/contacts">
            <div className="glass-card rounded-3xl p-5 flex flex-col justify-between h-36 hover:border-primary/50 transition-colors cursor-pointer">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 dark:bg-violet-500/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <span className="text-3xl font-bold text-foreground">{contacts.length}</span>
              </div>
              <div>
                <p className="text-sm font-bold text-foreground/80">Circle</p>
                <p className="text-xs text-muted-foreground">Total Connections</p>
              </div>
            </div>
          </Link>

          <Link href="/contacts">
            <div className="glass-card rounded-3xl p-5 flex flex-col justify-between h-36 hover:border-primary/50 transition-colors cursor-pointer">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-amber-500" />
                </div>
                <span className="text-3xl font-bold text-foreground">{urgentContacts.filter(c => c.healthScore < 50).length}</span>
              </div>
              <div>
                <p className="text-sm font-bold text-foreground/80">Drifting</p>
                <p className="text-xs text-muted-foreground">Needs attention</p>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Daily Task / Monetization */}
        {stats.dailyCountedXP < 100 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            <DailyTaskWidget />
          </motion.div>
        )}

        {/* Priority / Urgent Contacts */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              Priority Reach-outs
            </h2>
          </div>

          <div className="space-y-6">
            {contacts.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 text-center glass-card rounded-3xl border-dashed border-2 border-border"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-8 h-8 text-primary" />
                </div>
                <p className="text-foreground font-medium mb-1">Your circle is empty.</p>
                <p className="text-xs text-muted-foreground mb-4">Start by adding someone you care about.</p>
                <Link href="/add" className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                  Add Contact
                </Link>
              </motion.div>
            )}

            {urgentContacts.map((contact, i) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => router.push(`/contacts/${contact.id}`)}
                className="glass-card p-5 rounded-[2rem] flex items-center justify-between cursor-pointer transition-all border border-transparent hover:bg-white/90 dark:hover:bg-slate-800/80 hover:border-violet-500/20"
              >
                <div className="flex items-center gap-5 w-full">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <AvatarGradient name={contact.name} src={contact.avatar} size="md" />
                  </div>

                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-slate-800 dark:text-white dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] truncate">
                        {contact.name}
                      </h3>
                    </div>

                    {/* Stacked Bar & Status */}
                    <div className="w-full max-w-[180px]">
                      <HealthBar score={contact.healthScore} className="w-full h-2 shadow-[0_0_8px_rgba(139,92,246,0.2)]" />
                    </div>

                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 tracking-wide">
                      {contact.healthScore < 50 ? "Needs attention" : "Healthy Connection"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(contact.id);
                    }}
                    className="p-2 transition-colors"
                  >
                    <Star className={`w-5 h-5 ${contact.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-slate-300 hover:text-amber-400'}`} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `tel:${contact.phoneNumber}`;
                    }}
                    className="p-2 text-slate-300 hover:text-green-500 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}

            {contacts.length > 0 && urgentContacts.length === 0 && (
              <div className="p-8 text-center glass-card rounded-3xl">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="text-foreground font-medium">Everyone is close! 🌟</p>
                <p className="text-sm text-muted-foreground">You are doing a great job maintaining your relationships.</p>
              </div>
            )}

            {/* Network Overview Card - Navigates to /network */}
            <div
              onClick={() => router.push('/network')}
              className="mt-6 glass-card p-6 rounded-3xl cursor-pointer group hover:bg-secondary/50 transition-all border border-violet-500/20 hover:border-violet-500/50 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 group-hover:from-violet-500/10 group-hover:to-fuchsia-500/10 transition-colors" />

              <div className="relative flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400 mb-1">
                    Network Orbit
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Visualize your social solar system
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Network className="w-5 h-5 text-violet-400" />
                </div>
              </div>
            </div>

            {/* Ghost Mode Section */}
            <GhostMode />
          </div>
        </motion.section>
      </div>

      <BottomNav activeTab="home" />
    </MobileFrame>
  );
}
