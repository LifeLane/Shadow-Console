
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Gift, WalletCards, History, ExternalLink, Copy, AlertTriangle, Activity, BrainCircuit, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import TypewriterText from '@/components/TypewriterText';
import { getAirdropStatsAction, type AirdropStats } from '@/app/airdrop/actions';
import { updateWalletAction } from '@/app/settings/actions';

const BSAI_CONTRACT_ADDRESS = "CY1LMCWHZiQHf675QJ2uGwSE1w2fD5MYVWUQzgYyEpRS";
const BSAI_TRADING_LINK = "https://birdeye.so/token/CY1LMCWHZiQHf675QJ2uGwSE1w2fD5MYVWUQzgYyEpRS?chain=solana";

const POINTS_CONFIG = {
    WALLET_SYNC: 100,
    BSAI_HOLDER: 150,
    GENESIS_INVITE: 25,
};

export default function AirdropTab({ isDbInitialized }: { isDbInitialized: boolean }) {
  const { toast } = useToast();
  const [stats, setStats] = useState<AirdropStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Wallet Form State
  const [selectedChain, setSelectedChain] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isSavingWallet, setIsSavingWallet] = useState(false);

  const [descriptionKey, setDescriptionKey] = useState(0);

  const fetchStats = async () => {
      try {
          setIsLoading(true);
          const airdropStats = await getAirdropStatsAction();
          setStats(airdropStats);
      } catch (e) {
          toast({ title: "Error", description: "Could not load airdrop statistics.", variant: "destructive" });
      } finally {
          setIsLoading(false);
          setDescriptionKey(prev => prev + 1);
      }
  };

  useEffect(() => {
    if (!isDbInitialized) return;
    fetchStats();
  }, [isDbInitialized, toast]);
  
  const handleWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChain || !walletAddress) {
      toast({ title: "Wallet Sync Error", description: "Please select a chain and enter a valid wallet address.", variant: "destructive" });
      return;
    }
    setIsSavingWallet(true);
    try {
        await updateWalletAction(walletAddress, selectedChain);
        toast({ title: "Wallet Synced for Airdrop!", description: `Your ${selectedChain} wallet has been synced with the Shadow Core network.` });
        await fetchStats(); // Refresh stats after updating wallet
    } catch (error) {
        toast({ title: "Error", description: "Failed to sync wallet.", variant: "destructive" });
    } finally {
        setIsSavingWallet(false);
    }
  };

  const handleCopyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: `${type} Copied!`, description: `${text} copied to clipboard.` });
    } catch (err) {
      toast({ title: "Copy Failed", description: `Could not copy ${type}.`, variant: "destructive" });
    }
  };

  const { totalAirdropPoints, basePoints, activityPoints, eligibilityItems, allEligible } = useMemo(() => {
    if (!stats) return { totalAirdropPoints: 0, basePoints: 0, activityPoints: 0, eligibilityItems: [], allEligible: false };

    const items = [
        { id: 'walletSubmitted', label: 'Primary Wallet Synced', isEligible: stats.wallet.synced, points: POINTS_CONFIG.WALLET_SYNC, details: stats.wallet.synced ? `Synced: ${stats.wallet.chain}: ${stats.wallet.address?.substring(0,6)}...` : 'Sync your wallet to confirm.', category: 'base' },
        { id: 'bsaiHolder', label: 'BSAI Holder Status', isEligible: stats.bsaiHolder, points: POINTS_CONFIG.BSAI_HOLDER, details: 'Sync wallet to verify contribution.', category: 'base' },
        { id: 'invite', label: 'Genesis Invite Code Used', isEligible: stats.genesisInvite, points: POINTS_CONFIG.GENESIS_INVITE, details: 'Code: SHADOW2024 (Welcome, Agent!)', category: 'base' },
        { id: 'signalRewards', label: 'Signal Trading Rewards', isEligible: true, points: stats.signalPoints, details: `Points from ${stats.signalPoints / 5} successful signals.`, category: 'activity' },
        { id: 'agentRewards', label: 'Agent Performance Bonus', isEligible: true, points: stats.agentPoints, details: `Bonus from your agent's total XP.`, category: 'activity' },
        { id: 'taskRewards', label: 'Mission Completion Bonus', isEligible: true, points: stats.missionPoints, details: `Rewards from ${stats.missionPoints / 30} completed missions.`, category: 'activity' },
    ];
    
    const base = items.filter(item => item.category === 'base' && item.isEligible).reduce((sum, item) => sum + item.points, 0);
    const activity = items.filter(item => item.category === 'activity' && item.isEligible).reduce((sum, item) => sum + item.points, 0);
    const total = base + activity;
    const allCriteriaMet = items.every(item => item.isEligible);
    
    return { totalAirdropPoints: total, basePoints: base, activityPoints: activity, eligibilityItems: items, allEligible: allCriteriaMet };
  }, [stats]);
  
  const eligibleCount = eligibilityItems.filter(item => item.isEligible).length;
  const progressPercentage = eligibilityItems.length > 0 ? (eligibleCount / eligibilityItems.length) * 100 : 0;
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Fetching Airdrop Status...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <Card className="glow-border-primary">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="font-headline text-xl sm:text-3xl text-primary flex items-center"><Gift className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3" />BSAI Airdrop Hub</CardTitle>
          <TypewriterText 
            key={`desc-airdrop-${descriptionKey}`}
            text="Sync your wallet, verify contributions, and check your airdrop allocation. Your efforts power the Shadow Core." 
            className="text-xs sm:text-sm text-muted-foreground mt-1"
            speed={15}
            showCaret={false}
          />
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">

          <Card className="p-4 sm:p-6 bg-card/80 border-primary/30 shadow-inner glow-border-primary">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-primary font-headline text-center">Your Airdrop Allocation Summary</h3>
              <div className="text-center mb-4 border-b border-primary/20 pb-4">
                <p className="text-5xl font-bold text-primary font-headline">{totalAirdropPoints.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-code">Total Points</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center text-xs">
                <div>
                    <p className="font-bold text-2xl text-foreground">{basePoints.toLocaleString()}</p>
                    <p className="text-muted-foreground font-code uppercase">Base Eligibility</p>
                </div>
                <div>
                    <p className="font-bold text-2xl text-foreground">{activityPoints.toLocaleString()}</p>
                    <p className="text-muted-foreground font-code uppercase">Activity Rewards</p>
                </div>
              </div>
          </Card>

          {!stats?.wallet.synced ? (
            <Card className="p-4 sm:p-6 bg-card/80 border-primary/30 shadow-inner">
              <form onSubmit={handleWalletSubmit} className="space-y-3 sm:space-y-4">
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-primary font-headline">Sync Wallet for Eligibility</h3>
                <div>
                  <Label htmlFor="chain-select" className="font-code text-xs sm:text-sm text-muted-foreground">Select Network (ETH, SOL, or TON)</Label>
                  <Select value={selectedChain} onValueChange={setSelectedChain}>
                    <SelectTrigger id="chain-select" className="w-full mt-1 bg-background border-border focus:border-primary focus:ring-primary text-sm sm:text-base h-10">
                      <SelectValue placeholder="Choose your network for BSAI" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                      <SelectItem value="SOL">Solana (SOL)</SelectItem>
                      <SelectItem value="TON">TON Blockchain (TON)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="wallet-address" className="font-code text-xs sm:text-sm text-muted-foreground">Wallet Address</Label>
                  <Input
                    id="wallet-address"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="Enter your wallet address (e.g., 0x... or Sol...)"
                    className="mt-1 bg-background border-border focus:border-primary focus:ring-primary text-sm sm:text-base h-10"
                  />
                </div>
                <Button type="submit" className="w-full font-code bg-primary text-primary-foreground hover:bg-primary/90 py-2.5 text-sm sm:text-base" disabled={isSavingWallet}>
                    {isSavingWallet && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSavingWallet ? 'Syncing...' : 'Sync Wallet & Verify'}
                </Button>
              </form>
            </Card>
          ) : (
             <Card className="p-4 sm:p-6 bg-accent/10 border-accent/50 shadow-md text-center">
                <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-accent mx-auto mb-2 sm:mb-3" />
                <h3 className="text-lg sm:text-xl font-semibold text-accent font-headline">Wallet Synced Successfully!</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Network: {stats.wallet.chain} | Address: {stats.wallet.address?.substring(0,8)}...{stats.wallet.address?.substring(stats.wallet.address.length - 6)}</p>
            </Card>
          )}

          <div className="pt-2 sm:pt-4">
            <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 text-foreground font-headline">Airdrop Eligibility Progress</h3>
            <Progress value={progressPercentage} className="w-full h-2.5 sm:h-3 mb-1 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent" />
            <p className="text-xs sm:text-sm text-muted-foreground">{eligibleCount} of {eligibilityItems.length} criteria met. Each step aids the Shadow Core!</p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {eligibilityItems.map((item) => (
              <Card key={item.id} className={cn(
                "p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between transition-all duration-300 space-y-2 sm:space-y-0", 
                item.isEligible 
                  ? "bg-accent/10 border-accent/50 shadow-sm hover:shadow-accent/20 hover:border-accent" 
                  : "bg-destructive/10 border-destructive/50 shadow-sm hover:shadow-destructive/20 hover:border-destructive"
                )}>
                <div className="flex items-center w-full sm:w-auto">
                  {item.isEligible ? <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-accent shrink-0" /> : <XCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-destructive shrink-0" />}
                  <div className="flex-grow">
                    <p className="font-semibold text-sm sm:text-base text-foreground">{item.label} <span className="font-normal text-muted-foreground">({item.points} pts)</span></p>
                    {item.details && <TypewriterText key={`detail-${item.id}-${descriptionKey}`} text={item.details} className="text-xs text-muted-foreground" speed={10} showCaret={false} />}
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <Button 
            disabled={!allEligible} 
            onClick={() => toast({ title: "Airdrop Claim Initiated!", description: "BSAI Token Claim functionality is simulated. Your contribution is valued!"})}
            className={cn(
              "w-full text-base sm:text-lg py-2.5 sm:py-3 font-code transition-all duration-300",
              allEligible 
                ? "bg-accent text-accent-foreground hover:bg-accent/90 animate-pulse-glow-accent shadow-lg hover:shadow-accent/70" 
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            <WalletCards className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> {allEligible ? "Claim Your BSAI Airdrop Now!" : "Complete All Criteria to Claim"}
          </Button>
        </CardContent>
      </Card>

      <Card className="glow-border-accent">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="font-headline text-lg sm:text-2xl text-accent flex items-center"><AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />BSAI Token Intel</CardTitle>
           <TypewriterText 
            key={`desc-intel-${descriptionKey}`}
            text="Key information for the BSAI token on the Solana network. DYOR." 
            className="text-xs sm:text-sm text-muted-foreground mt-1"
            speed={15}
            showCaret={false}
          />
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border border-border rounded-md bg-card hover:bg-muted/30 space-y-2 sm:space-y-0">
            <div className="flex-grow">
              <p className="text-xs sm:text-sm font-semibold text-foreground">BSAI Contract Address (Solana):</p>
              <p className="text-xs font-code text-muted-foreground break-all">{BSAI_CONTRACT_ADDRESS}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(BSAI_CONTRACT_ADDRESS, 'Contract Address')} className="text-primary hover:text-primary/80 self-start sm:self-center shrink-0 ml-0 sm:ml-2">
              <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border border-border rounded-md bg-card hover:bg-muted/30 space-y-2 sm:space-y-0">
             <div className="flex-grow">
              <p className="text-xs sm:text-sm font-semibold text-foreground">Trade BSAI on Birdeye (Solana):</p>
              <a href={BSAI_TRADING_LINK} target="_blank" rel="noopener noreferrer" className="text-xs font-code text-primary hover:underline break-all block">{BSAI_TRADING_LINK}</a>
            </div>
            <Button variant="ghost" size="icon" asChild className="text-primary hover:text-primary/80 self-start sm:self-center shrink-0 ml-0 sm:ml-2">
              <a href={BSAI_TRADING_LINK} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </Button>
          </div>
           <p className="text-xs text-muted-foreground text-center pt-1 sm:pt-2">Always verify contract addresses from official Shadow Core channels before interacting.</p>
        </CardContent>
      </Card>
    </div>
  );
}
