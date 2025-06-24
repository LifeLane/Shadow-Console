
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateMarketInsights, MarketInsightsInput, MarketInsightsOutput } from '@/ai/flows/generate-market-insights';
import { useToast } from '@/hooks/use-toast';
import TerminalExecutionAnimation from '@/components/TerminalExecutionAnimation';
import { Loader2, Brain, Zap, History, CheckCircle, XCircle, DollarSign, Star, Fuel, Target, Percent, Shield, TrendingUp, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSignalHistoryAction } from '@/app/mind/actions';
import type { Signal } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';

type CoreState = 'idle' | 'simulating' | 'tracking' | 'resolved';

const initialFormState: MarketInsightsInput = {
  target: 'BTCUSDT',
  tradeMode: 'Intraday',
  risk: 'Medium',
};

const tradeModes = ['Scalping', 'Intraday', 'Swing Trading', 'Position Trading', 'Options', 'Futures'];
const riskLevels = ['Low', 'Medium', 'High'];

const cardVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.3, ease: "easeIn" } },
};

interface MindTabProps {
    isDbInitialized: boolean;
    coreState: CoreState;
    setCoreState: (state: CoreState) => void;
    onInitiateSignal: (input: MarketInsightsInput, result: MarketInsightsOutput) => void;
    onResetCore: () => void;
}

export default function MindTab({ isDbInitialized, coreState, setCoreState, onInitiateSignal, onResetCore }: MindTabProps) {
  const [formState, setFormState] = useState<MarketInsightsInput>(initialFormState);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  
  const [signalHistory, setSignalHistory] = useState<Signal[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  const fetchSignalHistory = async () => {
    if (!isDbInitialized) return;
    setIsHistoryLoading(true);
    try {
      const history = await getSignalHistoryAction();
      setSignalHistory(history);
    } catch (error) {
      toast({ title: "Error", description: "Could not load signal history.", variant: "destructive" });
    } finally {
      setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchSignalHistory();
    if(coreState === 'idle' || coreState === 'resolved') {
      fetchSignalHistory();
    }
  }, [isDbInitialized, coreState]);
  
  useEffect(() => {
    // When a signal is resolved, we might want to refresh the history
    if (coreState === 'resolved') {
      const timer = setTimeout(() => {
        // Delay fetching a bit to ensure data is written
         fetchSignalHistory();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [coreState]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({ ...prevState, [name]: value.toUpperCase() }));
  };

  const handleRiskTabChange = (value: string) => {
    setFormState(prevState => ({ ...prevState, risk: value }));
  };
  
  const handleTradeModeTabChange = (value: string) => {
      setFormState(prevState => ({ ...prevState, tradeMode: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (coreState !== 'idle') return;

    setIsGenerating(true);
    setCoreState('simulating');

    try {
      const result = await generateMarketInsights(formState);
      onInitiateSignal(formState, result);
    } catch (error) {
      console.error("Error generating insights:", error);
      toast({
        title: "Error Commanding Shadow Core",
        description: error instanceof Error ? error.message : "Failed to generate market insights. Please check console.",
        variant: "destructive",
      });
      setCoreState('idle');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderContent = () => {
    if (coreState === 'simulating') {
        return (
          <motion.div key="simulating" {...cardVariants}>
            <TerminalExecutionAnimation
              target={formState.target}
              tradeMode={formState.tradeMode}
              risk={formState.risk}
            />
          </motion.div>
        );
    }
    
    // Default view: form + history
    return (
        <motion.div key="idle" className="space-y-6" {...cardVariants}>
        <Card className="glow-border-primary shadow-2xl bg-card">
            <CardHeader className="border-b border-border/20 p-4 sm:p-6">
            <div className="flex items-center space-x-3">
                <Brain className="h-8 w-8 text-primary" />
                <div>
                <CardTitle className="font-headline text-2xl sm:text-3xl text-primary">Shadow Core Console</CardTitle>
                <CardDescription className="font-code text-sm text-muted-foreground">Input parameters to command the Shadow Core.</CardDescription>
                </div>
            </div>
            </CardHeader>
            <CardContent className="pt-6 p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                <fieldset disabled={coreState !== 'idle'} className="space-y-6 group">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div>
                    <Label htmlFor="target" className="font-code text-sm text-muted-foreground mb-2 block">Target Market</Label>
                    <Input
                    id="target"
                    name="target"
                    value={formState.target}
                    onChange={handleInputChange}
                    className="font-code text-lg py-2.5 h-11 bg-input group-disabled:cursor-not-allowed"
                    placeholder="e.g., BTCUSDT"
                    />
                </div>
                    <div>
                    <Label htmlFor="tradeMode" className="font-code text-sm text-muted-foreground mb-2 block">Select Trade Mode</Label>
                    <Tabs value={formState.tradeMode} onValueChange={handleTradeModeTabChange} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 bg-muted/50 border-primary/20 border group-disabled:cursor-not-allowed">
                            {tradeModes.slice(0,3).map(mode => (
                                <TabsTrigger key={mode} value={mode} className="font-code text-xs sm:text-sm data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-md py-2 transition-all">
                                    {mode}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>
                </div>

                <div>
                <Label className="font-code text-sm text-muted-foreground mb-2 block">Risk Protocol</Label>
                <div className="grid grid-cols-3 gap-2">
                    {riskLevels.map(level => (
                    <Button
                        key={level}
                        type="button"
                        variant="outline"
                        onClick={() => handleRiskTabChange(level)}
                        className={cn(
                        "font-code text-base py-6 transition-all duration-300 ease-in-out flex flex-col h-auto",
                        "border-primary/30 hover:bg-primary/20",
                        formState.risk === level ? "bg-primary/20 text-primary glow-border-primary" : "text-muted-foreground",
                        "group-disabled:cursor-not-allowed"
                        )}
                    >
                        {level === 'Low' && <ShieldCheck className="w-6 h-6 mb-1" />}
                        {level === 'Medium' && <TrendingUp className="w-6 h-6 mb-1" />}
                        {level === 'High' && <Zap className="w-6 h-6 mb-1" />}
                        {level}
                    </Button>
                    ))}
                </div>
                </div>
                </fieldset>

                <Button
                type="submit"
                disabled={coreState !== 'idle'}
                className={cn(
                    "w-full font-code bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3 rounded-lg shadow-lg hover:shadow-primary/50 transition-all duration-300 transform",
                    coreState === 'idle' && "hover:scale-105 animate-button-ripple-pulse",
                    coreState !== 'idle' && "cursor-wait"
                )}
                >
                {coreState === 'idle' ? 'Generate Signal' : <Loader2 className="mr-2 h-6 w-6 animate-spin" />}
                {coreState !== 'idle' && 'Signal Active...'}
                </Button>
            </form>
            </CardContent>
        </Card>

        <Card className="glow-border-accent shadow-xl mt-8">
            <CardHeader className="p-4 sm:p-6 border-b border-border/20">
                <CardTitle className="font-headline text-accent text-xl sm:text-2xl flex items-center">
                    <History className="mr-2 h-5 w-5 sm:h-6 sm:h-6"/> Signal History
                </CardTitle>
                <CardDescription>A record of previously generated signals from the Shadow Core.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 bg-card/90 rounded-b-lg">
                {isHistoryLoading ? (
                    <div className="flex items-center justify-center h-40">
                        <Loader2 className="h-6 w-6 animate-spin text-accent" />
                    </div>
                ) : signalHistory.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full space-y-2 max-h-[400px] overflow-y-auto pr-2">
                        {signalHistory.map((signal) => {
                            const isWin = signal.outcome === 'TP_HIT';
                            const isBuy = signal.prediction === 'BUY';
                            return (
                                <AccordionItem value={`item-${signal.id}`} key={signal.id} className="bg-card/50 border border-border/20 rounded-lg px-4 data-[state=open]:border-accent/50">
                                    <AccordionTrigger className="hover:no-underline font-code text-sm py-3">
                                        <div className="flex items-center gap-3 sm:gap-4 w-full">
                                            {isWin ? <CheckCircle className="h-5 w-5 text-green-500 shrink-0" /> : <XCircle className="h-5 w-5 text-red-500 shrink-0" />}
                                            <span className="font-bold w-20 sm:w-24 truncate">{signal.asset}</span>
                                            <span className={cn("w-12 sm:w-16 hidden sm:inline-block", isBuy ? "text-primary" : "text-destructive")}>{isBuy ? 'LONG' : 'SHORT'}</span>
                                            <Badge variant={isWin ? "default" : "destructive"} className={cn("text-xs", isWin ? "bg-green-600/80 border-green-500" : "bg-red-600/80 border-red-500")}>{isWin ? 'WIN' : 'LOSS'}</Badge>
                                            <span className="flex-1 text-right text-muted-foreground text-xs">
                                                {formatDistanceToNow(new Date(signal.created_at!), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                    <div className="space-y-4 pt-4 pb-2 text-sm font-code border-t border-border/20">
                                        <div>
                                            <h4 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Trade Parameters</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                                                <div className="flex items-center justify-between"><span className="text-muted-foreground flex items-center gap-2"><Target className="w-4 h-4"/>Entry Range:</span> <span className="font-semibold">{signal.entryRange || 'N/A'}</span></div>
                                                <div className="flex items-center justify-between"><span className="text-muted-foreground flex items-center gap-2"><Target className="w-4 h-4 text-destructive"/>Stop Loss:</span> <span className="font-semibold">{signal.stopLoss || 'N/A'}</span></div>
                                                <div className="flex items-center justify-between"><span className="text-muted-foreground flex items-center gap-2"><Target className="w-4 h-4 text-primary"/>Take Profit:</span> <span className="font-semibold">{signal.takeProfit || 'N/A'}</span></div>
                                                <div className="flex items-center justify-between"><span className="text-muted-foreground flex items-center gap-2"><TrendingUp className="w-4 h-4"/>Trade Mode:</span> <span className="font-semibold">{signal.trade_mode}</span></div>
                                            </div>
                                        </div>
                                        <div className="pt-2">
                                            <h4 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Analytics & Rewards</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                                                <div className="flex items-center justify-between"><span className="text-muted-foreground flex items-center gap-2"><Percent className="w-4 h-4"/>Confidence:</span> <span className="font-semibold">{signal.confidence ? `${signal.confidence}%` : 'N/A'}</span></div>
                                                <div className="flex items-center justify-between"><span className="text-muted-foreground flex items-center gap-2"><Shield className="w-4 h-4"/>ShadowScore:</span> <span className="font-semibold">{signal.shadowScore || 'N/A'}</span></div>
                                                <div className="flex items-center justify-between"><span className="text-muted-foreground flex items-center gap-2"><DollarSign className="w-4 h-4"/>BSAI Reward:</span> <span className="font-semibold text-primary">+{signal.reward_bsai}</span></div>
                                                <div className="flex items-center justify-between"><span className="text-muted-foreground flex items-center gap-2"><Star className="w-4 h-4 text-yellow-400"/>XP Gained:</span> <span className="font-semibold text-yellow-400">+{signal.reward_xp}</span></div>
                                                <div className="flex items-center justify-between"><span className="text-muted-foreground flex items-center gap-2"><Fuel className="w-4 h-4"/>Gas Paid:</span> <span className="font-semibold">-{signal.gas_paid}</span></div>
                                            </div>
                                        </div>
                                    </div>
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                ) : (
                    <p className="text-center text-muted-foreground h-40 flex items-center justify-center">No signal history found. Generate a signal to begin.</p>
                )}
            </CardContent>
        </Card>
        </motion.div>
    );
  };


  return (
    <div className="space-y-6 sm:space-y-8">
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
    </div>
  );
}
