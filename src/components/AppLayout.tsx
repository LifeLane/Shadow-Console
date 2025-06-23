
"use client";

import React, { useState, useEffect } from 'react';
import { Brain, Bot, Gift, ListChecks, Settings as SettingsIcon, Sparkles, Moon, Sun, Trophy } from 'lucide-react';
import MindTab from '@/components/tabs/MindTab';
import AgentsTab from '@/components/tabs/AgentsTab';
import AirdropTab from '@/components/tabs/AirdropTab';
import MissionsTab from '@/components/tabs/MissionsTab';
import LeaderboardTab from '@/components/tabs/LeaderboardTab';
import SettingsTab from '@/components/tabs/SettingsTab';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion'; // Import framer-motion

type TabId = 'mind' | 'agents' | 'airdrop' | 'missions' | 'leaderboard' | 'settings';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ElementType;
  component: React.ElementType;
  description?: string;
}

const tabs: Tab[] = [
  { id: 'mind', label: "Shadow's Mind", icon: Brain, component: MindTab, description: "Console + Result Viewer" },
  { id: 'agents', label: 'Agents', icon: Bot, component: AgentsTab, description: "Deployable Shadow agents (strategies)" },
  { id: 'airdrop', label: 'Airdrop Hub', icon: Gift, component: AirdropTab, description: "Claim airdrops, complete quests" },
  { id: 'missions', label: 'Missions', icon: ListChecks, component: MissionsTab, description: "Daily streaks, testnet tasks" },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, component: LeaderboardTab, description: "Top agents by contribution"},
  { id: 'settings', label: 'Settings', icon: SettingsIcon, component: SettingsTab, description: "Wallets, APIs, theme" },
];

const pageTransitionVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};

export default function AppLayout() {
  const [activeTab, setActiveTab] = useState<TabId>('mind');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || (() => <div className="text-center p-4 sm:p-8">Component not found. Select a tab.</div>);

  const handleTabChange = (tabId: TabId) => {
    if (tabId !== activeTab) {
      setActiveTab(tabId);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background/80 text-foreground font-body backdrop-blur-sm">
      <header className="sticky top-0 z-50 flex items-center justify-between p-3 sm:p-4 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center">
          <Sparkles className="h-7 w-7 sm:h-8 sm:w-8 mr-2 text-primary" />
          <h1 className="text-xl sm:text-2xl font-headline font-bold text-primary">Shadow Trader <span className="text-xs text-muted-foreground align-super">v2.0</span></h1>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </header>

      <main className="flex-grow overflow-y-auto">
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab} // Key helps AnimatePresence detect component changes
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageTransitionVariants}
              transition={pageTransitionVariants.transition}
            >
              <ActiveComponent />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <footer className="border-t border-border bg-background/80 backdrop-blur-md">
        <nav className="container mx-auto grid grid-cols-6 items-center h-16 sm:h-20 px-1">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center h-full px-0.5 sm:px-1 text-[0.6rem] sm:text-xs group transition-all duration-300 ease-out transform hover:scale-105 w-full rounded-none",
                activeTab === tab.id
                  ? 'text-primary scale-110'
                  : 'text-muted-foreground'
              )}
              aria-current={activeTab === tab.id ? 'page' : undefined}
              title={tab.label}
            >
              <div className={cn(
                "p-1.5 sm:p-2 rounded-full transition-all duration-300 ease-out",
                 activeTab === tab.id
                    ? 'bg-primary/10 glow-border-primary animate-pulse-glow-primary opacity-100'
                    : 'opacity-70 group-hover:opacity-100 group-hover:bg-accent group-hover:glow-border-primary'
              )}>
                <tab.icon className={cn(
                    "h-4 w-4 sm:h-5 sm:w-6",
                     activeTab === tab.id ? 'text-primary' : 'text-muted-foreground group-hover:text-accent-foreground'
                  )}
                />
              </div>
              <span className={cn(
                  "mt-0.5 sm:mt-1 font-medium truncate max-w-[50px] sm:max-w-none hidden sm:inline-block",
                  activeTab === tab.id ? 'text-primary' : 'text-muted-foreground group-hover:text-accent-foreground'
                )}
              >
                {tab.label}
              </span>
            </Button>
          ))}
        </nav>
      </footer>
    </div>
  );
}
