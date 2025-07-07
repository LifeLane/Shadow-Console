
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
import { Loader2, Zap, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Signal } from '@/lib/types';
import { getSignalHistoryAction, generateAiSignalAction } from '@/app/mind/actions';
import TerminalExecutionAnimation from '../TerminalExecutionAnimation';
import PulsingText from '../PulsingText';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

const signalFormSchema = z.object({
  market: z.string().min(1, 'Please select a market.'),
});

type SignalFormValues = z.infer<typeof signalFormSchema>;

export default function SignalTab({ isDbInitialized }: { isDbInitialized: boolean }) {
  const [history, setHistory] = useState<Signal[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSignal, setGeneratedSignal] = useState<Signal | null>(null);
  const { toast } = useToast();

  const form = useForm<SignalFormValues>({
    resolver: zodResolver(signalFormSchema),
    defaultValues: { market: 'BTCUSDT' },
  });

  useEffect(() => {
    async function loadHistory() {
      if (!isDbInitialized) return;
      setIsLoadingHistory(true);
      try {
        const historyData = await getSignalHistoryAction();
        setHistory(historyData);
      } catch (error) {
        toast({ title: "Error", description: "Could not load signal history.", variant: "destructive" });
      } finally {
        setIsLoadingHistory(false);
      }
    }
    loadHistory();
  }, [isDbInitialized, toast]);

  const onSubmit = async (data: SignalFormValues) => {
    setIsGenerating(true);
    setGeneratedSignal(null);
    try {
      const newSignal = await generateAiSignalAction(data.market);
      setGeneratedSignal(newSignal);
      // Add to history without re-fetching
      setHistory(prev => [newSignal, ...prev]);
    } catch (error) {
      toast({ title: "AI Oracle Error", description: "Failed to generate signal. The Oracle may be busy.", variant: "destructive" });
    } finally {
      // Keep the generated signal displayed, don't set isGenerating to false immediately
      // It will turn false when the user closes the result or starts a new generation
    }
  };

  const handleNewGeneration = () => {
    setIsGenerating(false);
    setGeneratedSignal(null);
  };

  const getStatusIcon = (status: Signal['status']) => {
    switch (status) {
      case 'WIN': return <CheckCircle className="text-green-500" />;
      case 'LOSS': return <AlertTriangle className="text-red-500" />;
      default: return <Clock className="text-yellow-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
      <div className="space-y-6">
        <Card className="glow-border-accent">
          <CardHeader>
            <CardTitle className="text-2xl text-accent flex items-center"><Zap className="mr-3" /> Signal Console</CardTitle>
            <CardDescription>Engage the Shadow Oracle to analyze markets and generate predictive signals.</CardDescription>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="space-y-4">
                {generatedSignal ? (
                  <Card className="bg-card/50">
                    <CardHeader>
                      <CardTitle className="text-primary">Oracle Insight Received</CardTitle>
                      <CardDescription>Asset: {generatedSignal.asset}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 font-code">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Prediction:</span>
                        <Badge className={cn(
                          generatedSignal.prediction === 'LONG' ? 'bg-green-500' :
                          generatedSignal.prediction === 'SHORT' ? 'bg-red-500' : 'bg-gray-500',
                          'text-lg'
                        )}>
                          {generatedSignal.prediction}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Confidence:</span>
                        <span>{generatedSignal.confidence}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Entry Price:</span>
                        <span>${generatedSignal.entryPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Take Profit:</span>
                        <span>${generatedSignal.takeProfit.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stop Loss:</span>
                        <span>${generatedSignal.stopLoss.toLocaleString()}</span>
                      </div>
                    </CardContent>
                     <Button className="w-full mt-4" onClick={handleNewGeneration}>Generate New Signal</Button>
                  </Card>
                ) : (
                  <div>
                    <PulsingText text="Executing predictive analysis..." className="text-center text-primary mb-4" />
                    <TerminalExecutionAnimation target={form.getValues('market')} tradeMode="ORACLE" risk="DYNAMIC" />
                  </div>
                )}
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="market"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Market Pair</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a market to analyze" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="BTCUSDT">BTC/USDT</SelectItem>
                            <SelectItem value="ETHUSDT">ETH/USDT</SelectItem>
                            <SelectItem value="MATICUSDT">MATIC/USDT</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isGenerating} className="w-full h-12 text-lg animate-button-ripple-pulse bg-accent hover:bg-accent/90">
                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2" />}
                    Initiate Analysis
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Signal History</CardTitle>
            <CardDescription>Review of the last 10 signals generated for your profile.</CardDescription>
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
                  {history.map((signal) => (
                    <TableRow key={signal.id}>
                      <TableCell className="font-medium">{signal.asset}</TableCell>
                      <TableCell>{signal.prediction}</TableCell>
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
