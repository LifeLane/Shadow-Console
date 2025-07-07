
"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowDown, ArrowUp, BarChart, Loader2, ListOrdered, X, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Trade, Market, Signal } from '@/lib/types';
import { getTradesAction, placeTradeAction } from '@/app/agents/actions';
import { getLivePrice, getAvailableMarketsAction } from '@/app/actions';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

const tradeFormSchema = z.object({
    asset: z.string().min(1, 'Please select an asset.'),
    side: z.enum(['LONG', 'SHORT']),
    stake: z.coerce.number().min(10, 'Minimum stake is 10 SHADOW').max(10000, 'Maximum stake is 10,000 SHADOW'),
    entryPrice: z.coerce.number().optional(),
    takeProfit: z.coerce.number().positive('Take profit must be a positive number.'),
    stopLoss: z.coerce.number().positive('Stop loss must be a positive number.'),
});

type TradeFormValues = z.infer<typeof tradeFormSchema>;

interface TradeTabProps {
  isDbInitialized: boolean;
  executableSignal: Signal | null;
  setExecutableSignal: (signal: Signal | null) => void;
}

export default function TradeTab({ isDbInitialized, executableSignal, setExecutableSignal }: TradeTabProps) {
    const [trades, setTrades] = useState<Trade[]>([]);
    const [markets, setMarkets] = useState<Market[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMarkets, setIsLoadingMarkets] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [livePrice, setLivePrice] = useState<string | null>(null);
    const { toast } = useToast();

    const form = useForm<TradeFormValues>({
        resolver: zodResolver(tradeFormSchema),
        defaultValues: {
            asset: '',
            side: 'LONG',
            stake: 100,
            takeProfit: 0,
            stopLoss: 0,
        },
    });

    const selectedAsset = form.watch('asset');

    useEffect(() => {
        if (!isDbInitialized) return;

        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                const tradesData = await getTradesAction();
                setTrades(tradesData);
            } catch (error) {
                toast({ title: 'Error', description: 'Could not load trade history.', variant: 'destructive' });
            } finally {
                setIsLoading(false);
            }
        };
        loadInitialData();
    }, [isDbInitialized, toast]);

    useEffect(() => {
        const loadMarkets = async () => {
            setIsLoadingMarkets(true);
            try {
                const availableMarkets = await getAvailableMarketsAction();
                setMarkets(availableMarkets);
                if (availableMarkets.length > 0 && !form.getValues('asset')) {
                    form.setValue('asset', availableMarkets[0].symbol);
                }
            } catch (error) {
                 toast({ title: 'Error', description: 'Could not load market pairs.', variant: 'destructive' });
            } finally {
                setIsLoadingMarkets(false);
            }
        };
        loadMarkets();
    }, [form, toast]);
    
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        const fetchPrice = async () => {
            if (selectedAsset) {
                const price = await getLivePrice(selectedAsset);
                setLivePrice(price);
            }
        }
        if (selectedAsset) {
            fetchPrice();
            interval = setInterval(fetchPrice, 5000);
        }
        return () => {
            if(interval) clearInterval(interval)
        };
    }, [selectedAsset]);
    
    useEffect(() => {
        if (livePrice && !form.getValues('takeProfit') && !form.getValues('stopLoss')) {
            const price = parseFloat(livePrice);
            if (!isNaN(price)) {
                form.setValue('takeProfit', parseFloat((price * 1.02).toFixed(2)));
                form.setValue('stopLoss', parseFloat((price * 0.99).toFixed(2)));
            }
        }
    }, [livePrice, selectedAsset, form]);


    const onSubmit = async (data: TradeFormValues) => {
        setIsSubmitting(true);
        try {
            const newTrade = await placeTradeAction({
              ...data,
              entryPrice: parseFloat(livePrice || '0')
            });
            setTrades(prev => [newTrade, ...prev]);
            toast({
                title: 'Trade Placed',
                description: `Your ${data.side} order for ${data.asset} has been submitted.`,
            });
            form.reset({
                ...form.getValues(),
                stake: 100,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ title: 'Trade Failed', description: errorMessage, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleUseSignal = () => {
        if (!executableSignal) return;

        if (executableSignal.prediction === 'HOLD') {
            toast({
                title: "Signal is 'HOLD'",
                description: "Cannot execute a 'HOLD' signal. Please choose LONG or SHORT manually.",
                variant: "destructive",
            });
            setExecutableSignal(null);
            return;
        }

        form.setValue('asset', executableSignal.asset);
        form.setValue('side', executableSignal.prediction as 'LONG' | 'SHORT');
        form.setValue('takeProfit', executableSignal.takeProfit);
        form.setValue('stopLoss', executableSignal.stopLoss);
        
        setExecutableSignal(null);
        toast({
            title: "Signal Applied",
            description: `Trade parameters for ${executableSignal.asset} have been set.`,
            className: "bg-accent text-accent-foreground border-primary"
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-1">
                <Card className="glow-border-primary">
                    <CardHeader>
                        <CardTitle className="text-2xl text-primary flex items-center">
                            <BarChart className="mr-3"/> Trade Terminal
                        </CardTitle>
                        <CardDescription>
                            Live Price ({selectedAsset}): {livePrice ? `$${parseFloat(livePrice).toLocaleString()}` : <Loader2 className="h-4 w-4 animate-spin inline-block"/>}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {executableSignal && (
                            <Card className="mb-6 border-accent glow-border-accent bg-accent/10">
                                <CardHeader className="p-4">
                                    <CardTitle className="text-accent flex items-center justify-between text-lg">
                                    <span className="flex items-center"><Zap className="mr-2"/> Executable Signal</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setExecutableSignal(null)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 space-y-2 text-sm">
                                    <div className="flex justify-between"><span>Asset:</span> <span className="font-bold">{executableSignal.asset}</span></div>
                                    <div className="flex justify-between"><span>Prediction:</span> <span className="font-bold">{executableSignal.prediction}</span></div>
                                    <div className="flex justify-between"><span>Confidence:</span> <span className="font-bold">{executableSignal.confidence}%</span></div>
                                    <Button onClick={handleUseSignal} className="w-full mt-2 bg-accent hover:bg-accent/90 text-accent-foreground">Use this Signal</Button>
                                </CardContent>
                            </Card>
                        )}
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField control={form.control} name="asset" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Asset</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingMarkets}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    {isLoadingMarkets ? <Loader2 className="h-4 w-4 animate-spin" /> : <SelectValue placeholder="Select an asset" />}
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {markets.map((market) => (
                                                  <SelectItem key={market.symbol} value={market.symbol}>{market.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                
                                <FormField control={form.control} name="side" render={({ field }) => (
                                    <FormItem>
                                        <Tabs value={field.value} onValueChange={(value) => field.onChange(value as 'LONG' | 'SHORT')} className="w-full">
                                            <TabsList className="grid w-full grid-cols-2">
                                                <TabsTrigger value="LONG">Long <ArrowUp className="h-4 w-4 ml-2 text-green-500"/></TabsTrigger>
                                                <TabsTrigger value="SHORT">Short <ArrowDown className="h-4 w-4 ml-2 text-red-500"/></TabsTrigger>
                                            </TabsList>
                                        </Tabs>
                                    </FormItem>
                                )}/>

                                <FormField control={form.control} name="stake" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Stake Amount (SHADOW)</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>

                                <FormField control={form.control} name="takeProfit" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Take Profit ($)</FormLabel>
                                        <FormControl><Input type="number" step="any" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>

                                <FormField control={form.control} name="stopLoss" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Stop Loss ($)</FormLabel>
                                        <FormControl><Input type="number" step="any" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>

                                <Button type="submit" disabled={isSubmitting || !livePrice} className="w-full h-12 text-lg">
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : 'Place Trade'}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center"><ListOrdered className="mr-2"/> Trade History</CardTitle>
                        <CardDescription>Your recent positions in the arena.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                             <div className="flex justify-center items-center h-40"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Asset</TableHead>
                                        <TableHead>Side</TableHead>
                                        <TableHead>Stake</TableHead>
                                        <TableHead>Entry Price</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">PNL</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {trades.map((trade) => (
                                        <TableRow key={trade.id} className={trade.status === 'CLOSED' ? 'opacity-70' : ''}>
                                            <TableCell className="font-medium">{trade.asset}</TableCell>
                                            <TableCell className={cn("font-semibold", trade.side === 'LONG' ? 'text-green-500' : 'text-red-500')}>{trade.side}</TableCell>
                                            <TableCell>{trade.stake}</TableCell>
                                            <TableCell>${trade.entryPrice?.toLocaleString() ?? 'N/A'}</TableCell>
                                            <TableCell>
                                                {trade.status === 'OPEN' ? 
                                                    <Badge variant="outline" className="text-yellow-400 border-yellow-400">OPEN</Badge> : 
                                                    <Badge variant="secondary" className={cn(trade.pnl && trade.pnl > 0 ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive")}>CLOSED</Badge>
                                                }
                                            </TableCell>
                                            <TableCell className={`text-right font-medium font-code ${trade.pnl && trade.pnl > 0 ? 'text-primary' : 'text-destructive'}`}>
                                               {trade.status === 'CLOSED' && trade.pnl ? `${trade.pnl > 0 ? '+' : ''}${trade.pnl}` : '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
