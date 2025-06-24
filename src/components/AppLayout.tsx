
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Brain, Bot, Gift, ListChecks, Settings as SettingsIcon, Sparkles, Moon, Sun, Trophy, Activity, CheckCircle, DollarSign, Star, Zap, TrendingUp, ShieldCheck, Target, Percent, Shield, Fuel } from 'lucide-react';
import MindTab from '@/components/tabs/MindTab';
import AgentsTab from '@/components/tabs/AgentsTab';
import AirdropTab from '@/components/tabs/AirdropTab';
import MissionsTab from '@/components/tabs/MissionsTab';
import LeaderboardTab from '@/components/tabs/LeaderboardTab';
import SettingsTab from '@/components/tabs/SettingsTab';
import MainnetStats from '@/components/MainnetStats';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { setupDatabaseAndSeed } from '@/app/agents/actions';
import { useToast } from '@/hooks/use-toast';
import type { MarketInsightsInput, MarketInsightsOutput } from '@/ai/flows/generate-market-insights';
import { getLivePrice } from '@/app/actions';
import { saveSignalAction } from '@/app/mind/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import PulsingText from '@/components/PulsingText';
import TypewriterText from '@/components/TypewriterText';
import { Label } from '@/components/ui/label';

type TabId = 'mind' | 'agents' | 'airdrop' | 'missions' | 'leaderboard' | 'settings';
type CoreState = 'idle' | 'simulating' | 'tracking' | 'resolved';

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

// --- SIGNAL MONITOR COMPONENT ---
const getPredictionColor = (prediction?: string) => {
    if (!prediction) return 'text-foreground';
    switch (prediction.toUpperCase()) {
      case 'BUY': return 'text-primary';
      case 'SELL': return 'text-destructive';
      case 'HOLD':
      default: return 'text-yellow-500';
    }
};
const OutputItem: React.FC<{ label: string; value: string | number; valueClassName?: string;}> = ({ label, value, valueClassName }) => (
  <div className="p-3 sm:p-4 border border-border/20 rounded-lg bg-card/50 shadow-md hover:shadow-lg transition-shadow min-h-[70px] sm:min-h-[80px] flex flex-col justify-center text-center">
    <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
    <p className={cn("text-base sm:text-xl font-semibold mt-1 truncate", valueClassName)}>{value}</p>
  </div>
);

const SignalMonitor = ({ activeSignal, coreState, signalStatusMessage, rewardData, onReset, formState }: {
    activeSignal: MarketInsightsOutput | null;
    coreState: CoreState;
    signalStatusMessage: string;
    rewardData: { bsaid: number; xp: number } | null;
    onReset: () => void;
    formState: MarketInsightsInput | null;
}) => {
    if (!activeSignal || !formState) return null;
    
    return (
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <Card className="glow-border-accent shadow-2xl">
            <CardHeader className="p-4">
                <div className="flex items-center space-x-3">
                    <Activity className="h-8 w-8 text-accent" />
                    <div>
                        <CardTitle className="font-headline text-2xl text-accent">Signal Monitor: {formState.target}</CardTitle>
                        <CardDescription className="font-code text-sm">
                            <PulsingText text={signalStatusMessage} />
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4 font-code text-sm md:text-base">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <OutputItem label="Signal Protocol" value={activeSignal.prediction} valueClassName={getPredictionColor(activeSignal.prediction)} />
                    <OutputItem label="Confidence" value={`${activeSignal.confidence}%`} />
                    <OutputItem label="ShadowScore" value={`${activeSignal.shadowScore}`} />
                    <OutputItem label="Entry Zone" value={activeSignal.entryRange} />
                    <OutputItem label="Stop Loss" value={activeSignal.stopLoss} />
                    <OutputItem label="Take Profit" value={activeSignal.takeProfit} />
                </div>
                 <div className="pt-4 mt-4 border-t border-accent/20">
                    <Label className="text-accent font-semibold text-base">Oracle's Whisper:</Label>
                    <div className="p-3 mt-1 border border-accent/30 rounded-lg bg-black/70 shadow-inner">
                        <TypewriterText text={`"${activeSignal.thought}"`} speed={10} className="text-foreground italic text-sm text-center" showCaret={false} />
                    </div>
                </div>
                {coreState === 'resolved' && rewardData && (
                    <div className="pt-4 text-center border-t border-accent/20 mt-4">
                        <h3 className="font-headline text-xl text-yellow-400 mb-2">{signalStatusMessage}</h3>
                        <div className="flex justify-center items-center gap-6">
                          <p className="text-lg">BSAI Reward: <span className="font-bold text-primary">{rewardData.bsaid}</span></p>
                          <p className="text-lg">XP Gained: <span className="font-bold text-primary">{rewardData.xp}</span></p>
                        </div>
                         <Button onClick={onReset} className="mt-4 bg-yellow-500 text-black hover:bg-yellow-600">
                            Acknowledge & Reset Core
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    );
};


export default function AppLayout() {
  const [activeTab, setActiveTab] = useState<TabId>('mind');
  const { toast } = useToast();
  const [dbInitialized, setDbInitialized] = useState(false);

  // --- Lifted State for Active Signal ---
  const [coreState, setCoreState] = useState<CoreState>('idle');
  const [activeSignal, setActiveSignal] = useState<MarketInsightsOutput | null>(null);
  const [signalInput, setSignalInput] = useState<MarketInsightsInput | null>(null);
  const [signalStatusMessage, setSignalStatusMessage] = useState('');
  const [rewardData, setRewardData] = useState<{ bsaid: number; xp: number } | null>(null);
  
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // --- Signal Lifecycle Management ---
  useEffect(() => {
    if (coreState === 'tracking' && activeSignal && signalInput) {
      setSignalStatusMessage(`On Hold: Awaiting optimal entry near ${activeSignal.entryRange}...`);
      
      const entryTimeout = setTimeout(() => {
          setSignalStatusMessage(`Order Executed! Monitoring Take Profit (${activeSignal.takeProfit}) / Stop Loss (${activeSignal.stopLoss})...`);
          
          trackingIntervalRef.current = setInterval(async () => {
            const priceStr = await getLivePrice(signalInput.target);
            if (priceStr) {
                const currentPrice = parseFloat(priceStr);
                const stopLossPrice = parseFloat(activeSignal.stopLoss.replace(/[^0-9.-]+/g,""));
                const takeProfitPrice = parseFloat(activeSignal.takeProfit.replace(/[^0-9.-]+/g,""));
                const isBuySignal = activeSignal.prediction.toUpperCase() === 'BUY';
                let outcome: 'TP_HIT' | 'SL_HIT' | null = null;
                
                if (isBuySignal) {
                    if (currentPrice >= takeProfitPrice) outcome = 'TP_HIT';
                    else if (currentPrice <= stopLossPrice) outcome = 'SL_HIT';
                } else {
                    if (currentPrice <= takeProfitPrice) outcome = 'TP_HIT';
                    else if (currentPrice >= stopLossPrice) outcome = 'SL_HIT';
                }

                if (outcome) {
                    if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
                    
                    const bsaid = outcome === 'TP_HIT' ? Math.floor(Math.random() * 500) + 250 : 0;
                    const xp = outcome === 'TP_HIT' ? Math.floor(Math.random() * 100) + 50 : 10;
                    setRewardData({ bsaid, xp });

                    try {
                      await saveSignalAction({
                          asset: signalInput.target,
                          prediction: activeSignal.prediction as 'BUY' | 'SELL' | 'HOLD',
                          trade_mode: signalInput.tradeMode,
                          outcome: outcome,
                          reward_bsai: bsaid,
                          reward_xp: xp,
                          gas_paid: Math.floor(Math.random() * 5) + 1,
                          entryRange: activeSignal.entryRange,
                          stopLoss: activeSignal.stopLoss,
                          takeProfit: activeSignal.takeProfit,
                          confidence: activeSignal.confidence,
                          shadowScore: activeSignal.shadowScore,
                      });
                    } catch(error) {
                      console.error("Failed to save signal:", error);
                      toast({ title: "Save Error", description: "Could not save signal results.", variant: "destructive" });
                    }

                    setSignalStatusMessage(outcome === 'TP_HIT' ? `Take Profit Hit at ${priceStr}!` : `Stop Loss Hit at ${priceStr}!`);
                    setCoreState('resolved');
                }
            }
          }, 5000);
      }, 4000);

      return () => {
          clearTimeout(entryTimeout);
          if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
      };
    }
  }, [coreState, activeSignal, signalInput, toast]);
  

  const handleInitiateSignal = (input: MarketInsightsInput, result: MarketInsightsOutput) => {
    setSignalInput(input);
    setActiveSignal(result);
    setCoreState('tracking');
    setRewardData(null);
  };
  
  const handleResetCore = () => {
    setCoreState('idle');
    setActiveSignal(null);
    setSignalInput(null);
    setRewardData(null);
    setSignalStatusMessage('');
  };

  useEffect(() => {
    async function initializeDataStore() {
        try {
            console.log("Initializing local JSON data store...");
            await setupDatabaseAndSeed();
            console.log("Local data store initialization complete.");
            setDbInitialized(true);
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

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || (() => <div className="text-center p-4 sm:p-8">Component not found. Select a tab.</div>);
  
  const handleTabChange = (tabId: TabId) => {
    if (tabId !== activeTab) {
      setActiveTab(tabId);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background/80 text-foreground font-body backdrop-blur-sm">
      <header className="sticky top-0 z-50 flex items-center justify-between p-3 sm:p-4 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center">
          <Sparkles className="h-7 w-7 sm:h-8 sm:w-8 mr-2 text-primary" />
          <h1 className="text-xl sm:text-2xl font-headline font-bold text-primary">Shadow Trader <span className="text-xs text-muted-foreground align-super">v2.0</span></h1>
        </div>
      </header>

      <MainnetStats />
      
      { (coreState === 'tracking' || coreState === 'resolved') &&
         <SignalMonitor
            activeSignal={activeSignal}
            coreState={coreState}
            signalStatusMessage={signalStatusMessage}
            rewardData={rewardData}
            onReset={handleResetCore}
            formState={signalInput}
         />
      }


      <main className="flex-grow overflow-y-auto pb-16 sm:pb-20">
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
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
                isDbInitialized={dbInitialized}
                coreState={coreState}
                setCoreState={setCoreState}
                onInitiateSignal={handleInitiateSignal}
                onResetCore={handleResetCore}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <footer className="sticky bottom-0 z-40 border-t border-border bg-background/80 backdrop-blur-md">
        <nav className="container mx-auto grid grid-cols-6 items-center h-16 sm:h-20 px-1">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center h-full px-0.5 sm:px-1 text-[0.6rem] sm:text-xs group transition-all duration-300 ease-out transform hover:scale-105 w-full rounded-none",
                activeTab === tab.id
                  ? 'bg-accent text-accent-foreground scale-110'
                  : 'text-muted-foreground hover:bg-primary hover:text-primary-foreground'
              )}
              aria-current={activeTab === tab.id ? 'page' : undefined}
              title={tab.label}
            >
              <div className={cn(
                "p-1.5 sm:p-2 rounded-full transition-all duration-300 ease-out",
                 activeTab === tab.id
                    ? 'glow-border-destructive'
                    : 'opacity-70 group-hover:opacity-100'
              )}>
                <tab.icon className="h-4 w-4 sm:h-5 sm:w-6" />
              </div>
              <span className="mt-0.5 sm:mt-1 font-medium truncate max-w-[50px] sm:max-w-none hidden sm:inline-block">
                {tab.label}
              </span>
            </Button>
          ))}
        </nav>
      </footer>
    </div>
  );
}
