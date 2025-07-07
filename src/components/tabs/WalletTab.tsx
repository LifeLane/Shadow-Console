
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
import { Gem, Landmark, Loader2, Cpu, Zap, TrendingUp, Gauge, Bolt, Power, PowerOff, ShoppingCart, Wrench } from 'lucide-react';
import type { WalletStats, User, MiningRig } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getWalletStatsAction, stakeShadowAction, unstakeShadowAction } from '@/app/missions/actions';
import { getProfileAction, updateUserAction } from '@/app/profile/actions';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Badge } from '../ui/badge';
import InfoGridItem from '../InfoGridItem';

const stakeFormSchema = z.object({
  amount: z.coerce.number().positive("Amount must be be positive."),
});
type StakeFormValues = z.infer<typeof stakeFormSchema>;


const StatDisplay = ({ icon, label, children, className }: { icon: React.ElementType, label: string, children: React.ReactNode, className?: string }) => (
    <div className={cn("p-4 text-center flex flex-col items-center justify-between space-y-2 h-[140px]", className)}>
        <div className="flex flex-col items-center gap-2">
            {React.createElement(icon, { className: "h-5 w-5 text-primary" })}
            <p className="text-xs text-muted-foreground whitespace-pre-line leading-tight">{label}</p>
        </div>
        <div className="flex flex-col items-center">{children}</div>
    </div>
);

// Mock Data for Rigs
const initialMarketRigs: MiningRig[] = [
  {
    id: 'rig_starter_1',
    name: 'Shadowbit S1',
    description: 'A reliable entry-level rig, perfect for new pilots getting into the mining game.',
    hashrate: 110,
    power: 3250,
    price: 1500,
    imageUrl: 'https://placehold.co/300x200.png',
    dataAiHint: 'mining rig',
  },
  {
    id: 'rig_advanced_1',
    name: 'GhostMiner G7',
    description: 'Advanced processing power with enhanced cooling. A serious upgrade for a growing fleet.',
    hashrate: 250,
    power: 4500,
    price: 5000,
    imageUrl: 'https://placehold.co/300x200.png',
    dataAiHint: 'server farm',
  },
    {
    id: 'rig_pro_1',
    name: 'Void Ripper V9',
    description: 'Top-tier commercial rig for maximum passive flow. Only for serious operators.',
    hashrate: 500,
    power: 7500,
    price: 12000,
    imageUrl: 'https://placehold.co/300x200.png',
    dataAiHint: 'data center',
  },
];

const initialOwnedRigs: MiningRig[] = [
    {
    id: 'owned_rig_1',
    name: 'Shadowbit S1',
    description: 'Your first active mining rig, generating passive SHADOW flow.',
    hashrate: 110,
    power: 3250,
    price: 1500,
    status: 'ACTIVE',
    imageUrl: 'https://placehold.co/300x200.png',
    dataAiHint: 'mining rig',
  },
];


const RigCard = ({ rig, type, onBuy, onDeploy, onUpgrade, balance }: { rig: MiningRig; type: 'market' | 'owned'; onBuy: (rig: MiningRig) => void; onDeploy: (rig: MiningRig, status: 'ACTIVE' | 'INACTIVE') => void; onUpgrade: (rig: MiningRig) => void; balance: number; }) => {
    const canAfford = type === 'market' && balance >= rig.price;
    return (
        <Card className="flex flex-col bg-card/50 border-primary/20">
            <CardHeader className="p-0">
                <div className="relative h-32 w-full">
                    <Image src={rig.imageUrl} alt={rig.name} layout="fill" objectFit="cover" className="rounded-t-lg" data-ai-hint={rig.dataAiHint} />
                    <Badge className="absolute top-2 right-2 border border-black/20">{rig.hashrate} TH/s</Badge>
                </div>
                <div className="p-3">
                    <CardTitle className="text-lg">{rig.name}</CardTitle>
                    <CardDescription className="text-xs">{rig.description}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 p-3 flex-grow">
                <InfoGridItem icon={Bolt} label="Power" value={`${rig.power} W`} />
                <InfoGridItem icon={Gem} label="Price" value={`${rig.price} S.D.`} valueClassName="text-primary" />
            </CardContent>
            <div className="p-3 mt-auto">
                {type === 'market' && (
                    <Button className="w-full" onClick={() => onBuy(rig)} disabled={!canAfford}>
                        <ShoppingCart className="mr-2 h-4 w-4" /> {canAfford ? "Acquire Rig" : "Insufficient Funds"}
                    </Button>
                )}
                {type === 'owned' && (
                    <div className="flex gap-2">
                        {rig.status === 'INACTIVE' ? (
                            <Button className="w-full" onClick={() => onDeploy(rig, 'ACTIVE')} variant="default">
                                <Power className="mr-2 h-4 w-4" /> Deploy
                            </Button>
                        ) : (
                            <Button className="w-full" onClick={() => onDeploy(rig, 'INACTIVE')} variant="secondary">
                                <PowerOff className="mr-2 h-4 w-4" /> Deactivate
                            </Button>
                        )}
                        <Button className="w-full" onClick={() => onUpgrade(rig)} variant="outline" disabled>
                            <Wrench className="mr-2 h-4 w-4" /> Upgrade
                        </Button>
                    </div>
                )}
            </div>
        </Card>
    );
};


export default function WalletTab({ isDbInitialized }: { isDbInitialized: boolean }) {
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStakeModalOpen, setStakeModalOpen] = useState(false);
  const [isUnstakeModalOpen, setUnstakeModalOpen] = useState(false);
  const { toast } = useToast();

  const [marketRigs, setMarketRigs] = useState<MiningRig[]>(initialMarketRigs);
  const [ownedRigs, setOwnedRigs] = useState<MiningRig[]>(initialOwnedRigs);
  const [totalHashrate, setTotalHashrate] = useState(0);
  const [passiveIncome, setPassiveIncome] = useState(0);

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

  useEffect(() => {
    const activeRigs = ownedRigs.filter(r => r.status === 'ACTIVE');
    const newTotalHashrate = activeRigs.reduce((sum, rig) => sum + rig.hashrate, 0);
    setTotalHashrate(newTotalHashrate);
    // Passive income formula: (total hashrate / 1000) SHADOW per hour
    setPassiveIncome(newTotalHashrate / 1000);
  }, [ownedRigs]);


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
  
  const handleBuyRig = async (rig: MiningRig) => {
      if (!user) return;
      if (user.shadowBalance < rig.price) {
          toast({ title: "Transaction Failed", description: "Insufficient SHADOW balance.", variant: "destructive"});
          return;
      }
      
      const updatedUser = {...user, shadowBalance: user.shadowBalance - rig.price };
      await updateUserAction(updatedUser);
      setUser(updatedUser);
      
      const newOwnedRig: MiningRig = { ...rig, id: `owned_${rig.id}_${Date.now()}`, status: 'INACTIVE' };
      setOwnedRigs(prev => [...prev, newOwnedRig]);

      // Remove from marketplace for this session
      setMarketRigs(prev => prev.filter(r => r.id !== rig.id));
      
      toast({ title: "Acquisition Successful", description: `You have acquired the ${rig.name}. Find it in your fleet.`});
  };

  const handleDeployRig = (rigToDeploy: MiningRig, status: 'ACTIVE' | 'INACTIVE') => {
      setOwnedRigs(prev => prev.map(r => r.id === rigToDeploy.id ? { ...r, status } : r));
      toast({
          title: `Rig ${status === 'ACTIVE' ? 'Deployed' : 'Deactivated'}`,
          description: `${rigToDeploy.name} is now ${status.toLowerCase()}.`
      });
  };
  
  const handleUpgradeRig = (rig: MiningRig) => {
      toast({ title: "Coming Soon", description: "Rig upgrade system is under development." });
  }

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
                <CardTitle className="text-primary flex items-center text-xl sm:text-2xl"><Landmark className="mr-3"/> SHADOW Vault</CardTitle>
                <CardDescription className="text-sm">Manage your SHADOW holdings. Stake in high-yield pools or deploy custom mining rigs.</CardDescription>
            </CardHeader>
        </Card>

        <Tabs defaultValue="staking" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="staking">Staking Pools</TabsTrigger>
                <TabsTrigger value="rigs">Mining Rigs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="staking" className="mt-4 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">My Staking Dashboard</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                         <div className="grid grid-cols-2 divide-x divide-border">
                            <StatDisplay icon={Gem} label={"Available\nSHADOW"} className="border-b border-border">
                                <p className="text-2xl font-bold font-code text-accent">{stats.shadowBalance.toLocaleString()}</p>
                            </StatDisplay>
                            <StatDisplay icon={Landmark} label={"Total\nStaked"} className="border-b border-border">
                                <p className="text-2xl font-bold font-code text-accent">{stats.stakedAmount.toLocaleString()}</p>
                            </StatDisplay>
                            <StatDisplay icon={TrendingUp} label={"Current\nStaking APR"}>
                                <p className="text-2xl font-bold font-code text-accent">{stats.apr.toFixed(2)}</p>
                                <p className="text-lg font-bold font-code text-accent/80">%</p>
                            </StatDisplay>
                            <StatDisplay icon={Zap} label={"Hourly\nRewards"}>
                                 <p className="text-2xl font-bold font-code text-accent">{hourlyRewards.toFixed(4)}</p>
                            </StatDisplay>
                        </div>
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

            <TabsContent value="rigs" className="mt-4 space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Fleet Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <StatDisplay icon={Gauge} label={"Total\nHashrate"} className="min-h-0 py-2">
                           <p className="text-2xl font-bold font-code text-accent">{totalHashrate.toLocaleString()} TH/s</p>
                        </StatDisplay>
                        <StatDisplay icon={Zap} label={"Passive Income\n(per hour)"} className="min-h-0 py-2">
                            <p className="text-2xl font-bold font-code text-accent">{passiveIncome.toFixed(3)}</p>
                             <p className="text-sm font-code text-accent/80 ml-1.5">SHADOW</p>
                        </StatDisplay>
                    </CardContent>
                </Card>

                <div>
                    <h3 className="text-xl font-semibold mb-3">My Fleet ({ownedRigs.length})</h3>
                    {ownedRigs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           {ownedRigs.map(rig => (
                               <RigCard key={rig.id} rig={rig} type="owned" onBuy={handleBuyRig} onDeploy={handleDeployRig} onUpgrade={handleUpgradeRig} balance={user.shadowBalance} />
                           ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">Your fleet is empty. Acquire rigs from the marketplace to begin mining.</p>
                    )}
                </div>

                <div>
                    <h3 className="text-xl font-semibold mb-3">Rig Marketplace</h3>
                     {marketRigs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           {marketRigs.map(rig => (
                               <RigCard key={rig.id} rig={rig} type="market" onBuy={handleBuyRig} onDeploy={handleDeployRig} onUpgrade={handleUpgradeRig} balance={user.shadowBalance} />
                           ))}
                        </div>
                    ) : (
                         <p className="text-muted-foreground text-center py-8">Marketplace is currently out of stock. Check back later.</p>
                    )}
                </div>
            </TabsContent>
        </Tabs>
    </div>
  );

}
