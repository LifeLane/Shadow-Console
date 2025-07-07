
"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Zap, AlertTriangle, CheckCircle, Clock, BrainCircuit, Quote } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Signal, Market } from '@/lib/types';
import { getSignalHistoryAction, generateAiSignalAction } from '@/app/mind/actions';
import { getAvailableMarketsAction } from '@/app/actions';
import PulsingText from '../PulsingText';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import TypewriterText from '../TypewriterText';

const mindFormSchema = z.object({
  market: z.string().min(1, 'Please select a market.'),
  timeframe: z.string().min(1, 'Please select a timeframe.'),
  risk: z.string().min(1, 'Please select a risk level.'),
  indicators: z.string().optional(),
});

type MindFormValues = z.infer<typeof mindFormSchema>;

export default function MindTab({ isDbInitialized }: { isDbInitialized: boolean }) {
  const [history, setHistory] = useState<Signal[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSignal, setGeneratedSignal] = useState<Signal | null>(null);
  const { toast } = useToast();

  const form = useForm<MindFormValues>({
    resolver: zodResolver(mindFormSchema),
    defaultValues: { market: '', timeframe: '1h', risk: 'Medium', indicators: 'RSI, MACD' },
  });

  useEffect(() => {
    if (!isDbInitialized) return;
    async function loadHistory() {
      setIsLoadingHistory(true);
      try {
        setHistory(await getSignalHistoryAction());
      } catch (error) {
        toast({ title: "Error", description: "Could not load signal history.", variant: "destructive" });
      } finally {
        setIsLoadingHistory(false);
      }
    }
    loadHistory();
  }, [isDbInitialized, toast]);

  useEffect(() => {
    async function loadMarkets() {
      setIsLoadingMarkets(true);
      try {
        const availableMarkets = await getAvailableMarketsAction();
        setMarkets(availableMarkets);
        if (availableMarkets.length > 0) {
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

  const onSubmit = async (data: MindFormValues) => {
    setIsGenerating(true);
    setGeneratedSignal(null);
    try {
      const newSignal = await generateAiSignalAction(data.market, data.timeframe, data.risk, data.indicators || '');
      setGeneratedSignal(newSignal);
      setHistory(prev => [newSignal, ...prev]);
    } catch (error) {
      toast({ title: "AI Oracle Error", description: "Failed to generate signal. The Oracle may be busy.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusIcon = (status: Signal['status']) => {
    switch (status) {
      case 'WIN': return <CheckCircle className="text-accent" />;
      case 'LOSS': return <AlertTriangle className="text-red-500" />;
      default: return <Clock className="text-yellow-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
      <Card className="glow-border">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center"><BrainCircuit className="mr-3" /> Market Command Console</CardTitle>
          <CardDescription>Engage the AI to analyze markets and generate predictive signals.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="market"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingMarkets || isGenerating}>
                      <FormControl>
                        <SelectTrigger>
                          {isLoadingMarkets ? <Loader2 className="h-4 w-4 animate-spin" /> : <SelectValue placeholder="Select a market" />}
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
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="timeframe" render={({ field }) => (
                    <FormItem> <FormLabel>Timeframe</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isGenerating}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="15m">15 Minutes</SelectItem>
                                <SelectItem value="1h">1 Hour</SelectItem>
                                <SelectItem value="4h">4 Hours</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormItem>
                )}/>
                <FormField control={form.control} name="risk" render={({ field }) => (
                    <FormItem> <FormLabel>Risk</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isGenerating}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="Low">Low</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormItem>
                )}/>
              </div>
              <Button type="submit" disabled={isGenerating || isLoadingMarkets} className="w-full h-12 text-lg bg-accent text-accent-foreground hover:bg-accent/90">
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2" />}
                Execute
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-6">
         <Card className="min-h-[200px] flex flex-col justify-center items-center bg-card/80 glow-border-accent">
            <CardHeader className="w-full">
                <CardTitle className="text-accent flex items-center"><Quote className="mr-2"/> Current Thought</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center w-full">
                {isGenerating && <PulsingText text="Analyzing data streams..." className="text-lg"/>}
                {!isGenerating && generatedSignal?.reasoning && (
                     <TypewriterText text={`"${generatedSignal.reasoning}"`} className="text-lg text-center italic" showCaretAfterComplete={true} />
                )}
                 {!isGenerating && !generatedSignal && (
                    <p className="text-muted-foreground">Awaiting new signal execution...</p>
                 )}
            </CardContent>
         </Card>

        <Card>
          <CardHeader>
            <CardTitle>Signal History</CardTitle>
            <CardDescription>Review of your last 10 signals.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingHistory ? (
              <div className="flex justify-center items-center h-40"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Prediction</TableHead>
                    <TableHead className="text-right">Confidence</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.slice(0, 5).map((signal) => (
                    <TableRow key={signal.id}>
                      <TableCell className="font-medium">{signal.asset}</TableCell>
                      <TableCell>
                         <Badge className={cn(
                            signal.prediction === 'LONG' ? 'bg-green-500/80' :
                            signal.prediction === 'SHORT' ? 'bg-red-500/80' : 'bg-gray-500/80',
                            'text-white'
                          )}>
                            {signal.prediction}
                          </Badge>
                      </TableCell>
                      <TableCell className="text-right font-code">{signal.confidence}%</TableCell>
                      <TableCell className="flex justify-end">{getStatusIcon(signal.status)}</TableCell>
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
