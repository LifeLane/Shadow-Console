
"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gem, Landmark, ShieldQuestion, Pickaxe, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import type { WalletStats } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getWalletStatsAction, stakeShadowAction, unstakeShadowAction } from '@/app/missions/actions';
import { Separator } from '../ui/separator';

const stakeFormSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive."),
});

type StakeFormValues = z.infer<typeof stakeFormSchema>;

const StatDisplay = ({ icon, label, value, unit, className }: { icon: React.ElementType, label: string, value: string | number, unit?: string, className?: string }) => (
    <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-lg text-center">
        {React.createElement(icon, { className: "h-8 w-8 text-accent mb-2" })}
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={`text-2xl font-bold font-code text-primary ${className}`}>{value} <span className="text-lg text-muted-foreground">{unit}</span></span>
    </div>
);

export default function WalletTab({ isDbInitialized }: { isDbInitialized: boolean }) {
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<StakeFormValues>({
    resolver: zodResolver(stakeFormSchema),
  });

  const fetchStats = async () => {
    if (!isDbInitialized) return;
    try {
      const statsData = await getWalletStatsAction();
      setStats(statsData);
    } catch (error) {
      toast({ title: "Error", description: "Could not load wallet data.", variant: "destructive" });
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchStats().finally(() => setIsLoading(false));
  }, [isDbInitialized]);

  const onStake = async (data: StakeFormValues) => {
    setIsSubmitting(true);
    try {
      await stakeShadowAction(data.amount);
      await fetchStats(); // Refresh stats
      toast({ title: "Success", description: `${data.amount} SHADOW staked successfully.` });
      form.reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Staking failed.";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onUnstake = async (data: StakeFormValues) => {
    setIsSubmitting(true);
    try {
      await unstakeShadowAction(data.amount);
      await fetchStats(); // Refresh stats
      toast({ title: "Success", description: `${data.amount} SHADOW unstaked successfully.` });
      form.reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unstaking failed.";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !stats) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <Card className="glow-border-primary">
        <CardHeader>
          <CardTitle className="text-primary flex items-center text-2xl"><Landmark className="mr-3" /> Shadow Vault</CardTitle>
          <CardDescription>Manage your SHADOW tokens, stake for rewards, and view your economic power.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatDisplay icon={Gem} label="SHADOW Balance" value={stats.shadowBalance.toLocaleString()} />
                <StatDisplay icon={Landmark} label="Staked Amount" value={stats.stakedAmount.toLocaleString()} />
                <StatDisplay icon={ShieldQuestion} label="Staking APR" value={stats.apr.toFixed(2)} unit="%" />
                <StatDisplay icon={Pickaxe} label="Mining Power" value={stats.miningPower.toFixed(2)} unit="S/hr" />
            </div>

            <Separator className="my-6 bg-border/50"/>
            
            <Tabs defaultValue="stake" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="stake">Stake SHADOW</TabsTrigger>
                    <TabsTrigger value="unstake">Unstake SHADOW</TabsTrigger>
                </TabsList>
                <TabsContent value="stake">
                    <Card className="bg-transparent border-0 shadow-none">
                        <CardHeader>
                            <CardTitle>Stake Tokens</CardTitle>
                            <CardDescription>Lock your SHADOW tokens to earn rewards and boost your AI signal level.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onStake)} className="space-y-4">
                                <FormField control={form.control} name="amount" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount to Stake</FormLabel>
                                        <FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                 <Button type="submit" disabled={isSubmitting} className="w-full">
                                    {isSubmitting ? <Loader2 className="animate-spin"/> : <ArrowRight/>} Stake
                                 </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="unstake">
                    <Card className="bg-transparent border-0 shadow-none">
                        <CardHeader>
                            <CardTitle>Unstake Tokens</CardTitle>
                            <CardDescription>Withdraw your staked SHADOW tokens back to your main balance.</CardDescription>
                        </CardHeader>
                         <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onUnstake)} className="space-y-4">
                                <FormField control={form.control} name="amount" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount to Unstake</FormLabel>
                                        <FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                 <Button variant="secondary" type="submit" disabled={isSubmitting} className="w-full">
                                    {isSubmitting ? <Loader2 className="animate-spin"/> : <ArrowLeft/>} Unstake
                                 </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

        </CardContent>
      </Card>
    </div>
  );
}
