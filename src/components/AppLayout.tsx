
"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { BrainCircuit, Landmark, Gift, User, BarChart, Sparkles, Pickaxe, Sun, Atom, Droplets, SquareTerminal, Scroll } from 'lucide-react';
import MindTab from '@/components/tabs/MindTab';
import WalletTab from '@/components/tabs/WalletTab';
import MissionsTab from '@/components/tabs/MissionsTab';
import ProfileTab from '@/components/tabs/ProfileTab';
import TradeTab from '@/components/tabs/TradeTab';
import BackgroundAnimation from './BackgroundAnimation';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { setupAndSeedLocalData } from '@/services/setupService';
import { useToast } from '@/hooks/use-toast';
import { resolveOpenTradesAction } from '@/app/agents/actions';
import { resolvePendingSignalsAction } from '@/app/mind/actions';

type TabId = 'wallet' | 'trade' | 'mind' | 'missions' | 'profile';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ElementType;
  component: React.ElementType;
}

const tabs: Tab[] = [
  { id: 'wallet', label: "Wallet", icon: Pickaxe, component: WalletTab },
  { id: 'trade', label: "Trade", icon: BarChart, component: TradeTab },
  { id: 'mind', label: "Mind", icon: BrainCircuit, component: MindTab },
  { id: 'missions', label: 'Missions', icon: Gift, component: MissionsTab },
  { id: 'profile', label: 'Profile', icon: User, component: ProfileTab },
];

const pageTransitionVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};

const appThemes = [
    { name: 'Solar Flare', icon: Sun, darkClass: 'theme-solar-flare-dark', lightClass: 'theme-solar-flare-light' },
    { name: 'Quantum Core', icon: Atom, darkClass: 'theme-quantum-core-dark', lightClass: 'theme-quantum-core-light' },
    { name: 'Bio-Synthwave', icon: Droplets, darkClass: 'theme-bio-synthwave-dark', lightClass: 'theme-bio-synthwave-light' },
    { name: 'Industrial Glitch', icon: SquareTerminal, darkClass: 'theme-industrial-glitch-dark', lightClass: 'theme-industrial-glitch-light' },
    { name: 'Arcane Codex', icon: Scroll, darkClass: 'theme-arcane-codex-dark', lightClass: 'theme-arcane-codex-light' },
];

export default function AppLayout() {
  const [activeTab, setActiveTab] = useState<TabId>('mind');
  const { toast } = useToast();
  const [isDbInitialized, setIsDbInitialized] = useState(false);
  const { setTheme, theme } = useTheme();
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);

  // Determine if current resolved theme is dark
  const isDarkMode = theme ? theme.endsWith('-dark') : true;

  const handleThemeToggle = () => {
    const newTheme = isDarkMode 
      ? appThemes[currentThemeIndex].lightClass 
      : appThemes[currentThemeIndex].darkClass;
    setTheme(newTheme);
  };
  
  const handleThemeCycle = () => {
    const nextIndex = (currentThemeIndex + 1) % appThemes.length;
    setCurrentThemeIndex(nextIndex);
    const newTheme = isDarkMode 
      ? appThemes[nextIndex].darkClass 
      : appThemes[nextIndex].lightClass;
    setTheme(newTheme);
  };

  const CurrentThemeIcon = appThemes[currentThemeIndex].icon;

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
    <div className="relative flex flex-col min-h-screen bg-background text-foreground font-body">
      <BackgroundAnimation />
      <header className="sticky top-0 z-50 flex items-center justify-between p-3 sm:p-4 bg-background/90 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-2">
          <Sparkles className="h-7 w-7 sm:h-8 sm:w-8 text-primary animate-pulse" />
          <h1 className="text-xl sm:text-2xl font-headline font-bold text-foreground">Block<span className="text-primary">SHADOW</span></h1>
        </div>

        <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleThemeCycle}
              className="h-9 w-9 text-primary hover:bg-primary/10 hover:text-primary/90"
              aria-label="Cycle Theme"
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentThemeIndex}
                        initial={{ opacity: 0, rotate: -30 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 30 }}
                        transition={{ duration: 0.2 }}
                    >
                        <CurrentThemeIcon className="h-5 w-5" />
                    </motion.div>
                </AnimatePresence>
            </Button>
        </div>
      </header>

      <main className="flex-grow flex flex-col p-2 sm:p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransitionVariants}
            transition={pageTransitionVariants.transition}
            className="flex-grow flex flex-col"
          >
            <ActiveComponent 
              isDbInitialized={isDbInitialized}
              setActiveTab={setActiveTab}
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
                "flex flex-col items-center justify-center h-full px-0.5 sm:px-1 text-xs sm:text-sm group transition-all duration-300 ease-out transform hover:scale-105 w-full rounded-none",
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
              <span className="hidden sm:block mt-1 font-medium">
                {tab.label}
              </span>
            </Button>
          ))}
        </nav>
      </footer>
    </div>
  );
}
