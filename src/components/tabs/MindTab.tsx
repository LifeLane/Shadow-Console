
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateMarketInsights, MarketInsightsInput, MarketInsightsOutput } from '@/ai/flows/generate-market-insights';
import { getLivePrice } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import TerminalExecutionAnimation from '@/components/TerminalExecutionAnimation';
import { Loader2, Activity, Brain, ShieldCheck, TrendingUp, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PulsingText from '@/components/PulsingText';

type CoreState = 'idle' | 'simulating' | 'resolved';

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

export default function MindTab() {
  const [formState, setFormState] = useState<MarketInsightsInput>(initialFormState);
  const [coreState, setCoreState] = useState<CoreState>('idle');
  const [insights, setInsights] = useState<MarketInsightsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (coreState === 'resolved') {
      const timer = setTimeout(() => {
        setCoreState('idle');
        setInsights(null);
      }, 5000); // Reset to idle after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [coreState]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({ ...prevState, [name]: value.toUpperCase() }));
  };

  const handleSelectChange = (name: keyof MarketInsightsInput) => (value: string) => {
    setFormState(prevState => ({ ...prevState, [name]: value }));
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

    setIsLoading(true);
    setCoreState('simulating');
    setInsights(null);

    try {
      const payload: MarketInsightsInput = {
        target: formState.target,
        tradeMode: formState.tradeMode,
        risk: formState.risk,
      };
      const result = await generateMarketInsights(payload);
      setInsights(result);
      setCoreState('resolved');
      toast({
        title: "Shadow Core Analysis Complete!",
        description: "Insights generated. Your contribution helps the Core learn!",
      });
    } catch (error) {
      console.error("Error generating insights:", error);
      toast({
        title: "Error Commanding Shadow Core",
        description: error instanceof Error ? error.message : "Failed to generate market insights. Please check console.",
        variant: "destructive",
      });
      setCoreState('idle');
    } finally {
      setIsLoading(false);
    }
  };
  
  const getPredictionColor = (prediction?: string) => {
    if (!prediction) return 'text-foreground';
    switch (prediction.toUpperCase()) {
      case 'BUY': return 'text-primary';
      case 'SELL': return 'text-destructive';
      case 'HOLD':
      default: return 'text-yellow-500';
    }
  };

  const renderContent = () => {
    switch (coreState) {
      case 'simulating':
        return (
          <motion.div key="simulating" {...cardVariants}>
            <TerminalExecutionAnimation
              target={formState.target}
              tradeMode={formState.tradeMode}
              risk={formState.risk}
            />
          </motion.div>
        );
      case 'resolved':
        return (
          <motion.div key="resolved" {...cardVariants}>
             {insights && (
                <Card className="glow-border-accent shadow-2xl">
                <CardHeader className="border-b border-border p-4 sm:p-6">
                    <div className="flex items-center space-x-3">
                        <Activity className="h-8 w-8 text-accent" />
                        <div>
                            <CardTitle className="font-headline text-3xl text-accent">Shadow Core Output</CardTitle>
                            <CardDescription className="font-code text-sm">Analysis complete. Review the generated insights.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6 font-code text-sm md:text-base">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <OutputItem label="Signal Protocol" value={insights.prediction} valueClassName={getPredictionColor(insights.prediction)} />
                    <OutputItem label="Confidence Matrix" value={`${insights.confidence}%`} />
                    <OutputItem label="ShadowScore Index" value={`${insights.shadowScore}`} />
                    <OutputItem label="Optimal Entry Zone" value={insights.entryRange} />
                    <OutputItem label="Risk Mitigation Point" value={insights.stopLoss} />
                    <OutputItem label="Profit Target Zone" value={insights.takeProfit} />
                    </div>
                    <div className="pt-2">
                    <Label className="text-accent font-semibold text-lg">Oracle's Whisper (Core Logic):</Label>
                    <div className="p-4 mt-2 border border-accent/30 rounded-lg bg-black/70 shadow-inner animate-pulse-glow-accent">
                        <PulsingText text={`"${insights.thought}"`} className="text-accent-foreground italic text-base text-center" />
                    </div>
                    </div>
                </CardContent>
                </Card>
            )}
          </motion.div>
        );
      case 'idle':
      default:
        return (
          <motion.div key="idle" {...cardVariants}>
            <Card className="glow-border-primary shadow-2xl bg-card">
              <CardHeader className="border-b border-border/20 p-4 sm:p-6">
                <div className="flex items-center space-x-3">
                  <Brain className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle className="font-headline text-2xl sm:text-3xl text-primary">Shadow Core Console</CardTitle>
                    <CardDescription className="font-code text-sm text-muted-foreground">Input parameters to command the Shadow Core. Each analysis contributes to its learning.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 p-4 sm:p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div>
                      <Label htmlFor="target" className="font-code text-sm text-muted-foreground mb-2 block">Target Market (e.g., BTCUSDT)</Label>
                      <Input
                        id="target"
                        name="target"
                        value={formState.target}
                        onChange={handleInputChange}
                        className="font-code text-lg py-2.5 h-11"
                        placeholder="e.g., BTCUSDT"
                      />
                    </div>
                     <div>
                        <Label htmlFor="tradeMode" className="font-code text-sm text-muted-foreground mb-2 block">Select Trade Mode</Label>
                        <Tabs value={formState.tradeMode} onValueChange={handleTradeModeTabChange} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 bg-muted/50 border-primary/20 border">
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
                    <Tabs value={formState.risk} onValueChange={handleRiskTabChange} className="w-full">
                      <TabsList className="grid w-full grid-cols-3 bg-muted/50 border-primary/20 border">
                        {riskLevels.map(level => (
                          <TabsTrigger
                            key={level}
                            value={level}
                            className={cn(
                              "font-code text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg py-2.5 transition-all duration-300 ease-in-out",
                              formState.risk === level && "risk-tab-active-glow"
                            )}
                          >
                            {level === 'Low' && <ShieldCheck className="w-4 h-4 mr-2 opacity-70" />}
                            {level === 'Medium' && <TrendingUp className="w-4 h-4 mr-2 opacity-70" />}
                            {level === 'High' && <Zap className="w-4 h-4 mr-2 opacity-70" />}
                            {level}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                      "w-full font-code bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground text-lg py-3 rounded-lg shadow-lg hover:shadow-primary/50 transition-all duration-300 transform",
                      !isLoading && "hover:scale-105 animate-button-ripple-pulse",
                      isLoading && "cursor-wait"
                    )}
                  >
                    {isLoading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : 'Generate Signal'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        );
    }
  };


  return (
    <div className="space-y-6 sm:space-y-8">
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
    </div>
  );
}

interface OutputItemProps {
  label: string;
  value: string | number;
  valueClassName?: string;
}

const OutputItem: React.FC<OutputItemProps> = ({ label, value, valueClassName }) => (
  <div className="p-3 sm:p-4 border border-border/20 rounded-lg bg-card/50 shadow-md hover:shadow-lg transition-shadow min-h-[70px] sm:min-h-[80px] flex flex-col justify-center text-center">
    <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
    <p className={cn("text-base sm:text-xl font-semibold mt-1 truncate", valueClassName)}>{value}</p>
  </div>
);
