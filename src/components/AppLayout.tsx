
"use client";

import React, { useState, useEffect } from 'react';
import { Brain, Bot, Gift, ListChecks, Settings as SettingsIcon, Sparkles, Moon, Sun, Rss } from 'lucide-react';
import MindTab from '@/components/tabs/MindTab'; // Renamed from HomeTab
import AgentsTab from '@/components/tabs/AgentsTab'; // New placeholder
import AirdropTab from '@/components/tabs/AirdropTab';
import MissionsTab from '@/components/tabs/MissionsTab'; // Renamed from TasksTab
import CoreDataStreamsTab from '@/components/tabs/CoreDataStreamsTab'; // New placeholder
import SettingsTab from '@/components/tabs/SettingsTab';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

type TabId = 'mind' | 'agents' | 'airdrop' | 'missions' | 'streams' | 'settings';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ElementType;
  component: React.ElementType;
  description?: string; // For potential future use
}

const tabs: Tab[] = [
  { id: 'mind', label: "Shadow's Mind", icon: Brain, component: MindTab, description: "Console + Result Viewer" },
  { id: 'agents', label: 'Agents', icon: Bot, component: AgentsTab, description: "Deployable Shadow agents (strategies)" },
  { id: 'airdrop', label: 'Airdrop Hub', icon: Gift, component: AirdropTab, description: "Claim airdrops, complete quests" },
  { id: 'missions', label: 'Missions', icon: ListChecks, component: MissionsTab, description: "Daily streaks, testnet tasks" },
  { id: 'streams', label: 'Data Streams', icon: Rss, component: CoreDataStreamsTab, description: "Core data feeds and insights"},
  { id: 'settings', label: 'Settings', icon: SettingsIcon, component: SettingsTab, description: "Wallets, APIs, theme" },
];

export default function AppLayout() {
  const [activeTab, setActiveTab] = useState<TabId>('mind');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isTabAnimating, setIsTabAnimating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || (() => <div className="text-center p-8">Component not found. Select a tab.</div>);

  const handleTabChange = (tabId: TabId) => {
    if (tabId !== activeTab) {
      setIsTabAnimating(true);
      setActiveTab(tabId);
      setTimeout(() => setIsTabAnimating(false), 300); // Duration of the animation
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center">
          <Sparkles className="h-8 w-8 mr-2 text-primary" />
          <h1 className="text-2xl font-headline font-bold text-primary">Shadow Trader <span className="text-xs text-muted-foreground align-super">v2.0</span></h1>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </header>

      <main className="flex-grow pt-20 pb-24 overflow-y-auto"> {/* Added pb-24 for bottom nav space */}
        <div className="container mx-auto px-2 sm:px-4 py-8">
          <div
            className={cn(
              "transition-all duration-300 ease-out",
              isTabAnimating ? 'tab-content-enter' : 'tab-content-enter-active'
            )}
          >
            <ActiveComponent />
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/80 backdrop-blur-md">
        <nav className="container mx-auto grid grid-cols-6 items-center h-20 px-1 sm:px-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center h-full px-1 text-xs group transition-all duration-300 ease-out transform hover:scale-105 w-full rounded-none",
                activeTab === tab.id
                  ? 'text-primary scale-110' 
                  : 'text-muted-foreground' 
              )}
              aria-current={activeTab === tab.id ? 'page' : undefined}
              title={tab.label}
            >
              <div className={cn(
                "p-2 rounded-full transition-all duration-300 ease-out",
                 activeTab === tab.id ? 'bg-primary/10 glow-border-primary animate-pulse-glow-primary opacity-100' : 'opacity-70 group-hover:opacity-100 group-hover:glow-border-primary'
              )}>
                <tab.icon className={cn(
                    "h-5 w-5 sm:h-6 sm:w-6",
                     activeTab === tab.id ? 'text-primary' : 'group-hover:text-primary'
                  )}
                />
              </div>
              <span className={cn(
                  "mt-1 font-medium truncate max-w-[60px] sm:max-w-none", // Truncate label on very small screens
                  activeTab === tab.id ? 'text-primary' : 'group-hover:text-primary'
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

    