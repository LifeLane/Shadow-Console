
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Loader2, Zap, BrainCircuit, ArrowUp, ArrowDown, TrendingUp, Clock, Crosshair, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Signal, Market, Ticker24h } from '@/lib/types';
import { generateAiSignalAction } from '@/app/mind/actions';
import { getAvailableMarketsAction, getTicker24hAction } from '@/app/actions';
import { cn } from '@/lib/utils';
import TerminalExecutionAnimation from '../TerminalExecutionAnimation';

const mindFormSchema = z.object({
  market: z.string().min(1, 'Please select a market.'),
  tradingMode: z.enum(['Scalper', 'Sniper', 'Intraday', 'Swing']),
  risk: z.enum(['Low', 'Medium', 'High']),
  executionType: z.enum(['instant', 'optimal']),
});

type MindFormValues = z.infer<typeof mindFormSchema>;

interface MindTabProps {
  isDbInitialized: boolean;
  setExecutableSignal: (signal: Signal | null) => void;
  setActiveTab: (tabId: 'wallet' | 'trade' | 'mind' | 'missions' | 'vault') => void;
}

const MarketStat = ({ label, value, change, icon: Icon, valueClassName }: { label: string; value: string | React.ReactNode; change?: number; icon: React.ElementType, valueClassName?: string }) => (
    <div className="bg-card/70 border border-border/50 rounded-lg p-2 sm:p-3">
        <div className="flex items-center text-muted-foreground text-[0.6rem] sm:text-xs">
            <Icon className="w-3 h-3 mr-1.5" />
            <span>{label}</span>
        </div>
        <div className={cn("text-base sm:text-lg font-bold font-code mt-1", valueClassName)}>
            {value}
        </div>
    </div>
);

const ModeButton = ({ icon: Icon, label, selected, ...props }: { icon: React.ElementType; label: string; selected: boolean } & React.ComponentProps<typeof Button>) => (
    <Button
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
  const { toast } = useToast();

  const form = useForm<MindFormValues>({
    resolver: zodResolver(mindFormSchema),
    defaultValues: { market: 'BTCUSDT', tradingMode: 'Sniper', risk: 'Medium', executionType: 'optimal' },
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

  const onSubmit = async (data: MindFormValues) => {
    setIsGenerating(true);
    try {
      const newSignal = await generateAiSignalAction(data.market, data.tradingMode, data.risk, 'RSI, MACD');
      setExecutableSignal(newSignal);
      toast({
        title: "SHADOW Signal Generated!",
        description: "Executable signal sent to the Trade tab.",
        className: "bg-accent text-accent-foreground border-primary",
        action: <Button onClick={() => setActiveTab('trade')}>Go to Trade</Button>
      });
    } catch (error) {
      toast({ title: "AI Oracle Error", description: "Failed to generate signal. The Oracle may be busy.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleExecutionClick = (type: 'instant' | 'optimal') => {
    form.setValue('executionType', type);
    form.handleSubmit(onSubmit)();
  };

  const tradingModes = [
      { id: 'Scalper', label: 'Scalper', icon: Zap },
      { id: 'Sniper', label: 'Sniper', icon: Crosshair },
      { id: 'Intraday', label: 'Intraday', icon: Clock },
      { id: 'Swing', label: 'Swing', icon: TrendingUp },
  ];

  return (
    <div className="flex-grow flex flex-col p-4 space-y-4 bg-background">
        {isGenerating ? (
            <div className="flex-grow flex flex-col justify-center items-center space-y-4">
                <TerminalExecutionAnimation target={form.getValues('market')} tradeMode={form.getValues('tradingMode')} risk={form.getValues('risk')} />
                <Button onClick={() => setIsGenerating(false)} variant="destructive">Cancel</Button>
            </div>
        ) : (
            <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    <MarketStat label="Current Price" value={tickerData ? `$${parseFloat(tickerData.lastPrice).toLocaleString()}`: <Loader2 className="h-5 w-5 animate-spin" />} icon={Zap} valueClassName="text-white" />
                    <MarketStat label="24h Change" value={tickerData ? `${parseFloat(tickerData.priceChangePercent).toFixed(2)}%`: <Loader2 className="h-5 w-5 animate-spin" />} icon={TrendingUp} valueClassName={tickerData && parseFloat(tickerData.priceChangePercent) >= 0 ? 'text-accent' : 'text-red-500'} />
                    <MarketStat label="24h High" value={tickerData ? `$${parseFloat(tickerData.highPrice).toLocaleString()}`: <Loader2 className="h-5 w-5 animate-spin" />} icon={ArrowUp} />
                    <MarketStat label="24h Low" value={tickerData ? `$${parseFloat(tickerData.lowPrice).toLocaleString()}`: <Loader2 className="h-5 w-5 animate-spin" />} icon={ArrowDown} />
                    <MarketStat label="Volume (BTC)" value={tickerData ? `${(parseFloat(tickerData.volume) / 1000).toFixed(2)}K`: <Loader2 className="h-5 w-5 animate-spin" />} icon={BrainCircuit} />
                    <MarketStat label="Volume (USDT)" value={tickerData ? `$${(parseFloat(tickerData.quoteVolume) / 1000000).toFixed(2)}M`: <Loader2 className="h-5 w-5 animate-spin" />} icon={BrainCircuit} />
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex-grow flex flex-col space-y-4">
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
                                                onClick={() => field.onChange(mode.id)}
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
                                        render={({ field }) => (
                                            <ToggleGroup
                                                type="single"
                                                value={field.value}
                                                onValueChange={(value) => value && field.onChange(value as 'Low' | 'Medium' | 'High')}
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

                        <div className="!mt-auto grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <Button type="button" onClick={() => handleExecutionClick('instant')} className="h-auto py-3 text-base border-2 border-accent text-accent bg-transparent hover:bg-accent hover:text-accent-foreground">
                                <div className="text-left">
                                    <p className="font-bold flex items-center"><Zap className="w-4 h-4 mr-2" />Instant Signal</p>
                                    <p className="text-xs font-normal opacity-80">Executes immediately at market price.</p>
                                </div>
                            </Button>
                             <Button type="button" onClick={() => handleExecutionClick('optimal')} className="h-auto py-3 text-base bg-accent text-accent-foreground hover:bg-accent/90">
                                <div className="text-left">
                                    <p className="font-bold flex items-center"><BrainCircuit className="w-4 h-4 mr-2" />SHADOW's Signal</p>
                                    <p className="text-xs font-normal opacity-80">SHADOW finds the optimal entry.</p>
                                </div>
                            </Button>
                        </div>
                        <p className="text-center text-xs text-muted-foreground !mt-2">Analyses today: 0 / 3. Register for <span className="text-primary underline cursor-pointer">unlimited</span>.</p>
                    </form>
                </Form>
            </>
        )}
    </div>
  );
}
