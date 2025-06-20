
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
import { Loader2, FileText, Lightbulb, TrendingUp, Zap, ShieldCheck, ShieldOff, Brain } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

type MindFormState = MarketInsightsInput;

const initialFormState: MindFormState = {
  target: 'BTCUSDT',
  tradeMode: 'Intraday',
  risk: 'Medium',
};

const tradeModes = ['Scalping', 'Intraday', 'Swing Trading', 'Position Trading', 'Options', 'Futures'];
const riskLevels = ['Low', 'Medium', 'High'];

const cardVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
};


export default function MindTab() {
  const [formState, setFormState] = useState<MindFormState>(initialFormState);
  const [insights, setInsights] = useState<MarketInsightsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoTradeEnabled, setIsAutoTradeEnabled] = useState(false);
  const { toast } = useToast();
  const [descriptionKey, setDescriptionKey] = useState(0); 
  const [thoughtKey, setThoughtKey] = useState(0);

  useEffect(() => {
    setDescriptionKey(prev => prev + 1); 
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({ ...prevState, [name]: value.toUpperCase() }));
  };
  
  const handleSelectChange = (name: keyof MindFormState) => (value: string) => {
    setFormState(prevState => ({ ...prevState, [name]: value }));
     if (name === 'target') {
        setFormState(prevState => ({ ...prevState, target: value.toUpperCase() }));
    }
  };

  const handleRiskTabChange = (value: string) => {
    setFormState(prevState => ({ ...prevState, risk: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setInsights(null);
    setDescriptionKey(prev => prev + 1); 
    setThoughtKey(prev => prev + 1); 

    try {
      const payload: MarketInsightsInput = {
        target: formState.target,
        tradeMode: formState.tradeMode,
        risk: formState.risk,
      };
      const result = await generateMarketInsights(payload);
      setInsights(result);
      toast({
        title: "Shadow Core Analysis Complete!",
        description: "Insights generated. Your contribution helps the Core learn!",
      });
    } catch (error) {
      console.error("Error generating insights:", error);
      toast({
        title: "Error Commanding Shadow Core",
        description: error instanceof Error ? error.message : "Failed to generate market insights. Please check console and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAutoTrade = () => {
    setIsAutoTradeEnabled(prev => {
        const newState = !prev;
        toast({
            title: `Auto-Trade Protocol ${newState ? 'Engaged' : 'Disengaged'}`,
            description: `Shadow Core auto-trade suggestions are now ${newState ? 'active' : 'inactive'} (Simulated).`,
        });
        return newState;
    });
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

  return (
    <div className="space-y-6 sm:space-y-8">
      <motion.div initial="initial" animate="animate" variants={cardVariants}>
        <Card className="glow-border-primary shadow-2xl">
          <CardHeader className="border-b border-border p-4 sm:p-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <div>
                <CardTitle className="font-headline text-xl sm:text-3xl text-primary">Shadow Core Console</CardTitle>
                <TypewriterText 
                  key={`desc-console-${descriptionKey}`}
                  text="Input parameters to command the Shadow Core. Each analysis contributes to its learning and your Airdrop rewards." 
                  className="font-code text-xs sm:text-sm text-muted-foreground mt-1" 
                  speed={15}
                  showCaret={false}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-end">
                <div>
                  <Label htmlFor="target" className="font-code text-xs sm:text-sm text-muted-foreground">Target Market (e.g., BTCUSDT)</Label>
                  <div className="flex items-center mt-1">
                    <Input 
                      id="target" 
                      name="target" 
                      value={formState.target} 
                      onChange={handleInputChange} 
                      className="font-code bg-card border-primary/30 focus:border-primary focus:ring-primary text-base sm:text-lg py-2 h-10 sm:h-auto flex-grow" 
                      placeholder="e.g., BTCUSDT"
                    />
                    <span 
                      className="ml-2 w-2 h-[1em] bg-accent animate-blink-block-caret self-center" 
                      aria-hidden="true"
                    ></span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="tradeMode" className="font-code text-xs sm:text-sm text-muted-foreground">Select Trade Mode</Label>
                  <Select name="tradeMode" value={formState.tradeMode} onValueChange={handleSelectChange('tradeMode')}>
                    <SelectTrigger id="tradeMode" className="font-code mt-1 bg-card border-primary/30 focus:border-primary focus:ring-primary text-base sm:text-lg py-2 h-10 sm:h-auto">
                      <SelectValue placeholder="Select trade mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {tradeModes.map(mode => <SelectItem key={mode} value={mode} className="font-code">{mode}</SelectItem>)}
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
                disabled={isLoading} 
                className={cn(
                  "w-full font-code bg-gradient-to-r from-primary via-purple-600 to-pink-600 hover:from-primary/90 hover:via-purple-500 hover:to-pink-500 text-primary-foreground text-base py-3 sm:text-lg sm:py-3 px-4 rounded-lg shadow-lg hover:shadow-primary/50 transition-all duration-300 transform",
                  !isLoading && "hover:scale-105 animate-button-ripple-pulse",
                  isLoading && "cursor-wait"
                )}
              >
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 sm:h-6 sm:w-6 animate-spin" /> : ':: INITIATE SHADOW ANALYSIS ::'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {isLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
          <TerminalExecutionAnimation 
            target={formState.target}
            tradeMode={formState.tradeMode}
            risk={formState.risk}
          />
        </motion.div>
      )}

      {insights && !isLoading && (
        <motion.div initial="initial" animate="animate" variants={cardVariants}>
          <Card className="glow-border-accent shadow-2xl">
            <CardHeader className="border-b border-border p-4 sm:p-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                  <Lightbulb className="h-6 w-6 sm:h-8 sm:h-8 text-accent" />
                  <div>
                      <CardTitle className="font-headline text-xl sm:text-3xl text-accent">Shadow Core Output</CardTitle>
                      <TypewriterText 
                          key={`desc-output-${descriptionKey}`}
                          text="Analysis complete. Review the generated insights." 
                          className="font-code text-xs sm:text-sm text-muted-foreground mt-1" 
                          speed={15}
                          showCaret={false}
                        />
                  </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6 font-code text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                <OutputItem label="Signal Protocol" value={insights.prediction} valueClassName={getPredictionColor(insights.prediction)} />
                <OutputItem label="Confidence Matrix" value={`${insights.confidence}%`} />
                <OutputItem label="ShadowScore Index" value={`${insights.shadowScore}`} />
                <OutputItem label="Optimal Entry Zone" value={insights.entryRange} />
                <OutputItem label="Risk Mitigation Point" value={insights.stopLoss} />
                <OutputItem label="Profit Target Zone" value={insights.takeProfit} />
              </div>
              <div className="pt-2">
                <Label className="text-accent font-semibold text-base sm:text-lg block text-center sm:text-left">Oracle's Whisper (Core Logic):</Label>
                <div className="p-3 sm:p-4 mt-2 border border-accent/30 rounded-lg bg-card shadow-inner animate-pulse-glow-accent min-h-[60px]">
                  <TypewriterText 
                      key={`thought-${thoughtKey}`}
                      text={`"${insights.thought}"`} 
                      className="text-card-foreground italic text-sm sm:text-base text-center" 
                      speed={25}
                      showCaret={false}
                    />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Tabs defaultValue="experimental-mode" className="w-full mt-8">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 bg-transparent p-0">
          <TabsTrigger value="experimental-mode" className="font-code py-2 sm:py-2.5 text-sm sm:text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:glow-border-primary data-[state=active]:shadow-md">
           <Lightbulb className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />Auto-Trade Sim
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
                    text="Engage or disengage the Shadow Core's auto-trade suggestions in a simulated environment. This feature is for testing and training purposes." 
                    className="text-muted-foreground text-xs sm:text-sm text-center" 
                    speed={15}
                    showCaret={false}
                    />
                    <Button 
                    onClick={toggleAutoTrade}
                    className={cn(
                        "font-code py-2 px-4 sm:py-2.5 sm:px-6 text-sm sm:text-base transition-all duration-300 w-full max-w-xs", // Added max-w-xs for button
                        isAutoTradeEnabled 
                            ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" 
                            : "bg-accent hover:bg-accent/90 text-accent-foreground"
                    )}
                    >
                    {isAutoTradeEnabled ? <ShieldOff className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> : <ShieldCheck className="mr-2 h-4 w-4 sm:h-5 sm:h-5" />}
                    {isAutoTradeEnabled ? "Disengage Auto-Trade Sim" : "Engage Auto-Trade Sim"}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">Note: Auto-trade simulation is for training the Shadow Core. Actual trades are not executed.</p>
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


    