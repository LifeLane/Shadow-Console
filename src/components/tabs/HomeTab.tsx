
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateMarketInsights, MarketInsightsInput, MarketInsightsOutput } from '@/ai/flows/generate-market-insights';
import { useToast } from '@/hooks/use-toast';
import PulsingText from '@/components/PulsingText';
import TerminalExecutionAnimation from '@/components/TerminalExecutionAnimation';
import { Loader2, BarChart, FileText, Lightbulb, Settings2, AlertTriangle, TrendingUp, Zap, ShieldCheck, ShieldOff } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { TradingViewWidget } from '@/components/TradingViewWidget';

type HomeFormState = MarketInsightsInput;

const initialFormState: HomeFormState = {
  target: 'BTCUSDT',
  tradeMode: 'Intraday',
  risk: 'Medium',
};

const tradeModes = ['Scalping', 'Intraday', 'Swing Trading', 'Position Trading', 'Options', 'Futures'];
const riskLevels = ['Low', 'Medium', 'High'];

const tradeModeToChartTimeframe = (tradeMode: string): string => {
  switch (tradeMode.toLowerCase()) {
    case 'scalping':
      return '5m';
    case 'intraday':
      return '1h';
    case 'swing trading':
      return '4h';
    case 'position trading':
    case 'options':
    case 'futures':
      return '1D';
    default:
      return '1D';
  }
};

export default function HomeTab() {
  const [formState, setFormState] = useState<HomeFormState>(initialFormState);
  const [insights, setInsights] = useState<MarketInsightsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoTradeEnabled, setIsAutoTradeEnabled] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({ ...prevState, [name]: value.toUpperCase() }));
  };
  
  const handleSelectChange = (name: keyof HomeFormState) => (value: string) => {
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

    try {
      const payload: MarketInsightsInput = {
        target: formState.target,
        tradeMode: formState.tradeMode,
        risk: formState.risk,
      };
      console.log("Submitting to generateMarketInsights:", payload);
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

  const chartTimeframe = useMemo(() => tradeModeToChartTimeframe(formState.tradeMode), [formState.tradeMode]);

  return (
    <div className="space-y-8">
      <Card className="glow-border-primary shadow-2xl">
        <CardHeader className="border-b border-border">
          <div className="flex items-center space-x-3">
            <Settings2 className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="font-headline text-3xl text-primary">Shadow Core: Command Console</CardTitle>
              <CardDescription className="font-code text-sm">Input parameters to guide the Shadow Core's analysis. Your queries help train the AI and earn airdrop rewards.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div>
                <Label htmlFor="target" className="font-code text-sm text-muted-foreground">Target Market (e.g., BTCUSDT)</Label>
                <Input 
                  id="target" 
                  name="target" 
                  value={formState.target} 
                  onChange={handleInputChange} 
                  className="font-code mt-1 bg-card border-primary/30 focus:border-primary focus:ring-primary text-lg py-2.5" 
                  placeholder="e.g., BTCUSDT"
                />
              </div>
              <div>
                <Label htmlFor="tradeMode" className="font-code text-sm text-muted-foreground">Select Trade Mode</Label>
                 <Select name="tradeMode" value={formState.tradeMode} onValueChange={handleSelectChange('tradeMode')}>
                  <SelectTrigger id="tradeMode" className="font-code mt-1 bg-card border-primary/30 focus:border-primary focus:ring-primary text-lg py-2.5 h-auto">
                    <SelectValue placeholder="Select trade mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {tradeModes.map(mode => <SelectItem key={mode} value={mode} className="font-code">{mode}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label className="font-code text-sm text-muted-foreground mb-2 block">Risk Protocol</Label>
              <Tabs value={formState.risk} onValueChange={handleRiskTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-primary/5 border-primary/20 border">
                  {riskLevels.map(level => (
                    <TabsTrigger 
                      key={level} 
                      value={level} 
                      className="font-code text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md py-2.5"
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

            <Button type="submit" disabled={isLoading} className="w-full font-code bg-gradient-to-r from-primary via-purple-600 to-pink-600 hover:from-primary/90 hover:via-purple-500 hover:to-pink-500 text-primary-foreground text-xl py-4 rounded-lg shadow-lg hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105">
              {isLoading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : '> INITIATE SHADOW ANALYSIS'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <TerminalExecutionAnimation 
          target={formState.target}
          tradeMode={formState.tradeMode}
          risk={formState.risk}
        />
      )}

      {insights && !isLoading && (
        <Card className="glow-border-accent shadow-2xl">
          <CardHeader className="border-b border-border">
             <div className="flex items-center space-x-3">
                <Lightbulb className="h-8 w-8 text-accent" />
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
              <div className="p-4 mt-2 border border-accent/30 rounded-lg bg-card shadow-inner animate-pulse-glow-accent">
                <PulsingText text={`"${insights.thought}"`} className="text-accent-foreground italic text-base" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="live-chart" className="w-full mt-12">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 bg-transparent p-0">
          <TabsTrigger value="live-chart" className="font-code py-2.5 text-base data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:glow-border-primary data-[state=active]:shadow-md">
            <BarChart className="mr-2 h-5 w-5"/>Live Market Matrix
          </TabsTrigger>
          <TabsTrigger value="experimental-mode" className="font-code py-2.5 text-base data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:glow-border-primary data-[state=active]:shadow-md">
           <Lightbulb className="mr-2 h-5 w-5" />Auto-Trade Sim
          </TabsTrigger>
          <TabsTrigger value="data-sources" className="font-code py-2.5 text-base data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:glow-border-primary data-[state=active]:shadow-md">
            <FileText className="mr-2 h-5 w-5"/>Core Data Streams
          </TabsTrigger>
        </TabsList>
        <TabsContent value="live-chart" className="mt-6">
          <Card className="glow-border-primary shadow-xl">
            <CardHeader><CardTitle className="font-headline text-primary text-2xl">Live Market Matrix</CardTitle></CardHeader>
            <CardContent className="p-2 sm:p-4">
              <div className="mt-4 h-[400px] md:h-[500px] rounded-md overflow-hidden border border-border">
                <TradingViewWidget
                  marketSymbol={formState.target || 'BTCUSDT'}
                  timeframe={chartTimeframe}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="experimental-mode" className="mt-6">
          <Card className="glow-border-primary shadow-xl">
            <CardHeader><CardTitle className="font-headline text-primary text-2xl">Experimental Auto-Trade Simulation</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Engage or disengage the Shadow Core's auto-trade suggestions in a simulated environment. This feature is for testing and training purposes.</p>
              <Button 
                onClick={toggleAutoTrade}
                className={cn(
                    "font-code py-2.5 px-6 text-base transition-all duration-300 w-full sm:w-auto",
                    isAutoTradeEnabled 
                        ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" 
                        : "bg-accent hover:bg-accent/90 text-accent-foreground"
                )}
                >
                {isAutoTradeEnabled ? <ShieldOff className="mr-2 h-5 w-5" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                {isAutoTradeEnabled ? "Disengage Auto-Trade Sim" : "Engage Auto-Trade Sim"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="data-sources" className="mt-6">
          <Card className="glow-border-primary shadow-xl">
            <CardHeader><CardTitle className="font-headline text-primary text-2xl">Shadow Core: Data Streams</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-base">
              <p><span className="font-semibold text-primary">Price Feed & Volume (Live):</span> Binance API</p>
              <p><span className="font-semibold text-primary">Market Sentiment & News (Conceptual):</span> CoinDesk API (BPI for BTC, placeholder for others)</p>
              <p><span className="font-semibold text-primary">AI Thought Generation:</span> Gemini Pro API via Genkit</p>
              <p><span className="font-semibold text-primary">On-Chain Wallet Activity (Live):</span> PolygonScan API (USDT/WBTC on Polygon)</p>
              <p className="text-sm text-muted-foreground pt-2">The Shadow Core utilizes these data streams to learn and generate insights. Your interactions help refine its accuracy.</p>
            </CardContent>
          </Card>
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
  <div className="p-4 border border-border rounded-lg bg-card shadow-md hover:shadow-lg transition-shadow min-h-[80px] flex flex-col justify-center">
    <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
    <p className={cn("text-xl font-semibold mt-1 truncate", valueClassName)}>{value}</p>
  </div>
);
