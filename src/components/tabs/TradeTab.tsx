
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, AlertTriangle, Loader2, List, Briefcase, CheckCircle2, TrendingUp, TrendingDown, Repeat, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Trade } from '@/lib/types';
import { getTradesAction, getPerformanceStatsAction, closeAllPositionsAction, type PerformanceStats } from '@/app/agents/actions';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

const StatCard = ({ icon: Icon, label, value, valuePrefix = '', valueClassName = '' }: { icon: React.ElementType, label: string, value: string | number, valuePrefix?: string, valueClassName?: string }) => (
    <Card className="bg-card/70">
        <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2 mb-1">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">{label}</p>
            </div>
            <p className={cn("text-xl sm:text-2xl font-bold font-code", valueClassName)}>
                {valuePrefix}{typeof value === 'number' ? value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : value}
            </p>
        </CardContent>
    </Card>
);

const TradeItem = ({ trade }: { trade: Trade }) => {
    const isWin = trade.pnl !== undefined && trade.pnl > 0;
    const pnlPrefix = isWin ? '+' : '';

    return (
        <Card className="p-3 bg-card/50 border-primary/20">
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                    <Badge className={cn(
                        "py-0.5 px-2 text-xs font-bold rounded-md",
                        trade.side === 'LONG' ? 'bg-green-500/80 text-white' : 'bg-red-500/80 text-white'
                    )}>{trade.side}</Badge>
                    <span className="font-semibold sm:text-lg">{trade.asset}</span>
                </div>
                 {trade.status === 'OPEN' ?
                    <Badge variant="outline" className="text-yellow-400 border-yellow-400 text-xs">OPEN</Badge> :
                    <Badge variant="secondary" className={cn("text-xs", isWin ? "bg-accent/20 text-accent" : "bg-destructive/20 text-destructive")}>CLOSED</Badge>
                 }
            </div>
            
            <Separator className="my-2 bg-border/20"/>

            <div className="grid grid-cols-2 gap-2 mt-3 text-center">
                <div className="flex flex-col p-2 rounded-lg bg-muted/40">
                    <span className="text-muted-foreground text-xs">Entry Price</span>
                    <span className="text-lg font-bold font-code text-foreground">${trade.entryPrice.toLocaleString()}</span>
                </div>
                <div className="flex flex-col p-2 rounded-lg bg-muted/40">
                    <span className="text-muted-foreground text-xs">Stake</span>
                    <span className="text-lg font-bold font-code text-primary">{trade.stake.toLocaleString()} SHADOW</span>
                </div>

                {trade.status === 'CLOSED' ? (
                    <>
                        <div className="flex flex-col p-2 rounded-lg bg-muted/40">
                            <span className="text-muted-foreground text-xs">Close Price</span>
                            <span className="text-lg font-bold font-code text-foreground">${trade.closePrice?.toLocaleString() ?? 'N/A'}</span>
                        </div>
                        <div className="flex flex-col p-2 rounded-lg bg-muted/40">
                            <span className="text-muted-foreground text-xs">PNL</span>
                            <span className={cn("text-lg font-bold font-code", isWin ? 'text-accent' : 'text-destructive')}>
                                {pnlPrefix}{trade.pnl?.toLocaleString() ?? '0'} SHADOW
                            </span>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex flex-col p-2 rounded-lg bg-muted/40">
                            <span className="text-muted-foreground text-xs">Take Profit</span>
                            <span className="text-lg font-bold font-code text-accent">${trade.takeProfit.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col p-2 rounded-lg bg-muted/40">
                            <span className="text-muted-foreground text-xs">Stop Loss</span>
                            <span className="text-lg font-bold font-code text-destructive">${trade.stopLoss.toLocaleString()}</span>
                        </div>
                    </>
                )}
            </div>

            <div className="pt-3 mt-2">
                <p className="text-xs text-muted-foreground text-right">
                    {formatDistanceToNow(new Date(trade.timestamp), { addSuffix: true })}
                </p>
            </div>
        </Card>
    );
};

export default function TradeTab({ isDbInitialized }: { 
  isDbInitialized: boolean;
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
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleKillSwitch = async () => {
        setIsClosing(true);
        try {
            const result = await closeAllPositionsAction();
            toast({ title: "Emergency Protocol Activated", description: result.message });
            await fetchData();
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
                <CardHeader className="p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-xl sm:text-2xl text-primary flex items-center"><BarChart className="mr-3"/> Performance Matrix</CardTitle>
                            <CardDescription className="text-sm">An overview of your trade performance.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <StatCard icon={DollarSign} label="Total PnL" value={stats?.totalPnl ?? 0} valuePrefix={stats && stats.totalPnl > 0 ? "+$" : "$"} valueClassName={stats && stats.totalPnl >= 0 ? 'text-accent' : 'text-destructive'}/>
                        <StatCard icon={TrendingUp} label="Best Trade" value={stats?.bestTrade ?? 0} valuePrefix="+$" valueClassName="text-accent"/>
                        <StatCard icon={TrendingDown} label="Worst Trade" value={stats?.worstTrade ?? 0} valuePrefix="$" valueClassName="text-destructive"/>
                        <StatCard icon={Repeat} label="Total Trades" value={stats?.totalTrades ?? 0}/>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card/70 border border-destructive/50">
                <CardContent className="p-3 flex flex-col sm:flex-row justify-between items-center gap-2">
                    <div className="text-center sm:text-left">
                        <h3 className="font-semibold text-destructive">Emergency Protocol</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">Instantly close all active positions at market price.</p>
                    </div>
                    <Button variant="destructive" onClick={handleKillSwitch} disabled={isClosing || openTrades.length === 0} className="w-full sm:w-auto">
                        {isClosing ? <Loader2 className="mr-2 animate-spin"/> : <AlertTriangle className="mr-2"/>}
                        Kill Switch
                    </Button>
                </CardContent>
            </Card>
            
            <Tabs defaultValue="positions" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-11 bg-accent/10">
                    <TabsTrigger value="positions" className="h-full text-sm sm:text-base data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">Positions ({openTrades.length})</TabsTrigger>
                    <TabsTrigger value="history" className="h-full text-sm sm:text-base data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">History ({closedTrades.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="positions" className="mt-3">
                     <ScrollArea className="h-[350px]">
                        {openTrades.length > 0 ? (
                            <div className="space-y-2 pr-2">
                                {openTrades.map(trade => <TradeItem key={trade.id} trade={trade} />)}
                            </div>
                        ) : (
                            <div className="text-center py-16 text-muted-foreground flex flex-col items-center justify-center h-full">
                                <Briefcase className="mx-auto h-10 w-10 sm:h-12 sm:w-12 mb-4"/>
                                <h3 className="text-lg sm:text-xl font-semibold">No Active Positions</h3>
                                <p className="text-sm">Generate a signal from the Mind Console to begin.</p>
                            </div>
                        )}
                    </ScrollArea>
                </TabsContent>
                <TabsContent value="history" className="mt-3">
                     <ScrollArea className="h-[350px]">
                        {closedTrades.length > 0 ? (
                            <div className="space-y-2 pr-2">
                                {closedTrades.map(trade => <TradeItem key={trade.id} trade={trade} />)}
                            </div>
                        ) : (
                            <div className="text-center py-16 text-muted-foreground flex flex-col items-center justify-center h-full">
                                <List className="mx-auto h-10 w-10 sm:h-12 sm:w-12 mb-4"/>
                                <h3 className="text-lg sm:text-xl font-semibold">No Trade History</h3>
                                <p className="text-sm">Your closed trades will appear here.</p>
                            </div>
                        )}
                     </ScrollArea>
                </TabsContent>
            </Tabs>
             <div className="px-4 py-2 mt-2 text-center text-xs text-muted-foreground/80 flex items-center justify-center gap-1.5">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <p>All trades are simulated for gamified purposes and do not constitute financial advice. Trade at your own risk.</p>
            </div>
        </div>
    );
}
