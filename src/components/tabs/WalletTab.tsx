
"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Gem, ShieldQuestion, Pickaxe, Loader2, Cpu, Orbit } from 'lucide-react';
import type { WalletStats } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getWalletStatsAction, stakeShadowAction, unstakeShadowAction } from '@/app/missions/actions';
import { Separator } from '../ui/separator';

const stakeFormSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive."),
});
type StakeFormValues = z.infer<typeof stakeFormSchema>;

const StatDisplay = ({ icon, label, value, unit, className }: { icon: React.ElementType, label: string, value: string | number, unit?: string, className?: string }) => (
    <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-lg text-center h-full">
        {React.createElement(icon, { className: "h-8 w-8 text-accent mb-2" })}
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={`text-2xl font-bold font-code text-primary ${className}`}>{value} <span className="text-lg text-muted-foreground">{unit}</span></span>
    </div>
);

const miningPools = [
    { id: 'genesis', name: 'Genesis Shard', icon: Gem, apr: 7.8, minStake: 100, description: 'A stable, foundational pool. Lower risk, consistent rewards.' },
    { id: 'quantum', name: 'Quantum Core', icon: Cpu, apr: 12.3, minStake: 1000, description: 'High-frequency mining pool. Higher potential yield, increased risk.' },
    { id: 'void', name: 'Void Echo', icon: Orbit, apr: 18.1, minStake: 5000, description: 'Experimental deep-state mining. Highest risk, highest reward.' },
];

export default function WalletTab({ isDbInitialized }: { isDbInitialized: boolean }) {
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStakeModalOpen, setStakeModalOpen] = useState(false);
  const [isUnstakeModalOpen, setUnstakeModalOpen] = useState(false);
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
      await fetchStats();
      toast({ title: "Success", description: `${data.amount} SHADOW staked successfully.` });
      form.reset();
      setStakeModalOpen(false);
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
      await fetchStats();
      toast({ title: "Success", description: `${data.amount} SHADOW unstaked successfully.` });
      form.reset();
      setUnstakeModalOpen(false);
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
          <CardTitle className="text-primary flex items-center text-2xl"><Pickaxe className="mr-3" /> Mining Pools</CardTitle>
          <CardDescription>Stake your SHADOW tokens in pools to earn rewards and power the network.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatDisplay icon={Gem} label="SHADOW Balance" value={stats.shadowBalance.toLocaleString()} />
                <StatDisplay icon={Pickaxe} label="Total Staked" value={stats.stakedAmount.toLocaleString()} />
                <StatDisplay icon={ShieldQuestion} label="Avg. Staking APR" value={stats.apr.toFixed(2)} unit="%" />
                <StatDisplay icon={Cpu} label="Total Mining Power" value={stats.miningPower.toFixed(2)} unit="S/hr" />
            </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {miningPools.map((pool) => (
            <Card key={pool.id} className="flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-accent">
                        <pool.icon className="h-6 w-6"/>
                        <span>{pool.name}</span>
                    </CardTitle>
                    <CardDescription>{pool.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                    <div className="flex justify-between items-center bg-muted/40 p-2 rounded-md">
                        <span className="text-sm font-medium">APR</span>
                        <span className="font-bold text-accent font-code">{pool.apr}%</span>
                    </div>
                     <div className="flex justify-between items-center bg-muted/40 p-2 rounded-md">
                        <span className="text-sm font-medium">Min. Stake</span>
                        <span className="font-bold font-code">{pool.minStake} SHADOW</span>
                    </div>
                </CardContent>
                <div className="p-6 pt-0">
                    <Dialog open={isStakeModalOpen} onOpenChange={setStakeModalOpen}>
                        <DialogTrigger asChild>
                             <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Stake in Pool</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Stake in {pool.name}</DialogTitle>
                            </DialogHeader>
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
                                        {isSubmitting ? <Loader2 className="animate-spin"/> : `Stake`}
                                    </Button>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>
            </Card>
        ))}
      </div>
      
      <Separator />

      <Card>
        <CardHeader>
            <CardTitle>Withdraw Staked Tokens</CardTitle>
            <CardDescription>Unstake your SHADOW tokens from all pools and return them to your main balance.</CardDescription>
        </CardHeader>
        <CardContent>
            <Dialog open={isUnstakeModalOpen} onOpenChange={setUnstakeModalOpen}>
                <DialogTrigger asChild>
                     <Button variant="outline" className="w-full md:w-1/3">Initiate Withdrawal</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Unstake SHADOW</DialogTitle>
                    </DialogHeader>
                     <Form {...form}>
                        <form onSubmit={form.handleSubmit(onUnstake)} className="space-y-4">
                            <FormField control={form.control} name="amount" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount to Unstake</FormLabel>
                                    <FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <Button variant="destructive" type="submit" disabled={isSubmitting} className="w-full">
                                {isSubmitting ? <Loader2 className="animate-spin"/> : `Confirm Unstake`}
                            </Button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
