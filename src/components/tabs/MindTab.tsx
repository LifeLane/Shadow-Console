
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateMarketInsights, MarketInsightsInput, MarketInsightsOutput } from '@/ai/flows/generate-market-insights';
import { useToast } from '@/hooks/use-toast';
import TerminalExecutionAnimation from '@/components/TerminalExecutionAnimation';
import TypewriterText from '@/components/TypewriterText';
import { Loader2, FileText, Lightbulb, TrendingUp, Zap, ShieldCheck, ShieldOff, Brain, Activity, Award, CheckCircle, PlayCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type CoreState = 'dormant' | 'activating' | 'idle' | 'simulating' | 'tracking' | 'resolved';

interface CurrentSignalParams extends MarketInsightsInput {}

interface RewardData {
  outcome: string;
  bsai: number;
  xp: number;
  badge?: string;
}

const initialFormState: MarketInsightsInput = {
  target: 'BTCUSDT',
  tradeMode: '1h', // Changed to represent timeframe
  risk: 'Medium',
};

const timeframes = ['5m', '15m', '1h', '4h', '1d']; // More typical timeframe selections
const riskLevels = ['Low', 'Medium', 'High'];

const cardVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.3, ease: "easeIn" } },
};

export default function MindTab() {
  const [formState, setFormState] = useState<MarketInsightsInput>(initialFormState);
  const [coreState, setCoreState] = useState<CoreState>('dormant');
  const [currentSignalParams, setCurrentSignalParams] = useState<CurrentSignalParams | null>(null);
  const [simulationResult, setSimulationResult] = useState<MarketInsightsOutput | null>(null);
  const [rewardData, setRewardData] = useState<RewardData | null>(null);
  const [trackingPulse, setTrackingPulse] = useState(78); // Simulated pulse strength
  const { toast } = useToast();
  const [descriptionKey, setDescriptionKey] = useState(0);
  const [thoughtKey, setThoughtKey] = useState(0);

  useEffect(() => {
    setDescriptionKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    let pulseInterval: NodeJS.Timeout;
    if (coreState === 'tracking') {
      pulseInterval = setInterval(() => {
        setTrackingPulse(prev => {
          const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
          return Math.max(60, Math.min(95, prev + change));
        });
      }, 2000);
    }
    return () => clearInterval(pulseInterval);
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

  const handleActivateCore = () => {
    setCoreState('activating');
    toast({ title: "Shadow Core Initializing...", description: "Synchronizing neural channels..." });
    setDescriptionKey(prev => prev + 1);
    setTimeout(() => {
      setCoreState('idle');
      toast({ title: "Shadow Core Active!", description: "Awaiting your command. Your thoughts feed the Mind." });
    }, 2500); // Simulated activation time
  };

  const handleSubmitSignal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (coreState !== 'idle') return;

    setCurrentSignalParams(formState);
    setCoreState('simulating');
    setSimulationResult(null); // Clear previous results
    setRewardData(null);
    setDescriptionKey(prev => prev + 1);
    setThoughtKey(prev => prev + 1);

    try {
      const result = await generateMarketInsights(formState);
      setSimulationResult(result);
      // insights for Oracle's Whisper are implicitly set by simulationResult
      setCoreState('tracking');
      toast({
        title: "Signal Deployed to ShadowNet!",
        description: "Monitoring simulated market pulse...",
      });
    } catch (error) {
      console.error("Error generating insights:", error);
      toast({
        title: "Error Commanding Shadow Core",
        description: error instanceof Error ? error.message : "Failed to deploy signal. Please check console.",
        variant: "destructive",
      });
      setCoreState('idle'); // Revert to idle on error
    }
  };

  const handleSimulateOutcome = () => {
    if (!simulationResult) return;
    const outcomes = ["Target Hit", "Stop Loss Triggered", "Neutral (Time Expired)"];
    const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    let bsaiReward = 0;
    let xpReward = 0;
    let badgeReward: string | undefined = undefined;

    if (randomOutcome === "Target Hit") {
      bsaiReward = Math.floor((simulationResult.confidence / 100) * (Math.random() * 500 + 500)); // Confidence based
      xpReward = Math.floor(Math.random() * 50 + 50);
      if (simulationResult.confidence > 85) {
        badgeReward = "Precision Analyst Badge";
      }
    } else if (randomOutcome === "Stop Loss Triggered") {
      xpReward = Math.floor(Math.random() * 20 + 10); // Minimal XP
    } else { // Neutral
      xpReward = Math.floor(Math.random() * 30 + 20); // Partial XP
    }

    setRewardData({ outcome: randomOutcome, bsai: bsaiReward, xp: xpReward, badge: badgeReward });
    setCoreState('resolved');
    setDescriptionKey(prev => prev + 1);
    toast({ title: "Signal Resolved!", description: `Outcome: ${randomOutcome}. Rewards calculated.`});
  };
  
  const handleAcknowledgeReset = () => {
    setCoreState('idle');
    setCurrentSignalParams(null);
    setSimulationResult(null);
    setRewardData(null);
    setDescriptionKey(prev => prev + 1);
    setThoughtKey(prev => prev + 1);
    toast({ title: "Shadow Core Reset", description: "Ready for new signal deployment." });
  };

  const getPredictionColor = (prediction?: string) => {
    if (!prediction) return 'text-foreground';
    switch (prediction.toUpperCase()) {
      case 'BUY': return 'text-green-400';
      case 'SELL': return 'text-red-400';
      case 'HOLD':
      default: return 'text-yellow-400';
    }
  };

  const renderContent = () => {
    switch (coreState) {
      case 'dormant':
        return (
          <motion.div key="dormant" {...cardVariants} className="text-center p-6 sm:p-10">
            <Brain className="h-16 w-16 sm:h-20 sm:w-20 text-primary mx-auto mb-4 animate-pulse-opacity" />
            <TypewriterText 
              key={`desc-dormant-${descriptionKey}`} 
              text="The Shadow Core is dormant. Your thoughts feed the Mind. Your signals guide the chain." 
              className="text-lg sm:text-xl text-muted-foreground mb-6 font-code" 
              speed={30} 
            />
            <Button onClick={handleActivateCore} size="lg" className="font-code bg-primary text-primary-foreground hover:bg-primary/90 text-lg py-3 px-6 animate-pulse-glow-primary">
              <PlayCircle className="mr-2 h-5 w-5" /> Activate Shadow Core
            </Button>
          </motion.div>
        );
      case 'activating':
        return (
          <motion.div key="activating" {...cardVariants} className="text-center p-6 sm:p-10 min-h-[200px] flex flex-col justify-center items-center">
            <Loader2 className="h-12 w-12 sm:h-16 sm:w-16 text-primary animate-spin mb-4" />
            <TypewriterText text="Initializing Shadow Core... Synchronizing neural pathways..." className="text-md sm:text-lg text-primary font-code" speed={40} />
          </motion.div>
        );
      case 'idle':
        return (
          <motion.div key="idle" {...cardVariants}>
            <CardHeader className="border-b border-border p-4 sm:p-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                <div>
                  <CardTitle className="font-headline text-xl sm:text-3xl text-primary">Shadow Core: Command Console</CardTitle>
                  <TypewriterText
                    key={`desc-console-${descriptionKey}`}
                    text="Input parameters to deploy a signal to the ShadowNet. Each signal helps train the Core."
                    className="font-code text-xs sm:text-sm text-muted-foreground mt-1"
                    speed={15}
                    showCaret={false}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <form onSubmit={handleSubmitSignal} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-end">
                  <div>
                    <Label htmlFor="target" className="font-code text-xs sm:text-sm text-muted-foreground">Target Market (e.g., BTCUSDT)</Label>
                    <div className="flex items-center mt-1">
                      <Input
                        id="target"
                        name="target"
                        value={formState.target}
                        onChange={handleInputChange}
                        className="font-code text-base sm:text-lg py-2 h-10 sm:h-auto flex-grow"
                        placeholder="e.g., BTCUSDT"
                      />
                      <span
                        className="ml-2 w-2 h-[1em] bg-accent animate-blink-block-caret self-center"
                        aria-hidden="true"
                      ></span>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="tradeMode" className="font-code text-xs sm:text-sm text-muted-foreground">Select Timeframe</Label>
                    <Select name="tradeMode" value={formState.tradeMode} onValueChange={handleSelectChange('tradeMode')}>
                      <SelectTrigger id="tradeMode" className="font-code mt-1 text-base sm:text-lg py-2 h-10 sm:h-auto dark:bg-black/80 dark:border-primary/60 dark:text-primary dark:focus-visible:ring-primary bg-background border-primary/40 text-primary focus-visible:ring-primary">
                        <SelectValue placeholder="Select timeframe" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeframes.map(frame => <SelectItem key={frame} value={frame} className="font-code">{frame}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="font-code text-xs sm:text-sm text-muted-foreground mb-2 block">Risk Protocol</Label>
                  <Tabs value={formState.risk} onValueChange={handleRiskTabChange} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-primary/5 border-primary/20 border p-1">
                      {riskLevels.map(level => (
                        <TabsTrigger
                          key={level}
                          value={level}
                          className={cn(
                            "font-code text-sm sm:text-base data-[state=active]:shadow-md py-2 sm:py-2.5 transition-all",
                            formState.risk === level && "data-[state=active]:text-primary-foreground",
                            formState.risk === level && level === 'Low' && "risk-tab-active-glow data-[state=active]:bg-primary",
                            formState.risk === level && level === 'Medium' && "risk-tab-active-glow data-[state=active]:bg-primary",
                            formState.risk === level && level === 'High' && "animate-pulse-glow-destructive data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground"
                          )}
                        >
                          {level === 'Low' && <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2 opacity-70" />}
                          {level === 'Medium' && <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2 opacity-70" />}
                          {level === 'High' && <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2 opacity-70" />}
                          {level}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
                <Button
                  type="submit"
                  className={cn(
                    "w-full font-code bg-gradient-to-r from-primary via-purple-500 to-accent hover:from-primary/90 hover:via-purple-600 hover:to-accent/90 text-primary-foreground text-base py-3 sm:text-lg sm:py-3 px-4 rounded-lg shadow-lg hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105 animate-button-ripple-pulse"
                  )}
                >
                  :: DEPLOY SIGNAL TO SHADOWNET ::
                </Button>
              </form>
            </CardContent>
          </motion.div>
        );
      case 'simulating':
        return (
           <motion.div key="simulating" {...cardVariants}>
            {currentSignalParams && (
              <TerminalExecutionAnimation
                target={currentSignalParams.target}
                tradeMode={currentSignalParams.tradeMode}
                risk={currentSignalParams.risk}
              />
            )}
          </motion.div>
        );
      case 'tracking':
        return (
          <motion.div key="tracking" {...cardVariants}>
            <Card className="glow-border-accent shadow-2xl">
              <CardHeader className="border-b border-border p-4 sm:p-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-accent animate-pulse-opacity" />
                  <div>
                    <CardTitle className="font-headline text-xl sm:text-3xl text-accent">Signal Pulse: LIVE</CardTitle>
                    <TypewriterText
                        key={`desc-tracking-${descriptionKey}`}
                        text={`Tracking: ${currentSignalParams?.target} | ${currentSignalParams?.tradeMode} | Risk: ${currentSignalParams?.risk}`}
                        className="font-code text-xs sm:text-sm text-muted-foreground mt-1"
                        speed={15} showCaret={false}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6 font-code text-sm">
                {simulationResult && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                      <OutputItem label="Signal Protocol" value={simulationResult.prediction} valueClassName={getPredictionColor(simulationResult.prediction)} />
                      <OutputItem label="Confidence Matrix" value={`${simulationResult.confidence}%`} />
                      <OutputItem label="ShadowScore Index" value={`${simulationResult.shadowScore}`} />
                      <OutputItem label="Optimal Entry Zone" value={simulationResult.entryRange} />
                      <OutputItem label="Risk Mitigation Point" value={simulationResult.stopLoss} />
                      <OutputItem label="Profit Target Zone" value={simulationResult.takeProfit} />
                    </div>
                     <div className="text-center p-3 border border-primary/30 rounded-md bg-black/50">
                        <p className="text-primary text-md animate-pulse-opacity">
                           [ SIGNAL LIVE — PULSE STRENGTH: {'█'.repeat(Math.floor(trackingPulse/10))+'░'.repeat(10-Math.floor(trackingPulse/10))} {trackingPulse}% ]
                        </p>
                    </div>
                    <div>
                      <Label className="text-accent font-semibold text-base sm:text-lg block text-center sm:text-left">Oracle's Whisper (Core Logic):</Label>
                      <div className="p-3 sm:p-4 mt-2 border border-accent/50 rounded-lg bg-black/70 shadow-inner animate-pulse-glow-accent min-h-[60px]">
                        <TypewriterText
                          key={`thought-tracking-${thoughtKey}`}
                          text={`"${simulationResult.thought}"`}
                          className="text-accent italic text-sm sm:text-base text-center"
                          speed={25}
                          showCaret={false}
                        />
                      </div>
                    </div>
                  </>
                )}
                <Button onClick={handleSimulateOutcome} className="w-full font-code bg-primary text-primary-foreground hover:bg-primary/90 text-base py-3">
                  Simulate Signal Outcome
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        );
      case 'resolved':
        return (
          <motion.div key="resolved" {...cardVariants}>
            <Card className="glow-border-primary shadow-2xl">
              <CardHeader className="border-b border-border p-4 sm:p-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Award className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  <div>
                    <CardTitle className="font-headline text-xl sm:text-3xl text-primary">Signal Resolution & Rewards</CardTitle>
                     <TypewriterText
                        key={`desc-resolved-${descriptionKey}`}
                        text={`Outcome for ${currentSignalParams?.target}: ${rewardData?.outcome}`}
                        className="font-code text-xs sm:text-sm text-muted-foreground mt-1"
                        speed={20} showCaret={false}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4 text-center font-code">
                <p className="text-2xl font-semibold text-accent">{rewardData?.outcome}</p>
                <div className="space-y-2 text-lg">
                  <p>BSAI Token Reward: <span className="font-bold text-primary">{rewardData?.bsai.toLocaleString() || 0} BSAI</span></p>
                  <p>Shadow XP Earned: <span className="font-bold text-primary">{rewardData?.xp.toLocaleString() || 0} XP</span></p>
                  {rewardData?.badge && <p>Badge Unlocked: <span className="font-bold text-primary">{rewardData.badge}</span></p>}
                </div>
                 <TypewriterText
                    key={`desc-reward-${descriptionKey}`}
                    text="Your contribution has been logged. The Shadow Core evolves."
                    className="text-sm text-muted-foreground pt-2"
                    speed={25} showCaret={false}
                />
                <Button onClick={handleAcknowledgeReset} size="lg" className="font-code bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-3 px-6 mt-4">
                 <CheckCircle className="mr-2 h-5 w-5" /> Acknowledge & Reset Core
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
       <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>

      {/* Auxiliary Tabs - only show if core is not dormant or activating */}
      {(coreState !== 'dormant' && coreState !== 'activating') && (
         <motion.div initial="initial" animate="animate" variants={cardVariants} className="mt-8">
            <Tabs defaultValue="experimental-mode" className="w-full">
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 bg-transparent p-0">
                <TabsTrigger value="experimental-mode" className="font-code py-2 sm:py-2.5 text-sm sm:text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:glow-border-primary data-[state=active]:shadow-md">
                <Lightbulb className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />Auto-Trade Sim (Placeholder)
                </TabsTrigger>
                <TabsTrigger value="data-sources" className="font-code py-2 sm:py-2.5 text-sm sm:text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:glow-border-primary data-[state=active]:shadow-md">
                    <FileText className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5"/>Core Data Streams
                </TabsTrigger>
                </TabsList>
                <TabsContent value="experimental-mode" className="mt-8">
                <motion.div initial="initial" animate="animate" variants={cardVariants}>
                    <Card className="glow-border-primary shadow-xl p-4 sm:p-6">
                    <CardHeader className="p-0 pb-3 sm:pb-4"><CardTitle className="font-headline text-primary text-lg sm:text-2xl">Experimental Auto-Trade Simulation</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                            <TypewriterText
                            key={`desc-autotrade-${descriptionKey}`}
                            text="This feature is currently under development. Auto-trade simulation will allow testing agent strategies."
                            className="text-muted-foreground text-xs sm:text-sm text-center"
                            speed={15}
                            showCaret={false}
                            />
                            <Button
                                disabled
                                className={cn( "font-code py-2 px-4 sm:py-2.5 sm:px-6 text-sm sm:text-base w-full max-w-xs bg-muted text-muted-foreground cursor-not-allowed" )} >
                            <ShieldOff className="mr-2 h-4 w-4 sm:h-5 sm:h-5" /> Engage Auto-Trade Sim (Coming Soon)
                            </Button>
                        </div>
                    </CardContent>
                    </Card>
                </motion.div>
                </TabsContent>
                <TabsContent value="data-sources" className="mt-8">
                <motion.div initial="initial" animate="animate" variants={cardVariants}>
                    <Card className="glow-border-primary shadow-xl p-4 sm:p-6">
                    <CardHeader className="p-0 pb-3 sm:pb-4"><CardTitle className="font-headline text-primary text-lg sm:text-2xl">Shadow Core: Data Streams</CardTitle></CardHeader>
                    <CardContent className="p-0 text-sm sm:text-base">
                        <div className="flex flex-col items-center space-y-2">
                            <TypewriterText key={`ds-1-${descriptionKey}`} text="Price Feed & Volume (Live): Binance API" speed={15} showCaret={false} className="text-foreground text-center"><span className="font-semibold text-primary">Price Feed & Volume (Live):</span> Binance API</TypewriterText>
                            <TypewriterText key={`ds-2-${descriptionKey}`} text="Market Sentiment & News (Conceptual): CoinDesk API (BPI for BTC, placeholder for others)" speed={15} showCaret={false} className="text-foreground text-center"><span className="font-semibold text-primary">Market Sentiment & News (Conceptual):</span> CoinDesk API (BPI for BTC, placeholder for others)</TypewriterText>
                            <TypewriterText key={`ds-3-${descriptionKey}`} text="AI Thought Generation: Gemini Pro API via Genkit" speed={15} showCaret={false} className="text-foreground text-center"><span className="font-semibold text-primary">AI Thought Generation:</span> Gemini Pro API via Genkit</TypewriterText>
                            <TypewriterText key={`ds-4-${descriptionKey}`} text="On-Chain Wallet Activity (Live): PolygonScan API (USDT/WBTC on Polygon)" speed={15} showCaret={false} className="text-foreground text-center"><span className="font-semibold text-primary">On-Chain Wallet Activity (Live):</span> PolygonScan API (USDT/WBTC on Polygon)</TypewriterText>
                            <TypewriterText key={`ds-5-${descriptionKey}`} text="The Shadow Core utilizes these data streams to learn and generate insights. Your interactions help refine its accuracy." speed={15} showCaret={false} className="text-xs sm:text-sm text-muted-foreground pt-2 text-center"/>
                        </div>
                    </CardContent>
                    </Card>
                </motion.div>
                </TabsContent>
            </Tabs>
        </motion.div>
      )}
    </div>
  );
}

interface OutputItemProps {
  label: string;
  value: string | number;
  valueClassName?: string;
}

const OutputItem: React.FC<OutputItemProps> = ({ label, value, valueClassName }) => (
  <div className="p-3 sm:p-4 border border-border rounded-lg bg-card shadow-md hover:shadow-lg transition-shadow min-h-[70px] sm:min-h-[80px] flex flex-col justify-center text-center">
    <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
    <p className={cn("text-base sm:text-xl font-semibold mt-1 truncate", valueClassName)}>{value}</p>
  </div>
);

    