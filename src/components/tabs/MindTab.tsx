
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Loader2, Zap, BrainCircuit, ArrowUp, ArrowDown, TrendingUp, Clock, Crosshair, Sparkles, Send, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Signal, Market, Ticker24h } from '@/lib/types';
import { generateAiSignalAction, getSignalHistoryAction } from '@/app/mind/actions';
import { getAvailableMarketsAction, getTicker24hAction } from '@/app/actions';
import { cn } from '@/lib/utils';
import TerminalExecutionAnimation from '../TerminalExecutionAnimation';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '../ui/badge';

const mindFormSchema = z.object({
  market: z.string().min(1, 'Please select a market.'),
  tradingMode: z.enum(['Scalper', 'Sniper', 'Intraday', 'Swing']),
  risk: z.enum(['Low', 'Medium', 'High']),
});

type MindFormValues = z.infer<typeof mindFormSchema>;

interface MindTabProps {
  isDbInitialized: boolean;
  setExecutableSignal: (signal: Signal | null) => void;
  setActiveTab: (tabId: 'wallet' | 'trade' | 'mind' | 'missions' | 'profile') => void;
}

const MarketStat = ({ label, value, icon: Icon, valueClassName }: { label: string; value: string | React.ReactNode; icon: React.ElementType, valueClassName?: string }) => (
    <Card className="bg-card/70 border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">{label}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-3 pt-0">
            <div className={cn("text-lg sm:text-xl font-bold font-code", valueClassName)}>
                {value}
            </div>
        </CardContent>
    </Card>
);

const ModeButton = ({ icon: Icon, label, selected, ...props }: { icon: React.ElementType; label: string; selected: boolean } & React.ComponentProps<typeof Button>) => (
    <Button
        type="button"
        variant="outline"
        className={cn(
            "h-auto p-3 flex flex-col justify-center items-center space-y-1.5 border-2 text-center transition-all duration-200",
            selected
                ? "bg-accent text-accent-foreground border-accent glow-border-accent"
                : "bg-card/80 border-border hover:bg-accent/10 hover:border-accent"
        )}
        {...props}
    >
        <Icon className="w-6 h-6" />
        <span className="font-semibold text-xs">{label}</span>
    </Button>
);

export default function MindTab({ isDbInitialized, setExecutableSignal, setActiveTab }: MindTabProps) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [tickerData, setTickerData] = useState<Ticker24h | null>(null);
  const [signalHistory, setSignalHistory] = useState<Signal[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const { toast } = useToast();

  const form = useForm<MindFormValues>({
    resolver: zodResolver(mindFormSchema),
    defaultValues: { market: 'BTCUSDT', tradingMode: 'Sniper', risk: 'Medium' },
  });
  
  const selectedMarket = form.watch('market');

  useEffect(() => {
    async function loadMarkets() {
      setIsLoadingMarkets(true);
      try {
        const availableMarkets = await getAvailableMarketsAction();
        setMarkets(availableMarkets);
        if (availableMarkets.length > 0 && !form.getValues('market')) {
          form.setValue('market', availableMarkets[0].symbol);
        }
      } catch (error) {
        toast({ title: "Error", description: "Could not load market pairs.", variant: "destructive" });
      } finally {
        setIsLoadingMarkets(false);
      }
    }
    loadMarkets();
  }, [form, toast]);

  useEffect(() => {
    let isMounted = true;
    async function loadTickerData() {
        if (!selectedMarket) return;
        setTickerData(null);
        const data = await getTicker24hAction(selectedMarket);
        if(isMounted) {
            setTickerData(data);
        }
    }
    loadTickerData();
    return () => { isMounted = false };
  }, [selectedMarket]);

  useEffect(() => {
    if (!isDbInitialized) return;
    async function loadHistory() {
      setIsLoadingHistory(true);
      try {
        const history = await getSignalHistoryAction();
        setSignalHistory(history);
      } catch (error) {
        toast({ title: "Error", description: "Could not load signal history.", variant: "destructive" });
      } finally {
        setIsLoadingHistory(false);
      }
    }
    loadHistory();
  }, [isDbInitialized, toast]);

  const handleGenerateSignal = form.handleSubmit(async (data: MindFormValues) => {
    setIsGenerating(true);
    try {
      const newSignal = await generateAiSignalAction(data.market, data.tradingMode, data.risk, 'RSI, MACD');
      setSignalHistory(prev => [newSignal, ...prev]);
      toast({
        title: "SHADOW Signal Generated!",
        description: "Review the new signal in your Signal Log below.",
        className: "bg-accent text-accent-foreground border-primary",
      });
    } catch (error) {
      toast({ title: "AI Oracle Error", description: "Failed to generate signal. The Oracle may be busy.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  });

  const handleExecuteSignal = (signal: Signal) => {
    if (signal.prediction === 'HOLD') {
        toast({ title: "Cannot Execute HOLD", description: "This signal is advisory. Only LONG or SHORT signals can be sent to the trade terminal.", variant: "destructive"});
        return;
    }
    setExecutableSignal(signal);
    setActiveTab('trade');
    toast({
        title: "Signal Sent to Terminal",
        description: `Parameters for ${signal.asset} ${signal.prediction} are ready for execution.`,
        className: "bg-primary text-primary-foreground border-accent"
    });
  }

  const tradingModes = [
      { id: 'Scalper', label: 'Scalper', icon: Zap },
      { id: 'Sniper', label: 'Sniper', icon: Crosshair },
      { id: 'Intraday', label: 'Intraday', icon: Clock },
      { id: 'Swing', label: 'Swing', icon: TrendingUp },
  ];
  
  if (isGenerating) {
    return (
      <div className="flex-grow flex flex-col justify-center items-center space-y-4 bg-background p-4">
        <TerminalExecutionAnimation target={form.getValues('market')} tradeMode={form.getValues('tradingMode')} risk={form.getValues('risk')} />
        <Button onClick={() => setIsGenerating(false)} variant="destructive">Cancel</Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4 bg-background">
        <div className="px-4 pt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <MarketStat label="Current Price" value={tickerData ? `$${parseFloat(tickerData.lastPrice).toLocaleString()}`: <Loader2 className="h-5 w-5 animate-spin" />} icon={Zap} valueClassName="text-white" />
                <MarketStat label="24h Change" value={tickerData ? `${parseFloat(tickerData.priceChangePercent).toFixed(2)}%`: <Loader2 className="h-5 w-5 animate-spin" />} icon={TrendingUp} valueClassName={tickerData && parseFloat(tickerData.priceChangePercent) >= 0 ? 'text-accent' : 'text-red-500'} />
                <MarketStat label="24h High" value={tickerData ? `$${parseFloat(tickerData.highPrice).toLocaleString()}`: <Loader2 className="h-5 w-5 animate-spin" />} icon={ArrowUp} />
                <MarketStat label="24h Low" value={tickerData ? `$${parseFloat(tickerData.lowPrice).toLocaleString()}`: <Loader2 className="h-5 w-5 animate-spin" />} icon={ArrowDown} />
                <MarketStat label="Volume (BTC)" value={tickerData ? `${(parseFloat(tickerData.volume) / 1000).toFixed(2)}K`: <Loader2 className="h-5 w-5 animate-spin" />} icon={BrainCircuit} />
                <MarketStat label="Volume (USDT)" value={tickerData ? `$${(parseFloat(tickerData.quoteVolume) / 1000000).toFixed(2)}M`: <Loader2 className="h-5 w-5 animate-spin" />} icon={BrainCircuit} />
            </div>

            <Form {...form}>
                <div className="flex-grow flex flex-col space-y-4 mt-4">
                    <FormField
                        control={form.control}
                        name="market"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-muted-foreground flex items-center"><BrainCircuit className="w-4 h-4 mr-2"/> Target Asset</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingMarkets}>
                                    <FormControl>
                                        <SelectTrigger className="h-12 text-base border-2 border-border focus:border-primary">
                                            {isLoadingMarkets ? <Loader2 className="h-4 w-4 animate-spin" /> : <SelectValue />}
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {markets.map((market) => (
                                            <SelectItem key={market.symbol} value={market.symbol}>{market.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />
                    
                    <FormField
                        control={form.control}
                        name="tradingMode"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-muted-foreground flex items-center"><Sparkles className="w-4 h-4 mr-2"/> Trading Mode</FormLabel>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {tradingModes.map((mode) => (
                                        <ModeButton
                                            key={mode.id}
                                            icon={mode.icon}
                                            label={mode.label}
                                            selected={field.value === mode.id}
                                            onClick={() => form.setValue('tradingMode', mode.id)}
                                        />
                                    ))}
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="risk"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-muted-foreground flex items-center"><Crosshair className="w-4 h-4 mr-2"/> Risk Profile</FormLabel>
                                <Controller
                                    control={form.control}
                                    name="risk"
                                    render={({ field: controllerField }) => (
                                        <ToggleGroup
                                            type="single"
                                            value={controllerField.value}
                                            onValueChange={(value) => { if (value) form.setValue('risk', value as 'Low' | 'Medium' | 'High')}}
                                            className="grid grid-cols-3 gap-2 sm:gap-4 h-12 border-2 border-border rounded-lg p-1"
                                        >
                                            <ToggleGroupItem value="Low" className="h-full">Low</ToggleGroupItem>
                                            <ToggleGroupItem value="Medium" className="h-full">Medium</ToggleGroupItem>
                                            <ToggleGroupItem value="High" className="h-full">High</ToggleGroupItem>
                                        </ToggleGroup>
                                    )}
                                />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <Button type="button" onClick={handleGenerateSignal} className="h-auto py-3 text-base border-2 border-accent text-accent bg-transparent hover:bg-accent hover:text-accent-foreground">
                            <div className="text-left">
                                <p className="font-bold flex items-center"><Zap className="w-4 h-4 mr-2" />Instant Signal</p>
                                <p className="text-xs font-normal opacity-80">Executes immediately at market price.</p>
                            </div>
                        </Button>
                         <Button type="button" onClick={handleGenerateSignal} className="h-auto py-3 text-base bg-accent text-accent-foreground hover:bg-accent/90">
                            <div className="text-left">
                                <p className="font-bold flex items-center"><BrainCircuit className="w-4 h-4 mr-2" />SHADOW's Signal</p>
                                <p className="text-xs font-normal opacity-80">SHADOW finds the optimal entry.</p>
                            </div>
                        </Button>
                    </div>
                    <p className="text-center text-xs text-muted-foreground !mt-2">Analyses today: 0 / 3. Register for <span className="text-primary underline cursor-pointer">unlimited</span>.</p>
                </div>
            </Form>
        </div>

        <div className="flex-grow flex flex-col min-h-0 px-4 pb-4">
            <Card className="flex-grow flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center"><History className="mr-2" /> Signal Log</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col p-2 pt-0">
                    <ScrollArea className="flex-grow">
                        <div className="space-y-3 p-4">
                            {isLoadingHistory ? (
                                <div className="flex justify-center items-center h-40"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
                            ) : signalHistory.length === 0 ? (
                                <p className="text-center text-muted-foreground">No signals generated yet. Use the console above.</p>
                            ) : (
                                signalHistory.map((signal) => (
                                    <Card key={signal.id} className="p-3 bg-card/50">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-grow">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge className={cn(
                                                        signal.prediction === 'LONG' ? 'bg-accent text-accent-foreground' :
                                                        signal.prediction === 'SHORT' ? 'bg-destructive text-destructive-foreground' : 'bg-muted text-muted-foreground'
                                                    )}>{signal.prediction}</Badge>
                                                    <span className="font-bold">{signal.asset}</span>
                                                    <span className="text-sm text-muted-foreground">(Conf: {signal.confidence}%)</span>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2 text-xs font-code">
                                                    <div><span className="text-muted-foreground">Entry:</span> ${signal.entryPrice.toLocaleString()}</div>
                                                    <div><span className="text-muted-foreground">TP:</span> ${signal.takeProfit.toLocaleString()}</div>
                                                    <div><span className="text-muted-foreground">SL:</span> ${signal.stopLoss.toLocaleString()}</div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                 <Button size="icon" variant="ghost" className="h-8 w-8 text-accent hover:bg-accent/20" onClick={() => handleExecuteSignal(signal)}>
                                                    <Send className="h-4 w-4" />
                                                </Button>
                                                <p className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {formatDistanceToNow(new Date(signal.timestamp), { addSuffix: true })}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
