"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateMarketInsights, MarketInsightsInput, MarketInsightsOutput } from '@/ai/flows/generate-market-insights';
import { useToast } from '@/hooks/use-toast';
import TypewriterText from '@/components/TypewriterText';
import PulsingText from '@/components/PulsingText';
import { Loader2, BarChart, FileText, Lightbulb } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from 'next/image';

const initialFormState: Omit<MarketInsightsInput, 'priceFeed' | 'sentimentNews' | 'walletTransaction'> = {
  target: 'BTCUSDT',
  timeframe: '15m',
  indicators: 'RSI, MACD, ATR',
  risk: 'Medium',
};

const timeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'];
const riskLevels = ['Low', 'Medium', 'High'];

export default function HomeTab() {
  const [formState, setFormState] = useState(initialFormState);
  const [insights, setInsights] = useState<MarketInsightsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSelectChange = (name: keyof typeof initialFormState) => (value: string) => {
    setFormState(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setInsights(null);

    // Mock data for external APIs as per the flow's requirements
    const mockApiData = {
      priceFeed: "Mock Price Data: BTC is currently trading at $25,350 with high volume.",
      sentimentNews: "Mock Sentiment: Recent news indicates positive market sentiment towards Bitcoin.",
      walletTransaction: "Mock Wallet Action: Large BTC accumulation detected in whale wallets.",
    };

    try {
      const result = await generateMarketInsights({ ...formState, ...mockApiData });
      setInsights(result);
    } catch (error) {
      console.error("Error generating insights:", error);
      toast({
        title: "Error",
        description: "Failed to generate market insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getPredictionColor = (prediction?: string) => {
    if (!prediction) return 'text-foreground';
    switch (prediction.toUpperCase()) {
      case 'BUY': return 'text-green-500';
      case 'SELL': return 'text-red-500';
      case 'HOLD':
      default: return 'text-yellow-500';
    }
  };


  return (
    <div className="space-y-8">
      <Card className="glow-border-primary">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">Market Command Console</CardTitle>
          <CardDescription>Input parameters to get Shadow's insights.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="target" className="font-code text-sm">Target Market (e.g., BTCUSDT)</Label>
                <Input 
                  id="target" 
                  name="target" 
                  value={formState.target} 
                  onChange={handleInputChange} 
                  className="font-code mt-1 bg-card border-primary/50 focus:border-primary focus:ring-primary" 
                  placeholder="BTCUSDT"
                />
              </div>
              <div>
                <Label htmlFor="timeframe" className="font-code text-sm">Timeframe</Label>
                 <Select name="timeframe" value={formState.timeframe} onValueChange={handleSelectChange('timeframe')}>
                  <SelectTrigger id="timeframe" className="font-code mt-1 bg-card border-primary/50 focus:border-primary focus:ring-primary">
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeframes.map(tf => <SelectItem key={tf} value={tf} className="font-code">{tf}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="indicators" className="font-code text-sm">Indicators (comma-separated)</Label>
              <Input 
                id="indicators" 
                name="indicators" 
                value={formState.indicators} 
                onChange={handleInputChange} 
                className="font-code mt-1 bg-card border-primary/50 focus:border-primary focus:ring-primary" 
                placeholder="RSI, MACD, ATR"
              />
            </div>
            <div>
              <Label htmlFor="risk" className="font-code text-sm">Risk Level</Label>
              <Select name="risk" value={formState.risk} onValueChange={handleSelectChange('risk')}>
                <SelectTrigger id="risk" className="font-code mt-1 bg-card border-primary/50 focus:border-primary focus:ring-primary">
                  <SelectValue placeholder="Select risk level" />
                </SelectTrigger>
                <SelectContent>
                  {riskLevels.map(rl => <SelectItem key={rl} value={rl} className="font-code">{rl}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full font-code bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3">
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : '> EXECUTE'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <Card className="glow-border-accent">
          <CardContent className="p-6 text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-accent mb-4" />
            <p className="text-accent font-code">Shadow is thinking...</p>
          </CardContent>
        </Card>
      )}

      {insights && (
        <Card className="glow-border-accent">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-accent">Shadow's Output</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 font-code text-sm md:text-base">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <OutputItem label="Prediction" value={insights.prediction} valueClassName={getPredictionColor(insights.prediction)} />
              <OutputItem label="Confidence" value={`${insights.confidence}%`} />
              <OutputItem label="ShadowScore" value={`${insights.shadowScore}`} />
              <OutputItem label="Entry Range" value={insights.entryRange} />
              <OutputItem label="Stop Loss" value={insights.stopLoss} />
              <OutputItem label="Take Profit" value={insights.takeProfit} />
            </div>
            <div className="pt-2">
              <Label className="text-accent font-semibold">Current Thought:</Label>
              <div className="p-3 mt-1 border border-accent/50 rounded-md bg-card animate-pulse-glow-accent">
                <PulsingText text={`"${insights.thought}"`} className="text-accent-foreground italic" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="live-chart" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 gap-2 bg-transparent p-0">
          <TabsTrigger value="live-chart" className="font-code data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:glow-border-primary">
            <BarChart className="mr-2 h-4 w-4"/>Live Chart
          </TabsTrigger>
          <TabsTrigger value="experimental-mode" className="font-code data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:glow-border-primary">
           <Lightbulb className="mr-2 h-4 w-4" />Experimental
          </TabsTrigger>
          <TabsTrigger value="data-sources" className="font-code data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:glow-border-primary">
            <FileText className="mr-2 h-4 w-4"/>Data Sources
          </TabsTrigger>
        </TabsList>
        <TabsContent value="live-chart">
          <Card className="mt-4 glow-border-primary">
            <CardHeader><CardTitle className="font-headline text-primary">Live Chart View</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground">TradingView widget will be integrated here.</p>
              <div className="mt-4 aspect-video bg-muted rounded-md flex items-center justify-center">
                 <Image src="https://placehold.co/600x400.png" alt="Placeholder chart" data-ai-hint="financial chart" width={600} height={400} className="rounded-md" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="experimental-mode">
          <Card className="mt-4 glow-border-primary">
            <CardHeader><CardTitle className="font-headline text-primary">Experimental Mode</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Enable Shadow auto-trade suggestions (simulated environment).</p>
              <Button className="mt-4 font-code bg-primary/80 hover:bg-primary text-primary-foreground">Enable Auto-Trade (Simulated)</Button>
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="data-sources">
          <Card className="mt-4 glow-border-primary">
            <CardHeader><CardTitle className="font-headline text-primary">Data Sources Used</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <p><span className="font-semibold text-primary">Price Feed & Volume:</span> Binance API (Simulated)</p>
              <p><span className="font-semibold text-primary">Sentiment/News:</span> CoinDesk API (Simulated)</p>
              <p><span className="font-semibold text-primary">AI Thought Generation:</span> Gemini Pro API</p>
              <p><span className="font-semibold text-primary">Wallet Activity:</span> Polygon API (Simulated)</p>
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
  <div className="p-3 border border-border rounded-md bg-card shadow-sm">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className={cn("text-lg font-semibold", valueClassName)}>{value}</p>
  </div>
);
