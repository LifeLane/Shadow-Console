
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Loader2, Zap, BrainCircuit, ArrowUp, ArrowDown, TrendingUp, Clock, Crosshair, Sparkles, Send, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Signal, Market, Ticker24h } from '@/lib/types';
import { generateAiSignalAction, getSignalHistoryAction } from '@/app/mind/actions';
import { getAvailableMarketsAction, getTicker24hAction } from '@/app/actions';
import { cn } from '@/lib/utils';
import TerminalExecutionAnimation from '../TerminalExecutionAnimation';
import { Card, CardContent } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { placeTradeAction } from '@/app/agents/actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';


const mindFormSchema = z.object({
  market: z.string().min(1, 'Please select a market.'),
  tradingMode: z.enum(['Scalper', 'Sniper', 'Intraday', 'Swing']),
  risk: z.enum(['Low', 'Medium', 'High']),
});

type MindFormValues = z.infer<typeof mindFormSchema>;

interface MindTabProps {
  isDbInitialized: boolean;
  setActiveTab: (tabId: 'wallet' | 'trade' | 'mind' | 'missions' | 'profile') => void;
}

const MarketStat = ({ label, value, icon: Icon, valueClassName }: { label: string; value: string | React.ReactNode; icon: React.ElementType, valueClassName?: string }) => (
    <div className="bg-card/60 border border-primary/20 rounded-lg p-3 flex flex-col justify-center text-center">
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <span>{label}</span>
            <Icon className="h-3 w-3 shrink-0" />
        </div>
        <div className={cn("text-lg font-bold font-code mt-1 truncate", valueClassName)}>
            {value}
        </div>
    </div>
);


const SignalCard = ({ signal, onExecute }: { signal: Signal; onExecute: (signal: Signal) => void; }) => (
    <Card className="p-3 bg-card/50 border-primary/20">
        <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
                <Badge className={cn(
                    "py-0.5 px-2 text-xs font-bold rounded-md",
                    signal.prediction === 'LONG' ? 'bg-green-500/80 text-white' :
                    signal.prediction === 'SHORT' ? 'bg-red-500/80 text-white' : 'bg-muted text-muted-foreground'
                )}>{signal.prediction}</Badge>
                <span className="font-semibold sm:text-lg">{signal.asset}</span>
            </div>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-accent hover:bg-accent/20" onClick={() => onExecute(signal)} disabled={signal.prediction === 'HOLD'}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Execute Trade</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>

        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 font-code text-sm mb-3">
            <div className="text-muted-foreground">Shadow Score</div>
            <div className="text-right font-semibold">{signal.confidence}%</div>
            
            <div className="text-muted-foreground">Entry</div>
            <div className="text-right font-semibold">${signal.entryPrice.toLocaleString()}</div>

            <div className="text-muted-foreground">TP</div>
            <div className="text-right font-semibold text-accent">${signal.takeProfit.toLocaleString()}</div>
            
            <div className="text-muted-foreground">SL</div>
            <div className="text-right font-semibold text-destructive">${signal.stopLoss.toLocaleString()}</div>
            
            <div className="text-muted-foreground">Generated</div>
            <div className="text-right font-semibold">
                {formatDistanceToNow(new Date(signal.timestamp), { addSuffix: true })}
            </div>
        </div>
        
        <div className="pt-3 border-t border-border/20">
             <p className="text-xs text-muted-foreground/80 flex items-start gap-1.5">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Shadow Signals are AI-generated for gamified purposes only and do not constitute financial advice. Trade at your own risk.</span>
            </p>
        </div>
    </Card>
);

const ModeButton = ({ icon: Icon, label, selected, ...props }: { icon: React.ElementType; label: string; selected: boolean } & React.ComponentProps<typeof Button>) => (
    <Button
        type="button"
        variant="outline"
        className={cn(
            "h-auto p-3 flex flex-row justify-center items-center gap-2 border-2 text-center transition-all duration-200",
            selected
                ? "bg-accent text-accent-foreground border-accent glow-border-accent"
                : "bg-card/80 border-border hover:bg-accent/10 hover:border-accent hover:text-primary"
        )}
        {...props}
    >
        <Icon className="w-4 h-4" />
        <span className="font-semibold text-sm">{label}</span>
    </Button>
);


export default function MindTab({ isDbInitialized, setActiveTab }: MindTabProps) {
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

  const loadHistory = useCallback(async () => {
    if (!isDbInitialized) return;
    setIsLoadingHistory(true);
    try {
      const history = await getSignalHistoryAction();
      setSignalHistory(history);
    } catch (error) {
      console.error("Error loading signal history:", error);
      toast({ title: "Error", description: "Could not load signal history.", variant: "destructive" });
    } finally {
      setIsLoadingHistory(false);
    }
  }, [isDbInitialized, toast]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleGenerateSignal = form.handleSubmit(async (data: MindFormValues) => {
    setIsGenerating(true);
    try {
      const newSignal = await generateAiSignalAction(data.market, data.tradingMode, data.risk, 'RSI, MACD');
      // Prepend the new signal to the history for immediate feedback
      setSignalHistory(prev => [newSignal, ...prev.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())]);
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

  const handleExecuteSignal = async (signal: Signal) => {
    if (signal.prediction === 'HOLD') {
        toast({ title: "Cannot Execute HOLD", description: "This signal is advisory. Only LONG or SHORT signals can be executed.", variant: "destructive"});
        return;
    }
    try {
      await placeTradeAction({
        asset: signal.asset,
        side: signal.prediction,
        stake: 100, // Default stake of 100 SHADOW
        entryPrice: signal.entryPrice,
        takeProfit: signal.takeProfit,
        stopLoss: signal.stopLoss,
      });
      toast({
        title: "Trade Executed!",
        description: `Your ${signal.prediction} order for ${signal.asset} has been placed. View in the Trade tab.`,
        className: "bg-primary text-primary-foreground border-accent"
      });
      setActiveTab('trade');
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ title: 'Trade Execution Failed', description: errorMessage, variant: 'destructive' });
    }
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

  const pendingSignals = signalHistory.filter(s => s.status === 'PENDING');

  return (
    <div className="h-full flex flex-col space-y-3 bg-background">
        {/* Top Section: Console */}
        <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                <MarketStat label="Current Price" value={tickerData ? `$${parseFloat(tickerData.lastPrice).toLocaleString()}`: <Loader2 className="h-5 w-5 animate-spin" />} icon={Zap} valueClassName="text-white" />
                <MarketStat label="24h Change" value={tickerData ? `${parseFloat(tickerData.priceChangePercent).toFixed(2)}%`: <Loader2 className="h-5 w-5 animate-spin" />} icon={TrendingUp} valueClassName={tickerData && parseFloat(tickerData.priceChangePercent) >= 0 ? 'text-accent' : 'text-red-500'} />
                <MarketStat label="24h High" value={tickerData ? `$${parseFloat(tickerData.highPrice).toLocaleString()}`: <Loader2 className="h-5 w-5 animate-spin" />} icon={ArrowUp} />
                <MarketStat label="24h Low" value={tickerData ? `$${parseFloat(tickerData.lowPrice).toLocaleString()}`: <Loader2 className="h-5 w-5 animate-spin" />} icon={ArrowDown} />
                <MarketStat label="Volume (BTC)" value={tickerData ? `${(parseFloat(tickerData.volume) / 1000).toFixed(2)}K`: <Loader2 className="h-5 w-5 animate-spin" />} icon={BrainCircuit} />
                <MarketStat label="Volume (USDT)" value={tickerData ? `$${(parseFloat(tickerData.quoteVolume) / 1000000).toFixed(2)}M`: <Loader2 className="h-5 w-5 animate-spin" />} icon={BrainCircuit} />
            </div>

            <Form {...form}>
                <div className="flex-grow flex flex-col space-y-3 mt-3">
                    <FormField
                        control={form.control}
                        name="market"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-muted-foreground text-xs flex items-center"><BrainCircuit className="w-4 h-4 mr-2"/> Target Asset</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingMarkets}>
                                    <FormControl>
                                        <SelectTrigger className="h-11 text-sm sm:text-base border-2 border-border focus:border-primary">
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
                    
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <FormField
                            control={form.control}
                            name="tradingMode"
                            render={({ field }) => (
                                <FormItem className="col-span-1 sm:col-span-4">
                                    <FormLabel className="text-muted-foreground text-xs flex items-center"><Sparkles className="w-4 h-4 mr-2"/> Trading Mode</FormLabel>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {tradingModes.map((mode) => (
                                            <ModeButton
                                                key={mode.id}
                                                icon={mode.icon}
                                                label={mode.label}
                                                selected={field.value === mode.id}
                                                onClick={() => form.setValue('tradingMode', mode.id as any, { shouldValidate: true })}
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
                                <FormItem className="col-span-1 sm:col-span-4">
                                    <FormLabel className="text-muted-foreground text-xs flex items-center"><Crosshair className="w-4 h-4 mr-2"/> Risk Profile</FormLabel>
                                    <Controller
                                        control={form.control}
                                        name="risk"
                                        render={({ field: controllerField }) => (
                                            <ToggleGroup
                                                type="single"
                                                value={controllerField.value}
                                                onValueChange={(value) => { if (value) form.setValue('risk', value as 'Low' | 'Medium' | 'High', { shouldValidate: true })}}
                                                className="grid grid-cols-3 gap-2 h-11 border-2 border-border rounded-lg p-1"
                                            >
                                                <ToggleGroupItem value="Low" className="h-full text-xs sm:text-sm">Low</ToggleGroupItem>
                                                <ToggleGroupItem value="Medium" className="h-full text-xs sm:text-sm">Medium</ToggleGroupItem>
                                                <ToggleGroupItem value="High" className="h-full text-xs sm:text-sm">High</ToggleGroupItem>
                                            </ToggleGroup>
                                        )}
                                    />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        <Button type="button" onClick={handleGenerateSignal} className="h-auto py-2 text-sm sm:text-base border-2 border-accent text-accent bg-transparent hover:bg-accent hover:text-accent-foreground">
                            <div className="text-left">
                                <p className="font-bold flex items-center"><Zap className="w-4 h-4 mr-2" />Instant Signal</p>
                                <p className="text-xs font-normal opacity-80">Executes immediately at market price.</p>
                            </div>
                        </Button>
                         <Button type="button" onClick={handleGenerateSignal} className="h-auto py-2 text-sm sm:text-base bg-accent text-accent-foreground hover:bg-accent/90">
                            <div className="text-left">
                                <p className="font-bold flex items-center"><BrainCircuit className="w-4 h-4 mr-2" />SHADOW's Signal</p>
                                <p className="text-xs font-normal opacity-80">SHADOW finds the optimal entry.</p>
                            </div>
                        </Button>
                    </div>
                </div>
            </Form>
        </div>

        {/* Bottom Section: Signal Log */}
        <div className="flex-grow flex flex-col min-h-0">
            <Tabs defaultValue="all" className="flex-grow flex flex-col">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="all" className="text-xs sm:text-sm">Signal Log</TabsTrigger>
                    <TabsTrigger value="pending" className="text-xs sm:text-sm">Pending ({pendingSignals.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="flex-grow mt-2 overflow-hidden">
                    <ScrollArea className="h-full">
                        <div className="space-y-2 pr-2">
                            {isLoadingHistory ? (
                                <div className="flex justify-center items-center h-40"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
                            ) : signalHistory.length === 0 ? (
                                <p className="text-center text-muted-foreground py-10 text-sm">No signals generated yet. Use the console above.</p>
                            ) : (
                                signalHistory.map((signal) => (
                                    <SignalCard key={signal.id} signal={signal} onExecute={handleExecuteSignal} />
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="pending" className="flex-grow mt-2 overflow-hidden">
                    <ScrollArea className="h-full">
                        <div className="space-y-2 pr-2">
                            {isLoadingHistory ? (
                                <div className="flex justify-center items-center h-40"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
                            ) : pendingSignals.length === 0 ? (
                                <p className="text-center text-muted-foreground py-10 text-sm">No pending signals.</p>
                            ) : (
                                pendingSignals.map((signal) => (
                                    <SignalCard key={signal.id} signal={signal} onExecute={handleExecuteSignal} />
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        </div>

        <div className="px-4 pb-2 text-center text-xs text-muted-foreground/80 flex items-center justify-center gap-1.5">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <p>Shadow Signals are AI-generated for gamified purposes and do not constitute financial advice. All trades are simulated. Trade at your own risk.</p>
        </div>
    </div>
  );
}
