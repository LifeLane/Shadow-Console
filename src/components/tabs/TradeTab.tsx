
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
import { ArrowDown, ArrowUp, BarChart, Loader2, ListOrdered, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Trade } from '@/lib/types';
import { getTradesAction, placeTradeAction } from '@/app/agents/actions';
import { getLivePrice } from '@/app/actions';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { SUPPORTED_MARKETS } from '@/lib/constants';

const tradeFormSchema = z.object({
    asset: z.string().min(1, 'Please select an asset.'),
    side: z.enum(['LONG', 'SHORT']),
    stake: z.coerce.number().min(10, 'Minimum stake is 10 SHADOW').max(10000, 'Maximum stake is 10,000 SHADOW'),
    entryPrice: z.coerce.number().optional(),
    takeProfit: z.coerce.number().positive('Take profit must be a positive number.'),
    stopLoss: z.coerce.number().positive('Stop loss must be a positive number.'),
});

type TradeFormValues = z.infer<typeof tradeFormSchema>;

export default function TradeTab({ isDbInitialized }: { isDbInitialized: boolean }) {
    const [trades, setTrades] = useState<Trade[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [livePrice, setLivePrice] = useState<string | null>(null);
    const { toast } = useToast();

    const form = useForm<TradeFormValues>({
        resolver: zodResolver(tradeFormSchema),
        defaultValues: {
            asset: SUPPORTED_MARKETS[0].symbol,
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
        let interval: NodeJS.Timeout;
        const fetchPrice = async () => {
            if (selectedAsset) {
                const price = await getLivePrice(selectedAsset);
                setLivePrice(price);
            }
        }
        fetchPrice(); // initial fetch
        interval = setInterval(fetchPrice, 5000); // fetch every 5 seconds
        return () => clearInterval(interval);
    }, [selectedAsset]);
    
    useEffect(() => {
        // Set initial TP/SL based on live price when asset changes
        if (livePrice) {
            const price = parseFloat(livePrice);
            if (!isNaN(price)) {
                form.setValue('takeProfit', parseFloat((price * 1.02).toFixed(2))); // Default 2% TP
                form.setValue('stopLoss', parseFloat((price * 0.99).toFixed(2))); // Default 1% SL
            }
        }
    }, [livePrice, selectedAsset, form]);


    const onSubmit = async (data: TradeFormValues) => {
        setIsSubmitting(true);
        try {
            const newTrade = await placeTradeAction({
              ...data,
              entryPrice: parseFloat(livePrice || '0') // Use live price for entry
            });
            setTrades(prev => [newTrade, ...prev]);
            toast({
                title: 'Trade Placed',
                description: `Your ${data.side} order for ${data.asset} has been submitted.`,
            });
            form.reset();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ title: 'Trade Failed', description: errorMessage, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
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
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField control={form.control} name="asset" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Asset</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue/></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {SUPPORTED_MARKETS.map((market) => (
                                                  <SelectItem key={market.symbol} value={market.symbol}>{market.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                
                                <FormField control={form.control} name="side" render={({ field }) => (
                                    <FormItem>
                                        <Tabs defaultValue={field.value} onValueChange={(value) => field.onChange(value as 'LONG' | 'SHORT')} className="w-full">
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
