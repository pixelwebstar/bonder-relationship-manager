"use client";

import { motion } from "framer-motion";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { BottomNav } from "@/components/layout/BottomNav";
import { Flame, TrendingUp, Heart, ChevronRight, UserPlus, Users } from "lucide-react";
import { useStore } from "@/lib/store";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { DailyTaskWidget } from "@/components/monetization/DailyTaskWidget";
import { OrbitView } from "@/components/social/OrbitView";
import { GhostMode } from "@/components/social/GhostMode";
import { OnboardingModal } from "@/components/layout/OnboardingModal";
import { LayoutGrid, CircleDot } from "lucide-react";
// I'll just import the widget.

// Avatar gradient generator
function AvatarGradient({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const colors = [
    ["#8B5CF6", "#3B82F6"],
    ["#EC4899", "#F97316"],
    ["#10B981", "#3B82F6"],
    ["#F59E0B", "#EF4444"],
    ["#6366F1", "#EC4899"],
  ];
  const colorIndex = (name.charCodeAt(0) || 0) % colors.length;
  const [from, to] = colors[colorIndex];
  const sizeClasses = { sm: "w-10 h-10 text-sm", md: "w-12 h-12 text-base", lg: "w-16 h-16 text-xl" };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold text-white shadow-lg transition-all duration-500`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function HealthIndicator({ health }: { health: number }) {
  const color = health > 70 ? "bg-emerald-500" : health > 40 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <motion.div
        className={`h-full ${color} rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${health}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}

export default function Home() {
  const { contacts, stats, calculateHealth, checkStreak, applyDriftPhysics } = useStore();
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'orbit'>('list');
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
    calculateHealth();
    checkStreak();
    applyDriftPhysics();

    // Check onboarding status
    const hasOnboarded = localStorage.getItem("bonder_has_onboarded");
    if (!hasOnboarded) {
      setTimeout(() => setShowOnboarding(true), 0);
    }
  }, [calculateHealth, checkStreak, applyDriftPhysics]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem("bonder_has_onboarded", "true");
  };

  const urgentContacts = [...contacts].sort((a, b) => a.healthScore - b.healthScore).slice(0, 5);

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
            <p className="text-sm text-muted-foreground font-medium tracking-wide">Good Morning,</p>
            <h1 className="text-3xl font-bold text-gradient">Valentine</h1>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <DailyTaskWidget />
        </motion.div>

        {/* Priority / Urgent Contacts */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-lg font-bold text-foreground">
              {viewMode === 'list' ? 'Priority Reach-outs' : 'Professional Network'}
            </h2>

            <div className="flex bg-secondary rounded-full p-1 gap-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-full transition-all ${viewMode === 'list' ? 'bg-background shadow text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('orbit')}
                className={`p-2 rounded-full transition-all ${viewMode === 'orbit' ? 'bg-background shadow text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <CircleDot className="w-4 h-4" />
              </button>
            </div>
          </div>

          {viewMode === 'orbit' ? (
            <OrbitView />
          ) : (
            <div className="space-y-3">
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

              {urgentContacts.map((contact, index) => (
                <Link href={`/contacts/${contact.id}`} key={contact.id}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="glass-card rounded-[1.25rem] p-4 cursor-pointer mb-3 hover:border-primary/50 transition-colors group"
                  >
                    <div className={`flex items-center gap-4 transition-all duration-500 ${contact.driftStatus === 'fading' ? 'grayscale opacity-70' : ''}`}>
                      <AvatarGradient name={contact.name} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{contact.name}</h3>
                            {contact.driftStatus === 'drifting' && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
                          </div>
                          <span className="text-xs text-muted-foreground font-medium">
                            {formatDistanceToNow(new Date(contact.lastContacted))} ago
                          </span>
                        </div>
                        <HealthIndicator health={contact.healthScore} />
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </motion.div>
                </Link>
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
              {/* Ghost Mode Section */}
              <GhostMode />
            </div>
          )}
        </motion.section>
      </div>

      <BottomNav activeTab="home" />
    </MobileFrame>
  );
}
