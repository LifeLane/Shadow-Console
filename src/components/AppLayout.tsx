
"use client";

import React, { useState, useEffect } from 'react';
import { BrainCircuit, Trophy, Gift, ScrollText, Settings, Sparkles } from 'lucide-react';
import MindTab from '@/components/tabs/MindTab';
import LeaderboardTab from '@/components/tabs/LeaderboardTab';
import AirdropTab from '@/components/tabs/AirdropTab';
import TasksTab from '@/components/tabs/TasksTab';
import SettingsTab from '@/components/tabs/SettingsTab';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { setupAndSeedLocalData } from '@/services/setupService';
import { useToast } from '@/hooks/use-toast';
import { resolveOpenTradesAction } from '@/app/agents/actions';
import { resolvePendingSignalsAction } from '@/app/mind/actions';

type TabId = 'mind' | 'leaderboard' | 'airdrop' | 'tasks' | 'settings';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ElementType;
  component: React.ElementType;
}

const tabs: Tab[] = [
  { id: 'mind', label: "Mind", icon: BrainCircuit, component: MindTab },
  { id: 'leaderboard', label: "Leaderboard", icon: Trophy, component: LeaderboardTab },
  { id: 'airdrop', label: 'Airdrop', icon: Gift, component: AirdropTab },
  { id: 'tasks', label: 'Tasks', icon: ScrollText, component: TasksTab },
  { id: 'settings', label: 'Settings', icon: Settings, component: SettingsTab },
];

const pageTransitionVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};


export default function AppLayout() {
  const [activeTab, setActiveTab] = useState<TabId>('mind');
  const { toast } = useToast();
  const [isDbInitialized, setIsDbInitialized] = useState(false);

  useEffect(() => {
    async function initializeDataStore() {
        try {
            console.log("Initializing local file-based data store for Shadow Trader...");
            await setupAndSeedLocalData();
            console.log("Local data store initialization complete.");
            setIsDbInitialized(true);
        } catch (error) {
            console.error("Failed to initialize local data store:", error);
            toast({
                title: "Data Store Error",
                description: "Could not initialize the application's local data files. Some features may not work correctly.",
                variant: "destructive",
            });
        }
    }
    initializeDataStore();
  }, [toast]);
  
  useEffect(() => {
    if (!isDbInitialized) return;

    // We can keep these background resolvers for now
    const tradeResolverInterval = setInterval(async () => {
      try {
        await resolveOpenTradesAction();
      } catch (error) {
        console.error("Error resolving trades:", error);
      }
    }, 15000); 

    const signalResolverInterval = setInterval(async () => {
      try {
        const resolvedSignals = await resolvePendingSignalsAction();
        resolvedSignals.forEach(signal => {
          toast({
            title: `Signal Resolved`,
            description: signal.message,
            variant: signal.result === 'WIN' ? 'default' : 'destructive'
          });
        });
      } catch (error) {
        console.error("Error resolving signals:", error);
      }
    }, 30000); 

    return () => {
      clearInterval(tradeResolverInterval);
      clearInterval(signalResolverInterval);
    }
  }, [isDbInitialized, toast]);

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || (() => <div className="text-center p-8">Select a tab.</div>);
  
  const handleTabChange = (tabId: TabId) => {
    if (tabId !== activeTab) {
      setActiveTab(tabId);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <header className="sticky top-0 z-50 flex items-center justify-between p-3 sm:p-4 bg-background/90 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center">
          <Sparkles className="h-7 w-7 sm:h-8 sm:w-8 mr-2 text-primary animate-pulse" />
          <h1 className="text-xl sm:text-2xl font-headline font-bold text-foreground">Shadow <span className="text-primary">Trader</span></h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransitionVariants}
            transition={pageTransitionVariants.transition}
          >
            <ActiveComponent 
              isDbInitialized={isDbInitialized}
            />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="sticky bottom-0 z-40 border-t border-border/50 bg-background/90 backdrop-blur-md">
        <nav className="container mx-auto grid grid-cols-5 items-center h-16 sm:h-20 px-1">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center h-full px-0.5 sm:px-1 text-[0.6rem] sm:text-xs group transition-all duration-300 ease-out transform hover:scale-105 w-full rounded-none",
                activeTab === tab.id
                  ? 'text-primary scale-110'
                  : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
              )}
              aria-current={activeTab === tab.id ? 'page' : undefined}
              title={tab.label}
            >
              <div className={cn(
                "p-1.5 sm:p-2 rounded-full transition-all duration-300 ease-out relative",
                 activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'opacity-70 group-hover:opacity-100'
              )}>
                 {activeTab === tab.id && <div className="absolute inset-0 rounded-full bg-primary animate-pulse z-0"></div>}
                <tab.icon className="h-5 w-5 sm:h-6 sm:w-6 relative z-10" />
              </div>
              <span className="mt-0.5 sm:mt-1 font-medium truncate max-w-[50px] sm:max-w-none">
                {tab.label}
              </span>
            </Button>
          ))}
        </nav>
      </footer>
    </div>
  );
}
