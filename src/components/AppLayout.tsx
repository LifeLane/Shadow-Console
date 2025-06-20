
"use client";

import React, { useState, useEffect } from 'react';
import { Home, Trophy, Gift, ListChecks, Settings as SettingsIcon, Sparkles, Moon, Sun } from 'lucide-react';
import HomeTab from '@/components/tabs/HomeTab';
import LeaderboardTab from '@/components/tabs/LeaderboardTab';
import AirdropTab from '@/components/tabs/AirdropTab';
import TasksTab from '@/components/tabs/TasksTab';
import SettingsTab from '@/components/tabs/SettingsTab';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

type TabId = 'home' | 'leaderboard' | 'airdrop' | 'tasks' | 'settings';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ElementType;
  component: React.ElementType;
}

const tabs: Tab[] = [
  { id: 'home', label: "Shadow's Mind", icon: Home, component: HomeTab },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, component: LeaderboardTab },
  { id: 'airdrop', label: 'Airdrop', icon: Gift, component: AirdropTab },
  { id: 'tasks', label: 'Tasks', icon: ListChecks, component: TasksTab },
  { id: 'settings', label: 'Settings', icon: SettingsIcon, component: SettingsTab },
];

export default function AppLayout() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isTabAnimating, setIsTabAnimating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || (() => null);

  const handleTabChange = (tabId: TabId) => {
    if (tabId !== activeTab) {
      setIsTabAnimating(true);
      setActiveTab(tabId);
      setTimeout(() => setIsTabAnimating(false), 300);
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
          <h1 className="text-2xl font-headline font-bold text-primary">Shadow Trader</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </header>

      <main className="flex-grow pt-20 pb-24 overflow-y-auto">
        <div className="container mx-auto px-4 py-8">
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
        <nav className="container mx-auto flex justify-around items-center h-20 px-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost" // On hover: bg-accent, text-accent-foreground (handles text color correctly)
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center h-full px-2 text-xs group transition-all duration-300 ease-out transform hover:scale-105",
                activeTab === tab.id
                  ? 'text-primary scale-110' // Active state: text is primary
                  : 'text-muted-foreground'   // Non-active: initial text is muted. Hover color is handled by variant="ghost"
              )}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              <div className={cn(
                "p-2 rounded-full transition-all duration-300 ease-out",
                activeTab === tab.id
                  ? 'bg-primary/10 glow-border-primary opacity-100'
                  : 'opacity-70 group-hover:opacity-100 group-hover:glow-border-primary' // Icon container gets glow on hover
              )}>
                <tab.icon className={cn(
                    "h-6 w-6",
                     activeTab === tab.id ? 'text-primary' : '' // Active icon text primary, non-active inherits from Button
                  )}
                />
              </div>
              <span className={cn(
                  "mt-1 font-medium",
                  activeTab === tab.id ? 'text-primary' : '' // Active label text primary, non-active inherits from Button
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
