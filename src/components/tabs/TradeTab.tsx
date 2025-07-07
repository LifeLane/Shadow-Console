
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, BarChart, ArrowUp, ArrowDown, Gift, AlertTriangle, Loader2, List, Briefcase, CheckCircle2, BrainCircuit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Trade } from '@/lib/types';
import { getTradesAction, getPerformanceStatsAction, closeAllPositionsAction, type PerformanceStats } from '@/app/agents/actions';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '../ui/scroll-area';

const StatCard = ({ icon: Icon, label, value, valuePrefix = '', valueClassName = '' }: { icon: React.ElementType, label: string, value: string | number, valuePrefix?: string, valueClassName?: string }) => (
    <Card className="bg-card/70 border border-green-500/20 glow-border-accent">
        <CardContent className="p-3">
            <div className="flex items-center space-x-2 mb-1">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
            </div>
            <p className={cn("text-2xl font-bold font-code", valueClassName)}>
                {valuePrefix}{typeof value === 'number' ? value.toLocaleString() : value}
            </p>
        </CardContent>
    </Card>
);

const TradeItem = ({ trade }: { trade: Trade }) => {
    const isWin = trade.pnl !== undefined && trade.pnl > 0;
    return (
        <Card className="p-4 bg-card/50 border border-primary/20">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-grow">
                    <div className="flex items-baseline gap-3 mb-3">
                        <Badge className={cn(
                            "py-1 px-3 text-sm font-bold rounded-md",
                            trade.side === 'LONG' ? 'bg-green-500/80 text-white' : 'bg-red-500/80 text-white'
                        )}>{trade.side}</Badge>
                        <span className="font-bold text-lg">{trade.asset}</span>
                        <span className="text-sm text-muted-foreground">(Stake: ${trade.stake})</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm font-code">
                        <div>
                            <p className="text-muted-foreground">Entry</p>
                            <p className="font-bold text-base">${trade.entryPrice.toLocaleString()}</p>
                        </div>
                        {trade.status === 'CLOSED' && trade.closePrice && (
                             <div>
                                <p className="text-muted-foreground">Close</p>
                                <p className="font-bold text-base">${trade.closePrice.toLocaleString()}</p>
                            </div>
                        )}
                        {trade.status === 'CLOSED' && trade.pnl !== undefined && (
                             <div className={cn("font-bold text-base", isWin ? 'text-accent' : 'text-destructive')}>
                                <p className="text-muted-foreground">PNL</p>
                                <p>{isWin ? '+' : ''}${trade.pnl.toLocaleString()}</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex flex-col items-end justify-between h-full min-h-[70px]">
                     {trade.status === 'OPEN' ?
                        <Badge variant="outline" className="text-yellow-400 border-yellow-400">OPEN</Badge> :
                        <Badge variant="secondary" className={cn(isWin ? "bg-accent/20 text-accent" : "bg-destructive/20 text-destructive")}>CLOSED</Badge>
                     }
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(trade.timestamp), { addSuffix: true })}
                    </p>
                </div>
            </div>
        </Card>
    )
}

export default function TradeTab({ isDbInitialized, setActiveTab }: { 
  isDbInitialized: boolean;
  setActiveTab: (tabId: 'wallet' | 'trade' | 'mind' | 'missions' | 'profile') => void;
}) {
    const [trades, setTrades] = useState<Trade[]>([]);
    const [stats, setStats] = useState<PerformanceStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isClosing, setIsClosing] = useState(false);
    const { toast } = useToast();

    const fetchData = useCallback(async () => {
        if (!isDbInitialized) return;
        setIsLoading(true);
        try {
            const [tradesData, statsData] = await Promise.all([
                getTradesAction(),
                getPerformanceStatsAction()
            ]);
            setTrades(tradesData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
            setStats(statsData);
        } catch (error) {
            toast({ title: 'Error', description: 'Could not load performance data.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    }, [isDbInitialized, toast]);

    useEffect(() => {
        fetchData();
        // Optional: auto-refresh data periodically
        const interval = setInterval(fetchData, 30000); // every 30 seconds
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleKillSwitch = async () => {
        setIsClosing(true);
        try {
            const result = await closeAllPositionsAction();
            toast({ title: "Emergency Protocol Activated", description: result.message });
            await fetchData(); // Refresh data immediately
        } catch (error) {
            toast({ title: 'Error', description: 'Could not close all positions.', variant: 'destructive' });
        } finally {
            setIsClosing(false);
        }
    }

    const openTrades = trades.filter(t => t.status === 'OPEN');
    const closedTrades = trades.filter(t => t.status === 'CLOSED');

    if (isLoading && !stats) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-4">
            <Card className="bg-card/70">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl text-primary flex items-center"><List className="mr-3"/> Performance Matrix</CardTitle>
                            <CardDescription>An overview of your closed trade performance.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                        <StatCard icon={Briefcase} label="Invested" value={stats?.invested ?? 0} valuePrefix="$" />
                        <StatCard icon={BarChart} label="Live PnL" value={stats?.livePnl.toFixed(2) ?? "0.00"} valuePrefix="$" valueClassName={stats && stats.livePnl >= 0 ? 'text-accent' : 'text-destructive'}/>
                        <StatCard icon={List} label="Trades" value={stats?.totalTrades ?? 0}/>
                        <StatCard icon={CheckCircle2} label="Winning Trades" value={stats?.winningTrades ?? 0} valueClassName="text-accent"/>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card/70 border border-destructive/50">
                <CardContent className="p-3 flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold text-destructive">Emergency Protocol</h3>
                        <p className="text-sm text-muted-foreground">Instantly close all active positions at market price.</p>
                    </div>
                    <Button variant="destructive" onClick={handleKillSwitch} disabled={isClosing || openTrades.length === 0}>
                        {isClosing ? <Loader2 className="mr-2 animate-spin"/> : <AlertTriangle className="mr-2"/>}
                        Kill Switch
                    </Button>
                </CardContent>
            </Card>
            
            <Tabs defaultValue="positions" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-12 bg-accent/10">
                    <TabsTrigger value="positions" className="h-full text-lg data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">Positions ({openTrades.length})</TabsTrigger>
                    <TabsTrigger value="history" className="h-full text-lg data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">History ({closedTrades.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="positions" className="mt-4">
                     <ScrollArea className="h-[400px]">
                        {openTrades.length > 0 ? (
                            <div className="space-y-4 pr-4">
                                {openTrades.map(trade => <TradeItem key={trade.id} trade={trade} />)}
                            </div>
                        ) : (
                            <div className="text-center py-16 text-muted-foreground flex flex-col items-center justify-center h-full">
                                <BarChart className="mx-auto h-12 w-12 mb-4"/>
                                <h3 className="text-xl font-semibold">No Active Positions</h3>
                                <p>Generate a signal from the Mind Console to begin.</p>
                            </div>
                        )}
                    </ScrollArea>
                </TabsContent>
                <TabsContent value="history" className="mt-4">
                     <ScrollArea className="h-[400px]">
                        {closedTrades.length > 0 ? (
                            <div className="space-y-4 pr-4">
                                {closedTrades.map(trade => <TradeItem key={trade.id} trade={trade} />)}
                            </div>
                        ) : (
                            <div className="text-center py-16 text-muted-foreground flex flex-col items-center justify-center h-full">
                                <List className="mx-auto h-12 w-12 mb-4"/>
                                <h3 className="text-xl font-semibold">No Trade History</h3>
                                <p>Your closed trades will appear here.</p>
                            </div>
                        )}
                     </ScrollArea>
                </TabsContent>
            </Tabs>
             <div className="px-4 py-2 mt-4 text-center text-xs text-muted-foreground">
                <p>Shadow Signals are AI-generated for gamified purposes and do not constitute financial advice. All trades are simulated. Trade at your own risk.</p>
            </div>
        </div>
    );
}
