
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Zap, AlertTriangle, CheckCircle, Clock, Send, BrainCircuit, User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Signal, Message } from '@/lib/types';
import { getSignalHistoryAction, generateAiSignalAction } from '@/app/mind/actions';
import { askOracleAction } from '@/app/profile/actions';
import TerminalExecutionAnimation from '../TerminalExecutionAnimation';
import PulsingText from '../PulsingText';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { SUPPORTED_MARKETS } from '@/lib/constants';


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

  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'The data streams are open, Pilot. What knowledge do you seek?' }
  ]);
  const [isChatting, setIsChatting] = useState(false);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);


  const form = useForm<SignalFormValues>({
    resolver: zodResolver(signalFormSchema),
    defaultValues: { market: SUPPORTED_MARKETS[0].symbol },
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

  useEffect(() => {
    if (scrollAreaRef.current) {
        const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollElement) {
            scrollElement.scrollTo({ top: scrollElement.scrollHeight, behavior: 'smooth' });
        }
    }
  }, [messages]);

  const handleChatSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const userInput = chatInputRef.current?.value;
      if (!userInput || isChatting) return;

      const newMessages: Message[] = [...messages, { role: 'user', text: userInput }];
      setMessages(newMessages);
      setIsChatting(true);
      if(chatInputRef.current) chatInputRef.current.value = '';

      try {
          const oracleResponse = await askOracleAction(newMessages, userInput);
          setMessages(prev => [...prev, { role: 'model', text: oracleResponse }]);
      } catch (error) {
          setMessages(prev => [...prev, { role: 'model', text: "Connection to the Oracle flickered and was lost. Try again." }]);
      } finally {
          setIsChatting(false);
      }
  };


  const onSubmit = async (data: SignalFormValues) => {
    setIsGenerating(true);
    setGeneratedSignal(null);
    try {
      const newSignal = await generateAiSignalAction(data.market);
      setGeneratedSignal(newSignal);
      setHistory(prev => [newSignal, ...prev]);
    } catch (error) {
      toast({ title: "AI Oracle Error", description: "Failed to generate signal. The Oracle may be busy.", variant: "destructive" });
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
    <div className="space-y-6 sm:space-y-8">
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
                              {SUPPORTED_MARKETS.map((market) => (
                                <SelectItem key={market.symbol} value={market.symbol}>{market.label}</SelectItem>
                              ))}
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
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><BrainCircuit className="mr-2 text-accent"/> Oracle Chat</CardTitle>
          <CardDescription>Chat directly with your AI trading assistant for insights.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col h-[400px]">
              <ScrollArea className="flex-grow p-4 border rounded-md bg-muted/20" ref={scrollAreaRef}>
                  <div className="space-y-4">
                      {messages.map((msg, index) => (
                          <div key={index} className={cn("flex items-start gap-3", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                              {msg.role === 'model' && <Avatar className="w-8 h-8"><AvatarFallback><BrainCircuit/></AvatarFallback></Avatar>}
                              <div className={cn("p-3 rounded-lg max-w-sm", msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
                                  <p className="text-sm break-words">{msg.text}</p>
                              </div>
                              {msg.role === 'user' && <Avatar className="w-8 h-8"><AvatarFallback><UserIcon/></AvatarFallback></Avatar>}
                          </div>
                      ))}
                      {isChatting && (
                          <div className="flex items-start gap-3 justify-start">
                              <Avatar className="w-8 h-8"><AvatarFallback><BrainCircuit/></AvatarFallback></Avatar>
                              <div className="p-3 rounded-lg bg-secondary flex items-center justify-center">
                                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                              </div>
                          </div>
                      )}
                  </div>
              </ScrollArea>
              <form onSubmit={handleChatSubmit} className="flex items-center gap-2 pt-4">
                  <Input ref={chatInputRef} placeholder="Ask the Oracle..." disabled={isChatting} />
                  <Button type="submit" disabled={isChatting}><Send/></Button>
              </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
