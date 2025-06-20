
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Gift, WalletCards, History, ExternalLink, Copy, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface EligibilityItem {
  id: string;
  label: string;
  isEligible: boolean;
  details?: string;
  action?: () => void;
  actionLabel?: string;
  disabled?: boolean;
}

const BSAI_CONTRACT_ADDRESS = "CY1LMCWHZiQHf675QJ2uGwSE1w2fD5MYVWUQzgYyEpRS";
const BSAI_TRADING_LINK = "https://birdeye.so/token/CY1LMCWHZiQHf675QJ2uGwSE1w2fD5MYVWUQzgYyEpRS?chain=solana";

const initialEligibilityData: Omit<EligibilityItem, 'action' | 'actionLabel' | 'disabled'>[] = [
  { id: 'walletSubmitted', label: 'Wallet Address Submitted', isEligible: false, details: 'No wallet submitted yet.' },
  { id: 'bsaiHolder', label: 'BSAI Holder Status (Simulated)', isEligible: false, details: 'Submit wallet to check.' },
  { id: 'trials', label: 'Signal Trials Completed', isEligible: false, details: '0/1 trial completed' },
  { id: 'invite', label: 'Invite Code Used (Simulated)', isEligible: true, details: 'Code: SHADOW2024' },
];

const mockTransactions = [
  { id: 'tx1', date: '2024-07-20', type: 'Airdrop Claim', amount: '100 BSAI', status: 'Completed', txHash: '0xabc...' },
  { id: 'tx2', date: '2024-07-15', type: 'Task Reward', amount: '20 BSAI', status: 'Completed', txHash: '0xdef...' },
];

export default function AirdropTab() {
  const { toast } = useToast();
  const [eligibilityItems, setEligibilityItems] = useState<EligibilityItem[]>([]);
  const [selectedChain, setSelectedChain] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isWalletFormSubmitted, setIsWalletFormSubmitted] = useState(false);

  useEffect(() => {
    setEligibilityItems(
      initialEligibilityData.map(item => ({
        ...item,
        action: item.id === 'trials' ? handleCompleteSignalTrial : undefined,
        actionLabel: item.id === 'trials' ? 'Complete Trial (Simulated)' : undefined,
        disabled: item.id === 'trials' ? item.isEligible : false,
      }))
    );
  }, []);


  const handleCompleteSignalTrial = () => {
    setEligibilityItems(prevItems =>
      prevItems.map(item =>
        item.id === 'trials' ? { ...item, isEligible: true, details: '1/1 trial completed', disabled: true } : item
      )
    );
    toast({ title: "Signal Trial Completed!", description: "Eligibility updated." });
  };
  
  const handleWalletSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChain || !walletAddress) {
      toast({ title: "Error", description: "Please select a chain and enter a wallet address.", variant: "destructive" });
      return;
    }
    setEligibilityItems(prevItems =>
      prevItems.map(item => {
        if (item.id === 'walletSubmitted') {
          return { ...item, isEligible: true, details: `${selectedChain}: ${walletAddress.substring(0,6)}...${walletAddress.substring(walletAddress.length - 4)}` };
        }
        if (item.id === 'bsaiHolder') {
          return { ...item, isEligible: true, details: 'Holder status confirmed (Simulated)' };
        }
        return item;
      })
    );
    setIsWalletFormSubmitted(true);
    toast({ title: "Wallet Submitted!", description: `Your ${selectedChain} wallet for the airdrop has been recorded.` });
  };

  const handleCopyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: `${type} Copied!`, description: `${text} copied to clipboard.` });
    } catch (err) {
      toast({ title: "Copy Failed", description: `Could not copy ${type}.`, variant: "destructive" });
    }
  };

  const eligibleCount = eligibilityItems.filter(item => item.isEligible).length;
  const progressPercentage = eligibilityItems.length > 0 ? (eligibleCount / eligibilityItems.length) * 100 : 0;
  const allEligible = eligibilityItems.length > 0 && eligibleCount === eligibilityItems.length;

  return (
    <div className="space-y-8">
      <Card className="glow-border-primary">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center"><Gift className="w-8 h-8 mr-3" />BSAI Airdrop Center</CardTitle>
          <CardDescription>Submit your wallet, check eligibility, and claim BSAI tokens.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isWalletFormSubmitted ? (
            <Card className="p-6 bg-card/80 border-primary/30 shadow-inner">
              <form onSubmit={handleWalletSubmit} className="space-y-4">
                <h3 className="text-xl font-semibold mb-3 text-primary font-headline">Submit Your Wallet for Airdrop</h3>
                <div>
                  <Label htmlFor="chain-select" className="font-code text-muted-foreground">Select Chain</Label>
                  <Select value={selectedChain} onValueChange={setSelectedChain}>
                    <SelectTrigger id="chain-select" className="w-full mt-1 bg-background border-border focus:border-primary focus:ring-primary">
                      <SelectValue placeholder="Choose your chain (ETH, SOL, or TON)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                      <SelectItem value="SOL">Solana (SOL)</SelectItem>
                      <SelectItem value="TON">TON Blockchain (TON)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="wallet-address" className="font-code text-muted-foreground">Wallet Address</Label>
                  <Input
                    id="wallet-address"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="Enter your wallet address"
                    className="mt-1 bg-background border-border focus:border-primary focus:ring-primary"
                  />
                </div>
                <Button type="submit" className="w-full font-code bg-primary text-primary-foreground hover:bg-primary/90 py-2.5 text-base">Submit Wallet</Button>
              </form>
            </Card>
          ) : (
             <Card className="p-6 bg-green-500/10 border-green-500/50 shadow-md text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-xl font-semibold text-green-400 font-headline">Wallet Submitted Successfully!</h3>
                <p className="text-muted-foreground">{selectedChain}: {walletAddress}</p>
            </Card>
          )}

          <div className="pt-4">
            <h3 className="text-xl font-semibold mb-2 text-foreground font-headline">Eligibility Progress</h3>
            <Progress value={progressPercentage} className="w-full h-3 mb-1 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent" />
            <p className="text-sm text-muted-foreground">{eligibleCount} of {eligibilityItems.length} criteria met.</p>
          </div>

          <div className="space-y-4">
            {eligibilityItems.map((item) => (
              <Card key={item.id} className={cn("p-4 flex items-center justify-between transition-all duration-300", item.isEligible ? "bg-green-500/10 border-green-500/50 shadow-sm hover:shadow-green-500/20 hover:border-green-500" : "bg-red-500/10 border-red-500/50 shadow-sm hover:shadow-red-500/20 hover:border-red-500")}>
                <div className="flex items-center">
                  {item.isEligible ? <CheckCircle className="w-6 h-6 mr-3 text-green-500" /> : <XCircle className="w-6 h-6 mr-3 text-red-500" />}
                  <div>
                    <p className="font-semibold text-foreground">{item.label}</p>
                    {item.details && <p className="text-xs text-muted-foreground">{item.details}</p>}
                  </div>
                </div>
                {item.action && !item.isEligible && !item.disabled && (
                  <Button variant="outline" size="sm" onClick={item.action} className="font-code border-primary text-primary hover:bg-primary/10 hover:text-primary">
                    {item.actionLabel}
                  </Button>
                )}
              </Card>
            ))}
          </div>
          
          <Button 
            disabled={!allEligible} 
            onClick={() => toast({ title: "Claim Attempted!", description: "BSAI Token Claim functionality is simulated for now."})}
            className={cn(
              "w-full text-lg py-3 font-code transition-all duration-300",
              allEligible 
                ? "bg-accent text-accent-foreground hover:bg-accent/90 animate-pulse-glow-accent shadow-lg hover:shadow-accent/70" 
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            <WalletCards className="w-5 h-5 mr-2" /> {allEligible ? "Claim Your BSAI Tokens Now!" : "Complete All Criteria to Claim"}
          </Button>
        </CardContent>
      </Card>

      <Card className="glow-border-accent">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-accent flex items-center"><AlertTriangle className="w-6 h-6 mr-3" />BSAI Token Information</CardTitle>
          <CardDescription>Details for adding BSAI to your Solana wallet.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border border-border rounded-md bg-card hover:bg-muted/30">
            <div>
              <p className="text-sm font-semibold text-foreground">BSAI Contract Address (Solana):</p>
              <p className="text-xs font-code text-muted-foreground break-all">{BSAI_CONTRACT_ADDRESS}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(BSAI_CONTRACT_ADDRESS, 'Contract Address')} className="text-primary hover:text-primary/80">
              <Copy className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 border border-border rounded-md bg-card hover:bg-muted/30">
             <div>
              <p className="text-sm font-semibold text-foreground">Trade BSAI on Birdeye (Solana):</p>
              <a href={BSAI_TRADING_LINK} target="_blank" rel="noopener noreferrer" className="text-xs font-code text-primary hover:underline break-all">{BSAI_TRADING_LINK}</a>
            </div>
            <Button variant="ghost" size="icon" asChild className="text-primary hover:text-primary/80">
              <a href={BSAI_TRADING_LINK} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-5 h-5" />
              </a>
            </Button>
          </div>
           <p className="text-xs text-muted-foreground text-center pt-2">Always verify contract addresses from official sources before interacting.</p>
        </CardContent>
      </Card>

      <Card className="glow-border-primary">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center"><History className="w-6 h-6 mr-3" />Transaction History (Simulated)</CardTitle>
          <CardDescription>Your recent simulated BSAI token transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          {mockTransactions.length > 0 ? (
            <ul className="space-y-3">
              {mockTransactions.map(tx => (
                <li key={tx.id} className="p-3 border border-border rounded-md flex justify-between items-center bg-card hover:bg-muted/30 transition-colors duration-200">
                  <div>
                    <p className="font-semibold">{tx.type} - <span className="text-accent font-bold">{tx.amount}</span></p>
                    <p className="text-xs text-muted-foreground">{tx.date} - Status: {tx.status}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                    {tx.txHash} <ExternalLink className="w-3 h-3 ml-1.5" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center py-4">No transactions yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    