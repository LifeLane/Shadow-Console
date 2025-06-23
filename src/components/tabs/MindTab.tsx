
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
import { Loader2, Activity, Brain, ShieldCheck, TrendingUp, Zap, BarChart, History, CheckCircle, XCircle, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PulsingText from '@/components/PulsingText';
import TypewriterText from '@/components/TypewriterText';
import AnimatedCore from '@/components/AnimatedCore';


type CoreState = 'dormant' | 'activating' | 'idle' | 'simulating' | 'tracking' | 'resolved';

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

const mockSignalHistory: {
    id: string;
    asset: string;
    prediction: 'BUY' | 'SELL';
    mode: string;
    outcome: 'TP_HIT' | 'SL_HIT';
    reward: number;
    gasPaid: number;
}[] = [
    { id: 'sig1', asset: 'BTCUSDT', prediction: 'BUY', mode: 'Intraday', outcome: 'TP_HIT', reward: 50, gasPaid: 2 },
    { id: 'sig2', asset: 'ETHUSDT', prediction: 'SELL', mode: 'Scalping', outcome: 'SL_HIT', reward: 10, gasPaid: 1 },
    { id: 'sig3', asset: 'SOLUSDT', prediction: 'BUY', mode: 'Swing Trading', outcome: 'TP_HIT', reward: 120, gasPaid: 5 },
    { id: 'sig4', asset: 'ADAUSDT', prediction: 'BUY', mode: 'Intraday', outcome: 'SL_HIT', reward: 5, gasPaid: 1 },
    { id: 'sig5', asset: 'DOGEUSDT', prediction: 'SELL', mode: 'Scalping', outcome: 'TP_HIT', reward: 25, gasPaid: 2 },
];

export default function MindTab() {
  const [formState, setFormState] = useState<MarketInsightsInput>(initialFormState);
  const [coreState, setCoreState] = useState<CoreState>('dormant');
  const [insights, setInsights] = useState<MarketInsightsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [activationStep, setActivationStep] = useState(0);
  const [signalStatusMessage, setSignalStatusMessage] = useState('');
  const [rewardData, setRewardData] = useState<{ bsaid: number; xp: number } | null>(null);
  const [simulationResult, setSimulationResult] = useState<MarketInsightsOutput | null>(null);
  const [livePrice, setLivePrice] = useState<string | null>(null);
  const [completedHistoryLines, setCompletedHistoryLines] = useState<string[]>([]);

  const trackingIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Stop tracking when component unmounts
  useEffect(() => {
    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (coreState === 'activating') {
      if (activationStep < 3) {
        timeoutId = setTimeout(() => setActivationStep(activationStep + 1), 700);
      } else {
        timeoutId = setTimeout(() => {
            setCoreState('idle');
            setCompletedHistoryLines([]); // Reset for animation
        }, 700);
      }
    }

    if (coreState === 'tracking' && simulationResult) {
      // Phase 1: On Hold
      setLivePrice(null);
      setSignalStatusMessage(`On Hold: Awaiting optimal entry near ${simulationResult.entryRange}...`);
      
      const entryTimeout = setTimeout(() => {
        // Phase 2: Order Executed & Start Tracking
        setSignalStatusMessage(`Order Executed! Monitoring Take Profit (${simulationResult.takeProfit}) / Stop Loss (${simulationResult.stopLoss})...`);
        
        trackingIntervalRef.current = setInterval(async () => {
          const priceStr = await getLivePrice(formState.target);
          if (priceStr) {
            const currentPrice = parseFloat(priceStr);
            setLivePrice(priceStr);

            const stopLossPrice = parseFloat(simulationResult.stopLoss.replace(/[^0-9.-]+/g,""));
            const takeProfitPrice = parseFloat(simulationResult.takeProfit.replace(/[^0-9.-]+/g,""));

            const isBuySignal = simulationResult.prediction.toUpperCase() === 'BUY';
            let outcome: 'TP' | 'SL' | null = null;
            
            if (isBuySignal) {
                if (currentPrice >= takeProfitPrice) outcome = 'TP';
                else if (currentPrice <= stopLossPrice) outcome = 'SL';
            } else { // It's a SELL signal
                if (currentPrice <= takeProfitPrice) outcome = 'TP'; // TP is lower for a sell
                else if (currentPrice >= stopLossPrice) outcome = 'SL'; // SL is higher for a sell
            }


            if (outcome) {
                if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
                
                const bsaid = outcome === 'TP' ? Math.floor(Math.random() * 500) + 250 : 0;
                const xp = outcome === 'TP' ? Math.floor(Math.random() * 100) + 50 : 10;
                setRewardData({ bsaid, xp });

                setSignalStatusMessage(outcome === 'TP' ? `Take Profit Hit at ${priceStr}!` : `Stop Loss Hit at ${priceStr}!`);
                setCoreState('resolved');
            }
          }
        }, 5000); // Check price every 5 seconds
      }, 4000); // 4 second "On Hold" delay

      return () => {
        clearTimeout(entryTimeout);
        if (trackingIntervalRef.current) {
          clearInterval(trackingIntervalRef.current);
        }
      };
    }

    return () => clearTimeout(timeoutId);
  }, [coreState, activationStep, simulationResult, formState.target]);


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

    setIsLoading(true);
    setCoreState('simulating');
    setInsights(null);
    setSimulationResult(null);

    try {
      const payload: MarketInsightsInput = {
        target: formState.target,
        tradeMode: formState.tradeMode,
        risk: formState.risk,
      };
      const result = await generateMarketInsights(payload);
      setInsights(result);
      setSimulationResult(result); // Store for tracking
      setCoreState('tracking'); // Move to tracking state
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

  const resetCore = () => {
    setCoreState('idle'); // Go back to idle, not dormant
    setActivationStep(0);
    setInsights(null);
    setSimulationResult(null);
    setRewardData(null);
    setSignalStatusMessage('');
    setLivePrice(null);
    setCompletedHistoryLines([]); // Reset for animation
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
      case 'dormant':
        return (
          <motion.div key="dormant" {...cardVariants} className="flex flex-col items-center justify-center">
            <AnimatedCore />
            <Card className="glow-border-primary shadow-2xl bg-card text-center p-8 w-full max-w-md">
              <CardTitle className="font-headline text-3xl text-primary mb-2">Core is Dormant</CardTitle>
              <CardDescription className="font-code text-base mb-6">Your thoughts feed the Mind. Your signals guide the chain.</CardDescription>
              <Button onClick={() => setCoreState('activating')} className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg py-3 px-6 glow-border-primary">
                Activate Shadow Core
              </Button>
            </Card>
          </motion.div>
        );
      case 'activating':
        const steps = [
          { text: 'Unlocking neural channel...', progress: 25 },
          { text: 'Calibrating quantum parameters...', progress: 60 },
          { text: 'Synchronizing with ShadowNet...', progress: 100 },
        ];
        const currentStep = steps[activationStep] || steps[2];
        return (
           <motion.div key="activating" {...cardVariants}>
            <Card className="glow-border-primary shadow-2xl bg-card text-center p-8">
                <CardTitle className="font-headline text-3xl text-primary mb-4">Core Activation</CardTitle>
                <div className="w-full bg-primary/10 rounded-full h-2.5 mb-4">
                    <div className="bg-primary h-2.5 rounded-full transition-all duration-700" style={{ width: `${currentStep.progress}%` }}></div>
                </div>
                <TypewriterText text={currentStep.text} speed={40} className="font-code text-lg text-muted-foreground" showCaret={false} />
            </Card>
           </motion.div>
        );
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
      case 'tracking':
      case 'resolved':
         return (
          <motion.div key="tracking" className="space-y-6" {...cardVariants}>
              <Card className="glow-border-primary shadow-2xl bg-card/80">
                <CardHeader className="p-4 border-b border-border/20">
                  <CardTitle className="font-headline text-2xl text-primary flex items-center justify-between">
                    <span>Market Pulse: {formState.target}</span>
                    {livePrice && <span className="text-xl font-code">{`$${parseFloat(livePrice).toLocaleString()}`}</span>}
                  </CardTitle>
                </CardHeader>
              </Card>
                
              {simulationResult && (
                <Card className="glow-border-accent shadow-2xl">
                    <CardHeader className="p-4">
                        <div className="flex items-center space-x-3">
                            <Activity className="h-8 w-8 text-accent" />
                            <div>
                                <CardTitle className="font-headline text-2xl text-accent">Signal Monitor</CardTitle>
                                <CardDescription className="font-code text-sm">
                                    <PulsingText text={coreState === 'resolved' ? signalStatusMessage : signalStatusMessage} />
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-4 font-code text-sm md:text-base">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <OutputItem label="Signal Protocol" value={simulationResult.prediction} valueClassName={getPredictionColor(simulationResult.prediction)} />
                            <OutputItem label="Confidence" value={`${simulationResult.confidence}%`} />
                            <OutputItem label="ShadowScore" value={`${simulationResult.shadowScore}`} />
                            <OutputItem label="Entry Zone" value={simulationResult.entryRange} />
                            <OutputItem label="Stop Loss" value={simulationResult.stopLoss} />
                            <OutputItem label="Take Profit" value={simulationResult.takeProfit} />
                        </div>
                        {insights && (
                             <div className="pt-4 mt-4 border-t border-accent/20">
                                <Label className="text-accent font-semibold text-base">Oracle's Whisper:</Label>
                                <div className="p-3 mt-1 border border-accent/30 rounded-lg bg-black/70 shadow-inner">
                                    <TypewriterText text={`"${insights.thought}"`} speed={10} className="text-foreground italic text-sm text-center" showCaret={false} />
                                </div>
                            </div>
                        )}
                        {coreState === 'resolved' && rewardData && (
                            <div className="pt-4 text-center border-t border-accent/20 mt-4">
                                <h3 className="font-headline text-xl text-yellow-400 mb-2">{signalStatusMessage}</h3>
                                <div className="flex justify-center items-center gap-6">
                                  <p className="text-lg">BSAI Reward: <span className="font-bold text-primary">{rewardData.bsaid}</span></p>
                                  <p className="text-lg">XP Gained: <span className="font-bold text-primary">{rewardData.xp}</span></p>
                                </div>
                                 <Button onClick={resetCore} className="mt-4 bg-yellow-500 text-black hover:bg-yellow-600">
                                    Acknowledge & Reset Core
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
              )}
          </motion.div>
        );

      case 'idle':
      default:
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div>
                      <Label htmlFor="target" className="font-code text-sm text-muted-foreground mb-2 block">Target Market</Label>
                      <Input
                        id="target"
                        name="target"
                        value={formState.target}
                        onChange={handleInputChange}
                        className="font-code text-lg py-2.5 h-11 bg-input"
                        placeholder="e.g., BTCUSDT"
                      />
                    </div>
                     <div>
                        <Label htmlFor="tradeMode" className="font-code text-sm text-muted-foreground mb-2 block">Select Trade Mode</Label>
                        <Tabs value={formState.tradeMode} onValueChange={handleTradeModeTabChange} className="w-full">
                            <TabsList className="grid w-full grid-cols-3 bg-muted/50 border-primary/20 border">
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
                            formState.risk === level ? "bg-primary/20 text-primary glow-border-primary" : "text-muted-foreground"
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

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                      "w-full font-code bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3 rounded-lg shadow-lg hover:shadow-primary/50 transition-all duration-300 transform",
                      !isLoading && "hover:scale-105 animate-button-ripple-pulse",
                      isLoading && "cursor-wait"
                    )}
                  >
                    {isLoading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : 'Generate Signal'}
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
                <CardContent className="p-4 sm:p-6 bg-black/70 rounded-b-lg">
                   {mockSignalHistory.length > 0 ? (
                        <div className="font-code text-sm space-y-1 h-32 overflow-y-auto">
                            {mockSignalHistory.map((signal, index) => {
                                const isPreviousLineCompleted = index === 0 || completedHistoryLines.includes(mockSignalHistory[index - 1].id);
                                if (!isPreviousLineCompleted) {
                                    return null;
                                }

                                const isWin = signal.outcome === 'TP_HIT';
                                const isLong = signal.prediction === 'BUY';
                                const lineText = `[${isWin ? 'WIN' : 'LOSS'}] ${signal.asset} | ${isLong ? 'LONG' : 'SHORT'} | +${signal.reward} BSAI (Gas: -${signal.gasPaid})`;
                                
                                return (
                                    <TypewriterText
                                        key={signal.id}
                                        text={lineText}
                                        speed={10}
                                        className={cn("whitespace-pre-wrap break-words", isWin ? 'text-green-400' : 'text-red-400')}
                                        onComplete={() => setCompletedHistoryLines(prev => [...prev, signal.id])}
                                        showCaret={!completedHistoryLines.includes(signal.id)} 
                                        caretClassName="bg-accent animate-blink-block-caret opacity-100"
                                    />
                                );
                            })}
                        </div>
                   ) : (
                     <p className="text-center text-muted-foreground">No signal history found. Generate a signal to begin.</p>
                   )}
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


    