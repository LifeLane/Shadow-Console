
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
import { Gem, Landmark, ShieldQuestion, Pickaxe, Loader2, Wallet, Bell, Paintbrush, KeyRound, ArrowLeft, ArrowRight } from 'lucide-react';
import type { WalletStats } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getWalletStatsAction, stakeShadowAction, unstakeShadowAction } from '@/app/settings/actions';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { useTheme } from 'next-themes';

const stakeFormSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive."),
});

type StakeFormValues = z.infer<typeof stakeFormSchema>;

const StatDisplay = ({ icon, label, value, unit, className }: { icon: React.ElementType, label: string, value: string | number, unit?: string, className?: string }) => (
    <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-lg text-center">
        {React.createElement(icon, { className: "h-8 w-8 text-primary mb-2" })}
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={`text-2xl font-bold font-code text-accent ${className}`}>{value} <span className="text-lg text-muted-foreground">{unit}</span></span>
    </div>
);

export default function SettingsTab({ isDbInitialized }: { isDbInitialized: boolean }) {
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const form = useForm<StakeFormValues>({
    resolver: zodResolver(stakeFormSchema),
  });

  const fetchStats = async () => {
    if (!isDbInitialized) return;
    try {
      setStats(await getWalletStatsAction());
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
      form.reset({ amount: 0 });
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
      form.reset({ amount: 0 });
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
    <Card className="glow-border">
        <CardHeader>
            <CardTitle className="text-primary flex items-center text-2xl">Settings & Wallet</CardTitle>
            <CardDescription>Manage your wallet, staking, and application preferences.</CardDescription>
        </CardHeader>
        <CardContent>
             <Tabs defaultValue="wallet" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="wallet"><Wallet className="mr-2" /> Wallet</TabsTrigger>
                    <TabsTrigger value="staking"><Landmark className="mr-2" /> Staking</TabsTrigger>
                    <TabsTrigger value="appearance"><Paintbrush className="mr-2" /> Appearance</TabsTrigger>
                    <TabsTrigger value="api_keys"><KeyRound className="mr-2" /> API Keys</TabsTrigger>
                </TabsList>

                <TabsContent value="wallet" className="mt-6">
                    <CardTitle>Wallet Management</CardTitle>
                    <CardDescription className="mb-4">Connect and manage your web3 wallets.</CardDescription>
                    <Button>Connect Wallet (Metamask)</Button>
                </TabsContent>

                <TabsContent value="staking" className="mt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <StatDisplay icon={Gem} label="SHADOW Balance" value={stats.shadowBalance.toLocaleString()} />
                        <StatDisplay icon={Landmark} label="Staked Amount" value={stats.stakedAmount.toLocaleString()} />
                        <StatDisplay icon={ShieldQuestion} label="Staking APR" value={stats.apr.toFixed(2)} unit="%" />
                        <StatDisplay icon={Pickaxe} label="Mining Power" value={stats.miningPower.toFixed(2)} unit="S/hr" />
                    </div>
                    <Separator className="my-6 bg-border/50"/>
                     <Form {...form}>
                        <form onSubmit={form.handleSubmit(onStake)} className="space-y-4">
                        <FormField control={form.control} name="amount" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Amount to Stake / Unstake</FormLabel>
                                <FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <div className="flex gap-4">
                            <Button type="button" onClick={form.handleSubmit(onStake)} disabled={isSubmitting} className="w-full">
                                {isSubmitting ? <Loader2 className="animate-spin"/> : <ArrowRight/>} Stake
                            </Button>
                            <Button variant="secondary" type="button" onClick={form.handleSubmit(onUnstake)} disabled={isSubmitting} className="w-full">
                                {isSubmitting ? <Loader2 className="animate-spin"/> : <ArrowLeft/>} Unstake
                            </Button>
                         </div>
                        </form>
                    </Form>
                </TabsContent>

                <TabsContent value="appearance" className="mt-6">
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription className="mb-4">Customize the look and feel of the application.</CardDescription>
                     <div className="flex items-center space-x-2">
                        <Switch id="theme-switch" checked={theme !== 'theme-light'} onCheckedChange={(checked) => setTheme(checked ? 'theme-shadow' : 'theme-light')} />
                        <Label htmlFor="theme-switch">Dark Mode</Label>
                    </div>
                </TabsContent>

                <TabsContent value="api_keys" className="mt-6">
                    <CardTitle>API Keys</CardTitle>
                    <CardDescription className="mb-4">Enter your own API keys for enhanced functionality (optional).</CardDescription>
                    <div className="space-y-4">
                        <Input placeholder="Binance API Key (optional)" type="password" />
                        <Input placeholder="Polygonscan API Key (optional)" type="password" />
                        <Button>Save Keys</Button>
                    </div>
                </TabsContent>

             </Tabs>
        </CardContent>
    </Card>
  );
}
