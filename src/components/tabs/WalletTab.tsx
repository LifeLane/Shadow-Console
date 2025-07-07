
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Gem, Pickaxe, Loader2, Cpu, Zap, TrendingUp } from 'lucide-react';
import type { WalletStats, User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getWalletStatsAction, stakeShadowAction, unstakeShadowAction } from '@/app/missions/actions';
import { getProfileAction } from '@/app/profile/actions';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const stakeFormSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive."),
});
type StakeFormValues = z.infer<typeof stakeFormSchema>;

const StatDisplay = ({ icon, label, value, unit, tooltip }: { icon: React.ElementType, label: string, value: string | number, unit?: string, tooltip: string }) => (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="flex flex-col items-center justify-between p-4 bg-muted/30 rounded-lg text-center h-36">
                    <div className="flex flex-col items-center gap-1">
                        {React.createElement(icon, { className: "h-6 w-6 text-primary" })}
                        <p className="text-sm text-muted-foreground whitespace-pre-line leading-tight">{label}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold font-code text-accent">{value}</p>
                        {unit && <p className="text-base text-accent -mt-1">{unit}</p>}
                    </div>
                </div>
            </TooltipTrigger>
            <TooltipContent>
                <p>{tooltip}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
);

export default function WalletTab({ isDbInitialized }: { isDbInitialized: boolean }) {
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStakeModalOpen, setStakeModalOpen] = useState(false);
  const [isUnstakeModalOpen, setUnstakeModalOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<StakeFormValues>({ resolver: zodResolver(stakeFormSchema) });

  const fetchData = useCallback(async () => {
    if (!isDbInitialized) return;
    try {
      const [statsData, userData] = await Promise.all([
        getWalletStatsAction(),
        getProfileAction()
      ]);
      setStats(statsData);
      setUser(userData);
    } catch (error) {
      toast({ title: "Error", description: "Could not load vault data.", variant: "destructive" });
    }
  }, [isDbInitialized, toast]);

  useEffect(() => {
    setIsLoading(true);
    fetchData().finally(() => setIsLoading(false));
  }, [fetchData]);

  const handleAction = async (action: 'stake' | 'unstake', data: StakeFormValues) => {
    setIsSubmitting(true);
    try {
      if (action === 'stake') {
        await stakeShadowAction(data.amount);
        toast({ title: "Success", description: `${data.amount} SHADOW staked successfully.` });
      } else {
        await unstakeShadowAction(data.amount);
        toast({ title: "Success", description: `${data.amount} SHADOW unstaked successfully.` });
      }
      await fetchData(); // Refresh stats
      form.reset();
      if (action === 'stake') setStakeModalOpen(false);
      if (action === 'unstake') setUnstakeModalOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : `${action} failed.`;
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !stats || !user) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  
  const xpForMaxApr = 10000;
  const xpProgress = Math.min((user.xp / xpForMaxApr) * 100, 100);
  const hourlyRewards = (stats.stakedAmount * (stats.apr / 100)) / (365 * 24);

  return (
    <div className="space-y-4 sm:space-y-6">
        <Card className="glow-border-primary">
            <CardHeader>
                <CardTitle className="text-primary flex items-center text-xl sm:text-2xl"><Pickaxe className="mr-3"/> SHADOW Vault</CardTitle>
                <CardDescription className="text-sm">Manage your SHADOW holdings. Stake in high-yield pools or deploy custom mining rigs.</CardDescription>
            </CardHeader>
        </Card>

        <Tabs defaultValue="staking" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="staking">Staking Pools</TabsTrigger>
                <TabsTrigger value="rigs" disabled>Mining Rigs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="staking" className="mt-4 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">My Staking Dashboard</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                        <StatDisplay icon={Gem} label={"Available\nSHADOW"} value={stats.shadowBalance.toLocaleString()} tooltip="Tokens in your wallet, ready to be staked."/>
                        <StatDisplay icon={Pickaxe} label={"Total\nStaked"} value={stats.stakedAmount.toLocaleString()} tooltip="Tokens currently earning rewards in staking pools."/>
                        <StatDisplay icon={TrendingUp} label={"Current\nStaking APR"} value={stats.apr.toFixed(2)} unit="%" tooltip="Your Annual Percentage Rate, boosted by your XP."/>
                        <StatDisplay icon={Zap} label={"Hourly\nRewards"} value={hourlyRewards.toFixed(4)} tooltip="Estimated SHADOW earned per hour from staking."/>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">XP-Boosted APR</CardTitle>
                        <CardDescription>Your total XP directly increases your staking APR. Max APR is achieved at {xpForMaxApr.toLocaleString()} XP.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>XP Progress</span>
                            <span>{user.xp.toLocaleString()} / {xpForMaxApr.toLocaleString()}</span>
                        </div>
                        <Progress value={xpProgress} />
                        <p className="text-xs text-center mt-2 text-accent">You are gaining a +{(stats.apr - 5.5).toFixed(2)}% APR bonus from your XP!</p>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Dialog open={isStakeModalOpen} onOpenChange={setStakeModalOpen}>
                        <DialogTrigger asChild><Button className="w-full h-12 text-base">Stake SHADOW</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Stake SHADOW</DialogTitle></DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit((d) => handleAction('stake', d))} className="space-y-4">
                                    <FormField control={form.control} name="amount" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Amount (Balance: {stats.shadowBalance.toLocaleString()})</FormLabel>
                                            <FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? <Loader2 className="animate-spin"/> : `Stake`}</Button>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                     <Dialog open={isUnstakeModalOpen} onOpenChange={setUnstakeModalOpen}>
                        <DialogTrigger asChild><Button variant="outline" className="w-full h-12 text-base">Unstake SHADOW</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Unstake SHADOW</DialogTitle></DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit((d) => handleAction('unstake', d))} className="space-y-4">
                                    <FormField control={form.control} name="amount" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Amount (Staked: {stats.stakedAmount.toLocaleString()})</FormLabel>
                                            <FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <Button variant="destructive" type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? <Loader2 className="animate-spin"/> : `Confirm Unstake`}</Button>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>
            </TabsContent>

            <TabsContent value="rigs" className="mt-4">
                <Card className="text-center h-96 flex flex-col items-center justify-center opacity-50 glow-border">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center text-2xl gap-3"><Cpu className="w-8 h-8"/> Mining Rigs</CardTitle>
                        <CardDescription className="text-lg text-primary">Feature Coming Soon</CardDescription>
                    </CardHeader>
                    <CardContent className="max-w-md">
                        <p>Soon, you'll be able to assemble, upgrade, and deploy custom SHADOW mining rigs to generate passive token flow. Allocate resources, optimize your hashrate, and dominate the network.</p>
                        <Button disabled className="mt-6">Configure Your First Rig</Button>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );

    

    